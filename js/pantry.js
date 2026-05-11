import { buildCoachScores } from "./coach.js";
import { hasEdamamConfig, searchRecipesByIngredients } from "./edamam.js";
import { getEffectiveTargets } from "./algorithm.js?v=navy2";
import {
  createEmptyRecipeSuggestions,
  getState,
  setState,
} from "./state.js";
import { formatDate, safeNumber, uniqueStrings } from "./utils.js";

function normalizeGoal(goal) {
  return ["cut", "maintenance", "bulk"].includes(goal) ? goal : "maintenance";
}

function getFoodsById(foods = []) {
  return new Map(foods.map((food) => [food.id, food]));
}

function getRemainingTargets(sourceState) {
  const dayKey = formatDate(sourceState.selectedDate);
  const day = sourceState.days?.[dayKey] || {};
  const targets = getEffectiveTargets(sourceState) || sourceState.targets;

  if (!targets) {
    return null;
  }

  return {
    kcal: Math.max(0, safeNumber(targets.kcal) - safeNumber(day.kcal)),
    prot: Math.max(0, safeNumber(targets.prot) - safeNumber(day.prot)),
    carb: Math.max(0, safeNumber(targets.carb) - safeNumber(day.carb)),
    fat: Math.max(0, safeNumber(targets.fat) - safeNumber(day.fat)),
  };
}

function deriveMacroTags({ kcal, prot, carb, fat }) {
  const tags = ["main"];
  const protein = safeNumber(prot);
  const carbs = safeNumber(carb);
  const fats = safeNumber(fat);
  const calories = safeNumber(kcal);

  if (protein >= carbs && protein >= fats) {
    tags.push("protein");
  } else if (carbs >= protein && carbs >= fats) {
    tags.push("carb");
  } else {
    tags.push("fat");
  }

  if (calories > 0 && protein / Math.max(calories, 1) >= 0.14 && calories <= 550) {
    tags.push("cut");
  } else if (calories >= 650 || fats >= 20 || carbs >= 55) {
    tags.push("bulk");
  }

  return uniqueStrings(tags);
}

function buildLocalRecipeSuggestion(recipe, foodsById, selectedFoodIds = new Set()) {
  const items = (recipe.items || [])
    .map((item) => {
      const food = foodsById.get(item.foodId);
      if (!food) {
        return null;
      }

      const factor = safeNumber(item.grams) / 100;

      return {
        foodId: food.id,
        externalId: String(food.externalId || "").trim(),
        name: food.name,
        grams: safeNumber(item.grams),
        kcal: Number((safeNumber(food.kcal) * factor).toFixed(1)),
        prot: Number((safeNumber(food.prot) * factor).toFixed(1)),
        carb: Number((safeNumber(food.carb) * factor).toFixed(1)),
        fat: Number((safeNumber(food.fat) * factor).toFixed(1)),
        source: food.source || "manual",
        rawExternal: food.rawExternal || null,
      };
    })
    .filter(Boolean);

  if (!items.length) {
    return null;
  }

  const matchedFoodIds = items
    .map((item) => item.foodId)
    .filter((foodId) => selectedFoodIds.has(foodId));

  if (!matchedFoodIds.length) {
    return null;
  }

  const ingredientLines = items.map((item) => `${item.grams}g ${item.name}`);

  return {
    id: String(recipe.id || crypto.randomUUID()),
    source: "local",
    title: recipe.name,
    url: "",
    image: "",
    ingredients: items.map((item) => ({
      foodId: item.foodId,
      externalId: item.externalId,
      name: item.name,
      text: `${item.grams}g ${item.name}`,
      grams: item.grams,
      weight: item.grams,
    })),
    ingredientLines,
    items,
    kcal: safeNumber(recipe.totals?.kcal),
    prot: safeNumber(recipe.totals?.prot),
    carb: safeNumber(recipe.totals?.carb),
    fat: safeNumber(recipe.totals?.fat),
    servings: 1,
    healthLabels: [],
    dietLabels: [],
    matchedFoodIds: uniqueStrings(matchedFoodIds),
    tags: uniqueStrings(
      items.flatMap((item) => foodsById.get(item.foodId)?.tags || []),
    ),
    raw: recipe,
  };
}

function buildExternalRecipeSuggestion(recipe, selectedFoodIds = []) {
  const existingTags = uniqueStrings([
    ...(recipe.healthLabels || []),
    ...(recipe.dietLabels || []),
  ]);

  return {
    ...recipe,
    id: String(recipe.externalId ?? recipe.url ?? recipe.title ?? crypto.randomUUID()),
    matchedFoodIds: uniqueStrings(selectedFoodIds),
    tags: uniqueStrings([...deriveMacroTags(recipe), ...existingTags]),
  };
}

