import { safeNumber } from "./utils.js";

const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2";
const OFF_SEARCH_API = "https://world.openfoodfacts.org/cgi/search.pl";

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
        headers: {
          Accept: "application/json",
        },
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

export async function searchFoodsByQuery(query) {
  const cleanQuery = String(query ?? "").trim();

  if (!cleanQuery) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("search_terms", cleanQuery);
  params.set("search_simple", "1");
  params.set("action", "process");
  params.set("json", "1");
  params.set("page_size", "12");
  params.set(
    "fields",
    "code,product_name,product_name_pt,generic_name,generic_name_pt,nutriments",
  );

  try {
    const response = await fetch(`${OFF_SEARCH_API}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];
    const seen = new Set();

    return products
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
      .slice(0, 12);
  } catch {
    return [];
  }
}
