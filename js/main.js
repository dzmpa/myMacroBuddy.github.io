import {
  calculateAdaptiveTDEE,
  calculateBaseMacros,
  calculateNavyBodyFat,
  getEffectiveTargets,
  getBodyFatRecommendation,
  isProfileValid,
  calculateSafetyWarnings,
} from "./algorithm.js?v=navy2";
import {
  createEmptyRecipeSuggestions,
  createEmptyDay,
  state,
  setState,
} from "./state.js";
import {
  createBackupPayload,
  importBackupPayload,
  loadFromStorage,
  saveToStorage,
} from "./storage.js";
import { addFood, deleteFood, getFoodById, updateFood } from "./food.js";
import { buildCoachScores } from "./coach.js";
import { searchFood, analyseRecipe, hasEdamamConfig } from "./edamam.js";
import { searchAllApis } from "./foodSearch.js";
import { initCalendar, renderCalendar } from "./calendar.js";
import { initDashboard, loadDay, renderDashboard } from "./dashboard.js";
import {
  addFoodPayloadToDay,
  addFoodToDay,
  addMealToDay,
  copyPreviousDayToSelected,
  removeFoodFromDay,
} from "./foodLog.js";
import {
  extractOpenFoodFactsBrandFacet,
  fetchBrandFoodsBatch,
  fetchFoodByBarcode,
} from "./openFoodFacts.js";
import {
  addPantryItem,
  clearPantry,
  removePantryItem,
  suggestRecipesFromPantry,
} from "./pantry.js";
import { generatePlan } from "./mealPlanner.js";
import {
  addToBuilder,
  deleteRecipe,
  removeFromBuilder,
  saveRecipe,
} from "./recipes.js";
import { getSeedStatePatch } from "./seeds.js";
import {
  renderApiConfig,
  renderDayFoods,
  renderExternalFoodResults,
  renderFoodList,
  renderMealPlan,
  renderOnboardingModal,
  renderPantryList,
  renderPantrySuggestions,
  renderProfileSummary,
  renderRecipeBuilder,
  renderRecipesList,
  renderSearchResults,
} from "./ui.js";
import { formatDate, formatInputNumber, safeNumber } from "./utils.js";
import { getState, setState } from "./state.js";
import { formatDate } from "./utils.js";
import { renderDashboard } from "./dashboard.js";

let isProfileModalForcedOpen = false;
const MACRO_CALCULATOR_FIELDS = [
  { id: "calcAge", event: "input" },
  { id: "calcWeight", event: "input" },
  { id: "calcHeight", event: "input" },
  { id: "calcGender", event: "change" },
  { id: "calcActivityLevel", event: "change" },
  { id: "calcGoal", event: "change" },
  { id: "calcMealsPerDay", event: "input" },
  { id: "calcTrainingHours", event: "input" },
  { id: "calcNeck", event: "input" },
  { id: "calcWaist", event: "input" },
  { id: "calcHip", event: "input" },
];
const APP_PAGES = [
  "calculator",
  "today",
  "search",
  "suggestions",
  "progress",
  "settings",
];
const BOOTSTRAP_BRAND_IMPORTS = [
  {
    brandTag: "continente",
    displayName: "Continente",
    sourceUrl: "https://world.openfoodfacts.org/facets/brands/continente",
  },
];
const BOOTSTRAP_BRAND_IMPORTS_STORAGE_KEY =
  "fitnessDashboardBootstrapBrandImportsV1";

function getElementValue(id) {
  return document.getElementById(id)?.value ?? "";
}

function isValidAppPage(page) {
  return APP_PAGES.includes(
    String(page || "")
      .trim()
      .toLowerCase(),
  );
}

function getActiveAppPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedPage = String(params.get("page") || "")
    .trim()
    .toLowerCase();

  return isValidAppPage(requestedPage) ? requestedPage : "calculator";
}

