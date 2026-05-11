import {
  calculateAdaptiveTDEE,
  calculateBaseMacros,
  calculateSafetyWarnings,
  sumEntryMacros,
} from "./algorithm.js?v=navy2";
import { inferTags, mergeTags } from "./food.js";
import {
  createEmptyDay,
  createEmptyPantry,
  createEmptyRecipeSuggestions,
  createInitialState,
  getDefaultApiConfig,
  getDefaultUserProfileTemplate,
} from "./state.js";
import { formatDate, safeNumber, uniqueStrings } from "./utils.js";

const STORAGE_KEY = "fitnessDataV6";
const LEGACY_STORAGE_KEY = "fitnessDataV5";
const BACKUP_VERSION = "6.0";
const INDEXED_DB_NAME = "fitness-dashboard-v6";
const INDEXED_DB_VERSION = 1;
const INDEXED_DB_STORE = "kv";

const storageRuntime = {
  driver: "pending",
  dbPromise: null,
  writeQueue: Promise.resolve(),
};

function isIndexedDbAvailable() {
  return typeof indexedDB !== "undefined";
}

function readLocalStorageValue(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorageValue(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeLocalStorageValue(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function cleanupLegacyLocalStorage() {
  [
    STORAGE_KEY,
    LEGACY_STORAGE_KEY,
    "foodsV6",
    "recipesV6",
  ].forEach(removeLocalStorageValue);
}

function getDatabase() {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  if (!storageRuntime.dbPromise) {
    storageRuntime.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(INDEXED_DB_STORE)) {
          database.createObjectStore(INDEXED_DB_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error("Falha ao abrir IndexedDB."));
    });
  }

  return storageRuntime.dbPromise;
}

async function readIndexedDbValue(key) {
  const database = await getDatabase();

  if (!database) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(INDEXED_DB_STORE, "readonly");
    const store = transaction.objectStore(INDEXED_DB_STORE);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () =>
      reject(request.error || new Error("Falha a ler IndexedDB."));
  });
}

async function writeIndexedDbValue(key, value) {
  const database = await getDatabase();

  if (!database) {
    throw new Error("IndexedDB indisponivel.");
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(INDEXED_DB_STORE, "readwrite");
    const store = transaction.objectStore(INDEXED_DB_STORE);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error || new Error("Falha a escrever IndexedDB."));

    store.put(value, key);
  });
}

async function persistSerializedState(rawValue) {
  if (storageRuntime.driver !== "localstorage" && isIndexedDbAvailable()) {
    try {
      await writeIndexedDbValue(STORAGE_KEY, rawValue);
      storageRuntime.driver = "indexeddb";
      cleanupLegacyLocalStorage();
      return;
    } catch {
      storageRuntime.driver = "localstorage";
    }
  }

  writeLocalStorageValue(STORAGE_KEY, rawValue);
}

function queueStorageWrite(rawValue) {
  storageRuntime.writeQueue = storageRuntime.writeQueue
    .catch(() => {})
    .then(() => persistSerializedState(rawValue));

  return storageRuntime.writeQueue;
}

