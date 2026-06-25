import { safeNumber, uniqueStrings } from "./utils.js";
import { isValidEdamamFoodHit, isValidEdamamRecipe } from "./validators.js";

const EDAMAM_FOOD_API_BASE = "https://api.edamam.com/api/food-database/v2";
const EDAMAM_RECIPE_API_BASE = "https://api.edamam.com/api/recipes/v2";
const EDAMAM_ANALYSIS_API_BASE = "https://api.edamam.com/api/nutrition-details";

function normalizeConfig(config = {}) {
  const source =
    config?.edamam ||
    config?.apiConfig?.edamam ||
    config;

  return {
    appId: String(
      source?.appId ?? source?.edamamAppId ?? config?.edamamAppId ?? "",
    ).trim(),
    appKey: String(
      source?.appKey ?? source?.edamamAppKey ?? config?.edamamAppKey ?? "",
    ).trim(),
  };
}

function assertEdamamConfig(config = {}) {
  const normalizedConfig = normalizeConfig(config);

  if (!normalizedConfig.appId || !normalizedConfig.appKey) {
    throw new Error("Add your Edamam App ID and App Key before using this search.");
  }

  return normalizedConfig;
}

function buildAuthSearchParams(config = {}) {
  const normalizedConfig = assertEdamamConfig(config);
  const params = new URLSearchParams();

  params.set("app_id", normalizedConfig.appId);
  params.set("app_key", normalizedConfig.appKey);

  return params;
}

function normalizeFoodHit(hit = {}) {
  const food = hit.food || {};
  const nutrients = food.nutrients || {};
  const name = String(food.label || "").trim();

  if (!name) {
    return null;
  }

  if (!isValidEdamamFoodHit(hit)) return null;

  return {
    source: "edamam",
    name,
    kcal: safeNumber(nutrients.ENERC_KCAL),
    prot: safeNumber(nutrients.PROCNT),
    carb: safeNumber(nutrients.CHOCDF),
    fat: safeNumber(nutrients.FAT),
    fiber: safeNumber(nutrients.FIBTG),
    externalId: String(food.foodId || food.uri || "").trim(),
    raw: hit,
    rawExternal: hit,
  };
}

function normalizeIngredientLine(rawIngredient = {}, servings = 1) {
  const ingredientFoodId = String(
    rawIngredient.foodId || rawIngredient.uri || rawIngredient.text || "",
  ).trim();
  const servingsCount = Math.max(1, safeNumber(servings));
  const totalWeight = safeNumber(rawIngredient.weight);

  return {
    foodId: ingredientFoodId || crypto.randomUUID(),
    externalId: ingredientFoodId,
    text: String(rawIngredient.text || rawIngredient.food || "").trim(),
    name: String(rawIngredient.food || rawIngredient.text || "Ingrediente").trim(),
    grams: Number((totalWeight / servingsCount).toFixed(1)),
    weight: totalWeight,
  };
}

function normalizeRecipeHit(hit = {}) {
  const recipe = hit.recipe || {};
  const servings = Math.max(1, safeNumber(recipe.yield) || 1);
  const totalNutrients = recipe.totalNutrients || {};
  const title = String(recipe.label || "").trim();

  if (!title) {
    return null;
  }

  const ingredients = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
    .map((ingredient) => normalizeIngredientLine(ingredient, servings))
    .filter((ingredient) => ingredient.text || ingredient.name);
  const ingredientLines = uniqueStrings(
    ingredients.map((ingredient) => ingredient.text),
  );
  const totalWeight = safeNumber(recipe.totalWeight);

  return {
    source: "edamam",
    externalId: String(recipe.uri || "").trim(),
    title,
    url: String(recipe.url || recipe.shareAs || "").trim(),
    image: String(recipe.image || "").trim(),
    ingredients,
    ingredientLines,
    items: [
      {
        foodId: String(recipe.uri || title).trim(),
        externalId: String(recipe.uri || "").trim(),
        name: title,
        grams: Number((totalWeight / servings).toFixed(1)) || 1,
        kcal: Number((safeNumber(recipe.calories) / servings).toFixed(1)),
        prot: Number((safeNumber(totalNutrients.PROCNT?.quantity) / servings).toFixed(1)),
        carb: Number((safeNumber(totalNutrients.CHOCDF?.quantity) / servings).toFixed(1)),
        fat: Number((safeNumber(totalNutrients.FAT?.quantity) / servings).toFixed(1)),
        fiber: Number((safeNumber(totalNutrients.FIBTG?.quantity) / servings).toFixed(1)),
        source: "edamam",
        rawExternal: recipe,
      },
    ],
    kcal: Number((safeNumber(recipe.calories) / servings).toFixed(1)),
    prot: Number((safeNumber(totalNutrients.PROCNT?.quantity) / servings).toFixed(1)),
    carb: Number((safeNumber(totalNutrients.CHOCDF?.quantity) / servings).toFixed(1)),
    fat: Number((safeNumber(totalNutrients.FAT?.quantity) / servings).toFixed(1)),
    fiber: Number((safeNumber(totalNutrients.FIBTG?.quantity) / servings).toFixed(1)),
    servings,
    healthLabels: uniqueStrings(recipe.healthLabels || []),
    dietLabels: uniqueStrings(recipe.dietLabels || []),
    raw: recipe,
  };
}

