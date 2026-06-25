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
import {
  getActiveSession,
  getActiveAccount,
  getAccountStorageKey,
  hasAnyAccounts,
  hasLegacyData,
  readLegacyData,
  loginAccount,
  registerAccount,
  logout,
} from "./auth.js";

// Active account storage key — set after login/register
let activeStorageKey = null;


// ---------------------------------------------------------------------------
// Unit conversion helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Unit toggle helpers — calculator
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Unit toggle helpers — profile modal
// ---------------------------------------------------------------------------

const BOOTSTRAP_BRAND_IMPORTS = [
  {
    brandTag: "continente",
    displayName: "Continente",
    sourceUrl: "https://world.openfoodfacts.org/facets/brands/continente",
  },
];
const BOOTSTRAP_BRAND_IMPORTS_STORAGE_KEY =
  "fitnessDashboardBootstrapBrandImportsV1";







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
  const cleanBrandTag = String(brandTag || "").trim().toLowerCase();

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







function setFoodTagSelection(tags = []) {
  const selectedTags = new Set(tags);

  document.querySelectorAll(".foodTag").forEach((checkbox) => {
    checkbox.checked = selectedTags.has(checkbox.value);
  });
}








function ensureSeedData() {
  const patch = getSeedStatePatch(state);

  if (!Object.keys(patch).length) {
    return;
  }

  setState(patch);
  saveToStorage(state, activeStorageKey);
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
  saveToStorage(state, activeStorageKey);
  updateUI(scopes);
}

function handleContextRefresh() {
  refreshDerivedState();
  saveToStorage(state, activeStorageKey);
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
    ({ brandTag }) => !completedImports[String(brandTag || "").trim().toLowerCase()],
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

    if (!Array.isArray(importedBatch.items) || importedBatch.items.length === 0) {
      setLastExternalImport({
        type: "global-food-search",
        source: "off",
        query: pendingImport.sourceUrl,
        item: null,
        items: [],
        pagination: null,
        message: `Could not import ${pendingImport.displayName} foods right now. Refresh and try again in a moment.`,
      });
      saveToStorage(state, activeStorageKey);
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
  saveToStorage(state, activeStorageKey);
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

  saveToStorage(state, activeStorageKey);
  updateUI(["all"]);
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
    saveToStorage(state, activeStorageKey);
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
    saveToStorage(state, activeStorageKey);
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










// ---------------------------------------------------------------------------
// Auth overlay controller
// ---------------------------------------------------------------------------










/**
 * Boot all app subsystems after auth is resolved.
 * Can be called from init() (existing session) or after login/register.
 */
async function bootApp(account) {
  updateUserBadge(account);
  dismissAuthOverlay();

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
  saveToStorage(state, activeStorageKey);
  setActiveAppPage(getActiveAppPage(), { replace: true });
  updateUI(["all"]);
  await runBootstrapBrandImports();

}





async function init() {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const activeUsername = getActiveSession();

  bindAuthOverlay();
  bindLogoutButton();

  if (!activeUsername) {
    // No session — keep the overlay visible, don't boot the app yet.
    return;
  }

  // We have a session — boot the app for this user.
  const account = getActiveAccount();
  activeStorageKey = getAccountStorageKey(activeUsername);

  let storedState = null;
  try {
    storedState = await loadFromStorage(activeStorageKey);
  } catch {
    storedState = null;
  }

  if (storedState) {
    setState(storedState);
  }

  await bootApp(account);
}

init();
