import { calculateFiberTarget } from "./algorithm.js?v=navy2";
import { createEmptyDay, getState, setState } from "./state.js";
import { saveToStorage } from "./storage.js";
import { formatDate, safeNumber, uniqueStrings } from "./utils.js";

const LEVEL_THRESHOLDS = [
  { level: 5, minXp: 1000 },
  { level: 4, minXp: 500 },
  { level: 3, minXp: 250 },
  { level: 2, minXp: 100 },
  { level: 1, minXp: 0 },
];

export const BADGE_DEFINITIONS = {
  FIRST_BLOOD: {
    id: "FIRST_BLOOD",
    name: "First Blood",
    description: "Logged food for the first time.",
  },
  PROTEIN_MASTER: {
    id: "PROTEIN_MASTER",
    name: "Protein Master",
    description: "Hit protein with elite precision.",
  },
  IRON_STREAK_7: {
    id: "IRON_STREAK_7",
    name: "Iron Streak",
    description: "Logged food for 7 straight days.",
  },
  FIBER_KING: {
    id: "FIBER_KING",
    name: "Fiber King",
    description: "Met the full daily fiber target.",
  },
};

function hasLoggedFood(day = createEmptyDay()) {
  return (
    safeNumber(day.kcal) > 0 ||
    (Array.isArray(day.foods) && day.foods.length > 0)
  );
}

function addDays(dateKey, deltaDays) {
  const date = new Date(`${formatDate(dateKey)}T00:00:00`);
  date.setDate(date.getDate() + safeNumber(deltaDays));
  return formatDate(date);
}

function getLoggedDayKeys(daysState = {}) {
  return Object.entries(daysState || {})
    .filter(([, day]) => hasLoggedFood(day))
    .map(([dayKey]) => formatDate(dayKey))
    .sort();
}

export function calculateDailyXPBreakdown(
  day = createEmptyDay(),
  targets = null,
) {
  const safeDay = day && typeof day === "object" ? day : createEmptyDay();
  const safeTargets = targets && typeof targets === "object" ? targets : null;

  if (!hasLoggedFood(safeDay)) {
    return {
      baseXp: 0,
      proteinBonus: 0,
      waterBonus: 0,
      overeatPenalty: 0,
      total: 0,
    };
  }

  const breakdown = {
    baseXp: 10,
    proteinBonus: 0,
    waterBonus: 0,
    overeatPenalty: 0,
    total: 10,
  };
  const calorieTarget = safeNumber(safeTargets?.kcal);
  const proteinTarget = safeNumber(safeTargets?.prot);
  const waterTarget = safeNumber(safeTargets?.water);

  if (calorieTarget > 0 && safeNumber(safeDay.kcal) - calorieTarget > 250) {
    breakdown.overeatPenalty = -15;
    breakdown.total = Math.max(0, breakdown.total + breakdown.overeatPenalty);
    return breakdown;
  }

  if (
    proteinTarget > 0 &&
    Math.abs(safeNumber(safeDay.prot) - proteinTarget) <= 5
  ) {
    breakdown.proteinBonus = 25;
  }

  if (waterTarget > 0 && safeNumber(safeDay.agua) >= waterTarget) {
    breakdown.waterBonus = 10;
  }

  breakdown.total = Math.max(
    0,
    breakdown.baseXp +
      breakdown.proteinBonus +
      breakdown.waterBonus +
      breakdown.overeatPenalty,
  );

  return breakdown;
}

export function calculateDailyXP(day = createEmptyDay(), targets = null) {
  return calculateDailyXPBreakdown(day, targets).total;
}

export function calculateLevel(totalXP) {
  const normalizedXp = Math.max(0, Math.floor(safeNumber(totalXP)));
  const matchedLevel =
    LEVEL_THRESHOLDS.find((threshold) => normalizedXp >= threshold.minXp) ||
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  return matchedLevel.level;
}