function normalizeAnalysisResponse(data = {}) {
  const calories = safeNumber(data.calories);
  const totalNutrients = data.totalNutrients || {};
  const totalWeight = safeNumber(data.totalWeight);
  const ingredientCount = Math.max(1, safeNumber(data.ingredients?.length) || 1);
  const ingredients = (Array.isArray(data.ingredients) ? data.ingredients : [])
    .map((ingredient) => {
      const parsed = ingredient.parsed?.[0] || {};
      const foodId = String(
        parsed.foodId || parsed.uri || ingredient.text || "",
      ).trim();
      const weight = safeNumber(parsed.weight) || safeNumber(ingredient.weight);

      return {
        foodId: foodId || crypto.randomUUID(),
        externalId: foodId,
        text: String(ingredient.text || parsed.food || "").trim(),
        name: String(parsed.food || ingredient.text || "Ingrediente").trim(),
        grams: Number(weight.toFixed(1)),
        kcal: Number((safeNumber(parsed.nutrients?.ENERC_KCAL) || calories / ingredientCount).toFixed(1)),
        prot: Number((safeNumber(parsed.nutrients?.PROCNT) || safeNumber(totalNutrients.PROCNT?.quantity) / ingredientCount).toFixed(1)),
        carb: Number((safeNumber(parsed.nutrients?.CHOCDF) || safeNumber(totalNutrients.CHOCDF?.quantity) / ingredientCount).toFixed(1)),
        fat: Number((safeNumber(parsed.nutrients?.FAT) || safeNumber(totalNutrients.FAT?.quantity) / ingredientCount).toFixed(1)),
        fiber: Number((safeNumber(parsed.nutrients?.FIBTG) || safeNumber(totalNutrients.FIBTG?.quantity) / ingredientCount).toFixed(1)),
        source: "edamam",
        rawExternal: ingredient,
      };
    })
    .filter((ingredient) => ingredient.name);

  return {
    source: "edamam",
    name: String(data.uri || "Receita analisada").trim(),
    kcal: calories,
    prot: safeNumber(totalNutrients.PROCNT?.quantity),
    carb: safeNumber(totalNutrients.CHOCDF?.quantity),
    fat: safeNumber(totalNutrients.FAT?.quantity),
    fiber: safeNumber(totalNutrients.FIBTG?.quantity),
    externalId: String(data.uri || "").trim(),
    items: ingredients.length
      ? ingredients
      : [
          {
            foodId: String(data.uri || "edamam-analysis"),
            externalId: String(data.uri || ""),
            name: "Receita Edamam",
            grams: totalWeight || 1,
            kcal: calories,
            prot: safeNumber(totalNutrients.PROCNT?.quantity),
            carb: safeNumber(totalNutrients.CHOCDF?.quantity),
            fat: safeNumber(totalNutrients.FAT?.quantity),
            fiber: safeNumber(totalNutrients.FIBTG?.quantity),
            source: "edamam",
            rawExternal: data,
          },
        ],
    raw: data,
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
    throw new Error(`Edamam search failed with status ${response.status}.`);
  }

  return response.json();
}