function setActiveAppPage(nextPage, { replace = false } = {}) {
  const normalizedPage = String(nextPage || "")
    .trim()
    .toLowerCase();

  if (!isValidAppPage(normalizedPage)) {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("page", normalizedPage);

  if (replace) {
    window.history.replaceState({}, "", url);
  } else {
    window.history.pushState({}, "", url);
  }

  renderPageNavigation();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderPageNavigation() {
  const activePage = getActiveAppPage();

  document.querySelectorAll("[data-page-link]").forEach((button) => {
    const isActive = button.dataset.pageLink === activePage;

    button.classList.toggle("border-emerald-500", isActive);
    button.classList.toggle("bg-emerald-500", isActive);
    button.classList.toggle("text-slate-950", isActive);
    button.classList.toggle("text-slate-200", !isActive);
    button.classList.toggle("border-slate-700", !isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  document.querySelectorAll("[data-app-page]").forEach((section) => {
    const isActive = section.dataset.appPage === activePage;

    section.classList.toggle("hidden", !isActive);
    section.setAttribute("aria-hidden", isActive ? "false" : "true");

    if (section instanceof HTMLDetailsElement) {
      section.open = isActive;
    }
  });
}

function syncInputValueIfBlank(id, value) {
  const input = document.getElementById(id);
  if (!input || document.activeElement === input) {
    return;
  }

  if (String(input.value ?? "").trim().length > 0) {
    return;
  }

  input.value = value ?? "";
}

function focusGlobalFoodSearch() {
  const searchInput = document.getElementById("globalFoodSearch");
  if (!searchInput) {
    return;
  }

  searchInput.focus({ preventScroll: true });
}

function setDayCopyStatus(message = "", isError = false) {
  const status = document.getElementById("copyPreviousDayStatus");

  if (!status) {
    return;
  }

  status.classList.remove("hidden", "text-emerald-200", "text-rose-300");

  if (!message) {
    status.textContent = "";
    status.classList.add("hidden");
    return;
  }

  status.textContent = message;
  status.classList.add(isError ? "text-rose-300" : "text-emerald-200");
}

function getFoodActionKey(food = {}) {
  if (food.barcode) {
    return String(food.barcode).trim();
  }

  if (food.externalId) {
    return `${String(food.source || "manual").trim()}:${String(food.externalId).trim()}`;
  }

  return String(food.name || "")
    .trim()
    .toLowerCase();
}

function getFoodImportIdentity(food = {}) {
  if (food.barcode) {
    return `barcode:${String(food.barcode).trim()}`;
  }

  if (food.externalId) {
    return `${String(food.source || "manual").trim()}:${String(food.externalId).trim()}`;
  }

  return `name:${String(food.name || "")
    .trim()
    .toLowerCase()}`;
}

function parseJsonValue(rawValue, fallback = null) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function readCompletedBootstrapBrandImports() {
  try {
    const rawValue = localStorage.getItem(BOOTSTRAP_BRAND_IMPORTS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : {};

    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

function markBootstrapBrandImportCompleted(brandTag) {
  const cleanBrandTag = String(brandTag || "")
    .trim()
    .toLowerCase();

  if (!cleanBrandTag) {
    return;
  }

  try {
    const nextCompletedImports = {
      ...readCompletedBootstrapBrandImports(),
      [cleanBrandTag]: new Date().toISOString(),
    };

    localStorage.setItem(
      BOOTSTRAP_BRAND_IMPORTS_STORAGE_KEY,
      JSON.stringify(nextCompletedImports),
    );
  } catch {}
}

function emptyRecipeSuggestions(message = "") {
  return {
    ...createEmptyRecipeSuggestions(),
    message,
  };
}

function getExternalSearchResults() {
  return Array.isArray(state.lastExternalImport?.items)
    ? state.lastExternalImport.items
    : [];
}

function getSelectedDay() {
  return state.days[formatDate(state.selectedDate)] || createEmptyDay();
}

function shouldShowOnboarding() {
  return isProfileModalForcedOpen;
}

function requireProfile() {
  return !isProfileValid(state.userProfile) || !state.targets;
}

function revalidateProfileState() {
  if (isProfileValid(state.userProfile) && state.targets) {
    return false;
  }

  const shouldResetProfile =
    state.userProfile ||
    state.targets ||
    state.adaptiveTDEE ||
    (Array.isArray(state.safetyWarnings) && state.safetyWarnings.length > 0);

  if (!shouldResetProfile) {
    return false;
  }

  setState({
    userProfile: null,
    targets: null,
    adaptiveTDEE: null,
    safetyWarnings: [],
  });

  return true;
}

function buildRemainingTarget(sourceState = state) {
  const effectiveTargets = getEffectiveTargets(sourceState);
  if (!effectiveTargets) {
    return null;
  }

  const day =
    sourceState.days[formatDate(sourceState.selectedDate)] || createEmptyDay();
  const remaining = {
    kcal: Math.max(0, safeNumber(effectiveTargets.kcal) - safeNumber(day.kcal)),
    prot: Math.max(0, safeNumber(effectiveTargets.prot) - safeNumber(day.prot)),
    carb: Math.max(0, safeNumber(effectiveTargets.carb) - safeNumber(day.carb)),
    fat: Math.max(0, safeNumber(effectiveTargets.fat) - safeNumber(day.fat)),
  };

  return Object.values(remaining).some((value) => value > 0) ? remaining : null;
}

function readProfileForm() {
  return {
    name: String(getElementValue("profileName")).trim(),
    age: safeNumber(getElementValue("profileAge")),
    weight: safeNumber(getElementValue("profileWeight")),
    height: safeNumber(getElementValue("profileHeight")),
    gender: String(getElementValue("profileGender")).trim().toLowerCase(),
    goal: String(getElementValue("profileGoal") || "maintenance"),
    activityLevel: String(getElementValue("profileActivityLevel"))
      .trim()
      .toLowerCase(),
    mealsPerDay: Math.min(
      6,
      Math.max(3, safeNumber(getElementValue("profileMealsPerDay")) || 4),
    ),
  };
}

function seedMacroCalculatorFromProfile(profile = state.userProfile) {
  if (!profile) {
    return;
  }

  syncInputValueIfBlank("calcAge", profile.age || "");
  syncInputValueIfBlank("calcWeight", profile.weight || "");
  syncInputValueIfBlank("calcHeight", profile.height || "");
  syncInputValueIfBlank("calcGender", profile.gender || "");
  syncInputValueIfBlank("calcActivityLevel", profile.activityLevel || "");
  syncInputValueIfBlank("calcGoal", profile.goal || "maintenance");
  syncInputValueIfBlank("calcMealsPerDay", profile.mealsPerDay || 4);
}

function readMacroCalculatorForm() {
  return {
    name: state.userProfile?.name || "Macro calculator",
    age: safeNumber(getElementValue("calcAge")),
    weight: safeNumber(getElementValue("calcWeight")),
    height: safeNumber(getElementValue("calcHeight")),
    gender: String(getElementValue("calcGender")).trim().toLowerCase(),
    goal: String(getElementValue("calcGoal") || "maintenance")
      .trim()
      .toLowerCase(),
    activityLevel: String(getElementValue("calcActivityLevel"))
      .trim()
      .toLowerCase(),
    mealsPerDay: Math.min(
      6,
      Math.max(3, safeNumber(getElementValue("calcMealsPerDay")) || 4),
    ),
    trainingHours: safeNumber(getElementValue("calcTrainingHours")),
    neck: safeNumber(getElementValue("calcNeck")),
    waist: safeNumber(getElementValue("calcWaist")),
    hip: safeNumber(getElementValue("calcHip")),
  };
}

function setMacroCalculatorMetric(id, value, suffix = "") {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.textContent =
    value === null || value === undefined || value === ""
      ? "--"
      : `${value}${suffix}`;
}

function resetMacroCalculatorOutput(message) {
  setMacroCalculatorMetric("macroCalcKcal", "--");
  setMacroCalculatorMetric("macroCalcProt", "--");
  setMacroCalculatorMetric("macroCalcCarb", "--");
  setMacroCalculatorMetric("macroCalcFat", "--");
  setMacroCalculatorMetric("macroCalcFiber", "--");
  setMacroCalculatorMetric("macroCalcWater", "--");
  setMacroCalculatorMetric("macroCalcBodyFat", "--");
  setMacroCalculatorMetric("macroCalcLeanMass", "--");
  setMacroCalculatorMetric("macroCalcFatMass", "--");

  const status = document.getElementById("macroCalculatorStatus");
  const meta = document.getElementById("macroCalculatorMeta");
  const perMeal = document.getElementById("macroCalcPerMeal");
  const recommendationTitle = document.getElementById(
    "macroCalcRecommendationTitle",
  );
  const recommendationText = document.getElementById(
    "macroCalcRecommendationText",
  );

  if (status) {
    status.textContent = message;
  }

  if (meta) {
    meta.textContent =
      "Uses the Mifflin-St Jeor formula, an activity multiplier, and a goal adjustment.";
  }

  if (perMeal) {
    perMeal.textContent =
      "Add your stats first to see an easy per-meal breakdown.";
  }

  if (recommendationTitle) {
    recommendationTitle.textContent = "Recommendation will appear here";
  }

  if (recommendationText) {
    recommendationText.textContent =
      "Add neck, waist, and hip for female entries to get the American Navy body-fat estimate and a recommendation.";
  }
}

function renderMacroCalculator() {
  const status = document.getElementById("macroCalculatorStatus");
  if (!status) {
    return;
  }

  seedMacroCalculatorFromProfile();

  const profile = readMacroCalculatorForm();
  const targets = calculateBaseMacros(profile);
  const navyEstimate = calculateNavyBodyFat(profile);
  const bodyFatRecommendation = getBodyFatRecommendation(profile, navyEstimate);

  if (!targets) {
    resetMacroCalculatorOutput(
      "Complete age, weight, height, gender, activity, and goal to calculate your macros.",
    );
    return;
  }

  const mealsPerDay = Math.min(
    6,
    Math.max(3, safeNumber(profile.mealsPerDay) || 4),
  );
  const perMeal = document.getElementById("macroCalcPerMeal");
  const meta = document.getElementById("macroCalculatorMeta");
  const recommendationTitle = document.getElementById(
    "macroCalcRecommendationTitle",
  );
  const recommendationText = document.getElementById(
    "macroCalcRecommendationText",
  );

  setMacroCalculatorMetric("macroCalcKcal", Math.round(targets.kcal));
  setMacroCalculatorMetric("macroCalcProt", targets.prot.toFixed(1), "g");
  setMacroCalculatorMetric("macroCalcCarb", targets.carb.toFixed(1), "g");
  setMacroCalculatorMetric("macroCalcFat", targets.fat.toFixed(1), "g");
  setMacroCalculatorMetric("macroCalcFiber", targets.fiber.toFixed(1), "g");
  setMacroCalculatorMetric("macroCalcWater", targets.water.toFixed(2), "L");

  if (navyEstimate) {
    setMacroCalculatorMetric(
      "macroCalcBodyFat",
      navyEstimate.bodyFat.toFixed(1),
      "%",
    );
    setMacroCalculatorMetric(
      "macroCalcLeanMass",
      navyEstimate.leanMass.toFixed(1),
      "kg",
    );
    setMacroCalculatorMetric(
      "macroCalcFatMass",
      navyEstimate.fatMass.toFixed(1),
      "kg",
    );
  } else {
    setMacroCalculatorMetric("macroCalcBodyFat", "--");
    setMacroCalculatorMetric("macroCalcLeanMass", "--");
    setMacroCalculatorMetric("macroCalcFatMass", "--");
  }

  status.textContent = `Calculated for a ${profile.goal} goal at ${profile.activityLevel} activity.`;

  if (meta) {
    meta.textContent = `BMR ${Math.round(targets.bmr)} kcal | TDEE ${Math.round(targets.tdee)} kcal | Activity x${targets.activityMultiplier}`;
  }

  if (perMeal) {
    perMeal.textContent =
      `${mealsPerDay} meal(s) per day: ` +
      `${Math.round(targets.kcal / mealsPerDay)} kcal | ` +
      `P ${(targets.prot / mealsPerDay).toFixed(1)}g | ` +
      `C ${(targets.carb / mealsPerDay).toFixed(1)}g | ` +
      `F ${(targets.fat / mealsPerDay).toFixed(1)}g per meal.`;
  }

  if (recommendationTitle && recommendationText) {
    if (bodyFatRecommendation) {
      recommendationTitle.textContent = bodyFatRecommendation.title;
      recommendationText.textContent = `${bodyFatRecommendation.message} Navy estimate: ${navyEstimate.bodyFat.toFixed(1)}% body fat, ${navyEstimate.category} range.`;
    } else if (["male", "female"].includes(profile.gender)) {
      recommendationTitle.textContent = "Add your Navy measurements";
      recommendationText.textContent =
        profile.gender === "female"
          ? "Enter neck, waist, and hip circumference in cm to unlock the body-fat estimate and recommendation."
          : "Enter neck and waist circumference in cm to unlock the body-fat estimate and recommendation.";
    } else {
      recommendationTitle.textContent = "Navy estimate unavailable";
      recommendationText.textContent =
        "The American Navy body-fat estimate in this calculator currently supports male and female entries only.";
    }
  }
}

function setFoodTagSelection(tags = []) {
  const selectedTags = new Set(tags);

  document.querySelectorAll(".foodTag").forEach((checkbox) => {
    checkbox.checked = selectedTags.has(checkbox.value);
  });
}

function getSelectedFoodTags() {
  return Array.from(document.querySelectorAll(".foodTag:checked")).map(
    (checkbox) => checkbox.value,
  );
}

function getEditingFoodId() {
  return String(getElementValue("foodEditingId")).trim();
}

function setFoodFormState({
  editingId = "",
  source = "manual",
  externalId = "",
  rawExternal = null,
} = {}) {
  const editingInput = document.getElementById("foodEditingId");
  const sourceInput = document.getElementById("foodSource");
  const externalIdInput = document.getElementById("foodExternalId");
  const rawExternalInput = document.getElementById("foodRawExternal");
  const addFoodButton = document.getElementById("addFoodBtn");

  if (editingInput) editingInput.value = editingId;
  if (sourceInput) sourceInput.value = source;
  if (externalIdInput) externalIdInput.value = externalId;
  if (rawExternalInput) {
    rawExternalInput.value = rawExternal ? JSON.stringify(rawExternal) : "";
  }
  if (addFoodButton) {
    addFoodButton.textContent = editingId ? "Save food" : "Add food";
  }

  renderFoodImportStatus();
}

function renderFoodImportStatus() {
  const status = document.getElementById("foodImportStatus");
  if (!status) return;

  const source = String(getElementValue("foodSource") || "manual");
  const barcode = String(getElementValue("foodBarcode")).trim();
  const externalId = String(getElementValue("foodExternalId")).trim();
  const lastExternalLabel = state.lastExternalImport?.message
    ? ` | ${state.lastExternalImport.message}`
    : "";

  status.textContent =
    source === "off"
      ? `Current source: Open Food Facts${barcode ? ` (${barcode})` : ""}${lastExternalLabel}`
      : source === "edamam"
        ? `Current source: Edamam${externalId ? ` (${externalId})` : ""}${lastExternalLabel}`
        : source === "usda"
          ? `Current source: legacy USDA entry${externalId ? ` (${externalId})` : ""}${lastExternalLabel}`
          : `Current source: manual${lastExternalLabel}`;
}

function clearFoodForm() {
  [
    "foodName",
    "foodKcal",
    "foodP",
    "foodC",
    "foodF",
    "foodFiber",
    "foodBarcode",
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  setFoodTagSelection([]);
  setFoodFormState({
    editingId: "",
    source: "manual",
    externalId: "",
    rawExternal: null,
  });
}

function readFoodForm() {
  return {
    name: String(getElementValue("foodName")).trim(),
    kcal: safeNumber(getElementValue("foodKcal")),
    prot: safeNumber(getElementValue("foodP")),
    carb: safeNumber(getElementValue("foodC")),
    fat: safeNumber(getElementValue("foodF")),
    fiber: safeNumber(getElementValue("foodFiber")),
    barcode: String(getElementValue("foodBarcode")).trim(),
    source: String(getElementValue("foodSource") || "manual"),
    externalId: String(getElementValue("foodExternalId")).trim(),
    rawExternal: parseJsonValue(getElementValue("foodRawExternal"), null),
    tags: getSelectedFoodTags(),
  };
}

function readApiConfigForm() {
  return {
    usdaApiKey: String(getElementValue("usdaApiKey")).trim(),
    edamamAppId: String(getElementValue("edamamAppId")).trim(),
    edamamAppKey: String(getElementValue("edamamAppKey")).trim(),
  };
}

function ensureSeedData() {
  const patch = getSeedStatePatch(state);

  if (!Object.keys(patch).length) {
    return;
  }

  setState(patch);
  saveToStorage(state);
}

function refreshDerivedState() {
  const selectedDay = getSelectedDay();
  const profileIsValid = isProfileValid(state.userProfile);
  const nextAdaptiveTDEE = profileIsValid
    ? calculateAdaptiveTDEE(state.days, state.userProfile)
    : null;
  const nextBaseState = {
    ...state,
    adaptiveTDEE: nextAdaptiveTDEE,
  };
  const effectiveTargets = getEffectiveTargets(nextBaseState);
  const nextSafetyWarnings =
    profileIsValid && effectiveTargets
      ? calculateSafetyWarnings(state.userProfile, effectiveTargets, {
          day: selectedDay,
          days: state.days,
        })
      : [];

  if (!profileIsValid || !state.targets) {
    setState({
      adaptiveTDEE: nextAdaptiveTDEE,
      safetyWarnings: nextSafetyWarnings,
      mealPlan: {
        error:
          "Completa o perfil para calcular targets reais antes de gerar o meal planner.",
        plan: [],
      },
    });
    return;
  }

  const target = buildRemainingTarget(nextBaseState);

  if (!target) {
    setState({
      adaptiveTDEE: nextAdaptiveTDEE,
      safetyWarnings: nextSafetyWarnings,
      mealPlan: { error: "Sem metas restantes para hoje.", plan: [] },
    });
    return;
  }

  const coachScores = buildCoachScores(state);
  const plannerState = {
    ...state,
    adaptiveTDEE: nextAdaptiveTDEE,
    safetyWarnings: nextSafetyWarnings,
  };

  setState({
    adaptiveTDEE: nextAdaptiveTDEE,
    safetyWarnings: nextSafetyWarnings,
    mealPlan: generatePlan(plannerState, target, coachScores),
  });
}

function updateUI(scopes = ["all"]) {
  const isAll = scopes.includes("all");

  // Âmbito: Perfil e Metas
  if (isAll || scopes.includes("profile")) {
    renderProfileSummary();
    renderMacroCalculator();
  }

  // Âmbito: Diário Alimentar e Dashboard (o mais frequente)
  if (isAll || scopes.includes("day")) {
    renderDayFoods({ onRemove: handleRemoveDayFood });
    renderDashboard();
    renderCalendar();
    renderMealPlan(state.mealPlan, { onEatMeal: handleEatMeal });
  }

  // Âmbito: Base de Dados de Alimentos
  if (isAll || scopes.includes("foods")) {
    renderFoodList({ onEdit: handleEditFood, onDelete: handleDeleteFood });
    renderPantryList();
    renderFoodImportStatus();
  }

  // Âmbito: Pesquisa
  if (isAll || scopes.includes("search")) {
    renderSearchResults(state.lastExternalImport, {
      onAddFood: handleAddSearchResult,
      onAddFoodToDay: handleAddSearchResultToDay,
      onChangePage: handleSearchPageChange,
    });
    renderExternalFoodResults(state.lastExternalImport, {
      onSaveFood: handleSaveExternalFood,
    });
  }

  // Âmbito: Receitas e Builder
  if (isAll || scopes.includes("recipes")) {
    renderRecipeBuilder({ onRemove: handleRemoveBuilderItem });
    renderRecipesList({ onDelete: handleDeleteRecipe });
    renderPantrySuggestions(state.recipeSuggestions, {
      onEatSuggestion: handleEatSuggestion,
    });
  }

  // Elementos globais que raramente mudam
  if (isAll) {
    renderApiConfig();
    renderOnboardingModal({ isOpen: shouldShowOnboarding() });
    renderPageNavigation();
  }
}

// Nova versão da persistência que aceita o âmbito
function persistAndUpdate(scopes = ["all"]) {
  refreshDerivedState();
  saveToStorage(state);
  updateUI(scopes);
}

function handleContextRefresh() {
  refreshDerivedState();
  saveToStorage(state);
  setDayCopyStatus("");
  updateUI(["day"]);
}

function resetRecipeSuggestions(message = "") {
  setState({
    recipeSuggestions: emptyRecipeSuggestions(message),
  });
}

function resetPantryAfterFoodChange() {
  const validFoodIds = new Set(state.foods.map((food) => food.id));

  setState({
    pantry: {
      ...(state.pantry || {}),
      foodIds: (state.pantry?.foodIds || []).filter((foodId) =>
        validFoodIds.has(foodId),
      ),
    },
  });
  resetRecipeSuggestions();
}

function setLastExternalImport(payload) {
  setState({
    lastExternalImport: {
      importedAt: new Date().toISOString(),
      ...payload,
    },
  });
}

async function runBootstrapBrandImports() {
  const completedImports = readCompletedBootstrapBrandImports();
  const pendingImports = BOOTSTRAP_BRAND_IMPORTS.filter(
    ({ brandTag }) =>
      !completedImports[
        String(brandTag || "")
          .trim()
          .toLowerCase()
      ],
  );

  if (!pendingImports.length) {
    return;
  }

  for (const pendingImport of pendingImports) {
    setLastExternalImport({
      type: "global-food-search",
      source: "off",
      query: pendingImport.sourceUrl,
      item: null,
      items: [],
      pagination: null,
      message: `Importing ${pendingImport.displayName} foods into your local database...`,
    });
    updateUI(["search"]);

    const beforeCount = state.foods.length;
    const importedBatch = await fetchBrandFoodsBatch(pendingImport.brandTag, {
      maxPages: 60,
      maxItems: 3000,
      pageSize: 50,
    });

    if (
      !Array.isArray(importedBatch.items) ||
      importedBatch.items.length === 0
    ) {
      setLastExternalImport({
        type: "global-food-search",
        source: "off",
        query: pendingImport.sourceUrl,
        item: null,
        items: [],
        pagination: null,
        message: `Could not import ${pendingImport.displayName} foods right now. Refresh and try again in a moment.`,
      });
      saveToStorage(state);
      updateUI(["search"]);
      continue;
    }

    const seenKeys = new Set();
    const importedItems = importedBatch.items
      .map((food) => addFood(food))
      .filter(Boolean)
      .filter((food) => {
        const identity = getFoodImportIdentity(food);
        if (seenKeys.has(identity)) {
          return false;
        }

        seenKeys.add(identity);
        return true;
      })
      .map((food) => ({
        ...food,
        alreadySaved: true,
        matchedSources: ["local", "off"],
      }));
    const addedCount = Math.max(0, state.foods.length - beforeCount);
    const refreshedCount = Math.max(0, importedItems.length - addedCount);

    markBootstrapBrandImportCompleted(pendingImport.brandTag);
    setLastExternalImport({
      type: "global-food-search",
      source: "off",
      query: pendingImport.sourceUrl,
      item: null,
      items: importedItems,
      pagination: null,
      message: `Imported ${addedCount} new ${pendingImport.displayName} food(s) and refreshed ${refreshedCount} existing one(s).`,
    });
    persistAndUpdate(["foods", "search"]);
  }
}

function handleEditFood(id) {
  const food = getFoodById(id);
  if (!food) return;

  document.getElementById("foodName").value = food.name;
  document.getElementById("foodKcal").value = formatInputNumber(food.kcal, {
    decimals: 0,
  });
  document.getElementById("foodP").value = formatInputNumber(food.prot, {
    decimals: 1,
  });
  document.getElementById("foodC").value = formatInputNumber(food.carb, {
    decimals: 1,
  });
  document.getElementById("foodF").value = formatInputNumber(food.fat, {
    decimals: 1,
  });
  document.getElementById("foodFiber").value = formatInputNumber(food.fiber, {
    decimals: 1,
  });
  document.getElementById("foodBarcode").value = food.barcode || "";

  setFoodTagSelection(food.tags || []);
  setFoodFormState({
    editingId: food.id,
    source: food.source || "manual",
    externalId: food.externalId || "",
    rawExternal: food.rawExternal || null,
  });
}

function handleDeleteFood(id) {
  deleteFood(id);
  resetPantryAfterFoodChange();
  persistAndUpdate(["foods", "recipes"]);
}

function handleRemoveBuilderItem(id) {
  removeFromBuilder(id);
  persistAndUpdate(["recipes"]);
}

function handleDeleteRecipe(id) {
  deleteRecipe(id);
  resetRecipeSuggestions();
  persistAndUpdate(["recipes"]);
}

function handleRemoveDayFood(index) {
  removeFoodFromDay(index);
  persistAndUpdate(["day"]);
}

function handleCopyPreviousDay() {
  const copyResult = copyPreviousDayToSelected();

  if (!copyResult.copied) {
    setDayCopyStatus(
      `No daily data found on ${copyResult.previousDayKey} to copy.`,
      true,
    );
    return;
  }

  refreshDerivedState();
  saveToStorage(state);
  loadDay();
  updateUI(["day"]);
  setDayCopyStatus(`Copied daily data from ${copyResult.previousDayKey}.`);
}

function handleEatMeal(meal) {
  addMealToDay(meal);
  persistAndUpdate(["day"]);
}

async function prepareSuggestionForLogging(recipe) {
  if (
    recipe.source !== "edamam" ||
    !hasEdamamConfig(state.apiConfig) ||
    !Array.isArray(recipe.ingredientLines) ||
    recipe.ingredientLines.length === 0
  ) {
    return recipe;
  }

  try {
    const analysis = await analyseRecipe(
      recipe.ingredientLines,
      state.apiConfig,
    );

    return {
      ...recipe,
      items:
        Array.isArray(analysis.items) && analysis.items.length
          ? analysis.items
          : recipe.items,
    };
  } catch {
    return recipe;
  }
}

async function handleEatSuggestion(recipe) {
  const preparedRecipe = await prepareSuggestionForLogging(recipe);
  addMealToDay(preparedRecipe);
  setLastExternalImport({
    type: "recipe-added-to-day",
    source: preparedRecipe.source || "manual",
    item: null,
    items: [],
    message: `${preparedRecipe.title} was added to today.`,
  });
  persistAndUpdate(["day"]);
}

async function handleSuggestPantryRecipes() {
  const suggestButton = document.getElementById("suggestPantryRecipesBtn");
  if (suggestButton) {
    suggestButton.disabled = true;
    suggestButton.textContent = "A sugerir...";
  }

  try {
    const result = await suggestRecipesFromPantry(
      state,
      state.pantry?.foodIds || [],
    );
    setState({
      recipeSuggestions: result,
    });
  } finally {
    if (suggestButton) {
      suggestButton.disabled = false;
      suggestButton.textContent = "Sugerir receitas";
    }
  }

  saveToStorage(state);
  updateUI(["all"]);
}

function handleSaveProfile() {
  const currentProfile = state.userProfile || {};
  const nextProfile = {
    ...currentProfile,
    ...readProfileForm(),
    completedAt: currentProfile.completedAt || new Date().toISOString(),
  };
  const nextTargets = calculateBaseMacros(nextProfile);

  if (!nextTargets) {
    return;
  }

  const nextAdaptiveTDEE = calculateAdaptiveTDEE(state.days, nextProfile);
  const nextEffectiveTargets =
    getEffectiveTargets({
      ...state,
      userProfile: nextProfile,
      targets: nextTargets,
      adaptiveTDEE: nextAdaptiveTDEE,
    }) || nextTargets;
  const nextSafetyWarnings = calculateSafetyWarnings(
    nextProfile,
    nextEffectiveTargets,
    { day: getSelectedDay(), days: state.days },
  );

  isProfileModalForcedOpen = false;
  setState({
    userProfile: nextProfile,
    targets: nextTargets,
    adaptiveTDEE: nextAdaptiveTDEE,
    safetyWarnings: nextSafetyWarnings,
  });

  persistAndUpdate(["profile", "day"]);
}

function handleSaveExternalFood(food) {
  const savedFood = addFood(food);

  setLastExternalImport({
    type: "food-saved",
    source: savedFood?.source || food.source || "manual",
    item: savedFood || food,
    items: getExternalSearchResults(),
    recentAction: "saved",
    recentFoodKey: getFoodActionKey(savedFood || food),
    message: `${savedFood?.name || food.name} was saved to your local database.`,
  });

  resetPantryAfterFoodChange();
  persistAndUpdate(["foods", "search"]);
}

function isSameFoodCandidate(left = {}, right = {}) {
  if (left.barcode && right.barcode) {
    return String(left.barcode) === String(right.barcode);
  }

  if (left.externalId && right.externalId && left.source === right.source) {
    return String(left.externalId) === String(right.externalId);
  }

  return (
    String(left.name || "")
      .trim()
      .toLowerCase() ===
    String(right.name || "")
      .trim()
      .toLowerCase()
  );
}

function handleAddSearchResult(food) {
  const savedFood = addFood(food);
  const searchItems =
    state.lastExternalImport?.type === "global-food-search" &&
    Array.isArray(state.lastExternalImport.items)
      ? state.lastExternalImport.items
      : [];
  const nextItems = searchItems.map((item) =>
    isSameFoodCandidate(item, food) ? { ...item, alreadySaved: true } : item,
  );

  setLastExternalImport({
    type: "global-food-search",
    source: "manual",
    query: state.lastExternalImport?.query || "",
    item: savedFood || food,
    items: nextItems,
    pagination: state.lastExternalImport?.pagination || null,
    recentAction: "saved",
    recentFoodKey: getFoodActionKey(savedFood || food),
    message: `${savedFood?.name || food.name} was saved to your local database.`,
  });

  resetPantryAfterFoodChange();
  persistAndUpdate(["foods", "search"]);
  focusGlobalFoodSearch();
}

function handleAddSearchResultToDay(food, grams) {
  const cleanGrams = safeNumber(grams) > 0 ? safeNumber(grams) : 100;
  const dayUpdate = addFoodPayloadToDay(food, cleanGrams);

  if (!dayUpdate) {
    return;
  }

  setLastExternalImport({
    type: "global-food-search",
    source: food.source || "manual",
    query: state.lastExternalImport?.query || "",
    item: food,
    items:
      state.lastExternalImport?.type === "global-food-search" &&
      Array.isArray(state.lastExternalImport.items)
        ? state.lastExternalImport.items
        : [],
    pagination: state.lastExternalImport?.pagination || null,
    recentAction: "logged",
    recentFoodKey: getFoodActionKey(food),
    recentGrams: Math.round(cleanGrams),
    message: `${food.name} (${Math.round(cleanGrams)}g) was added to today.`,
  });

  persistAndUpdate(["day", "search"]);
  focusGlobalFoodSearch();
}

function bindFoodForm() {
  const addFoodButton = document.getElementById("addFoodBtn");
  if (!addFoodButton || addFoodButton.dataset.bound === "true") return;

  addFoodButton.dataset.bound = "true";
  addFoodButton.addEventListener("click", () => {
    const payload = readFoodForm();
    if (!payload.name) return;

    const editingId = getEditingFoodId();
    let savedFood = null;

    if (editingId) {
      savedFood = updateFood(editingId, payload);
    } else {
      savedFood = addFood(payload);
    }

    if (payload.source !== "manual" && savedFood) {
      setLastExternalImport({
        type: editingId ? "food-updated" : "food-saved",
        source: payload.source,
        item: savedFood,
        items: payload.source === "edamam" ? getExternalSearchResults() : [],
        barcode: payload.barcode,
        message: `${savedFood.name} was saved to your local database.`,
      });
    }

    clearFoodForm();
    resetPantryAfterFoodChange();
    persistAndUpdate(["foods", "recipes", "day"]);
  });
}

function bindRecipeForm() {
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

function bindFoodLog() {
  const quickAddButton = document.getElementById("quickAddFoodBtn");
  const copyPreviousDayButton = document.getElementById("copyPreviousDayBtn");

  if (quickAddButton && quickAddButton.dataset.bound !== "true") {
    quickAddButton.dataset.bound = "true";
    quickAddButton.addEventListener("click", () => {
      const foodId = String(getElementValue("quickFoodSelect")).trim();
      const grams = safeNumber(getElementValue("quickFoodGrams"));

      if (!foodId || grams <= 0) return;

      addFoodToDay(foodId, grams);
      document.getElementById("quickFoodGrams").value = "";
      persistAndUpdate(["day"]);
    });
  }

  if (copyPreviousDayButton && copyPreviousDayButton.dataset.bound !== "true") {
    copyPreviousDayButton.dataset.bound = "true";
    copyPreviousDayButton.addEventListener("click", () => {
      handleCopyPreviousDay();
    });
  }
}

function bindMealPlanner() {
  const generateButton = document.getElementById("generateMealPlanBtn");
  if (!generateButton || generateButton.dataset.bound === "true") return;

  generateButton.dataset.bound = "true";
  generateButton.addEventListener("click", () => {
    refreshDerivedState();
    updateUI(["day"]);
  });
}

function bindOpenFoodFacts() {
  const importButton = document.getElementById("btnFetchOFF");
  const barcodeInput = document.getElementById("foodBarcode");

  if (!importButton || !barcodeInput || importButton.dataset.bound === "true") {
    return;
  }

  importButton.dataset.bound = "true";
  importButton.addEventListener("click", async () => {
    const barcode = String(barcodeInput.value).trim();
    if (!barcode) {
      setLastExternalImport({
        type: "off-error",
        source: "off",
        barcode: "",
        item: null,
        items: [],
        message: "Enter a barcode first.",
      });
      saveToStorage(state);
      updateUI(["all"]);
      return;
    }

    importButton.disabled = true;
    importButton.textContent = "Loading...";

    const result = await fetchFoodByBarcode(barcode);

    importButton.disabled = false;
    importButton.textContent = "Import from OFF";

    if (result.error) {
      setLastExternalImport({
        type: "off-error",
        source: "off",
        barcode,
        item: null,
        items: [],
        message: result.error,
      });
      saveToStorage(state);
      updateUI(["all"]);
      return;
    }

    document.getElementById("foodName").value = result.name;
    document.getElementById("foodKcal").value = formatInputNumber(result.kcal, {
      decimals: 0,
    });
    document.getElementById("foodP").value = formatInputNumber(result.prot, {
      decimals: 1,
    });
    document.getElementById("foodC").value = formatInputNumber(result.carb, {
      decimals: 1,
    });
    document.getElementById("foodF").value = formatInputNumber(result.fat, {
      decimals: 1,
    });
    document.getElementById("foodFiber").value = formatInputNumber(
      result.fiber,
      {
        decimals: 1,
      },
    );
    document.getElementById("foodBarcode").value = result.barcode;

    setFoodTagSelection([]);
    setFoodFormState({
      editingId: "",
      source: result.source,
      externalId: result.externalId,
      rawExternal: result.rawExternal || result.raw || null,
    });
    setLastExternalImport({
      type: "off-barcode",
      source: "off",
      barcode,
      item: result,
      items: [result],
      message: `${result.name} was imported from Open Food Facts. Review it and save when ready.`,
    });
    saveToStorage(state);
    updateUI(["all"]);
  });
}

function bindApiConfig() {
  const saveButton = document.getElementById("saveApiConfigBtn");
  if (!saveButton || saveButton.dataset.bound === "true") return;

  saveButton.dataset.bound = "true";
  saveButton.addEventListener("click", () => {
    setState({
      apiConfig: readApiConfigForm(),
    });
    setLastExternalImport({
      type: "api-config",
      source: "manual",
      item: null,
      items: [],
      message: hasEdamamConfig(state.apiConfig)
        ? "API settings saved."
        : "Settings saved. Open Food Facts search is built in.",
    });
    saveToStorage(state);
    updateUI(["all"]);
  });
}

function bindEdamamFoodSearch() {
  const searchButton = document.getElementById("searchEdamamFoodBtn");
  const searchInput = document.getElementById("edamamFoodQuery");

  if (!searchButton || !searchInput || searchButton.dataset.bound === "true") {
    return;
  }

  searchButton.dataset.bound = "true";
  searchButton.addEventListener("click", async () => {
    const query = String(searchInput.value).trim();

    if (!query) {
      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query: "",
        item: null,
        items: [],
        message: "Type a food name to search Edamam.",
      });
      saveToStorage(state);
      updateUI(["all"]);
      return;
    }

    if (!hasEdamamConfig(state.apiConfig)) {
      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query,
        item: null,
        items: [],
        message: "Add Edamam credentials before running this optional search.",
      });
      saveToStorage(state);
      updateUI(["all"]);
      return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {
      const foods = await searchFood(query, state.apiConfig);

      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query,
        item: null,
        items: foods,
        message: foods.length
          ? `Found ${foods.length} food result(s) in Edamam.`
          : "No Edamam results matched that search.",
      });
    } catch (error) {
      setLastExternalImport({
        type: "edamam-food-search",
        source: "edamam",
        query,
        item: null,
        items: [],
        message:
          error instanceof Error
            ? error.message
            : "Edamam search failed. The app still works with local and Open Food Facts data.",
      });
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = "Search Edamam";
      saveToStorage(state);
      updateUI(["all"]);
    }
  });
}

async function runGlobalFoodSearch(page = 1) {
  const searchButton = document.getElementById("searchAllApis");
  const searchInput = document.getElementById("globalFoodSearch");

  if (!searchButton || !searchInput) {
    return;
  }

  const query = String(searchInput.value).trim();
  const brandFacet = extractOpenFoodFactsBrandFacet(query);

  if (!query) {
    setLastExternalImport({
      type: "global-food-search",
      source: "manual",
      query: "",
      item: null,
      items: [],
      pagination: null,
      message: "Type a food name to search.",
    });
    saveToStorage(state);
    updateUI(["all"]);
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Searching...";

  try {
    if (brandFacet) {
      const beforeCount = state.foods.length;
      const importedBatch = await fetchBrandFoodsBatch(brandFacet.brandTag, {
        maxPages: 60,
        maxItems: 3000,
        pageSize: 50,
      });

      const seenKeys = new Set();
      const importedItems = importedBatch.items
        .map((food) => addFood(food))
        .filter(Boolean)
        .filter((food) => {
          const identity = getFoodImportIdentity(food);
          if (seenKeys.has(identity)) {
            return false;
          }

          seenKeys.add(identity);
          return true;
        })
        .map((food) => ({
          ...food,
          alreadySaved: true,
          matchedSources: ["local", "off"],
        }));
      const addedCount = Math.max(0, state.foods.length - beforeCount);
      const reviewedCount = importedItems.length;

      setLastExternalImport({
        type: "global-food-search",
        source: "off",
        query,
        item: null,
        items: importedItems,
        pagination: null,
        message: reviewedCount
          ? `Imported ${addedCount} new food(s) and refreshed ${reviewedCount - addedCount} existing one(s) from brand ${brandFacet.displayName}.`
          : `No foods were imported from brand ${brandFacet.displayName}.`,
      });

      persistAndUpdate(["foods", "search"]);
      return;
    }

    const result = await searchAllApis(query, state, { page });

    setLastExternalImport({
      type: "global-food-search",
      source: "manual",
      query,
      item: null,
      items: result.items,
      pagination: result.pagination,
      message: result.message,
    });
  } catch (error) {
    setLastExternalImport({
      type: "global-food-search",
      source: "manual",
      query,
      item: null,
      items: [],
      pagination: null,
      message:
        error instanceof Error
          ? error.message
          : "Search failed. The app still works with local data.",
    });
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
    saveToStorage(state);
    updateUI(["all"]);
  }
}

function handleSearchPageChange(nextPage) {
  const currentPage = Math.max(
    1,
    safeNumber(state.lastExternalImport?.pagination?.page) || 1,
  );
  const targetPage = Math.max(1, safeNumber(nextPage) || 1);

  if (targetPage === currentPage) {
    return;
  }

  runGlobalFoodSearch(targetPage);
}

function bindGlobalFoodSearch() {
  const searchButton = document.getElementById("searchAllApis");
  const searchInput = document.getElementById("globalFoodSearch");

  if (!searchButton || !searchInput || searchButton.dataset.bound === "true") {
    return;
  }

  searchButton.dataset.bound = "true";
  searchButton.addEventListener("click", () => {
    runGlobalFoodSearch(1);
  });

  if (searchInput.dataset.bound !== "true") {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runGlobalFoodSearch(1);
      }
    });
  }
}

function bindPantryAssistant() {
  const pantryList = document.getElementById("pantryFoodList");
  const suggestButton = document.getElementById("suggestPantryRecipesBtn");
  const clearButton = document.getElementById("clearPantryBtn");

  if (pantryList && pantryList.dataset.bound !== "true") {
    pantryList.dataset.bound = "true";
    pantryList.addEventListener("change", (event) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement &&
        target.matches("[data-pantry-food-id]")
      ) {
        if (target.checked) {
          addPantryItem(target.value);
        } else {
          removePantryItem(target.value);
        }

        resetRecipeSuggestions();
        saveToStorage(state);
        updateUI(["all"]);
      }
    });
  }

  if (suggestButton && suggestButton.dataset.bound !== "true") {
    suggestButton.dataset.bound = "true";
    suggestButton.addEventListener("click", () => {
      handleSuggestPantryRecipes();
    });
  }

  if (clearButton && clearButton.dataset.bound !== "true") {
    clearButton.dataset.bound = "true";
    clearButton.addEventListener("click", () => {
      clearPantry();
      resetRecipeSuggestions("Despensa limpa.");
      saveToStorage(state);
      updateUI(["all"]);
    });
  }
}

function bindProfileForm() {
  const profileForm = document.getElementById("profileForm");

  if (!profileForm || profileForm.dataset.bound === "true") {
    return;
  }

  profileForm.dataset.bound = "true";
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSaveProfile();
  });
}