export function calculateLevelProgress(totalXP) {
  const normalizedXp = Math.max(0, Math.floor(safeNumber(totalXP)));
  const currentThreshold =
    LEVEL_THRESHOLDS.find((threshold) => normalizedXp >= threshold.minXp) ||
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const ascendingThresholds = [...LEVEL_THRESHOLDS].sort(
    (left, right) => left.minXp - right.minXp,
  );
  const currentIndex = ascendingThresholds.findIndex(
    (threshold) => threshold.level === currentThreshold.level,
  );
  const nextThreshold =
    currentIndex >= 0 ? ascendingThresholds[currentIndex + 1] || null : null;
  const currentLevelMinXp = currentThreshold.minXp;
  const nextLevelMinXp = nextThreshold?.minXp ?? currentLevelMinXp;
  const xpIntoLevel = normalizedXp - currentLevelMinXp;
  const xpToNextLevel = nextThreshold
    ? Math.max(0, nextThreshold.minXp - normalizedXp)
    : 0;
  const progressDenominator = Math.max(1, nextLevelMinXp - currentLevelMinXp);

  return {
    level: currentThreshold.level,
    currentLevelMinXp,
    nextLevel: nextThreshold?.level ?? null,
    nextLevelMinXp: nextThreshold?.minXp ?? null,
    xpIntoLevel,
    xpToNextLevel,
    progress: nextThreshold
      ? Math.min(1, Math.max(0, xpIntoLevel / progressDenominator))
      : 1,
  };
}

export function checkStreaks(
  currentDateKey,
  gamificationState = {},
  daysState = {},
) {
  const normalizedDateKey = formatDate(
    currentDateKey || gamificationState?.lastLoggedDate || new Date(),
  );
  const loggedDayKeys = getLoggedDayKeys(daysState);
  const loggedDaySet = new Set(loggedDayKeys);
  const lastLoggedDate = loggedDayKeys.at(-1) || null;

  if (!loggedDaySet.has(normalizedDateKey)) {
    return {
      currentStreak: 0,
      lastLoggedDate,
    };
  }

  let streak = 1;
  let cursorKey = normalizedDateKey;

  while (loggedDaySet.has(addDays(cursorKey, -1))) {
    cursorKey = addDays(cursorKey, -1);
    streak += 1;
  }

  return {
    currentStreak: streak,
    lastLoggedDate: normalizedDateKey,
  };
}

export function evaluateBadges(
  currentState = {},
  currentDay = createEmptyDay(),
  dailyXp = 0,
) {
  const qualifiedBadges = [];
  const safeTargets =
    currentState?.targets && typeof currentState.targets === "object"
      ? currentState.targets
      : null;

  const proteinTarget = safeNumber(safeTargets?.prot);
  const carbTarget = safeNumber(safeTargets?.carb); // FIX: was safeTargets?.carbs (wrong field name)
  const fatTarget = safeNumber(safeTargets?.fat);
  const calorieTarget = safeNumber(safeTargets?.kcal);
  const waterTarget = safeNumber(safeTargets?.water);
  const fiberTarget =
    safeNumber(safeTargets?.fiber) ||
    calculateFiberTarget(safeNumber(safeTargets?.kcal));

  const currentStreak = safeNumber(currentState?.gamification?.currentStreak);
  const totalXp = safeNumber(currentState?.gamification?.xp);

  // 1. THE FIRST REP (FIRST_BLOOD)
  if (totalXp > 0 || dailyXp > 0) {
    qualifiedBadges.push("FIRST_BLOOD");
    qualifiedBadges.push("THE_FIRST_REP");
  }

  // 2. MACRO SNIPER (Protein)
  if (
    proteinTarget > 0 &&
    Math.abs(safeNumber(currentDay?.prot) - proteinTarget) <= 3
  ) {
    qualifiedBadges.push("PROTEIN_MASTER");
    qualifiedBadges.push("MACRO_SNIPER");
  }

  if (currentStreak >= 7) {
    qualifiedBadges.push("IRON_STREAK_7");
  }

  // 3. GLYCOGEN MASTER (Carbs) — FIX: was currentDay?.carbs (wrong field name)
  if (
    carbTarget > 0 &&
    Math.abs(safeNumber(currentDay?.carb) - carbTarget) <= 5
  ) {
    qualifiedBadges.push("GLYCOGEN_MASTER");
  }

  // 4. FAT ARCHITECT (Fats)
  if (fatTarget > 0 && Math.abs(safeNumber(currentDay?.fat) - fatTarget) <= 3) {
    qualifiedBadges.push("FAT_ARCHITECT");
  }

  // 5. CALORIC BULLSEYE
  if (
    calorieTarget > 0 &&
    safeNumber(currentDay?.kcal) > 0 &&
    Math.abs(safeNumber(currentDay?.kcal) - calorieTarget) <= 50
  ) {
    qualifiedBadges.push("CALORIC_BULLSEYE");
  }

  // 6. FIBER KING
  if (
    safeNumber(currentDay?.kcal) > 0 &&
    fiberTarget > 0 &&
    safeNumber(currentDay?.fiber) >= fiberTarget
  ) {
    qualifiedBadges.push("FIBER_KING");
  }

  // 7. HYDRO ENGINE
  if (waterTarget > 0 && safeNumber(currentDay?.agua) >= waterTarget) {
    qualifiedBadges.push("HYDRO_ENGINE");
  }

  // 8. CONSISTENT FUEL
  if (Array.isArray(currentDay?.foods) && currentDay.foods.length >= 4) {
    qualifiedBadges.push("CONSISTENT_FUEL");
  }

  // 9. THE PPL CYCLE (3 Days)
  if (currentStreak >= 3) qualifiedBadges.push("THE_PPL_CYCLE");

  // 10. IRON DISCIPLINE (7 Days)
  if (currentStreak >= 7) qualifiedBadges.push("IRON_DISCIPLINE_7");

  // 11. UNBREAKABLE (30 Days)
  if (currentStreak >= 30) qualifiedBadges.push("UNBREAKABLE_30");

  // 12. CENTURY CLUB (1000 XP)
  if (totalXp >= 1000) qualifiedBadges.push("CENTURY_CLUB");

  return uniqueStrings(qualifiedBadges);
}

