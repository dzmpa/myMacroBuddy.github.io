import { clamp, safeNumber } from "./utils.js";

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
  athlete: 1.9,
};

const GOAL_ADJUSTMENTS = {
  cut: -500,
  maintenance: 0,
  bulk: 300,
};

function roundToOne(value) {
  return Number(safeNumber(value).toFixed(1));
}

function roundToTwo(value) {
  return Number(safeNumber(value).toFixed(2));
}

function normalizeGoal(goal) {
  return ["cut", "maintenance", "bulk"].includes(goal) ? goal : "maintenance";
}

function normalizeGender(gender) {
  const normalizedGender = String(gender ?? "").trim().toLowerCase();

  if (["male", "masculino", "m"].includes(normalizedGender)) {
    return "male";
  }

  if (["female", "feminino", "f"].includes(normalizedGender)) {
    return "female";
  }

  if (["other", "outro"].includes(normalizedGender)) {
    return "other";
  }

  return "";
}

function normalizeActivityLevel(activityLevel) {
  const normalizedActivity = String(activityLevel ?? "").trim().toLowerCase();
  return Object.hasOwn(ACTIVITY_MULTIPLIERS, normalizedActivity)
    ? normalizedActivity
    : "";
}

export function hasCompleteProfile(profile = {}) {
  const source = profile && typeof profile === "object" ? profile : {};
  const hasGoal = ["cut", "maintenance", "bulk"].includes(
    String(source.goal ?? "").trim().toLowerCase(),
  );

  return (
    String(source.name ?? "").trim().length > 0 &&
    safeNumber(source.age) > 0 &&
    safeNumber(source.weight) > 0 &&
    safeNumber(source.height) > 0 &&
    Boolean(normalizeGender(source.gender)) &&
    Boolean(normalizeActivityLevel(source.activityLevel)) &&
    hasGoal &&
    clamp(safeNumber(source.mealsPerDay), 3, 6) >= 3
  );
}

export function isProfileValid(profile = {}) {
  return hasCompleteProfile(profile);
}

export function calculateFiberTarget(kcal) {
  return roundToOne((safeNumber(kcal) / 1000) * 14);
}

export function calculateWaterTarget(weight, trainingHours = 0) {
  const liters = (safeNumber(weight) * 35 + safeNumber(trainingHours) * 1000) / 1000;
  return roundToTwo(Math.max(0, liters));
}

export function calculateBaseMacros(profile) {
  if (!hasCompleteProfile(profile)) {
    return null;
  }

  const weight = safeNumber(profile.weight);
  const height = safeNumber(profile.height);
  const age = safeNumber(profile.age);
  const goal = normalizeGoal(profile.goal);
  const activityLevel = normalizeActivityLevel(profile.activityLevel);
  const gender = normalizeGender(profile.gender);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const kcalAdjustment = GOAL_ADJUSTMENTS[goal];
  const genderAdjustment = gender === "male" ? 5 : gender === "female" ? -161 : -78;
  const bmr = 10 * weight + 6.25 * height - 5 * age + genderAdjustment;
  const tdee = bmr * activityMultiplier;
  const kcal = Math.max(1200, Math.round(tdee + kcalAdjustment));
  const prot = roundToOne(weight * (goal === "cut" ? 2.2 : 2.0));
  const fatTargetByGoal = weight * (goal === "cut" ? 0.8 : 1.0);
  const minSafeFat = roundToOne(weight * 0.6);
  const fat = roundToOne(Math.max(fatTargetByGoal, minSafeFat));
  const remainingCalories = Math.max(0, kcal - prot * 4 - fat * 9);
  const carb = roundToOne(remainingCalories / 4);
  const fiber = calculateFiberTarget(kcal);
  const water = calculateWaterTarget(weight, safeNumber(profile.trainingHours));

  return {
    kcal,
    prot,
    carb,
    fat,
    fiber,
    water,
    bmr: roundToOne(bmr),
    tdee: roundToOne(tdee),
    activityMultiplier,
    kcalAdjustment,
    minSafeFat,
  };
}

export function getEffectiveTargets(state) {
  const baseTargets = state?.targets;
  if (!baseTargets) {
    return null;
  }

  const adaptiveKcal = safeNumber(state?.adaptiveTDEE?.kcal);
  if (adaptiveKcal <= 0) {
    return { ...baseTargets };
  }

  const kcal = Math.round(safeNumber(baseTargets.kcal) * 0.7 + adaptiveKcal * 0.3);
  const prot = safeNumber(baseTargets.prot);
  const fat = safeNumber(baseTargets.fat);
  const remainingCalories = Math.max(0, kcal - prot * 4 - fat * 9);
  const carb = roundToOne(remainingCalories / 4);

  return {
    ...baseTargets,
    kcal,
    prot,
    fat,
    carb,
    fiber: calculateFiberTarget(kcal),
  };
}

export function calculateRemaining(target, consumed) {
  return safeNumber(target) - safeNumber(consumed);
}

