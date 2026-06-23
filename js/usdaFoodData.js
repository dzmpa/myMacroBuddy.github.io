import { safeNumber, uniqueStrings } from "./utils.js";
import { parseNumberOrNull, isValidNutrientEntry, isValidUSDAFood } from "./validators.js";

const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";
const USDA_DEFAULT_API_KEY = "DEMO_KEY";

const USDA_NUTRIENTS = {
  kcal: {
    ids: [1008],
    names: ["energy"],
  },
  prot: {
    ids: [1003],
    names: ["protein"],
  },
  carb: {
    ids: [1005],
    names: ["carbohydrate, by difference"],
  },
  fat: {
    ids: [1004],
    names: ["total lipid (fat)", "total fat"],
  },
  fiber: {
    ids: [1079],
    names: ["fiber, total dietary", "dietary fiber"],
  },
};

function roundMacro(value) {
  return Number(safeNumber(value).toFixed(1));
}

function normalizeConfig(config = {}) {
  const source = config?.usda || config?.apiConfig?.usda || config;
  const apiKey = String(
    source?.apiKey ?? source?.usdaApiKey ?? config?.usdaApiKey ?? USDA_DEFAULT_API_KEY,
  ).trim();

  return {
    apiKey: apiKey || USDA_DEFAULT_API_KEY,
  };
}

function buildUrl(pathname, params = new URLSearchParams(), config = {}) {
  const url = new URL(`${USDA_API_BASE}${pathname}`);
  const normalizedConfig = normalizeConfig(config);
  params.set("api_key", normalizedConfig.apiKey);
  url.search = params.toString();
  return url.toString();
}

function getNutrientMeta(entry = {}) {
  if (entry?.nutrient && typeof entry.nutrient === "object") {
    return {
      id: safeNumber(entry.nutrient.id),
      name: String(entry.nutrient.name || "").trim().toLowerCase(),
      amount: safeNumber(entry.amount),
    };
  }

  return {
    id: safeNumber(entry.nutrientId ?? entry.nutrientNumber ?? entry.number),
    name: String(entry.nutrientName ?? entry.name ?? "").trim().toLowerCase(),
    amount: safeNumber(entry.value ?? entry.amount),
  };
}

// nutrient validation delegated to js/validators.js

function resolveNutrientAmount(foodNutrients = [], definition = {}) {
  const wantedIds = new Set((definition.ids || []).map((value) => safeNumber(value)));
  const wantedNames = new Set(
    (definition.names || []).map((value) => String(value || "").trim().toLowerCase()),
  );

  for (const nutrient of foodNutrients) {
    const meta = getNutrientMeta(nutrient);

    if (wantedIds.has(meta.id) || wantedNames.has(meta.name)) {
      return roundMacro(meta.amount);
    }
  }

  return 0;
}

export function normalizeFoodResult(food = {}) {
  const name = String(food.description ?? food.lowercaseDescription ?? "").trim();
  const externalId = String(food.fdcId ?? food.externalId ?? "").trim();
  const nutrients = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];

  // Use the centralized USDA food validator which ensures required fields
  // and nutrient entries are parseable.
  if (!isValidUSDAFood(food)) return null;

  return {
    id: `usda:${externalId}`,
    name,
    kcal: resolveNutrientAmount(nutrients, USDA_NUTRIENTS.kcal),
    prot: resolveNutrientAmount(nutrients, USDA_NUTRIENTS.prot),
    carb: resolveNutrientAmount(nutrients, USDA_NUTRIENTS.carb),
    fat: resolveNutrientAmount(nutrients, USDA_NUTRIENTS.fat),
    fiber: resolveNutrientAmount(nutrients, USDA_NUTRIENTS.fiber),
    source: "usda",
    externalId,
    tags: uniqueStrings([]),
    raw: food,
    rawExternal: food,
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? "USDA demo access is rate-limited. Add your own USDA API key for reliable search."
        : `USDA search failed with status ${response.status}.`,
    );
  }

  return response.json();
}

export async function searchFoods(query, config = {}) {
  const cleanQuery = String(query ?? "").trim();

  if (!cleanQuery) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("query", cleanQuery);
  params.set("pageSize", "12");
  params.append("dataType", "Foundation");
  params.append("dataType", "SR Legacy");
  params.append("dataType", "Survey (FNDDS)");

  const data = await fetchJson(buildUrl("/foods/search", params, config));
  const foods = Array.isArray(data.foods) ? data.foods : [];
  const seen = new Set();

  return foods
    .map((food) => normalizeFoodResult(food))
    .filter((food) => {
      if (!food) {
        return false;
      }

      const key = `${food.source}:${food.externalId}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

export async function getFoodMacros(fdcId, config = {}) {
  const cleanId = String(fdcId ?? "").trim();

  if (!cleanId) {
    throw new Error("USDA food ID is required.");
  }

  const data = await fetchJson(
    buildUrl(`/food/${encodeURIComponent(cleanId)}`, new URLSearchParams(), config),
  );
  const normalizedFood = normalizeFoodResult(data);

  if (!normalizedFood) {
    throw new Error("USDA food details were incomplete.");
  }

  return normalizedFood;
}