export function getBadgeDetails(badgeIds = []) {
  return uniqueStrings(badgeIds)
    .map((badgeId) => BADGE_DEFINITIONS[badgeId])
    .filter(Boolean);
}

export function processDayGamification(dateValue) {
  const currentState = getState();
  const dateKey = formatDate(dateValue || currentState.selectedDate);
  const targets = currentState.targets;
  const currentDay = currentState.days[dateKey] || createEmptyDay();
  const dailyXpBreakdown = calculateDailyXPBreakdown(currentDay, targets);
  const dailyXp = dailyXpBreakdown.total;
  const totalXp = getLoggedDayKeys(currentState.days).reduce((sum, dayKey) => {
    const day = currentState.days[dayKey] || createEmptyDay();
    return sum + calculateDailyXP(day, targets);
  }, 0);
  const nextLevel = calculateLevel(totalXp);
  const levelProgress = calculateLevelProgress(totalXp);
  const streakState = checkStreaks(
    dateKey,
    currentState.gamification,
    currentState.days,
  );
  const unlockedBadges = Array.isArray(currentState.gamification?.badges)
    ? currentState.gamification.badges
    : [];
  const nextGamification = {
    ...(currentState.gamification || {}),
    xp: totalXp,
    level: nextLevel,
    currentStreak: streakState.currentStreak,
    lastLoggedDate: streakState.lastLoggedDate,
    badges: unlockedBadges,
  };
  const badgeEvaluationState = {
    ...currentState,
    gamification: nextGamification,
  };
  const qualifiedBadges = evaluateBadges(
    badgeEvaluationState,
    currentDay,
    dailyXp,
  );
  const newlyUnlockedBadges = qualifiedBadges.filter(
    (badgeId) => !unlockedBadges.includes(badgeId),
  );
  const finalGamification = {
    ...nextGamification,
    badges: uniqueStrings([...unlockedBadges, ...newlyUnlockedBadges]),
  };

  setState({
    gamification: finalGamification,
  });
  saveToStorage(getState());

  return {
    ...finalGamification,
    dailyXp,
    dailyXpBreakdown,
    levelProgress,
    unlockedBadgeDetails: getBadgeDetails(finalGamification.badges),
    newlyUnlockedBadges,
    newlyUnlockedBadgeDetails: getBadgeDetails(newlyUnlockedBadges),
  };
}
