import {
  calculateAdaptiveTDEE,
  calculateBaseMacros,
  getEffectiveTargets,
  isProfileValid,
  calculateSafetyWarnings,
} from "./algorithm.js";
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
import { initDashboard, renderDashboard } from "./dashboard.js";
import {
  addFoodPayloadToDay,
  addFoodToDay,
  addMealToDay,
  removeFoodFromDay,
} from "./foodLog.js";
import { fetchFoodByBarcode } from "./openFoodFacts.js";
import {
  addPantryItem,
  clearPantry,
  removePantryItem,
  suggestRecipesFromPantry,
} from "./pantry.js";
import { generatePlan } from "./mealPlanner.js";
import { addToBuilder, deleteRecipe, removeFromBuilder, saveRecipe } from "./recipes.js";
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
import { formatDate, safeNumber } from "./utils.js";

let isProfileModalForcedOpen = false;

function getElementValue(id) {
  return document.getElementById(id)?.value ?? "";
}

function focusGlobalFoodSearch() {
  const searchInput = document.getElementById("globalFoodSearch");
  if (!searchInput) {
    return;
  }

  searchInput.focus({ preventScroll: true });
}

function getFoodActionKey(food = {}) {
  if (food.barcode) {
    return String(food.barcode).trim();
  }

  if (food.externalId) {
    return `${String(food.source || "manual").trim()}:${String(food.externalId).trim()}`;
  }

  return String(food.name || "").trim().toLowerCase();
}

function parseJsonValue(rawValue, fallback = null) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
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
  return (
    isProfileModalForcedOpen ||
    !isProfileValid(state.userProfile) ||
    !state.targets
  );
}

function requireProfile() {
  const needsProfile = !isProfileValid(state.userProfile) || !state.targets;

  if (needsProfile) {
    isProfileModalForcedOpen = true;
  }

  return needsProfile;
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

  return Object.values(remaining).some((value) => value > 0)
    ? remaining
    : null;
}