function scoreGoalFit(recipe, goal) {
  const normalizedGoal = normalizeGoal(goal);
  const calories = Math.max(1, safeNumber(recipe.kcal));
  const protein = safeNumber(recipe.prot);
  const carbs = safeNumber(recipe.carb);
  const fat = safeNumber(recipe.fat);
  const proteinDensity = protein / calories;
  const calorieModeration = 1 - Math.min(Math.abs(calories - 550) / 550, 1);
  const calorieDensity = Math.min(calories / 850, 1);
  const balance = 1 - Math.min(Math.abs(carbs - protein) / 90, 1);
  const fatModeration = 1 - Math.min(fat / 40, 1);

  if (normalizedGoal === "cut") {
    return proteinDensity * 0.55 + calorieModeration * 0.3 + fatModeration * 0.15;
  }

  if (normalizedGoal === "bulk") {
    return proteinDensity * 0.35 + calorieDensity * 0.4 + balance * 0.25;
  }

  return proteinDensity * 0.4 + calorieModeration * 0.3 + balance * 0.3;
}

function scoreMacroFit(recipe, remainingTargets) {
  const remainingKcal = Math.max(1, safeNumber(remainingTargets.kcal) || 550);
  const remainingProt = Math.max(1, safeNumber(remainingTargets.prot) || 30);
  const remainingCarb = Math.max(1, safeNumber(remainingTargets.carb) || 45);
  const remainingFat = Math.max(1, safeNumber(remainingTargets.fat) || 15);

  const kcalFit =
    1 -
    Math.min(
      Math.abs(remainingKcal - safeNumber(recipe.kcal)) / remainingKcal,
      1,
    );
  const proteinFit = Math.min(safeNumber(recipe.prot) / remainingProt, 1);
  const carbFit =
    1 -
    Math.min(
      Math.abs(remainingCarb - safeNumber(recipe.carb)) / remainingCarb,
      1,
    );
  const fatFit =
    1 -
    Math.min(
      Math.abs(remainingFat - safeNumber(recipe.fat)) / remainingFat,
      1,
    );

  return kcalFit * 0.35 + proteinFit * 0.35 + carbFit * 0.15 + fatFit * 0.15;
}

function scoreTagAlignment(recipeTags = [], pantryTags = []) {
  const recipeTagSet = new Set(recipeTags);
  const relevantPantryTags = pantryTags.filter((tag) =>
    ["protein", "carb", "fat", "cut", "bulk", "main", "snack"].includes(tag),
  );

  if (!relevantPantryTags.length) {
    return 0.6;
  }

  const matched = relevantPantryTags.filter((tag) => recipeTagSet.has(tag));
  return matched.length / relevantPantryTags.length;
}

function scoreCoverage(recipe, selectedFoodIds) {
  if (recipe.source === "local") {
    const totalItems = Math.max(1, recipe.ingredients?.length || recipe.items?.length || 1);
    return Math.min((recipe.matchedFoodIds?.length || 0) / totalItems, 1);
  }

  return selectedFoodIds.length ? 0.65 : 0;
}

function scoreCoachAlignment(recipe, coachScores = {}, pantryFoodIds = []) {
  const candidateFoodIds =
    recipe.source === "local"
      ? recipe.matchedFoodIds || []
      : pantryFoodIds;

  if (!candidateFoodIds.length) {
    return 0.45;
  }

  const total = candidateFoodIds.reduce((sum, foodId) => {
    return sum + safeNumber(coachScores[foodId]?.total ?? 0.45);
  }, 0);

  return total / candidateFoodIds.length;
}

function scoreSuggestion(recipe, context) {
  const coverage = scoreCoverage(recipe, context.selectedFoodIds);
  const goalFit = scoreGoalFit(recipe, context.goal);
  const macroFit = scoreMacroFit(recipe, context.remainingTargets);
  const coachFit = scoreCoachAlignment(
    recipe,
    context.coachScores,
    context.selectedFoodIds,
  );
  const tagFit = scoreTagAlignment(recipe.tags || [], context.pantryTags);
  const score =
    coverage * 0.28 +
    goalFit * 0.24 +
    macroFit * 0.2 +
    coachFit * 0.16 +
    tagFit * 0.12;
  const reasons = [
    coverage >= 0.99
      ? "Usa totalmente os alimentos escolhidos."
      : "Aproveita a tua selecao de despensa.",
    context.goal === "cut"
      ? "Priorizada para corte com foco em proteina."
      : context.goal === "bulk"
        ? "Priorizada para bulk com mais energia util."
        : "Priorizada para manutencao equilibrada.",
    macroFit >= 0.6
      ? "Encaixa bem nas macros restantes do dia."
      : "Faz sentido como refeicao complementar.",
  ];

  return {
    ...recipe,
    score: Number(score.toFixed(3)),
    reasons: uniqueStrings(reasons),
  };
}

