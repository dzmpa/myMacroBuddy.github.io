import {
  calculateRemaining,
  getEffectiveTargets,
} from "./algorithm.js?v=navy2";
import { createEmptyDay, getState, setState } from "./state.js";
import { saveToStorage } from "./storage.js";
import { renderCharts } from "./charts.js";
import {
  debounce,
  formatDate,
  formatInputNumber,
  safeNumber,
} from "./utils.js";

const FIELD_CONFIG = [
  { id: "kcal", numeric: true, event: "input" },
  { id: "prot", numeric: true, event: "input" },
  { id: "carb", numeric: true, event: "input" },
  { id: "fat", numeric: true, event: "input" },
  { id: "fiber", numeric: true, event: "input" },
  { id: "peso", numeric: true, event: "input" },
  { id: "agua", numeric: true, event: "input" },
  { id: "notes", numeric: false, event: "input" },
  { id: "dayType", numeric: false, event: "change" },
];

let onDayUpdated = () => {};

function getSelectedDay(currentState) {
  const dayKey = formatDate(currentState.selectedDate);
  return currentState.days[dayKey] || createEmptyDay();
}

function formatSelectedDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMetaValue(value, suffix = "") {
  const cleanValue = safeNumber(value);
  return cleanValue > 0 ? `${cleanValue}${suffix}` : "--";
}

function bindInputs() {
  FIELD_CONFIG.forEach(({ id, event }) => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;

    element.dataset.bound = "true";

    // Cria um debouncer independente para cada campo se for um evento de teclado ("input")
    // 400ms é o "sweet spot" ideal para não parecer lento, mas poupar imensos recursos
    const processInput =
      event === "input"
        ? debounce((value) => handleInputChange(id, value), 400)
        : (value) => handleInputChange(id, value);

    element.addEventListener(event, () => {
      processInput(element.value);
    });
  });
}

function handleInputChange(field, rawValue) {
  const currentState = getState();
  const dayKey = formatDate(currentState.selectedDate);
  const currentDay = currentState.days[dayKey] || createEmptyDay();
  const fieldConfig = FIELD_CONFIG.find((config) => config.id === field);
  const nextValue = fieldConfig?.numeric
    ? safeNumber(rawValue)
    : String(rawValue);

  setState({
    days: {
      ...currentState.days,
      [dayKey]: {
        ...currentDay,
        [field]: nextValue,
      },
    },
  });

  saveToStorage(getState());
  renderDashboard();
  onDayUpdated();
}

function renderWarnings(warnings = []) {
  const container = document.getElementById("safetyWarnings");
  if (!container) {
    return;
  }

  if (!warnings.length) {
    container.innerHTML = `
      <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
        No safety alerts for the current context.
      </div>
    `;
    return;
  }

  container.innerHTML = warnings
    .map(
      (warning) => `
        <div class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          ${warning.message}
        </div>
      `,
    )
    .join("");
}

export function initDashboard(options = {}) {
  onDayUpdated = options.onDayUpdated || (() => {});
  bindInputs();
  loadDay();
}

export function loadDay() {
  const currentState = getState();
  const day = getSelectedDay(currentState);

  FIELD_CONFIG.forEach(({ id, numeric }) => {
    const element = document.getElementById(id);
    if (!element) return;

    if (!numeric) {
      element.value = day[id] ?? "";
      return;
    }

    const numericValue = safeNumber(day[id]);
    element.value = formatInputNumber(numericValue, {
      decimals: id === "kcal" ? 0 : 1,
      allowZero: false,
    });
  });

  renderDashboard();
}