export function hasEdamamConfig(config = {}) {
  const normalizedConfig = normalizeConfig(config);
  return Boolean(normalizedConfig.appId && normalizedConfig.appKey);
}

export async function searchFood(query, config = {}) {
  const cleanQuery = String(query ?? "").trim();

  if (!cleanQuery) {
    return [];
  }

  const params = buildAuthSearchParams(config);
  params.set("ingr", cleanQuery);
  params.set("nutrition-type", "logging");
  params.set("category", "generic-foods");

  const data = await fetchJson(`${EDAMAM_FOOD_API_BASE}/parser?${params.toString()}`);
  const hints = Array.isArray(data.hints) ? data.hints : [];
  const seenExternalIds = new Set();

  return hints
    .map(normalizeFoodHit)
    .filter((food) => {
      if (!food) return false;

      const dedupeKey = `${food.source}:${food.externalId || food.name}`;
      if (seenExternalIds.has(dedupeKey)) {
        return false;
      }

      seenExternalIds.add(dedupeKey);
      return true;
    })
    .slice(0, 12);
}

export async function searchRecipesByIngredients(ingredients, profile = {}, config = {}) {
  const ingredientNames = uniqueStrings(
    (Array.isArray(ingredients) ? ingredients : [ingredients]).map((ingredient) =>
      typeof ingredient === "string" ? ingredient : ingredient?.name,
    ),
  );

  if (!ingredientNames.length) {
    return [];
  }

  const params = buildAuthSearchParams(config);
  params.set("type", "public");
  params.set("q", ingredientNames.slice(0, 4).join(" "));

  const goal = String(profile?.goal || "maintenance");
  if (goal === "cut") {
    params.set("diet", "high-protein");
  }

  [
    "uri",
    "label",
    "url",
    "image",
    "ingredients",
    "yield",
    "calories",
    "totalWeight",
    "totalNutrients",
    "healthLabels",
    "dietLabels",
    "shareAs",
  ].forEach((field) => params.append("field", field));

  const data = await fetchJson(`${EDAMAM_RECIPE_API_BASE}?${params.toString()}`);
  const hits = Array.isArray(data.hits) ? data.hits : [];

  return hits.map(normalizeRecipeHit).filter(Boolean).slice(0, 12);
}

export async function analyseRecipe(ingredientsText, config = {}) {
  const ingredients = uniqueStrings(
    Array.isArray(ingredientsText)
      ? ingredientsText
      : String(ingredientsText ?? "")
          .split("\n")
          .map((line) => line.trim()),
  );

  if (!ingredients.length) {
    throw new Error("There are no ingredients to analyse.");
  }

  const params = buildAuthSearchParams(config);
  const data = await fetchJson(
    `${EDAMAM_ANALYSIS_API_BASE}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Receita analisada",
        ingr: ingredients,
      }),
    },
  );

  return normalizeAnalysisResponse(data);
}

export function bindEdamamFoodSearch() {
  const searchButton = document.getElementById("searchEdamamFoodBtn");
  const searchInput = document.getElementById("edamamFoodQuery");

  if (!searchButton || !searchInput || searchButton.dataset.bound === "true") {
    return;
  }

  searchButton.dataset.bound = "true";
  searchButton.addEventListener("click", async () => {
    const query = String(searchInput.value).trim();

    if (!query) {
      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query: "",
        item: null,
        items: [],
        message: "Type a food name to search Edamam.",
      });
      saveToStorage(state, activeStorageKey);
      updateUI(["all"]);
      return;
    }

    if (!hasEdamamConfig(state.apiConfig)) {
      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query,
        item: null,
        items: [],
        message: "Add Edamam credentials before running this optional search.",
      });
      saveToStorage(state, activeStorageKey);
      updateUI(["all"]);
      return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {
      const foods = await searchFood(query, state.apiConfig);

      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query,
        item: null,
        items: foods,
        message: foods.length
          ? `Found ${foods.length} food result(s) in Edamam.`
          : "No Edamam results matched that search.",
      });
    } catch (error) {
      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query,
        item: null,
        items: [],
        message:
          error instanceof Error
            ? error.message
            : "Edamam search failed. The app still works with local and Open Food Facts data.",
      });
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = "Search Edamam";
      saveToStorage(state, activeStorageKey);
      updateUI(["all"]);
    }
  });
}
