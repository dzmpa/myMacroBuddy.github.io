import { clamp, safeNumber } from "./utils.js";

const SCORE_WEIGHTS = {
  nutrition: 0.5,
  frequency: 0.4,
  variety: 0.1,
};

const FREQUENCY_CAP = 0.75;

function getMaxUsage(usageMap) {
  return Math.max(1, ...Object.values(usageMap));
}

function getNutritionScore(food) {
  const calories = safeNumber(food.kcal);
  if (calories <= 0) return 0;

  const proteinDensity = safeNumber(food.prot) / calories;
  const carbDensity = safeNumber(food.carb) / calories;
  const fatDensity = safeNumber(food.fat) / calories;

  return clamp(
    proteinDensity * 4 - carbDensity * 0.15 - fatDensity * 0.25,
    0,
    1,
  );
}

export function buildUsageMap(days = {}) {
  return Object.values(days).reduce((usageMap, day) => {
    (day.foods || []).forEach((foodEntry) => {
      if (!foodEntry.id) return;

      usageMap[foodEntry.id] = (usageMap[foodEntry.id] || 0) + 1;
    });

    return usageMap;
  }, {});
}

export function scoreFood(food, usageMap = {}) {
  const maxUsage = getMaxUsage(usageMap);
  const usageCount = usageMap[food.id] || 0;
  const nutritionScore = getNutritionScore(food);
  const frequencyScore = Math.min(usageCount / maxUsage, FREQUENCY_CAP);
  const varietyScore = 1 - Math.min(usageCount / (maxUsage * 1.5), 1);
  const total =
    nutritionScore * SCORE_WEIGHTS.nutrition +
    frequencyScore * SCORE_WEIGHTS.frequency +
    varietyScore * SCORE_WEIGHTS.variety;

  return {
    foodId: food.id,
    nutritionScore,
    frequencyScore,
    varietyScore,
    total: clamp(total, 0.01, 1),
  };
}

export function buildCoachScores(state) {
  const usageMap = buildUsageMap(state.days || {});

  return state.foods.reduce((scores, food) => {
    scores[food.id] = scoreFood(food, usageMap);
    return scores;
  }, {});
}

export function pickByScore(candidates = [], scores = {}) {
  if (!candidates.length) return null;

  const weightedCandidates = candidates.map((food) => ({
    food,
    weight: Math.max(0.01, safeNumber(scores[food.id]?.total ?? scores[food.id])),
  }));

  const totalWeight = weightedCandidates.reduce(
    (sum, candidate) => sum + candidate.weight,
    0,
  );

  let cursor = Math.random() * totalWeight;

  for (const candidate of weightedCandidates) {
    cursor -= candidate.weight;

    if (cursor <= 0) {
      return candidate.food;
    }
  }

  return weightedCandidates[0].food;
}