function readProfileForm() {
  return {
    name: String(getElementValue("profileName")).trim(),
    age: safeNumber(getElementValue("profileAge")),
    weight: safeNumber(getElementValue("profileWeight")),
    height: safeNumber(getElementValue("profileHeight")),
    gender: String(getElementValue("profileGender")).trim().toLowerCase(),
    goal: String(getElementValue("profileGoal") || "maintenance"),
    activityLevel: String(getElementValue("profileActivityLevel")).trim().toLowerCase(),
    mealsPerDay: Math.min(
      6,
      Math.max(3, safeNumber(getElementValue("profileMealsPerDay")) || 4),
    ),
  };
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
    addFoodButton.textContent = editingId
      ? "Save food"
      : "Add food";
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
          ? `Current source: USDA${externalId ? ` (${externalId})` : ""}${lastExternalLabel}`
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
      ? calculateSafetyWarnings(
          state.userProfile,
          effectiveTargets,
          { day: selectedDay, days: state.days },
        )
      : [];

  if (!profileIsValid || !state.targets) {
    setState({
      adaptiveTDEE: nextAdaptiveTDEE,
      safetyWarnings: nextSafetyWarnings,
      mealPlan: {
        error: "Completa o perfil para calcular targets reais antes de gerar o meal planner.",
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

function renderAll() {
  renderProfileSummary();
  renderApiConfig();
  renderSearchResults(state.lastExternalImport, {
    onAddFood: handleAddSearchResult,
    onAddFoodToDay: handleAddSearchResultToDay,
  });
  renderFoodList({
    onEdit: handleEditFood,
    onDelete: handleDeleteFood,
  });
  renderExternalFoodResults(state.lastExternalImport, {
    onSaveFood: handleSaveExternalFood,
  });
  renderPantryList();
  renderRecipeBuilder({
    onRemove: handleRemoveBuilderItem,
  });
  renderRecipesList({
    onDelete: handleDeleteRecipe,
  });
  renderDayFoods({
    onRemove: handleRemoveDayFood,
  });
  renderMealPlan(state.mealPlan, {
    onEatMeal: handleEatMeal,
  });
  renderPantrySuggestions(state.recipeSuggestions, {
    onEatSuggestion: handleEatSuggestion,
  });
  renderOnboardingModal({ isOpen: shouldShowOnboarding() });
  renderDashboard();
  renderCalendar();
  renderFoodImportStatus();
}

function persistAndRenderAll() {
  refreshDerivedState();
  saveToStorage(state);
  renderAll();
}

function handleContextRefresh() {
  refreshDerivedState();
  saveToStorage(state);
  renderAll();
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

function handleEditFood(id) {
  const food = getFoodById(id);
  if (!food) return;

  document.getElementById("foodName").value = food.name;
  document.getElementById("foodKcal").value = food.kcal;
  document.getElementById("foodP").value = food.prot;
  document.getElementById("foodC").value = food.carb;
  document.getElementById("foodF").value = food.fat;
  document.getElementById("foodFiber").value = food.fiber || "";
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
  persistAndRenderAll();
}

function handleRemoveBuilderItem(id) {
  removeFromBuilder(id);
  persistAndRenderAll();
}

function handleDeleteRecipe(id) {
  deleteRecipe(id);
  resetRecipeSuggestions();
  persistAndRenderAll();
}

function handleRemoveDayFood(index) {
  removeFoodFromDay(index);
  persistAndRenderAll();
}

function handleEatMeal(meal) {
  addMealToDay(meal);
  persistAndRenderAll();
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
    const analysis = await analyseRecipe(recipe.ingredientLines, state.apiConfig);

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
  persistAndRenderAll();
}

async function handleSuggestPantryRecipes() {
  const suggestButton = document.getElementById("suggestPantryRecipesBtn");
  if (suggestButton) {
    suggestButton.disabled = true;
    suggestButton.textContent = "A sugerir...";
  }

  try {
    const result = await suggestRecipesFromPantry(state, state.pantry?.foodIds || []);
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
  renderAll();
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

  persistAndRenderAll();
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
  persistAndRenderAll();
}

function isSameFoodCandidate(left = {}, right = {}) {
  if (left.barcode && right.barcode) {
    return String(left.barcode) === String(right.barcode);
  }

  if (left.externalId && right.externalId && left.source === right.source) {
    return String(left.externalId) === String(right.externalId);
  }

  return String(left.name || "").trim().toLowerCase() ===
    String(right.name || "").trim().toLowerCase();
}

function handleAddSearchResult(food) {
  const savedFood = addFood(food);
  const searchItems =
    state.lastExternalImport?.type === "global-food-search" &&
    Array.isArray(state.lastExternalImport.items)
      ? state.lastExternalImport.items
      : [];
  const nextItems = searchItems.map((item) =>
    isSameFoodCandidate(item, food)
      ? { ...item, alreadySaved: true }
      : item,
  );

  setLastExternalImport({
    type: "global-food-search",
    source: "manual",
    query: state.lastExternalImport?.query || "",
    item: savedFood || food,
    items: nextItems,
    recentAction: "saved",
    recentFoodKey: getFoodActionKey(savedFood || food),
    message: `${savedFood?.name || food.name} was saved to your local database.`,
  });

  resetPantryAfterFoodChange();
  persistAndRenderAll();
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
    recentAction: "logged",
    recentFoodKey: getFoodActionKey(food),
    recentGrams: Math.round(cleanGrams),
    message: `${food.name} (${Math.round(cleanGrams)}g) was added to today.`,
  });

  persistAndRenderAll();
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
    persistAndRenderAll();
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
      persistAndRenderAll();
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
      persistAndRenderAll();
    });
  }
}

function bindFoodLog() {
  const quickAddButton = document.getElementById("quickAddFoodBtn");
  if (!quickAddButton || quickAddButton.dataset.bound === "true") return;

  quickAddButton.dataset.bound = "true";
  quickAddButton.addEventListener("click", () => {
    const foodId = String(getElementValue("quickFoodSelect")).trim();
    const grams = safeNumber(getElementValue("quickFoodGrams"));

    if (!foodId || grams <= 0) return;

    addFoodToDay(foodId, grams);
    document.getElementById("quickFoodGrams").value = "";
    persistAndRenderAll();
  });
}

function bindMealPlanner() {
  const generateButton = document.getElementById("generateMealPlanBtn");
  if (!generateButton || generateButton.dataset.bound === "true") return;

  generateButton.dataset.bound = "true";
  generateButton.addEventListener("click", () => {
    refreshDerivedState();
    renderAll();
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
      renderAll();
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
      renderAll();
      return;
    }

    document.getElementById("foodName").value = result.name;
    document.getElementById("foodKcal").value = result.kcal;
    document.getElementById("foodP").value = result.prot;
    document.getElementById("foodC").value = result.carb;
    document.getElementById("foodF").value = result.fat;
    document.getElementById("foodFiber").value = result.fiber;
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
    renderAll();
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
      message:
        state.apiConfig.usdaApiKey || hasEdamamConfig(state.apiConfig)
          ? "API settings saved."
          : "API settings updated. USDA demo access stays available by default.",
    });
    saveToStorage(state);
    renderAll();
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
      renderAll();
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
      renderAll();
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
            : "Edamam search failed. The app still works with local and USDA data.",
      });
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = "Search Edamam";
      saveToStorage(state);
      renderAll();
    }
  });
}

function bindGlobalFoodSearch() {
  const searchButton = document.getElementById("searchAllApis");
  const searchInput = document.getElementById("globalFoodSearch");

  if (!searchButton || !searchInput || searchButton.dataset.bound === "true") {
    return;
  }

  const runSearch = async () => {
    const query = String(searchInput.value).trim();

    if (!query) {
      setLastExternalImport({
        type: "global-food-search",
        source: "manual",
        query: "",
        item: null,
        items: [],
        message: "Type a food name to search.",
      });
      saveToStorage(state);
      renderAll();
      return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {
      const result = await searchAllApis(query, state);

      setLastExternalImport({
        type: "global-food-search",
        source: "manual",
        query,
        item: null,
        items: result.items,
        message: result.message,
      });
    } catch (error) {
      setLastExternalImport({
        type: "global-food-search",
        source: "manual",
        query,
        item: null,
        items: [],
        message:
          error instanceof Error
            ? error.message
            : "Search failed. The app still works with local data.",
      });
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = "Search";
      saveToStorage(state);
      renderAll();
    }
  };

  searchButton.dataset.bound = "true";
  searchButton.addEventListener("click", () => {
    runSearch();
  });

  if (searchInput.dataset.bound !== "true") {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runSearch();
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
        renderAll();
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
      renderAll();
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
    renderAll();
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
        persistAndRenderAll();
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
  bindProfileForm();
  bindProfileActions();
  bindBackupControls();

  initDashboard({ onDayUpdated: handleContextRefresh });
  initCalendar({ onDateChange: handleContextRefresh });

  clearFoodForm();
  refreshDerivedState();
  saveToStorage(state);
  renderAll();
  registerServiceWorker();
}

init();
