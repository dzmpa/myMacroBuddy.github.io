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

// Debounced heavy chart rendering to avoid blocking input handlers
const debouncedRenderCharts = debounce(() => {
  const currentState = getState();
  const day = getSelectedDay(currentState);
  const target = getEffectiveTargets(currentState);
  renderCharts(day, target || {}, currentState.days);
}, 300);

function updateSelectedDateLabel(dateValue) {
  const el = document.getElementById("selectedDateLabel");
  if (el) el.textContent = formatSelectedDate(dateValue);
}

function updateKcalStatus(day, target) {
  const kcalRemaining = target ? calculateRemaining(target.kcal, day.kcal) : 0;
  const kcalRemainingEl = document.getElementById("kcalRemaining");
  const kcalStatusEl = document.getElementById("kcalStatus");

  if (kcalRemainingEl) {
    kcalRemainingEl.textContent = target ? Math.abs(Math.round(kcalRemaining)) : "--";
    kcalRemainingEl.classList.toggle("text-emerald-400", target && kcalRemaining >= 0);
    kcalRemainingEl.classList.toggle("text-red-400", target && kcalRemaining < 0);
  }

  if (kcalStatusEl) {
    if (!target) {
      kcalStatusEl.textContent =
        "Complete your profile to unlock live targets and daily remaining calories.";
    } else {
      const consumed = Math.round(safeNumber(day.kcal));

      if (kcalRemaining >= 0) {
        kcalStatusEl.innerHTML = `Consumed <strong>${consumed}</strong> kcal. <strong>${Math.round(
          kcalRemaining,
        )}</strong> left.`;
      } else {
        kcalStatusEl.innerHTML = `Consumed <strong>${consumed}</strong> kcal. Over by <strong>${Math.abs(
          Math.round(kcalRemaining),
        )}</strong>.`;
      }
    }
  }
}

function updateMacroSummary(day, target) {
  const macroSummaryEl = document.getElementById("macroSummary");
  if (!macroSummaryEl) return;
  macroSummaryEl.textContent = target
    ? `P ${Math.round(safeNumber(day.prot))}/${Math.round(target.prot)}g | C ${Math.round(
        safeNumber(day.carb),
      )}/${Math.round(target.carb)}g | F ${Math.round(safeNumber(day.fat))}/${Math.round(target.fat)}g`
    : "Live targets are unavailable until you save your profile.";
}

function updateDayMetaSummary(day) {
  const dayMetaSummaryEl = document.getElementById("dayMetaSummary");
  if (!dayMetaSummaryEl) return;
  dayMetaSummaryEl.textContent =
    `Weight ${formatMetaValue(day.peso, " kg")} | ` +
    `Water ${formatMetaValue(day.agua, " L")} | ` +
    `Fiber ${formatMetaValue(day.fiber, " g")}`;
}

function updateNotesPreview(day) {
  const notesPreviewEl = document.getElementById("notesPreview");
  if (!notesPreviewEl) return;
  notesPreviewEl.textContent = String(day.notes ?? "").trim() || "No notes saved for this day.";
}

function updateDayTypeSummary(day) {
  const dayTypeSummaryEl = document.getElementById("dayTypeSummary");
  if (!dayTypeSummaryEl) return;
  dayTypeSummaryEl.textContent = String(day.dayType ?? "normal");
}

function updateTargetSummary(target, currentState) {
  const targetSummaryEl = document.getElementById("targetSummary");
  if (!targetSummaryEl) return;
  const hasSoftAdjustment =
    Boolean(currentState.adaptiveTDEE) &&
    Boolean(currentState.targets) &&
    Math.round(safeNumber(currentState.targets.kcal)) !== Math.round(safeNumber(target?.kcal));

  targetSummaryEl.textContent = target
    ? `Active target: ${Math.round(target.kcal)} kcal | P ${target.prot.toFixed(1)}g | C ${target.carb.toFixed(
        1,
      )}g | F ${target.fat.toFixed(1)}g | Fiber ${target.fiber.toFixed(1)}g | Water ${target.water.toFixed(1)}L${
        hasSoftAdjustment ? ` | Baseline ${Math.round(currentState.targets.kcal)} kcal` : ""
      }`
    : "No live targets calculated yet.";
}

function updateAdaptiveTDEEInsight(currentState) {
  const adaptiveTDEEInsightEl = document.getElementById("adaptiveTdeeInsight");
  if (!adaptiveTDEEInsightEl) return;
  adaptiveTDEEInsightEl.textContent = currentState.adaptiveTDEE
    ? `Adaptive TDEE: ${Math.round(currentState.adaptiveTDEE.kcal)} kcal (${currentState.adaptiveTDEE.daysUsed} valid day(s)).`
    : "Adaptive TDEE: not enough data yet.";
}

