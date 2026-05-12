import { safeNumber } from "./utils.js";

const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2";
const OFF_TEXT_SEARCH_API = "https://search.openfoodfacts.org/search";
const OFF_DEFAULT_PAGE_SIZE = 12;
const OFF_BRAND_IMPORT_PAGE_SIZE = 24;
const OFF_HEADERS = {
  Accept: "application/json",
  "User-Agent": "V6Fitness/6.0 (support@v6fitness.app)",
};
const OFF_HOST_MATCH = "openfoodfacts.org";

function resolveKcalPer100g(nutriments = {}) {
  const kcal =
    safeNumber(nutriments["energy-kcal_100g"]) ||
    safeNumber(nutriments["energy-kcal"]) ||
    safeNumber(nutriments["energy-kcal_value"]);

  if (kcal > 0) {
    return kcal;
  }

  const kj =
    safeNumber(nutriments.energy_100g) ||
    safeNumber(nutriments.energy) ||
    safeNumber(nutriments["energy-kj_100g"]);

  return kj > 0 ? Number((kj / 4.184).toFixed(1)) : 0;
}

function resolveProductName(product = {}, barcode) {
  const preferredNames = [
    product.product_name_pt,
    product.product_name,
    product.generic_name_pt,
    product.generic_name,
  ];

  return (
    preferredNames.map((value) => String(value || "").trim()).find(Boolean) ||
    `Produto ${barcode}`
  );
}

function normalizeOffPayload(barcode, data) {
  const product = data?.product;
  const nutriments = product?.nutriments || {};

  if (!product || safeNumber(data?.status) !== 1) {
    return { error: "Food not found." };
  }

  return {
    source: "off",
    name: resolveProductName(product, barcode),
    kcal: resolveKcalPer100g(nutriments),
    prot: safeNumber(nutriments.proteins_100g),
    carb: safeNumber(nutriments.carbohydrates_100g),
    fat: safeNumber(nutriments.fat_100g),
    fiber: safeNumber(nutriments.fiber_100g),
    externalId: barcode,
    barcode,
    raw: data,
    rawExternal: data,
  };
}

function normalizeOffProduct(product = {}) {
  const barcode = String(product.code || product._id || "").trim();
  const nutriments = product.nutriments || {};
  const name = resolveProductName(product, barcode || "OFF");

  if (!name) {
    return null;
  }

  return {
    source: "off",
    name,
    searchText: [
      product.product_name_pt,
      product.product_name,
      product.generic_name_pt,
      product.generic_name,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" | "),
    kcal: resolveKcalPer100g(nutriments),
    prot: safeNumber(nutriments.proteins_100g),
    carb: safeNumber(nutriments.carbohydrates_100g),
    fat: safeNumber(nutriments.fat_100g),
    fiber: safeNumber(nutriments.fiber_100g),
    externalId: barcode,
    barcode,
    raw: null,
    rawExternal: null,
  };
}

export async function fetchFoodByBarcode(barcode) {
  const cleanBarcode = String(barcode ?? "").trim();

  if (!cleanBarcode) {
    return { error: "Barcode is empty." };
  }

  try {
    const response = await fetch(
      `${OFF_API_BASE}/product/${encodeURIComponent(cleanBarcode)}.json`,
      {
        headers: OFF_HEADERS,
      },
    );

    if (!response.ok) {
      return { error: "Open Food Facts is unavailable right now." };
    }

    return normalizeOffPayload(cleanBarcode, await response.json());
  } catch {
    return { error: "Could not reach Open Food Facts." };
  }
}