function bindProfileActions() {
  const editProfileButton = document.getElementById("editProfileBtn");

  if (!editProfileButton || editProfileButton.dataset.bound === "true") {
    return;
  }

  editProfileButton.dataset.bound = "true";
  editProfileButton.addEventListener("click", () => {
    isProfileModalForcedOpen = true;
    updateUI(["all"]);
  });
}

function bindMacroCalculator() {
  const calculateButton = document.getElementById("calculateMacrosBtn");

  if (calculateButton && calculateButton.dataset.bound !== "true") {
    calculateButton.dataset.bound = "true";
    calculateButton.addEventListener("click", () => {
      renderMacroCalculator();
    });
  }

  MACRO_CALCULATOR_FIELDS.forEach(({ id, event }) => {
    const element = document.getElementById(id);

    if (!element || element.dataset.bound === "true") {
      return;
    }

    element.dataset.bound = "true";
    element.addEventListener(event, () => {
      renderMacroCalculator();
    });
  });
}

function bindPageNavigation() {
  const navigationButtons = document.querySelectorAll("[data-page-link]");

  navigationButtons.forEach((button) => {
    if (button.dataset.bound === "true") {
      return;
    }

    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      setActiveAppPage(button.dataset.pageLink);
    });
  });

  if (document.body.dataset.pageNavBound === "true") {
    return;
  }

  document.body.dataset.pageNavBound = "true";
  window.addEventListener("popstate", () => {
    renderPageNavigation();
  });
}

