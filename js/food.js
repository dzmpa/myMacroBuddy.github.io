import { getState, setState } from "./state.js";
import { safeNumber, uniqueStrings } from "./utils.js";
import { refreshSearchIndex } from "./search.js";

export const FOOD_TAGS = [
  "protein",
  "carb",
  "fat",
  "main",
  "snack",
  "cut",
  "bulk",
];

export function inferTags(food) {
  const protein = safeNumber(food.prot);
  const carbs = safeNumber(food.carb);
  const fats = safeNumber(food.fat);
  const calories = safeNumber(food.kcal);

  const tags = [];

  if (protein >= carbs && protein >= fats) {
    tags.push("protein");
  } else if (carbs >= protein && carbs >= fats) {
    tags.push("carb");
  } else {
    tags.push("fat");
  }

  if (calories <= 150) {
    tags.push("cut");
  } else {
    tags.push("bulk");
  }

  if (tags.includes("fat")) {
    tags.push("snack");
  } else {
    tags.push("main");
  }

  return tags;
}

export function mergeTags(autoTags = [], manualTags = []) {
  return uniqueStrings([...autoTags, ...manualTags]).filter((tag) =>
    FOOD_TAGS.includes(tag),
  );
}

function normalizeSource(source) {
  const normalizedSource = String(source ?? "").trim().toLowerCase();

  if (
    normalizedSource === "off" ||
    normalizedSource.includes("open food facts")
  ) {
    return "off";
  }

  if (normalizedSource === "edamam") {
    return "edamam";
  }

  if (normalizedSource === "usda") {
    return "usda";
  }

  return "manual";
}

function cloneRawExternal(rawExternal) {
  if (!rawExternal || typeof rawExternal !== "object") {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(rawExternal));
  } catch {
    return null;
  }
}

function normalizeFoodPayload(payload, currentFood = {}) {
  const baseFood = {
    id: currentFood.id || crypto.randomUUID(),
    name: String(payload.name ?? "").trim(),
    kcal: safeNumber(payload.kcal),
    prot: safeNumber(payload.prot),
    carb: safeNumber(payload.carb),
    fat: safeNumber(payload.fat),
    fiber: safeNumber(payload.fiber ?? currentFood.fiber),
    source: normalizeSource(payload.source || currentFood.source || "manual"),
    externalId: String(
      payload.externalId ?? currentFood.externalId ?? "",
    ).trim(),
    barcode: String(payload.barcode ?? currentFood.barcode ?? "").trim(),
  };

  return {
    ...baseFood,
    tags: mergeTags(inferTags(baseFood), payload.tags || currentFood.tags || []),
    rawExternal:
      baseFood.source === "edamam"
        ? null
        : cloneRawExternal(payload.rawExternal ?? payload.raw ?? currentFood.rawExternal),
  };
}

function findExistingImportedFood(foods, payload) {
  if (payload.barcode) {
    return foods.find((food) => String(food.barcode || "") === payload.barcode) || null;
  }

  if (payload.externalId && payload.source !== "manual") {
    return (
      foods.find(
        (food) =>
          String(food.externalId || "") === payload.externalId &&
          String(food.source || "manual") === payload.source,
      ) || null
    );
  }

  return null;
}

export function getFoodById(id) {
  return getState().foods.find((food) => food.id === id) || null;
}

export function addFood(payload) {
  const currentState = getState();
  const food = normalizeFoodPayload(payload);

  if (!food.name) return null;

  const existingImportedFood = findExistingImportedFood(currentState.foods, food);
  if (existingImportedFood) {
    return updateFood(existingImportedFood.id, food);
  }

  setState({
    foods: [...currentState.foods, food],
  });

  // Keep in-memory search index live
  try {
    refreshSearchIndex();
  } catch (e) {
    // non-fatal
    console.error("refreshSearchIndex error (addFood)", e);
  }

  return food;
}

export function updateFood(id, payload) {
  const currentState = getState();
  const currentFood = getFoodById(id);

  if (!currentFood) return null;

  const updatedFood = normalizeFoodPayload(payload, currentFood);

  setState({
    foods: currentState.foods.map((food) =>
      food.id === id ? updatedFood : food,
    ),
  });

  // Keep in-memory search index live
  try {
    refreshSearchIndex();
  } catch (e) {
    console.error("refreshSearchIndex error (updateFood)", e);
  }

  return updatedFood;
}

export function deleteFood(id) {
  const currentState = getState();

  setState({
    foods: currentState.foods.filter((food) => food.id !== id),
  });

  // Keep in-memory search index live
  try {
    refreshSearchIndex();
  } catch (e) {
    console.error("refreshSearchIndex error (deleteFood)", e);
  }
}
