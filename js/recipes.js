import { getState, setState } from "./state.js";
import { safeNumber } from "./utils.js";

function calculateRecipeTotals(items, foods) {
  return items.reduce(
    (acc, item) => {
      const food = foods.find((candidate) => candidate.id === item.foodId);
      if (!food) return acc;

      const factor = safeNumber(item.grams) / 100;

      return {
        kcal: acc.kcal + safeNumber(food.kcal) * factor,
        prot: acc.prot + safeNumber(food.prot) * factor,
        carb: acc.carb + safeNumber(food.carb) * factor,
        fat: acc.fat + safeNumber(food.fat) * factor,
      };
    },
    { kcal: 0, prot: 0, carb: 0, fat: 0 },
  );
}

export function addToBuilder(foodId, grams) {
  if (!foodId) return null;

  const currentState = getState();
  const nextItem = {
    id: crypto.randomUUID(),
    foodId,
    grams: safeNumber(grams),
  };

  setState({
    builder: [...currentState.builder, nextItem],
  });

  return nextItem;
}

export function removeFromBuilder(id) {
  const currentState = getState();

  setState({
    builder: currentState.builder.filter((item) => item.id !== id),
  });
}

export function saveRecipe(name) {
  const currentState = getState();
  const recipeName = String(name ?? "").trim();

  if (!recipeName || currentState.builder.length === 0) return null;

  const recipe = {
    id: crypto.randomUUID(),
    name: recipeName,
    items: currentState.builder.map((item) => ({ ...item })),
    totals: calculateRecipeTotals(currentState.builder, currentState.foods),
  };

  setState({
    recipes: [...currentState.recipes, recipe],
    builder: [],
  });

  return recipe;
}

export function deleteRecipe(id) {
  const currentState = getState();

  setState({
    recipes: currentState.recipes.filter((recipe) => recipe.id !== id),
  });
}

export function bindRecipeForm() {
  const addIngredientButton = document.getElementById("addIngredientBtn");
  const saveRecipeButton = document.getElementById("saveRecipeBtn");

  if (addIngredientButton && addIngredientButton.dataset.bound !== "true") {
    addIngredientButton.dataset.bound = "true";
    addIngredientButton.addEventListener("click", () => {
      const foodId = String(getElementValue("recipeFoodSelect")).trim();
      const grams = safeNumber(getElementValue("recipeFoodGrams"));

      if (!foodId || grams <= 0) return;

      addToBuilder(foodId, grams);
      document.getElementById("recipeFoodGrams").value = "";
      persistAndUpdate(["recipes"]);
    });
  }

  if (saveRecipeButton && saveRecipeButton.dataset.bound !== "true") {
    saveRecipeButton.dataset.bound = "true";
    saveRecipeButton.addEventListener("click", () => {
      const name = String(getElementValue("recipeName")).trim();
      if (!name) return;

      saveRecipe(name);
      document.getElementById("recipeName").value = "";
      resetRecipeSuggestions();
      persistAndUpdate(["recipes"]);
    });
  }
}