function setBackupStatus(message, isError = false) {
  const status = document.getElementById("backupStatus");
  if (!status) return;

  status.textContent = message;
  status.classList.toggle("text-rose-300", isError);
  status.classList.toggle("text-emerald-300", !isError);
}

function bindBackupControls() {
  const exportButton = document.getElementById("exportBackupBtn");
  const importButton = document.getElementById("importBackupBtn");
  const importInput = document.getElementById("importBackupInput");

  if (exportButton && exportButton.dataset.bound !== "true") {
    exportButton.dataset.bound = "true";
    exportButton.addEventListener("click", () => {
      const backupPayload = createBackupPayload(state);
      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `fitness-dashboard-v6-backup-${formatDate(new Date())}.json`;
      link.click();

      URL.revokeObjectURL(url);
      setBackupStatus("Backup exportado com sucesso.");
    });
  }

  if (importButton && importButton.dataset.bound !== "true") {
    importButton.dataset.bound = "true";
    importButton.addEventListener("click", () => {
      importInput?.click();
    });
  }

  if (importInput && importInput.dataset.bound !== "true") {
    importInput.dataset.bound = "true";
    importInput.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;

      try {
        const importedState = importBackupPayload(await file.text());
        setState(importedState);
        revalidateProfileState();
        requireProfile();
        ensureSeedData();
        persistAndUpdate(["all"]);
        setBackupStatus(`Backup importado: ${file.name}`);
      } catch (error) {
        setBackupStatus(
          error instanceof Error ? error.message : "Falha ao importar backup.",
          true,
        );
      } finally {
        importInput.value = "";
      }
    });
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  navigator.serviceWorker
    .register(new URL("../service-worker.js", import.meta.url))
    .catch(() => {});
}