export function extractOpenFoodFactsBarcode(value) {
  const cleanValue = String(value ?? "").trim();

  if (!cleanValue) {
    return null;
  }

  if (/^\d{8,18}$/.test(cleanValue)) {
    return {
      barcode: cleanValue,
      source: "barcode",
    };
  }

  try {
    const url = new URL(cleanValue);
    const hostname = String(url.hostname || "").toLowerCase();

    if (!hostname.includes(OFF_HOST_MATCH)) {
      return null;
    }

    const pathParts = url.pathname
      .split("/")
      .map((value) => String(value || "").trim())
      .filter(Boolean);
    const productIndex = pathParts.findIndex((value) => value === "product");
    const barcodeCandidate =
      productIndex >= 0 ? String(pathParts[productIndex + 1] || "").trim() : "";

    if (/^\d{8,18}$/.test(barcodeCandidate)) {
      return {
        barcode: barcodeCandidate,
        source: "url",
      };
    }

    const fallbackMatch = cleanValue.match(/\b\d{8,18}\b/);
    if (fallbackMatch) {
      return {
        barcode: fallbackMatch[0],
        source: "url",
      };
    }
  } catch {}

  return null;
}

function prettifyBrandTag(brandTag = "") {
  return String(brandTag || "")
    .split("-")
    .map((part) =>
      part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part,
    )
    .join(" ")
    .trim();
}

export function extractOpenFoodFactsBrandFacet(value) {
  const cleanValue = String(value ?? "").trim();

  if (!cleanValue) {
    return null;
  }

  try {
    const url = new URL(cleanValue);
    const hostname = String(url.hostname || "").toLowerCase();

    if (!hostname.includes(OFF_HOST_MATCH)) {
      return null;
    }

    const pathParts = url.pathname
      .split("/")
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
    const brandIndex = pathParts.findIndex(
      (entry) => entry === "brands" && pathParts[pathParts.indexOf("facets")] === "facets",
    );
    const facetsIndex = pathParts.findIndex((entry) => entry === "facets");
    const normalizedBrandIndex =
      facetsIndex >= 0 && pathParts[facetsIndex + 1] === "brands"
        ? facetsIndex + 1
        : brandIndex;
    const brandTag = String(pathParts[normalizedBrandIndex + 1] || "")
      .trim()
      .toLowerCase();

    if (!brandTag) {
      return null;
    }

    return {
      brandTag,
      displayName: prettifyBrandTag(decodeURIComponent(brandTag)),
      source: "brand-facet-url",
    };
  } catch {
    return null;
  }
}

function createEmptySearchResult(page = 1, pageSize = OFF_DEFAULT_PAGE_SIZE) {
  return {
    items: [],
    page,
    pageSize,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: page > 1,
  };
}