function sortAndLimitSuggestions(candidates = []) {
  return [...candidates]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

function updatePantry(foodIds) {
  const currentState = getState();
  const knownFoodIds = new Set(currentState.foods.map((food) => food.id));

  setState({
    pantry: {
      ...(currentState.pantry || {}),
      foodIds: uniqueStrings(foodIds).filter((foodId) => knownFoodIds.has(foodId)),
    },
  });
}

export function addPantryItem(foodId) {
  const currentState = getState();
  const currentFoodIds = currentState.pantry?.foodIds || [];

  updatePantry([...currentFoodIds, String(foodId || "").trim()]);
}

export function removePantryItem(foodId) {
  const currentState = getState();

  updatePantry(
    (currentState.pantry?.foodIds || []).filter(
      (currentFoodId) => currentFoodId !== String(foodId || "").trim(),
    ),
  );
}

export function clearPantry() {
  updatePantry([]);
}

export function getAvailableFoods(ids, foods = []) {
  const selectedFoodIds = new Set((ids || []).map(String));
  return foods.filter((food) => selectedFoodIds.has(food.id));
}

export function getPantryFoods(sourceState = getState()) {
  return getAvailableFoods(sourceState.pantry?.foodIds || [], sourceState.foods || []);
}

export async function suggestRecipesFromPantry(
  sourceState = getState(),
  selectedFoodIds = sourceState.pantry?.foodIds || [],
) {
  const baseResult = createEmptyRecipeSuggestions();
  const availableFoods = getAvailableFoods(selectedFoodIds, sourceState.foods || []);

  if (!availableFoods.length) {
    return {
      ...baseResult,
      message: "Escolhe alimentos na despensa antes de pedir sugestoes.",
    };
  }

  const foodsById = getFoodsById(sourceState.foods || []);
  const selectedFoodIdSet = new Set(selectedFoodIds);
  const coachScores = buildCoachScores(sourceState);
  const goal = normalizeGoal(sourceState.userProfile?.goal);
  const effectiveTargets = getEffectiveTargets(sourceState) || sourceState.targets;
  const remainingTargets = getRemainingTargets(sourceState) || {
    kcal: Math.max(1, safeNumber(effectiveTargets?.kcal)),
    prot: Math.max(1, safeNumber(effectiveTargets?.prot)),
    carb: Math.max(1, safeNumber(effectiveTargets?.carb)),
    fat: Math.max(1, safeNumber(effectiveTargets?.fat)),
  };
  const pantryTags = uniqueStrings(availableFoods.flatMap((food) => food.tags || []));

  const localCandidates = (sourceState.recipes || [])
    .map((recipe) => buildLocalRecipeSuggestion(recipe, foodsById, selectedFoodIdSet))
    .filter(Boolean);

  let externalCandidates = [];
  let externalMessage = "";

  if (hasEdamamConfig(sourceState.apiConfig)) {
    try {
      const externalRecipes = await searchRecipesByIngredients(
        availableFoods,
        sourceState.userProfile,
        sourceState.apiConfig,
      );

      externalCandidates = externalRecipes.map((recipe) =>
        buildExternalRecipeSuggestion(recipe, selectedFoodIds),
      );
    } catch (error) {
      externalMessage =
        error instanceof Error
          ? error.message
          : "A pesquisa externa falhou, por isso mostrei apenas dados locais.";
    }
  } else if (!localCandidates.length) {
    externalMessage =
      "Configura a Edamam para desbloquear mais sugestoes alem das receitas locais.";
  }

  const scoredSuggestions = [...localCandidates, ...externalCandidates].map((recipe) =>
    scoreSuggestion(recipe, {
      goal,
      remainingTargets,
      coachScores,
      pantryTags,
      selectedFoodIds,
    }),
  );
  const items = sortAndLimitSuggestions(scoredSuggestions);

  if (!items.length) {
    return {
      ...baseResult,
      message:
        externalMessage ||
        "Nao encontrei 1 a 3 receitas compativeis com esta despensa.",
      usedExternal: false,
      generatedAt: new Date().toISOString(),
    };
  }

  const suggestionCountMessage =
    items.length < 3
      ? `Encontrei ${items.length} sugest${items.length === 1 ? "ao" : "oes"} util(is) para esta despensa.`
      : "";

  return {
    items,
    message: externalMessage || suggestionCountMessage,
    usedExternal: externalCandidates.length > 0,
    generatedAt: new Date().toISOString(),
  };
}