async function init() {
  let storedState = null;

  try {
    storedState = await loadFromStorage();
  } catch {
    storedState = null;
  }

  if (storedState) {
    setState(storedState);
  }
  revalidateProfileState();
  requireProfile();

  ensureSeedData();

  bindFoodForm();
  bindRecipeForm();
  bindFoodLog();
  bindMealPlanner();
  bindOpenFoodFacts();
  bindApiConfig();
  bindEdamamFoodSearch();
  bindGlobalFoodSearch();
  bindPantryAssistant();
  bindMacroCalculator();
  bindPageNavigation();
  bindProfileForm();
  bindProfileActions();
  bindBackupControls();

  initDashboard({ onDayUpdated: handleContextRefresh });
  initCalendar({ onDateChange: handleContextRefresh });

  clearFoodForm();
  refreshDerivedState();
  saveToStorage(state);
  setActiveAppPage(getActiveAppPage(), { replace: true });
  updateUI(["all"]);
  await runBootstrapBrandImports();
  registerServiceWorker();
}
// 1. Forçar a data de hoje sempre que a app é recarregada do zero
function forceTodayOnLoad() {
  const todayStr = formatDate(new Date());
  setState({ selectedDate: todayStr });
}

// 2. O "Despertador" para o iPhone: detetar quando a app volta ao primeiro plano
function setupVisibilityWakeup() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const currentState = getState();
      const todayStr = formatDate(new Date());

      // Se a app acordou e a data que está no ecrã já não é a data de hoje real
      if (currentState.selectedDate !== todayStr) {
        // Atualiza o estado para hoje
        setState({ selectedDate: todayStr });

        // Corre a gamificação em background para atualizar a streak (caso tenhas falhado ontem, ela quebra agora)
        import("./gamification.js").then((module) => {
          module.processDayGamification(todayStr);
        });

        // Volta a renderizar a interface para mostrar os dados de hoje
        if (typeof renderDashboard === "function") {
          renderDashboard();
        }

        // Se tiveres uma função para renderizar o calendário/datas, chama-a aqui também
        // if (typeof renderCalendar === 'function') renderCalendar();
      }
    }
  });
}

// Executar ambas as proteções
forceTodayOnLoad();
setupVisibilityWakeup();

init().then(() => {
  try {
    if (typeof window.navigate === 'function') window.navigate('dashboard');
  } catch (e) {
    // ignore
  }
});
