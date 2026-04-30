const defaultUserProfileTemplate = {
  name: "",
  age: 0,
  weight: 0,
  height: 0,
  gender: "",
  goal: "maintenance",
  activityLevel: "",
  mealsPerDay: 4,
  completedAt: "",
};

const defaultApiConfig = {
  usdaApiKey: "",
  edamamAppId: "",
  edamamAppKey: "",
};

export function createEmptyDay() {
  return {
    kcal: 0,
    prot: 0,
    carb: 0,
    fat: 0,
    fiber: 0,
    peso: 0,
    agua: 0,
    notes: "",
    dayType: "normal",
    foods: [],
  };
}

export function createEmptyPantry() {
  return {
    foodIds: [],
  };
}

export function createEmptyRecipeSuggestions() {
  return {
    items: [],
    message: "",
    usedExternal: false,
    generatedAt: "",
  };
}

export function getDefaultUserProfileTemplate() {
  return { ...defaultUserProfileTemplate };
}

export function getDefaultApiConfig() {
  return { ...defaultApiConfig };
}

export function createInitialState() {
  return {
    selectedDate: new Date(),
    currentMonth: new Date(),
    userProfile: null,
    targets: null,
    adaptiveTDEE: null,
    safetyWarnings: [],
    days: {},
    foods: [],
    recipes: [],
    builder: [],
    mealPlan: { plan: [] },
    pantry: createEmptyPantry(),
    apiConfig: getDefaultApiConfig(),
    recipeSuggestions: createEmptyRecipeSuggestions(),
    lastExternalImport: null,
  };
}

export const state = createInitialState();

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  return state;
}
