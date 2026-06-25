import {
  calculateAccuracy,
  calculateFiberTarget,
  getEffectiveTargets,
  sumEntryMacros,
} from "./algorithm.js?v=navy2";
import { pickByScore } from "./coach.js";
import { clamp, formatDate, safeNumber } from "./utils.js";

function getMealStructure(mealsPerDay = 4) {
  return [
    { name: "Pequeno-almoco", type: "snack", weight: 0.2 },
    { name: "Almoco", type: "main", weight: 0.35 },
    { name: "Lanche", type: "snack", weight: 0.1 },
    { name: "Jantar", type: "main", weight: 0.35 },
  ].slice(0, mealsPerDay);
}

function buildMealTarget(target, weight) {
  return {
    kcal: Math.round(safeNumber(target.kcal) * weight),
    prot: Math.round(safeNumber(target.prot) * weight),
    carb: Math.round(safeNumber(target.carb) * weight),
    fat: Math.round(safeNumber(target.fat) * weight),
  };
}

function getCompatibleFoods(foods, mealType, macroTag) {
  const exactMatches = foods.filter(
    (food) =>
      Array.isArray(food.tags) &&
      food.tags.includes(macroTag) &&
      food.tags.includes(mealType),
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  return foods.filter(
    (food) => Array.isArray(food.tags) && food.tags.includes(macroTag),
  );
}

function getSelectedDay(state) {
  return state.days?.[formatDate(state.selectedDate)] || {};
}

function getWarningSet(state) {
  return new Set((state.safetyWarnings || []).map((warning) => warning.id));
}

function getFiberShortfall(state) {
  const day = getSelectedDay(state);
  const effectiveTargets = getEffectiveTargets(state) || state.targets;

  if (!effectiveTargets) {
    return 0;
  }

  const fiberTarget =
    safeNumber(effectiveTargets.fiber) ||
    calculateFiberTarget(effectiveTargets.kcal);

  return Math.max(0, fiberTarget - safeNumber(day.fiber));
}

function getGoalTagBoost(state, food) {
  const goal = String(state.userProfile?.goal || "");
  const tags = new Set(food.tags || []);

  if (!goal) {
    return 0;
  }

  if (tags.has(goal)) {
    return 0.12;
  }

  if (goal === "cut" && tags.has("bulk")) {
    return -0.08;
  }

  if (goal === "bulk" && tags.has("cut")) {
    return -0.06;
  }

  return 0;
}

function getProteinDensityBoost(food, macroTag) {
  if (macroTag !== "protein") {
    return 0;
  }

  const calories = Math.max(1, safeNumber(food.kcal));
  const proteinDensity = safeNumber(food.prot) / calories;
  return clamp(proteinDensity * 3.5, 0, 0.22);
}

function getFiberPenalty(state, food, macroTag) {
  const shortfall = getFiberShortfall(state);

  if (shortfall <= 0) {
    return 0;
  }

  const severity = shortfall >= 10 ? 1 : 0.65;
  const carbs = safeNumber(food.carb);
  const tags = new Set(food.tags || []);

  if (macroTag === "carb") {
    return carbs >= 20 || tags.has("carb") ? 0 : 0.18 * severity;
  }

  if (tags.has("carb") || carbs >= 12) {
    return 0.05 * severity;
  }

  return 0.16 * severity;
}

function getSafetyPenalty(state, food, macroTag) {
  const warnings = getWarningSet(state);
  let penalty = 0;

  if (warnings.has("lowFat") && macroTag !== "fat" && safeNumber(food.fat) < 8) {
    penalty += 0.16;
  }

  if (warnings.has("fastWeightLoss") && safeNumber(food.kcal) < 120) {
    penalty += 0.08;
  }

  return penalty;
}

function getSafetyBoost(state, food, macroTag) {
  const warnings = getWarningSet(state);
  let boost = 0;

  if (
    warnings.has("lowFat") &&
    (macroTag === "fat" || safeNumber(food.fat) >= 12)
  ) {
    boost += 0.18;
  }

  if (warnings.has("fastWeightLoss") && safeNumber(food.kcal) >= 180) {
    boost += 0.06;
  }

  return boost;
}

function applySafetyOverride(candidatePool, state, macroTag) {
  const warnings = getWarningSet(state);

  if (warnings.has("lowFat") && macroTag === "fat") {
    const fatForwardFoods = candidatePool.filter((food) => {
      const tags = new Set(food.tags || []);
      return tags.has("fat") || safeNumber(food.fat) >= 12;
    });

    if (fatForwardFoods.length) {
      return fatForwardFoods;
    }
  }

  return candidatePool;
}

function buildAdjustedScores(
  candidatePool,
  state,
  mealType,
  macroTag,
  coachScores,
  usedFoodIds,
) {
  return candidatePool.reduce((scores, food) => {
    const tags = new Set(food.tags || []);
    let score = safeNumber(coachScores[food.id]?.total ?? coachScores[food.id] ?? 0.45);

    if (tags.has(mealType)) {
      score += 0.05;
    }

    score += getGoalTagBoost(state, food);
    score += getSafetyBoost(state, food, macroTag);
    score += getProteinDensityBoost(food, macroTag);
    score -= getFiberPenalty(state, food, macroTag);
    score -= getSafetyPenalty(state, food, macroTag);

    if (usedFoodIds.has(food.id)) {
      score -= 0.2;
    }

    scores[food.id] = { total: clamp(score, 0.01, 1.4) };
    return scores;
  }, {});
}

function chooseFood(foods, state, mealType, macroTag, coachScores, usedFoodIds) {
  const compatibleFoods = getCompatibleFoods(foods, mealType, macroTag);
  if (!compatibleFoods.length) return null;

  const unusedFoods = compatibleFoods.filter((food) => !usedFoodIds.has(food.id));
  const candidatePool = unusedFoods.length ? unusedFoods : compatibleFoods;
  const safetyAwarePool = applySafetyOverride(candidatePool, state, macroTag);
  const adjustedScores = buildAdjustedScores(
    safetyAwarePool,
    state,
    mealType,
    macroTag,
    coachScores,
    usedFoodIds,
  );

  return pickByScore(safetyAwarePool, adjustedScores);
}

function calculateItemGrams(food, targetMacro, macroKey) {
  const cleanTargetMacro = safeNumber(targetMacro);
  const macroPer100 = safeNumber(food?.[macroKey]);

  if (!food || cleanTargetMacro <= 0 || macroPer100 <= 0) {
    return 0;
  }

  return clamp(Math.round((cleanTargetMacro / macroPer100) * 100), 5, 300);
}

function buildMealItem(food, grams) {
  const factor = grams / 100;

  return {
    foodId: food.id,
    name: food.name,
    grams,
    kcal: safeNumber(food.kcal) * factor,
    prot: safeNumber(food.prot) * factor,
    carb: safeNumber(food.carb) * factor,
    fat: safeNumber(food.fat) * factor,
  };
}

export function generatePlan(state, target, coachScores = {}) {
  if (!Array.isArray(state.foods) || state.foods.length === 0) {
    return { error: "Sem alimentos na base de dados." };
  }

  const meals = getMealStructure(state.userProfile?.mealsPerDay || 4);
  const plan = meals.map((meal) => {
    const mealTarget = buildMealTarget(target, meal.weight);
    const usedFoodIds = new Set();
    const items = [];

    const macroSteps = [
      { tag: "protein", key: "prot", target: mealTarget.prot },
      { tag: "carb", key: "carb", target: mealTarget.carb },
      { tag: "fat", key: "fat", target: mealTarget.fat },
    ];

    macroSteps.forEach((step) => {
      const food = chooseFood(
        state.foods,
        state,
        meal.type,
        step.tag,
        coachScores,
        usedFoodIds,
      );

      if (!food) return;

      const grams = calculateItemGrams(food, step.target, step.key);
      if (grams <= 0) return;

      usedFoodIds.add(food.id);
      items.push(buildMealItem(food, grams));
    });

    const totals = sumEntryMacros(items);

    return {
      name: meal.name,
      target: mealTarget,
      actual: {
        kcal: Math.round(totals.kcal),
        prot: Math.round(totals.prot),
        carb: Math.round(totals.carb),
        fat: Math.round(totals.fat),
      },
      items,
      accuracy: calculateAccuracy(mealTarget.kcal, totals.kcal),
    };
  });

  return { plan };
}

export function bindMealPlanner() {
  const generateButton = document.getElementById("generateMealPlanBtn");
  if (!generateButton || generateButton.dataset.bound === "true") return;

  generateButton.dataset.bound = "true";
  generateButton.addEventListener("click", () => {
    refreshDerivedState();
    updateUI(["day"]);
  });
}
