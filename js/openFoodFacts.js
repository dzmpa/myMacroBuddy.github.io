import { safeNumber } from "./utils.js";
import { isValidOFFProduct } from "./validators.js";
import { state } from "./state.js";

const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2";
const OFF_API_SEARCH_BASE = `${OFF_API_BASE}/search`;
const OFF_TEXT_SEARCH_API = "https://search.openfoodfacts.org/search";
const OFF_DEFAULT_PAGE_SIZE = 12;
const OFF_BRAND_IMPORT_PAGE_SIZE = 24;
const OFF_HEADERS = {
  Accept: "application/json",
  "User-Agent": "V6Fitness/6.0 (support@v6fitness.app)",
};
const OFF_HOST_MATCH = "openfoodfacts.org";

function getOpenFoodFactsProxySearchUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const hostname = String(window.location.hostname || "").trim().toLowerCase();

  // Allow localhost, loopback and common LAN IP ranges so mobile devices
  // on the same Wi-Fi can use a local proxy (e.g., 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const localIpRegex = /^(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})$/;

  if (!localIpRegex.test(hostname)) {
    return "";
  }

  return `http://${hostname}:3001/openfoodfacts/search`;
}

async function fetchOpenFoodFactsSearchJson(requestUrls = []) {
  for (const requestUrl of requestUrls) {
    if (!requestUrl) {
      continue;
    }

    try {
      const response = await fetch(requestUrl, {
        headers: OFF_HEADERS,
      });

      if (!response.ok) {
        continue;
      }

      return await response.json();
    } catch {}
  }

  return null;
}

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

  // Bouncer: drop malformed or incomplete products at the boundary
  if (!isValidOFFProduct(product)) {
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
    rawExternal: product,
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
    const facetsIndex = pathParts.findIndex((entry) => entry === "facets");

    if (facetsIndex < 0 || pathParts[facetsIndex + 1] !== "brands") {
      return null;
    }

    const brandTag = String(pathParts[facetsIndex + 2] || "")
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

  const country = state.userProfile?.shoppingCountry;
  const brand = state.userProfile?.shoppingBrand;

  let queryText = cleanQuery;
  if (brand && !cleanQuery.toLowerCase().includes(brand.toLowerCase())) {
    queryText = `${brand} ${cleanQuery}`;
  }

  const proxyParams = new URLSearchParams();
  proxyParams.set("q", country ? `${queryText} countries_tags:${country}` : queryText);
  proxyParams.set("page", String(normalizedPage));
  proxyParams.set("page_size", String(normalizedPageSize));
  proxyParams.set("langs", "pt,en");
  proxyParams.set("boost_phrase", "true");
  proxyParams.set(
    "fields",
    "code,product_name,product_name_pt,generic_name,generic_name_pt,brands,brands_tags,categories,labels,nutriments",
  );

  const apiParams = new URLSearchParams();
  apiParams.set("search_terms", queryText);
  if (country) {
    apiParams.set("countries_tags_en", country);
  }
  apiParams.set("page", String(normalizedPage));
  apiParams.set("page_size", String(normalizedPageSize));
  apiParams.set(
    "fields",
    "code,product_name,product_name_pt,generic_name,generic_name_pt,brands,brands_tags,categories,labels,nutriments",
  );

  try {
    const proxyUrl = getOpenFoodFactsProxySearchUrl();
    const data = await fetchOpenFoodFactsSearchJson([
      proxyUrl ? `${proxyUrl}?${proxyParams.toString()}` : "",
      `${OFF_API_SEARCH_BASE}?${apiParams.toString()}`,
    ]);

    if (!data) {
      return createEmptySearchResult(normalizedPage, normalizedPageSize);
    }
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

  const proxyParams = new URLSearchParams();
  proxyParams.set("q", `brands_tags:${cleanBrandTag}`);
  proxyParams.set("page", String(normalizedPage));
  proxyParams.set("page_size", String(normalizedPageSize));
  proxyParams.set(
    "fields",
    "code,product_name,product_name_pt,generic_name,generic_name_pt,brands,brands_tags,nutriments",
  );

  try {
    const proxyUrl = getOpenFoodFactsProxySearchUrl();
    const data = await fetchOpenFoodFactsSearchJson([
      proxyUrl ? `${proxyUrl}?${proxyParams.toString()}` : "",
    ]);

    if (!data) {
      return createEmptySearchResult(normalizedPage, normalizedPageSize);
    }
    const products = Array.isArray(data.hits)
      ? data.hits
      : Array.isArray(data.products)
        ? data.products
        : [];
    const items = products
      .map(normalizeOffProduct)
      .filter(Boolean)
      .filter((product) => {
        const rawBrandTags = product?.rawExternal?.brands_tags;
        const normalizedBrandTags = Array.isArray(rawBrandTags)
          ? rawBrandTags.map((tag) => String(tag || "").trim().toLowerCase())
          : String(rawBrandTags || "")
              .split(",")
              .map((tag) => String(tag || "").trim().toLowerCase())
              .filter(Boolean);

        return normalizedBrandTags.includes(cleanBrandTag);
      });
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
  { maxPages = 60, maxItems = 3000, pageSize = 50 } = {},
) {
  const cleanBrandTag = String(brandTag ?? "").trim().toLowerCase();
  const normalizedMaxPages = Math.max(1, safeNumber(maxPages) || 1);
  const normalizedMaxItems = Math.max(1, safeNumber(maxItems) || pageSize);
  const normalizedPageSize = Math.max(1, safeNumber(pageSize) || OFF_BRAND_IMPORT_PAGE_SIZE);
  const items = [];
  const seenKeys = new Set();
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

    batch.items.forEach((food) => {
      const identity = food.barcode || food.externalId || food.name.toLowerCase();
      if (!seenKeys.has(identity)) {
        seenKeys.add(identity);
        items.push(food);
      }
    });

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

export function bindOpenFoodFacts() {
  const importButton = document.getElementById("btnFetchOFF");
  const barcodeInput = document.getElementById("foodBarcode");

  if (!importButton || !barcodeInput || importButton.dataset.bound === "true") {
    return;
  }

  importButton.dataset.bound = "true";
  importButton.addEventListener("click", async () => {
    const barcode = String(barcodeInput.value).trim();
    if (!barcode) {
      setLastExternalImport({
        type: "off-error",
        source: "off",
        barcode: "",
        item: null,
        items: [],
        message: "Enter a barcode first.",
      });
      saveToStorage(state, activeStorageKey);
      updateUI(["all"]);
      return;
    }

    importButton.disabled = true;
    importButton.textContent = "Loading...";

    const result = await fetchFoodByBarcode(barcode);

    importButton.disabled = false;
    importButton.textContent = "Import from OFF";

    if (result.error) {
      setLastExternalImport({
        type: "off-error",
        source: "off",
        barcode,
        item: null,
        items: [],
        message: result.error,
      });
      saveToStorage(state, activeStorageKey);
      updateUI(["all"]);
      return;
    }

    document.getElementById("foodName").value = result.name;
    document.getElementById("foodKcal").value = formatInputNumber(result.kcal, {
      decimals: 0,
    });
    document.getElementById("foodP").value = formatInputNumber(result.prot, {
      decimals: 1,
    });
    document.getElementById("foodC").value = formatInputNumber(result.carb, {
      decimals: 1,
    });
    document.getElementById("foodF").value = formatInputNumber(result.fat, {
      decimals: 1,
    });
    document.getElementById("foodFiber").value = formatInputNumber(
      result.fiber,
      {
        decimals: 1,
      },
    );
    document.getElementById("foodBarcode").value = result.barcode;

    setFoodTagSelection([]);
    setFoodFormState({
      editingId: "",
      source: result.source,
      externalId: result.externalId,
      rawExternal: result.rawExternal || result.raw || null,
    });
    setLastExternalImport({
      type: "off-barcode",
      source: "off",
      barcode,
      item: result,
      items: [result],
      message: `${result.name} was imported from Open Food Facts. Review it and save when ready.`,
    });
    saveToStorage(state, activeStorageKey);
    updateUI(["all"]);
  });
}
