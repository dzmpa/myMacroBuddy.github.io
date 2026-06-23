import { safeNumber } from "./utils.js";

export function parseNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const s = String(value).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function isValidNutrientEntry(entry = {}) {
  const candidates = [entry.amount, entry.value, entry.nutrient?.amount, entry.nutrient?.value];
  for (const c of candidates) {
    if (c === undefined) continue;
    const parsed = parseNumberOrNull(c);
    if (parsed === null && c !== null && String(c).trim() !== "") {
      return false;
    }
  }

  return true;
}

export function isValidUSDAFood(food = {}) {
  const name = String(food.description ?? food.lowercaseDescription ?? "").trim();
  const externalId = String(food.fdcId ?? food.externalId ?? "").trim();

  if (!name || !externalId) return false;

  const nutrients = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];
  for (const entry of nutrients) {
    if (!isValidNutrientEntry(entry)) return false;
  }

  return true;
}

export function isValidEdamamFoodHit(hit = {}) {
  const food = hit.food || {};
  const nutrients = food.nutrients || {};
  const name = String(food.label || "").trim();

  if (!name) return false;

  const nutrientKeys = ["ENERC_KCAL", "PROCNT", "CHOCDF", "FAT", "FIBTG"];
  for (const k of nutrientKeys) {
    if (Object.prototype.hasOwnProperty.call(nutrients, k)) {
      const parsed = parseNumberOrNull(nutrients[k]);
      if (parsed === null && String(nutrients[k]).trim() !== "") return false;
    }
  }

  return true;
}

export function isValidEdamamRecipe(recipe = {}) {
  if (!recipe || typeof recipe !== "object") return false;
  const title = String(recipe.label || "").trim();
  if (!title) return false;
  const calories = parseNumberOrNull(recipe.calories);
  if (calories === null) return false;
  // allow zero-calorie recipes but prefer recipes with positive calories
  return calories >= 0;
}

export function isValidOFFProduct(product = {}) {
  if (!product || typeof product !== "object") return false;

  const hasName = Boolean(
    product.product_name_pt || product.product_name || product.generic_name,
  );

  const nutriments = product.nutriments;
  const hasNutriments = nutriments && typeof nutriments === "object" && Object.keys(nutriments).length > 0;

  return hasName && hasNutriments;
}