function parseJson(rawValue, fallback = null) {
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

function cloneSerializable(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function normalizeDate(value, fallback = new Date()) {
  const normalizedDate = value ? new Date(value) : new Date(fallback);

  return Number.isNaN(normalizedDate.getTime())
    ? new Date(fallback)
    : normalizedDate;
}

function normalizeGoal(goal) {
  return ["cut", "maintenance", "bulk"].includes(goal) ? goal : "maintenance";
}

function normalizeActivityLevel(activityLevel) {
  return ["sedentary", "light", "moderate", "heavy", "athlete"].includes(
    String(activityLevel ?? "").trim().toLowerCase(),
  )
    ? String(activityLevel).trim().toLowerCase()
    : "";
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

function normalizeFoodSource(source) {
  const normalizedSource = String(source ?? "").trim().toLowerCase();

  if (
    normalizedSource === "off" ||
    normalizedSource.includes("open food facts")
  ) {
    return "off";
  }

  if (normalizedSource === "edamam") {
    return "edamam";
  }

  if (normalizedSource === "usda") {
    return "usda";
  }

  return "manual";
}

function normalizeRecipeSource(source) {
  return normalizeFoodSource(source) === "manual"
    ? "local"
    : normalizeFoodSource(source);
}

function normalizeUserProfile(rawProfile) {
  if (!rawProfile || typeof rawProfile !== "object") {
    return null;
  }

  const defaultProfile = getDefaultUserProfileTemplate();
  const name = String(rawProfile.name ?? rawProfile.nome ?? "").trim();

  return {
    ...defaultProfile,
    name,
    age: safeNumber(rawProfile.age ?? rawProfile.idade),
    weight: safeNumber(rawProfile.weight ?? rawProfile.peso),
    height: safeNumber(rawProfile.height ?? rawProfile.altura),
    gender: normalizeGender(rawProfile.gender ?? rawProfile.genero),
    goal: normalizeGoal(rawProfile.goal),
    activityLevel: normalizeActivityLevel(
      rawProfile.activityLevel ?? rawProfile.activity ?? rawProfile.nivelAtividade,
    ),
    mealsPerDay: Math.min(
      6,
      Math.max(3, safeNumber(rawProfile.mealsPerDay) || defaultProfile.mealsPerDay),
    ),
    completedAt: String(rawProfile.completedAt || ""),
  };
}

function normalizeApiConfig(rawApiConfig = {}) {
  const baseConfig = getDefaultApiConfig();
  const edamamConfig = rawApiConfig?.edamam || rawApiConfig;

  return {
    ...baseConfig,
    usdaApiKey: String(
      rawApiConfig?.usda?.apiKey ??
        rawApiConfig?.usda?.usdaApiKey ??
        rawApiConfig?.usdaApiKey ??
        baseConfig.usdaApiKey,
    ).trim(),
    edamamAppId: String(
      edamamConfig?.appId ??
        edamamConfig?.edamamAppId ??
        rawApiConfig?.edamamAppId ??
        baseConfig.edamamAppId,
    ).trim(),
    edamamAppKey: String(
      edamamConfig?.appKey ??
        edamamConfig?.edamamAppKey ??
        rawApiConfig?.edamamAppKey ??
        baseConfig.edamamAppKey,
    ).trim(),
  };
}

function normalizeTargets(rawTargets, normalizedProfile) {
  const computedTargets = calculateBaseMacros(normalizedProfile);

  if (!computedTargets) {
    return null;
  }

  if (!rawTargets || typeof rawTargets !== "object") {
    return computedTargets;
  }

  const fallback = computedTargets;

  return {
    kcal: safeNumber(rawTargets.kcal ?? fallback.kcal),
    prot: safeNumber(rawTargets.prot ?? fallback.prot),
    carb: safeNumber(rawTargets.carb ?? fallback.carb),
    fat: safeNumber(rawTargets.fat ?? fallback.fat),
    fiber: safeNumber(rawTargets.fiber ?? fallback.fiber),
    water: safeNumber(rawTargets.water ?? fallback.water),
    bmr: safeNumber(rawTargets.bmr ?? fallback.bmr),
    tdee: safeNumber(rawTargets.tdee ?? fallback.tdee),
    activityMultiplier: safeNumber(
      rawTargets.activityMultiplier ?? fallback.activityMultiplier,
    ),
    kcalAdjustment: safeNumber(rawTargets.kcalAdjustment ?? fallback.kcalAdjustment),
    minSafeFat: safeNumber(rawTargets.minSafeFat ?? fallback.minSafeFat),
  };
}

function normalizeAdaptiveTDEE(rawAdaptiveTDEE, days, profile) {
  const computedAdaptiveTDEE = calculateAdaptiveTDEE(days, profile);

  if (!rawAdaptiveTDEE || typeof rawAdaptiveTDEE !== "object") {
    return computedAdaptiveTDEE;
  }

  if (!computedAdaptiveTDEE) {
    return null;
  }

  return {
    kcal: safeNumber(rawAdaptiveTDEE.kcal ?? computedAdaptiveTDEE.kcal),
    averageIntake: safeNumber(
      rawAdaptiveTDEE.averageIntake ?? computedAdaptiveTDEE.averageIntake,
    ),
    weightChangeKg: safeNumber(
      rawAdaptiveTDEE.weightChangeKg ?? computedAdaptiveTDEE.weightChangeKg,
    ),
    spanDays: safeNumber(rawAdaptiveTDEE.spanDays ?? computedAdaptiveTDEE.spanDays),
    daysUsed: safeNumber(rawAdaptiveTDEE.daysUsed ?? computedAdaptiveTDEE.daysUsed),
  };
}

function normalizeFood(rawFood = {}) {
  const baseFood = {
    id: String(rawFood.id ?? crypto.randomUUID()),
    name: String(rawFood.name ?? "").trim(),
    kcal: safeNumber(rawFood.kcal),
    prot: safeNumber(rawFood.prot),
    carb: safeNumber(rawFood.carb),
    fat: safeNumber(rawFood.fat),
    fiber: safeNumber(rawFood.fiber),
    source: normalizeFoodSource(rawFood.source),
    externalId: String(rawFood.externalId ?? rawFood.foodId ?? "").trim(),
    barcode: String(rawFood.barcode ?? rawFood.code ?? "").trim(),
  };

  if (!baseFood.name) {
    return null;
  }

  return {
    ...baseFood,
    tags: mergeTags(
      inferTags(baseFood),
      uniqueStrings(Array.isArray(rawFood.tags) ? rawFood.tags : []),
    ),
    rawExternal:
      baseFood.source === "edamam"
        ? null
        : cloneSerializable(rawFood.rawExternal ?? rawFood.raw),
  };
}

function normalizeLoggedFood(rawFood = {}) {
  const id = String(
    rawFood.id ?? rawFood.foodId ?? rawFood.externalId ?? "",
  ).trim();
  const name = String(rawFood.name ?? rawFood.title ?? "").trim();

  if (!id && !name) {
    return null;
  }

  return {
    id: id || crypto.randomUUID(),
    externalId: String(rawFood.externalId ?? "").trim(),
    name: name || "Food",
    grams: safeNumber(rawFood.grams ?? rawFood.weight),
    kcal: safeNumber(rawFood.kcal),
    prot: safeNumber(rawFood.prot),
    carb: safeNumber(rawFood.carb),
    fat: safeNumber(rawFood.fat),
    fiber: safeNumber(rawFood.fiber),
    source: normalizeFoodSource(rawFood.source),
    rawExternal:
      normalizeFoodSource(rawFood.source) === "edamam"
        ? null
        : cloneSerializable(rawFood.rawExternal ?? rawFood.raw),
  };
}

function normalizeRecipeItem(rawItem = {}) {
  const foodId = String(rawItem.foodId ?? "").trim();
  const grams = safeNumber(rawItem.grams);

  if (!foodId || grams <= 0) {
    return null;
  }

  return {
    id: String(rawItem.id ?? crypto.randomUUID()),
    foodId,
    grams,
  };
}

function normalizeRecipe(rawRecipe = {}) {
  const items = (Array.isArray(rawRecipe.items) ? rawRecipe.items : [])
    .map(normalizeRecipeItem)
    .filter(Boolean);
  const name = String(rawRecipe.name ?? rawRecipe.title ?? "").trim();

  if (!name) {
    return null;
  }

  return {
    id: String(rawRecipe.id ?? crypto.randomUUID()),
    source: normalizeRecipeSource(rawRecipe.source),
    name,
    items,
    totals: {
      kcal: safeNumber(rawRecipe.totals?.kcal ?? rawRecipe.kcal),
      prot: safeNumber(rawRecipe.totals?.prot ?? rawRecipe.prot),
      carb: safeNumber(rawRecipe.totals?.carb ?? rawRecipe.carb),
      fat: safeNumber(rawRecipe.totals?.fat ?? rawRecipe.fat),
    },
  };
}

function normalizeMealPlan(rawMealPlan) {
  if (!rawMealPlan || !Array.isArray(rawMealPlan.plan)) {
    return { plan: [] };
  }

  return {
    error: rawMealPlan.error ? String(rawMealPlan.error) : undefined,
    plan: rawMealPlan.plan.map((meal) => ({
      name: String(meal.name ?? meal.title ?? "Refeicao"),
      accuracy: safeNumber(meal.accuracy),
      target: {
        kcal: safeNumber(meal.target?.kcal),
        prot: safeNumber(meal.target?.prot),
        carb: safeNumber(meal.target?.carb),
        fat: safeNumber(meal.target?.fat),
      },
      actual: {
        kcal: safeNumber(meal.actual?.kcal),
        prot: safeNumber(meal.actual?.prot),
        carb: safeNumber(meal.actual?.carb),
        fat: safeNumber(meal.actual?.fat),
      },
      items: (Array.isArray(meal.items) ? meal.items : [])
        .map(normalizeLoggedFood)
        .filter(Boolean),
    })),
  };
}

function normalizeRecipeSuggestionIngredient(rawIngredient = {}) {
  const name = String(rawIngredient.name ?? rawIngredient.food ?? "").trim();
  const text = String(rawIngredient.text ?? rawIngredient.name ?? "").trim();

  if (!name && !text) {
    return null;
  }

  return {
    foodId: String(
      rawIngredient.foodId ?? rawIngredient.externalId ?? crypto.randomUUID(),
    ).trim(),
    externalId: String(rawIngredient.externalId ?? rawIngredient.foodId ?? "").trim(),
    name: name || text,
    text: text || name,
    grams: safeNumber(rawIngredient.grams ?? rawIngredient.weight),
    weight: safeNumber(rawIngredient.weight ?? rawIngredient.grams),
  };
}

function normalizeRecipeSuggestion(rawRecipe = {}) {
  const title = String(rawRecipe.title ?? rawRecipe.name ?? "").trim();

  if (!title) {
    return null;
  }

  return {
    id: String(
      rawRecipe.id ?? rawRecipe.externalId ?? rawRecipe.url ?? crypto.randomUUID(),
    ),
    source: normalizeRecipeSource(rawRecipe.source || "local"),
    externalId: String(rawRecipe.externalId ?? "").trim(),
    title,
    url: String(rawRecipe.url ?? "").trim(),
    image: String(rawRecipe.image ?? "").trim(),
    ingredients: (Array.isArray(rawRecipe.ingredients) ? rawRecipe.ingredients : [])
      .map(normalizeRecipeSuggestionIngredient)
      .filter(Boolean),
    ingredientLines: uniqueStrings(
      Array.isArray(rawRecipe.ingredientLines)
        ? rawRecipe.ingredientLines
        : (rawRecipe.ingredients || []).map((ingredient) =>
            ingredient?.text ?? ingredient?.name,
          ),
    ),
    items: (Array.isArray(rawRecipe.items) ? rawRecipe.items : [])
      .map(normalizeLoggedFood)
      .filter(Boolean),
    kcal: safeNumber(rawRecipe.kcal ?? rawRecipe.totals?.kcal),
    prot: safeNumber(rawRecipe.prot ?? rawRecipe.totals?.prot),
    carb: safeNumber(rawRecipe.carb ?? rawRecipe.totals?.carb),
    fat: safeNumber(rawRecipe.fat ?? rawRecipe.totals?.fat),
    servings: Math.max(1, safeNumber(rawRecipe.servings) || 1),
    healthLabels: uniqueStrings(rawRecipe.healthLabels || []),
    dietLabels: uniqueStrings(rawRecipe.dietLabels || []),
    tags: uniqueStrings(rawRecipe.tags || []),
    matchedFoodIds: uniqueStrings(rawRecipe.matchedFoodIds || []),
    score: safeNumber(rawRecipe.score ?? rawRecipe.pantryScore),
    reasons: uniqueStrings(
      Array.isArray(rawRecipe.reasons)
        ? rawRecipe.reasons
        : [rawRecipe.reason, rawRecipe.pantryReason].filter(Boolean),
    ),
    raw:
      normalizeRecipeSource(rawRecipe.source || "local") === "edamam"
        ? null
        : cloneSerializable(rawRecipe.raw),
  };
}

function normalizeRecipeSuggestions(rawSuggestions) {
  const defaultValue = createEmptyRecipeSuggestions();
  const source =
    rawSuggestions && typeof rawSuggestions === "object" && !Array.isArray(rawSuggestions)
      ? rawSuggestions
      : { items: Array.isArray(rawSuggestions) ? rawSuggestions : [] };

  return {
    ...defaultValue,
    items: (Array.isArray(source.items) ? source.items : [])
      .map(normalizeRecipeSuggestion)
      .filter(Boolean),
    message: String(source.message ?? "").trim(),
    usedExternal: Boolean(source.usedExternal),
    generatedAt: String(source.generatedAt ?? ""),
  };
}

function normalizeSearchPagination(rawPagination) {
  if (!rawPagination || typeof rawPagination !== "object") {
    return null;
  }

  return {
    page: Math.max(1, safeNumber(rawPagination.page) || 1),
    pageSize: Math.max(1, safeNumber(rawPagination.pageSize) || 12),
    totalCount: Math.max(0, safeNumber(rawPagination.totalCount)),
    totalPages: Math.max(1, safeNumber(rawPagination.totalPages) || 1),
    hasNextPage: Boolean(rawPagination.hasNextPage),
    hasPreviousPage: Boolean(rawPagination.hasPreviousPage),
    localCount: Math.max(0, safeNumber(rawPagination.localCount)),
    externalCount: Math.max(0, safeNumber(rawPagination.externalCount)),
    localPinned: Boolean(rawPagination.localPinned),
  };
}

function normalizeLastExternalImport(rawImport) {
  if (!rawImport || typeof rawImport !== "object") {
    return null;
  }

  const normalizeImportedFood = (rawFood) => {
    const normalizedFood = normalizeFood(rawFood);

    if (!normalizedFood) {
      return null;
    }

    return {
      ...normalizedFood,
      alreadySaved: Boolean(rawFood?.alreadySaved),
      matchedSources: uniqueStrings(
        Array.isArray(rawFood?.matchedSources)
          ? rawFood.matchedSources
          : [normalizedFood.source],
      ),
    };
  };

  return {
    type: String(rawImport.type ?? "").trim(),
    source: normalizeFoodSource(rawImport.source),
    query: String(rawImport.query ?? "").trim(),
    barcode: String(rawImport.barcode ?? "").trim(),
    message: String(rawImport.message ?? rawImport.error ?? "").trim(),
    importedAt: String(rawImport.importedAt ?? new Date().toISOString()),
    recentAction: String(rawImport.recentAction ?? "").trim(),
    recentFoodKey: String(rawImport.recentFoodKey ?? "").trim(),
    recentGrams: safeNumber(rawImport.recentGrams),
    pagination: normalizeSearchPagination(rawImport.pagination),
    item: normalizeImportedFood(rawImport.item),
    items: (Array.isArray(rawImport.items) ? rawImport.items : [])
      .map(normalizeImportedFood)
      .filter(Boolean),
  };
}

function normalizePantry(rawPantry, normalizedFoods = []) {
  const basePantry = createEmptyPantry();
  const knownFoodIds = new Set(normalizedFoods.map((food) => food.id));
  const foodIds = uniqueStrings(
    rawPantry?.foodIds ||
      rawPantry?.selectedFoodIds ||
      rawPantry ||
      [],
  ).filter((foodId) => knownFoodIds.has(foodId));

  return {
    ...basePantry,
    foodIds,
  };
}

function normalizeDay(rawDay = {}) {
  const baseDay = createEmptyDay();
  const foods = (Array.isArray(rawDay.foods) ? rawDay.foods : [])
    .map(normalizeLoggedFood)
    .filter(Boolean);
  const totalsFromFoods = sumEntryMacros(foods);
  const hasFoodLog = foods.length > 0;

  return {
    ...baseDay,
    kcal: hasFoodLog ? totalsFromFoods.kcal : safeNumber(rawDay.kcal),
    prot: hasFoodLog ? totalsFromFoods.prot : safeNumber(rawDay.prot),
    carb: hasFoodLog ? totalsFromFoods.carb : safeNumber(rawDay.carb),
    fat: hasFoodLog ? totalsFromFoods.fat : safeNumber(rawDay.fat),
    fiber: safeNumber(rawDay.fiber ?? rawDay.fibra),
    peso: safeNumber(rawDay.peso ?? rawDay.weight),
    agua: safeNumber(rawDay.agua ?? rawDay.water),
    notes: String(rawDay.notes ?? ""),
    dayType: String(rawDay.dayType ?? baseDay.dayType),
    foods,
  };
}

function sanitizeState(rawState = {}) {
  const initialState = createInitialState();
  const normalizedFoods = (Array.isArray(rawState.foods) ? rawState.foods : [])
    .map(normalizeFood)
    .filter(Boolean);
  const rawDays =
    rawState.days && typeof rawState.days === "object" ? rawState.days : {};
  const normalizedDays = Object.entries(rawDays).reduce((acc, [dateKey, day]) => {
    acc[dateKey] = normalizeDay(day);
    return acc;
  }, {});
  const normalizedUserProfile = normalizeUserProfile(rawState.userProfile);
  const selectedDate = normalizeDate(rawState.selectedDate, initialState.selectedDate);
  const currentMonth = normalizeDate(
    rawState.currentMonth || rawState.selectedDate,
    initialState.currentMonth,
  );
  const normalizedTargets = normalizeTargets(
    rawState.targets ?? rawState.baseTargets,
    normalizedUserProfile,
  );
  const hasValidProfile = Boolean(normalizedUserProfile && normalizedTargets);
  const sanitizedProfile = hasValidProfile ? normalizedUserProfile : null;
  const sanitizedTargets = hasValidProfile ? normalizedTargets : null;
  const selectedDay = normalizedDays[formatDate(selectedDate)] || createEmptyDay();

  return {
    ...initialState,
    selectedDate,
    currentMonth,
    userProfile: sanitizedProfile,
    targets: sanitizedTargets,
    adaptiveTDEE: hasValidProfile
      ? normalizeAdaptiveTDEE(
          rawState.adaptiveTDEE,
          normalizedDays,
          sanitizedProfile,
        )
      : null,
    safetyWarnings: hasValidProfile
      ? calculateSafetyWarnings(
          sanitizedProfile,
          sanitizedTargets,
          { day: selectedDay, days: normalizedDays },
        )
      : [],
    days: normalizedDays,
    foods: normalizedFoods,
    recipes: (Array.isArray(rawState.recipes) ? rawState.recipes : [])
      .map(normalizeRecipe)
      .filter(Boolean),
    builder: (Array.isArray(rawState.builder) ? rawState.builder : [])
      .map(normalizeRecipeItem)
      .filter(Boolean),
    mealPlan: normalizeMealPlan(rawState.mealPlan),
    pantry: normalizePantry(
      rawState.pantry ?? rawState.pantrySelection ?? rawState.pantryItems,
      normalizedFoods,
    ),
    apiConfig: normalizeApiConfig(rawState.apiConfig),
    recipeSuggestions: normalizeRecipeSuggestions(
      rawState.recipeSuggestions ?? rawState.pantrySuggestions,
    ),
    lastExternalImport: normalizeLastExternalImport(rawState.lastExternalImport),
  };
}

function migrateLegacyState(rawLegacyState) {
  const fallbackFoods = parseJson(readLocalStorageValue("foodsV6"), []);
  const fallbackRecipes = parseJson(readLocalStorageValue("recipesV6"), []);
  const legacyDays =
    rawLegacyState?.days && typeof rawLegacyState.days === "object"
      ? rawLegacyState.days
      : rawLegacyState;

  return sanitizeState({
    selectedDate: new Date(),
    currentMonth: new Date(),
    userProfile: rawLegacyState?.userProfile || rawLegacyState?.profile || null,
    targets: rawLegacyState?.targets || rawLegacyState?.baseTargets || null,
    days: legacyDays,
    foods: rawLegacyState?.foods || fallbackFoods,
    recipes: rawLegacyState?.recipes || fallbackRecipes,
    builder: rawLegacyState?.builder || [],
    mealPlan: { plan: [] },
    pantry: rawLegacyState?.pantry || rawLegacyState?.pantrySelection || [],
    apiConfig: rawLegacyState?.apiConfig || {},
    recipeSuggestions:
      rawLegacyState?.recipeSuggestions || rawLegacyState?.pantrySuggestions || [],
    lastExternalImport: rawLegacyState?.lastExternalImport || null,
  });
}

function serializeState(sourceState) {
  const cleanState = sanitizeState(sourceState);

  return {
    ...cleanState,
    selectedDate: cleanState.selectedDate.toISOString(),
    currentMonth: cleanState.currentMonth.toISOString(),
  };
}

export async function loadFromStorage() {
  if (isIndexedDbAvailable()) {
    try {
      const rawIndexedState = await readIndexedDbValue(STORAGE_KEY);

      if (rawIndexedState) {
        storageRuntime.driver = "indexeddb";
        const parsedIndexedState = parseJson(rawIndexedState);
        return parsedIndexedState ? sanitizeState(parsedIndexedState) : null;
      }

      storageRuntime.driver = "indexeddb";
    } catch {
      storageRuntime.driver = "localstorage";
    }
  } else {
    storageRuntime.driver = "localstorage";
  }

  const rawV6 = readLocalStorageValue(STORAGE_KEY);

  if (rawV6) {
    const parsedV6 = parseJson(rawV6);

    if (!parsedV6) {
      return null;
    }

    const migratedV6State = sanitizeState(parsedV6);

    if (storageRuntime.driver === "indexeddb") {
      await persistSerializedState(JSON.stringify(serializeState(migratedV6State)));
    }

    return migratedV6State;
  }

  const rawLegacy = readLocalStorageValue(LEGACY_STORAGE_KEY);
  if (!rawLegacy) {
    return null;
  }

  const parsedLegacy = parseJson(rawLegacy);
  if (!parsedLegacy) {
    return null;
  }

  const migratedState = migrateLegacyState(parsedLegacy);

  if (storageRuntime.driver === "indexeddb") {
    await persistSerializedState(JSON.stringify(serializeState(migratedState)));
  } else {
    saveToStorage(migratedState);
  }

  return migratedState;
}

export function saveToStorage(sourceState) {
  try {
    queueStorageWrite(JSON.stringify(serializeState(sourceState)));
    return true;
  } catch (error) {
    console.warn("Storage save skipped because state serialization failed.", error);
    return false;
  }
}

export function createBackupPayload(sourceState) {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    state: serializeState(sourceState),
  };
}

export function importBackupPayload(rawPayload) {
  const parsedPayload =
    typeof rawPayload === "string" ? parseJson(rawPayload) : rawPayload;

  if (!parsedPayload) {
    throw new Error("Backup invalido.");
  }

  const nextState = sanitizeState(parsedPayload.state || parsedPayload);
  saveToStorage(nextState);

  return nextState;
}