export function renderDashboard() {
  const currentState = getState();
  const day = getSelectedDay(currentState);
  const target = getEffectiveTargets(currentState);
  const hasSoftAdjustment =
    Boolean(currentState.adaptiveTDEE) &&
    Boolean(currentState.targets) &&
    Math.round(safeNumber(currentState.targets.kcal)) !==
      Math.round(safeNumber(target?.kcal));
  const kcalRemaining = target ? calculateRemaining(target.kcal, day.kcal) : 0;
  const gamificationBannerEl = document.getElementById("gamificationBanner");
  if (gamificationBannerEl) {
    const gState = currentState.gamification;
    if (gState) {
      // Obter thresholds (precisas de importar ou replicar a array LEVEL_THRESHOLDS do gamification.js)
      // Como atalho para a UI, podemos fazer um cálculo aproximado ou usar valores hardcoded para o progresso visual:
      const LEVEL_THRESHOLDS = [
        { level: 5, minXp: 1000 },
        { level: 4, minXp: 500 },
        { level: 3, minXp: 250 },
        { level: 2, minXp: 100 },
        { level: 1, minXp: 0 },
      ];

      const currentLevelObj =
        LEVEL_THRESHOLDS.find((t) => t.level === gState.level) ||
        LEVEL_THRESHOLDS[4];
      const nextLevelObj = LEVEL_THRESHOLDS.find(
        (t) => t.level === gState.level + 1,
      );

      let progress = 100;
      if (nextLevelObj) {
        const xpIntoLevel = gState.xp - currentLevelObj.minXp;
        const xpRequired = nextLevelObj.minXp - currentLevelObj.minXp;
        progress = Math.min(100, Math.round((xpIntoLevel / xpRequired) * 100));
      }
      gamificationBannerEl.innerHTML = `
        <div class="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4 mb-4">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-inner">
              Lvl ${gState.level}
            </div>
            <div>
              <p class="text-sm font-semibold text-white">XP: ${gState.xp}</p>
              <div class="mt-1.5 h-1.5 w-28 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-700 ease-out" style="width: ${progress}%"></div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <span class="flex items-center gap-1.5 text-lg font-bold text-orange-400 drop-shadow-md">
              🔥 ${gState.currentStreak}
            </span>
            <span class="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Streak</span>
          </div>
        </div>
      `;
    }
  }

  const selectedDateLabel = document.getElementById("selectedDateLabel");
  const kcalRemainingEl = document.getElementById("kcalRemaining");
  const kcalStatusEl = document.getElementById("kcalStatus");
  const macroSummaryEl = document.getElementById("macroSummary");
  const dayMetaSummaryEl = document.getElementById("dayMetaSummary");
  const notesPreviewEl = document.getElementById("notesPreview");
  const dayTypeSummaryEl = document.getElementById("dayTypeSummary");
  const targetSummaryEl = document.getElementById("targetSummary");
  const adaptiveTDEEInsightEl = document.getElementById("adaptiveTdeeInsight");

  if (selectedDateLabel) {
    selectedDateLabel.textContent = formatSelectedDate(
      currentState.selectedDate,
    );
  }

  if (kcalRemainingEl) {
    kcalRemainingEl.textContent = target
      ? Math.abs(Math.round(kcalRemaining))
      : "--";
    kcalRemainingEl.classList.toggle(
      "text-emerald-400",
      target && kcalRemaining >= 0,
    );
    kcalRemainingEl.classList.toggle(
      "text-red-400",
      target && kcalRemaining < 0,
    );
  }

  if (kcalStatusEl) {
    if (!target) {
      kcalStatusEl.textContent =
        "Complete your profile to unlock live targets and daily remaining calories.";
    } else {
      const consumed = Math.round(safeNumber(day.kcal));

      if (kcalRemaining >= 0) {
        kcalStatusEl.innerHTML = `Consumed <strong>${consumed}</strong> kcal. <strong>${Math.round(kcalRemaining)}</strong> left.`;
      } else {
        kcalStatusEl.innerHTML = `Consumed <strong>${consumed}</strong> kcal. Over by <strong>${Math.abs(Math.round(kcalRemaining))}</strong>.`;
      }
    }
  }

  if (macroSummaryEl) {
    macroSummaryEl.textContent = target
      ? `P ${Math.round(safeNumber(day.prot))}/${Math.round(target.prot)}g | C ${Math.round(safeNumber(day.carb))}/${Math.round(target.carb)}g | F ${Math.round(safeNumber(day.fat))}/${Math.round(target.fat)}g`
      : "Live targets are unavailable until you save your profile.";
  }

  if (dayMetaSummaryEl) {
    dayMetaSummaryEl.textContent =
      `Weight ${formatMetaValue(day.peso, " kg")} | ` +
      `Water ${formatMetaValue(day.agua, " L")} | ` +
      `Fiber ${formatMetaValue(day.fiber, " g")}`;
  }

  if (notesPreviewEl) {
    notesPreviewEl.textContent =
      String(day.notes ?? "").trim() || "No notes saved for this day.";
  }

  if (dayTypeSummaryEl) {
    dayTypeSummaryEl.textContent = String(day.dayType ?? "normal");
  }

  if (targetSummaryEl) {
    targetSummaryEl.textContent = target
      ? `Active target: ${Math.round(target.kcal)} kcal | P ${target.prot.toFixed(1)}g | C ${target.carb.toFixed(1)}g | F ${target.fat.toFixed(1)}g | Fiber ${target.fiber.toFixed(1)}g | Water ${target.water.toFixed(1)}L${hasSoftAdjustment ? ` | Baseline ${Math.round(currentState.targets.kcal)} kcal` : ""}`
      : "No live targets calculated yet.";
  }

  if (adaptiveTDEEInsightEl) {
    adaptiveTDEEInsightEl.textContent = currentState.adaptiveTDEE
      ? `Adaptive TDEE: ${Math.round(currentState.adaptiveTDEE.kcal)} kcal (${currentState.adaptiveTDEE.daysUsed} valid day(s)).`
      : "Adaptive TDEE: not enough data yet.";
  }

  renderWarnings(currentState.safetyWarnings || []);
  renderCharts(day, target || {}, currentState.days);
}