export async function searchFoodsByQuery(
  query,
  { page = 1, pageSize = OFF_DEFAULT_PAGE_SIZE } = {},
) {
  const cleanQuery = String(query ?? "").trim();
  const normalizedPage = Math.max(1, safeNumber(page) || 1);
  const normalizedPageSize = Math.max(
    1,
    Math.min(24, safeNumber(pageSize) || OFF_DEFAULT_PAGE_SIZE),
  );

  if (!cleanQuery) {
    return createEmptySearchResult(normalizedPage, normalizedPageSize);
  }

  const params = new URLSearchParams();
  params.set("q", cleanQuery);
  params.set("page", String(normalizedPage));
  params.set("page_size", String(normalizedPageSize));
  params.set("langs", "pt,en");
  params.set("boost_phrase", "true");
  params.set(
    "fields",
    "code,product_name,product_name_pt,generic_name,generic_name_pt,brands,categories,labels,nutriments",
  );

  try {
    const response = await fetch(`${OFF_TEXT_SEARCH_API}?${params.toString()}`, {
      headers: OFF_HEADERS,
    });

    if (!response.ok) {
      return createEmptySearchResult(normalizedPage, normalizedPageSize);
    }

    const data = await response.json();
    const products = Array.isArray(data.hits)
      ? data.hits
      : Array.isArray(data.products)
        ? data.products
        : [];
    const seen = new Set();
    const totalCount = Math.max(0, safeNumber(data.count));
    const apiPageCount = Math.max(0, safeNumber(data.page_count));
    const totalPages =
      apiPageCount > 0
        ? apiPageCount
        : totalCount > 0
          ? Math.max(1, Math.ceil(totalCount / normalizedPageSize))
          : 1;
    const items = products
      .map(normalizeOffProduct)
      .filter((product) => {
        if (!product) {
          return false;
        }

        const key = product.barcode || product.name.toLowerCase();
        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .slice(0, normalizedPageSize);

    return {
      items,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      totalCount,
      totalPages,
      hasNextPage:
        normalizedPage < totalPages &&
        (items.length > 0 || totalCount > normalizedPage * normalizedPageSize),
      hasPreviousPage: normalizedPage > 1,
    };
  } catch {
    return createEmptySearchResult(normalizedPage, normalizedPageSize);
  }
}

export async function fetchFoodsByBrandTag(
  brandTag,
  { page = 1, pageSize = OFF_BRAND_IMPORT_PAGE_SIZE } = {},
) {
  const cleanBrandTag = String(brandTag ?? "").trim().toLowerCase();
  const normalizedPage = Math.max(1, safeNumber(page) || 1);
  const normalizedPageSize = Math.max(
    1,
    Math.min(50, safeNumber(pageSize) || OFF_BRAND_IMPORT_PAGE_SIZE),
  );

  if (!cleanBrandTag) {
    return createEmptySearchResult(normalizedPage, normalizedPageSize);
  }

  const params = new URLSearchParams();
  params.set("q", `brands_tags:${cleanBrandTag}`);
  params.set("page", String(normalizedPage));
  params.set("page_size", String(normalizedPageSize));
  params.set(
    "fields",
    "code,product_name,product_name_pt,generic_name,generic_name_pt,nutriments",
  );

  try {
    const response = await fetch(`${OFF_TEXT_SEARCH_API}?${params.toString()}`, {
      headers: OFF_HEADERS,
    });

    if (!response.ok) {
      return createEmptySearchResult(normalizedPage, normalizedPageSize);
    }

    const data = await response.json();
    const products = Array.isArray(data.hits)
      ? data.hits
      : Array.isArray(data.products)
        ? data.products
        : [];
    const items = products
      .map(normalizeOffProduct)
      .filter(Boolean);
    const totalCount = Math.max(0, safeNumber(data.count));
    const totalPages = Math.max(1, safeNumber(data.page_count) || 1);

    return {
      items,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      totalCount,
      totalPages,
      hasNextPage: normalizedPage < totalPages,
      hasPreviousPage: normalizedPage > 1,
    };
  } catch {
    return createEmptySearchResult(normalizedPage, normalizedPageSize);
  }
}

export async function fetchBrandFoodsBatch(
  brandTag,
  { maxPages = 5, maxItems = 120, pageSize = OFF_BRAND_IMPORT_PAGE_SIZE } = {},
) {
  const cleanBrandTag = String(brandTag ?? "").trim().toLowerCase();
  const normalizedMaxPages = Math.max(1, safeNumber(maxPages) || 1);
  const normalizedMaxItems = Math.max(1, safeNumber(maxItems) || pageSize);
  const normalizedPageSize = Math.max(1, safeNumber(pageSize) || OFF_BRAND_IMPORT_PAGE_SIZE);
  const items = [];
  let totalCount = 0;
  let totalPages = 1;

  for (let page = 1; page <= normalizedMaxPages; page += 1) {
    const batch = await fetchFoodsByBrandTag(cleanBrandTag, {
      page,
      pageSize: normalizedPageSize,
    });

    totalCount = Math.max(totalCount, safeNumber(batch.totalCount));
    totalPages = Math.max(totalPages, safeNumber(batch.totalPages) || 1);

    if (!batch.items.length) {
      break;
    }

    items.push(...batch.items);

    if (items.length >= normalizedMaxItems || !batch.hasNextPage) {
      break;
    }
  }

  return {
    brandTag: cleanBrandTag,
    displayName: prettifyBrandTag(cleanBrandTag),
    items: items.slice(0, normalizedMaxItems),
    totalCount,
    totalPages,
  };
}