// FIX: single source of truth for gamification banner HTML.
// Previously this block was duplicated between updateGamificationBanner()
// and renderDashboard(), causing the two to drift out of sync.
function buildGamificationBannerHTML(gState) {
  const LEVEL_THRESHOLDS = [
    { level: 5, minXp: 1000 },
    { level: 4, minXp: 500 },
    { level: 3, minXp: 250 },
    { level: 2, minXp: 100 },
    { level: 1, minXp: 0 },
  ];

  const currentLevelObj = LEVEL_THRESHOLDS.find((t) => t.level === gState.level) || LEVEL_THRESHOLDS[4];
  const nextLevelObj = LEVEL_THRESHOLDS.find((t) => t.level === gState.level + 1);

  let progress = 100;
  if (nextLevelObj) {
    const xpIntoLevel = gState.xp - currentLevelObj.minXp;
    const xpRequired = nextLevelObj.minXp - currentLevelObj.minXp;
    progress = Math.min(100, Math.round((xpIntoLevel / xpRequired) * 100));
  }

  return `
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
    <div class="flex flex-col items-end gap-1">
      <span class="flex items-center gap-1.5 text-lg font-bold text-orange-400 drop-shadow-md">
        🔥 ${gState.currentStreak}
      </span>
      <button id="openTrophyBtn" type="button" class="text-[10px] uppercase tracking-widest font-semibold text-slate-400 hover:text-emerald-300 transition flex items-center gap-1">
        Troféus <span>🏆</span>
      </button>
    </div>
  </div>
`;
}

function updateGamificationBanner(currentState) {
  const gamificationBannerEl = document.getElementById("gamificationBanner");
  if (!gamificationBannerEl) return;
  const gState = currentState.gamification;
  if (!gState) return;

  gamificationBannerEl.innerHTML = buildGamificationBannerHTML(gState);

  const openBtn = document.getElementById("openTrophyBtn");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      import("./trophies.js").then((module) => module.toggleTrophyModal(true));
    });
  }
}

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

    const processInput =
      event === "input"
        ? debounce((value) => handleInputChange(id, value), 400)
        : (value) => handleInputChange(id, value);

    element.addEventListener(event, () => {
      processInput(element.value);
    });
  });
}

// FIX: renderWarnings was broken — the template literal was left open and
// code from handleInputChange had leaked inside it. Restored as a proper function.
function renderWarnings(warnings = []) {
  const container = document.getElementById("safetyWarnings");
  if (!container) return;

  if (!warnings.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = warnings
    .map(
      (w) => `
      <div class="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        ${w.message}
      </div>`,
    )
    .join("");
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

  // Granular updates: only re-render the pieces affected by this field
  const nextState = getState();
  const nextDay = nextState.days[dayKey] || createEmptyDay();
  const target = getEffectiveTargets(nextState);

  switch (field) {
    case "peso":
    case "agua":
      updateDayMetaSummary(nextDay);
      break;
    case "notes":
      updateNotesPreview(nextDay);
      break;
    case "dayType":
      updateDayTypeSummary(nextDay);
      break;
    case "kcal":
      updateKcalStatus(nextDay, target);
      updateMacroSummary(nextDay, target);
      debouncedRenderCharts();
      break;
    case "prot":
    case "carb":
    case "fat":
    case "fiber":
      updateMacroSummary(nextDay, target);
      updateKcalStatus(nextDay, target);
      debouncedRenderCharts();
      break;
    default:
      break;
  }

  onDayUpdated();
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
  const kcalRemaining = target ? calculateRemaining(target.kcal, day.kcal) : 0;
  const hasSoftAdjustment =
    Boolean(currentState.adaptiveTDEE) &&
    Boolean(currentState.targets) &&
    Math.round(safeNumber(currentState.targets.kcal)) !==
      Math.round(safeNumber(target?.kcal));

  // Gamification banner — delegated to updateGamificationBanner to avoid duplication
  updateGamificationBanner(currentState);

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
    selectedDateLabel.textContent = formatSelectedDate(currentState.selectedDate);
  }

  if (kcalRemainingEl) {
    kcalRemainingEl.textContent = target
      ? Math.abs(Math.round(kcalRemaining))
      : "--";
    kcalRemainingEl.classList.toggle("text-emerald-400", target && kcalRemaining >= 0);
    kcalRemainingEl.classList.toggle("text-red-400", target && kcalRemaining < 0);
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
