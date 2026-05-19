import { createEmptyDay, getState, setState } from "./state.js";
import { saveToStorage } from "./storage.js";
import { formatDate, safeNumber } from "./utils.js";

const LEVEL_THRESHOLDS = [
  { level: 5, minXp: 1000 },
  { level: 4, minXp: 500 },
  { level: 3, minXp: 250 },
  { level: 2, minXp: 100 },
  { level: 1, minXp: 0 },
];

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

export function calculateDailyXP(day = createEmptyDay(), targets = null) {
  const safeDay =
    day && typeof day === "object" ? day : createEmptyDay();
  const safeTargets = targets && typeof targets === "object" ? targets : null;

  if (!hasLoggedFood(safeDay)) {
    return 0;
  }

  let xp = 10;
  const calorieTarget = safeNumber(safeTargets?.kcal);
  const proteinTarget = safeNumber(safeTargets?.prot);
  const waterTarget = safeNumber(safeTargets?.water);

  if (calorieTarget > 0 && safeNumber(safeDay.kcal) - calorieTarget > 250) {
    return Math.max(0, xp - 15);
  }

  if (proteinTarget > 0 && Math.abs(safeNumber(safeDay.prot) - proteinTarget) <= 5) {
    xp += 25;
  }

  if (waterTarget > 0 && safeNumber(safeDay.agua) >= waterTarget) {
    xp += 10;
  }

  return xp;
}

export function calculateLevel(totalXP) {
  const normalizedXp = Math.max(0, Math.floor(safeNumber(totalXP)));
  const matchedLevel =
    LEVEL_THRESHOLDS.find((threshold) => normalizedXp >= threshold.minXp) ||
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  return matchedLevel.level;
}

export function checkStreaks(
  currentDateKey,
  gamificationState = {},
  daysState = {},
) {
  const normalizedDateKey = formatDate(
    currentDateKey ||
      gamificationState?.lastLoggedDate ||
      new Date(),
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

export function processDayGamification(dateValue) {
  const currentState = getState();
  const dateKey = formatDate(dateValue || currentState.selectedDate);
  const targets = currentState.targets;
  const currentDay = currentState.days[dateKey] || createEmptyDay();
  const dailyXp = calculateDailyXP(currentDay, targets);
  const totalXp = getLoggedDayKeys(currentState.days).reduce((sum, dayKey) => {
    const day = currentState.days[dayKey] || createEmptyDay();
    return sum + calculateDailyXP(day, targets);
  }, 0);
  const nextLevel = calculateLevel(totalXp);
  const streakState = checkStreaks(
    dateKey,
    currentState.gamification,
    currentState.days,
  );
  const nextGamification = {
    ...(currentState.gamification || {}),
    xp: totalXp,
    level: nextLevel,
    currentStreak: streakState.currentStreak,
    lastLoggedDate: streakState.lastLoggedDate,
    badges: Array.isArray(currentState.gamification?.badges)
      ? currentState.gamification.badges
      : [],
  };

  setState({
    gamification: nextGamification,
  });
  saveToStorage(getState());

  return {
    ...nextGamification,
    dailyXp,
  };
}
