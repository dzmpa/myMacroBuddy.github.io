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

const defaultGamificationTemplate = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  lastLoggedDate: null,
  badges: [],
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

export function createEmptyGamification() {
  return {
    ...defaultGamificationTemplate,
    badges: [...defaultGamificationTemplate.badges],
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
    gamification: createEmptyGamification(),
  };
}

export let state = createInitialState();

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);
}

function deepMerge(target, patch) {
  if (!isPlainObject(patch)) {
    if (Array.isArray(patch)) return patch.slice();
    return patch;
  }

  const base = isPlainObject(target) ? { ...target } : {};

  for (const key of Object.keys(patch)) {
    const p = patch[key];
    const t = target ? target[key] : undefined;

    if (isPlainObject(p)) {
      base[key] = deepMerge(isPlainObject(t) ? t : {}, p);
    } else if (Array.isArray(p)) {
      base[key] = p.slice();
    } else {
      base[key] = p;
    }
  }

  return base;
}

export function getState() {
  return state;
}

export function setState(patch) {
  // produce a brand-new state tree by deep-merging the current state
  const next = deepMerge(state, patch);
  state = next; // reassign exported binding so importers see updated object
  return state;
}