export function calculateAccuracy(targetKcal, actualKcal) {
  const cleanTarget = safeNumber(targetKcal);

  if (cleanTarget <= 0) {
    return 1;
  }

  return Math.abs(cleanTarget - safeNumber(actualKcal)) / cleanTarget;
}

export function sumEntryMacros(entries = []) {
  return entries.reduce(
    (acc, entry) => ({
      kcal: acc.kcal + safeNumber(entry.kcal),
      prot: acc.prot + safeNumber(entry.prot),
      carb: acc.carb + safeNumber(entry.carb),
      fat: acc.fat + safeNumber(entry.fat),
      fiber: acc.fiber + safeNumber(entry.fiber),
    }),
    { kcal: 0, prot: 0, carb: 0, fat: 0, fiber: 0 },
  );
}

function getWeightTrend(days = {}) {
  const validEntries = Object.entries(days)
    .map(([dateKey, day]) => ({
      dateKey,
      kcal: safeNumber(day.kcal),
      weight: safeNumber(day.peso),
    }))
    .filter((entry) => entry.kcal > 0 && entry.weight > 0)
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey))
    .slice(-14);

  if (validEntries.length < 7) {
    return null;
  }

  const firstEntry = validEntries[0];
  const lastEntry = validEntries[validEntries.length - 1];
  const spanDays = Math.max(
    1,
    Math.round(
      (new Date(lastEntry.dateKey).getTime() - new Date(firstEntry.dateKey).getTime()) /
        86400000,
    ),
  );

  if (spanDays < 6) {
    return null;
  }

  return {
    entries: validEntries,
    firstEntry,
    lastEntry,
    spanDays,
    weightChangeKg: roundToTwo(lastEntry.weight - firstEntry.weight),
  };
}

export function calculateAdaptiveTDEE(days = {}, profile = {}) {
  if (!hasCompleteProfile(profile)) {
    return null;
  }

  const trend = getWeightTrend(days);
  if (!trend) {
    return null;
  }

  const averageKcal =
    trend.entries.reduce((sum, entry) => sum + entry.kcal, 0) / trend.entries.length;
  const estimatedDailyEnergyShift = (trend.weightChangeKg * 7700) / trend.spanDays;
  const estimatedTDEE = averageKcal - estimatedDailyEnergyShift;

  return {
    kcal: Math.round(estimatedTDEE),
    averageIntake: Math.round(averageKcal),
    weightChangeKg: trend.weightChangeKg,
    spanDays: trend.spanDays,
    daysUsed: trend.entries.length,
  };
}

export function calculateSafetyWarnings(profile, targets, dayData = {}) {
  if (!hasCompleteProfile(profile) || !targets) {
    return [];
  }

  const warnings = [];
  const weight = safeNumber(profile.weight);
  const minSafeFat = roundToOne(weight * 0.6);
  const targetFat = safeNumber(targets.fat);
  const selectedDay = dayData.day || dayData;
  const dayHasTrackedIntake =
    safeNumber(selectedDay.kcal) > 0 ||
    safeNumber(selectedDay.prot) > 0 ||
    safeNumber(selectedDay.carb) > 0 ||
    safeNumber(selectedDay.fat) > 0 ||
    safeNumber(selectedDay.fiber) > 0 ||
    safeNumber(selectedDay.agua) > 0 ||
    (Array.isArray(selectedDay.foods) && selectedDay.foods.length > 0);

  if (targetFat < minSafeFat) {
      warnings.push({
        id: "lowFat",
        message: `Target fat is below the safety minimum (${targetFat.toFixed(1)}g vs ${minSafeFat.toFixed(1)}g).`,
      });
  }

  if (dayHasTrackedIntake) {
    const fiberTarget = safeNumber(targets.fiber) || calculateFiberTarget(targets.kcal);
    const consumedFiber = safeNumber(selectedDay.fiber);

    if (consumedFiber < fiberTarget) {
      warnings.push({
        id: "lowFiber",
        message: `Fiber is below the daily target (${consumedFiber.toFixed(1)}g / ${fiberTarget.toFixed(1)}g).`,
      });
    }

    const trainingHours = safeNumber(selectedDay.trainingHours);
    const waterTarget = safeNumber(targets.water) || calculateWaterTarget(weight, trainingHours);
    const consumedWater = safeNumber(selectedDay.agua);

    if (consumedWater < waterTarget) {
      warnings.push({
        id: "lowWater",
        message: `Water is below the daily target (${consumedWater.toFixed(1)}L / ${waterTarget.toFixed(1)}L).`,
      });
    }
  }

  const weightTrend = getWeightTrend(dayData.days || {});
  if (weightTrend && weightTrend.firstEntry.weight > 0) {
    const weeklyLossPct =
      ((weightTrend.firstEntry.weight - weightTrend.lastEntry.weight) /
        weightTrend.firstEntry.weight) *
      (7 / weightTrend.spanDays) *
      100;

    if (weeklyLossPct > 1.2) {
      warnings.push({
        id: "fastWeightLoss",
        message: `Perda semanal estimada acima de 1.2% (${weeklyLossPct.toFixed(2)}%).`,
      });
    }
  }

  return warnings;
}
