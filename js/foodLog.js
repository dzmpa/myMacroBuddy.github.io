import { sumEntryMacros } from "./algorithm.js";
import { createEmptyDay, getState, setState } from "./state.js";
import { formatDate, safeNumber } from "./utils.js";

function getDayKey(dateValue) {
  return typeof dateValue === "string"
    ? dateValue
    : formatDate(dateValue || getState().selectedDate);
}

function getCurrentDay(currentState, dayKey) {
  return currentState.days[dayKey] || createEmptyDay();
}

function commitDay(dayKey, nextDay) {
  const currentState = getState();

  setState({
    days: {
      ...currentState.days,
      [dayKey]: nextDay,
    },
  });

  return nextDay;
}

function buildFoodEntry(food, grams) {
  const cleanGrams = safeNumber(grams);
  if (!food || cleanGrams <= 0) return null;

  const factor = cleanGrams / 100;

  return {
    id: food.id,
    externalId: String(food.externalId ?? "").trim(),
    name: food.name,
    grams: cleanGrams,
    kcal: safeNumber(food.kcal) * factor,
    prot: safeNumber(food.prot) * factor,
    carb: safeNumber(food.carb) * factor,
    fat: safeNumber(food.fat) * factor,
    fiber: safeNumber(food.fiber) * factor,
    source: food.source || "manual",
    rawExternal: food.rawExternal ?? food.raw ?? null,
  };
}

function buildExternalEntry(item = {}) {
  const name = String(item.name ?? item.title ?? "").trim();
  const grams = safeNumber(item.grams ?? item.weight);

  if (!name) return null;

  return {
    id: String(item.foodId ?? item.externalId ?? crypto.randomUUID()),
    externalId: String(item.externalId ?? "").trim(),
    name,
    grams: grams > 0 ? grams : 1,
    kcal: safeNumber(item.kcal),
    prot: safeNumber(item.prot),
    carb: safeNumber(item.carb),
    fat: safeNumber(item.fat),
    fiber: safeNumber(item.fiber),
    source: String(item.source || "manual"),
    rawExternal: item.rawExternal ?? item.raw ?? null,
  };
}

export function recalculateDayMacros(dateValue) {
  const currentState = getState();
  const dayKey = getDayKey(dateValue);
  const currentDay = getCurrentDay(currentState, dayKey);
  const foods = Array.isArray(currentDay.foods) ? currentDay.foods : [];
  const totals = sumEntryMacros(foods);

  return commitDay(dayKey, {
    ...currentDay,
    ...totals,
    foods,
  });
}

export function addFoodToDay(foodId, grams) {
  const currentState = getState();
  const dayKey = getDayKey();
  const currentDay = getCurrentDay(currentState, dayKey);
  const food = currentState.foods.find((candidate) => candidate.id === foodId);
  const nextEntry = buildFoodEntry(food, grams);

  if (!nextEntry) return null;

  commitDay(dayKey, {
    ...currentDay,
    foods: [...currentDay.foods, nextEntry],
  });

  return recalculateDayMacros(dayKey);
}

export function addFoodPayloadToDay(food, grams) {
  const currentState = getState();
  const dayKey = getDayKey();
  const currentDay = getCurrentDay(currentState, dayKey);
  const nextEntry = buildFoodEntry(food, grams);

  if (!nextEntry) return null;

  commitDay(dayKey, {
    ...currentDay,
    foods: [...currentDay.foods, nextEntry],
  });

  return recalculateDayMacros(dayKey);
}

export function addMealToDay(meal) {
  const currentState = getState();
  const dayKey = getDayKey();
  const currentDay = getCurrentDay(currentState, dayKey);
  const mealEntries = (meal?.items || [])
    .map((item) => {
      const food = currentState.foods.find(
        (candidate) => candidate.id === item.foodId,
      );

      return food
        ? buildFoodEntry(food, item.grams)
        : buildExternalEntry(item);
    })
    .filter(Boolean);

  if (mealEntries.length === 0) return null;

  commitDay(dayKey, {
    ...currentDay,
    foods: [...currentDay.foods, ...mealEntries],
  });

  return recalculateDayMacros(dayKey);
}

export function removeFoodFromDay(index) {
  const currentState = getState();
  const dayKey = getDayKey();
  const currentDay = currentState.days[dayKey];

  if (!currentDay) return null;

  commitDay(dayKey, {
    ...currentDay,
    foods: currentDay.foods.filter((_, itemIndex) => itemIndex !== index),
  });

  return recalculateDayMacros(dayKey);
}
