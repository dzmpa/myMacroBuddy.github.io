import { state, setState } from "../state.js";
import { calculateBaseMacros, calculateAdaptiveTDEE, getEffectiveTargets, calculateSafetyWarnings, isProfileValid } from "../algorithm.js?v=navy2";
import { lbsToKg, kgToLbs, ftInToCm, cmToFtIn } from "../core/units.js";
import { safeNumber, getElementValue } from "../utils.js";
import { getSelectedDay, persistAndUpdate, updateUI } from "../main.js"; // Need to pass these or import them

export let isProfileModalForcedOpen = false;
export let profileUnitMode = "metric"; // "metric" | "imperial"

export function setProfileModalForcedOpen(isOpen) {
  isProfileModalForcedOpen = isOpen;
}

export function shouldShowOnboarding() {
  return isProfileModalForcedOpen;
}

export function requireProfile() {
  return !isProfileValid(state.userProfile) || !state.targets;
}

export function revalidateProfileState() {
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

export function applyProfileUnitMode(mode) {
  profileUnitMode = mode === "imperial" ? "imperial" : "metric";
  const isImperial = profileUnitMode === "imperial";

  const metricBtn = document.getElementById("profileUnitMetric");
  const imperialBtn = document.getElementById("profileUnitImperial");
  if (metricBtn) {
    metricBtn.classList.toggle("bg-emerald-500", !isImperial);
    metricBtn.classList.toggle("text-slate-950", !isImperial);
    metricBtn.classList.toggle("bg-slate-800", isImperial);
    metricBtn.classList.toggle("text-slate-300", isImperial);
    metricBtn.setAttribute("aria-pressed", String(!isImperial));
  }
  if (imperialBtn) {
    imperialBtn.classList.toggle("bg-emerald-500", isImperial);
    imperialBtn.classList.toggle("text-slate-950", isImperial);
    imperialBtn.classList.toggle("bg-slate-800", !isImperial);
    imperialBtn.classList.toggle("text-slate-300", !isImperial);
    imperialBtn.setAttribute("aria-pressed", String(isImperial));
  }

  const weightLabel = document.getElementById("profileWeightLabel");
  const weightInput = document.getElementById("profileWeight");
  if (weightLabel) weightLabel.textContent = isImperial ? "Weight (lbs)" : "Weight (kg)";
  if (weightInput) {
    const currentVal = safeNumber(weightInput.value);
    // currentVal is still in the OLD unit when this runs
    if (isImperial && currentVal > 0) weightInput.value = Number(kgToLbs(currentVal).toFixed(1));
    if (!isImperial && currentVal > 0) weightInput.value = Number(lbsToKg(currentVal).toFixed(1));
    weightInput.placeholder = isImperial ? "160" : "Weight";
  }

  const cmWrap = document.getElementById("profileHeightCmWrap");
  const imperialWrap = document.getElementById("profileHeightImperialWrap");
  const cmInput = document.getElementById("profileHeight");
  const ftInput = document.getElementById("profileHeightFt");
  const inInput = document.getElementById("profileHeightIn");
  if (cmWrap) cmWrap.classList.toggle("hidden", isImperial);
  if (imperialWrap) imperialWrap.classList.toggle("hidden", !isImperial);
  if (isImperial && cmInput && cmInput.value) {
    const { ft, inches } = cmToFtIn(safeNumber(cmInput.value));
    if (ftInput) ftInput.value = ft;
    if (inInput) inInput.value = inches;
  } else if (!isImperial && ftInput && inInput && ftInput.value) {
    if (cmInput) cmInput.value = Number(ftInToCm(safeNumber(ftInput.value), safeNumber(inInput.value)).toFixed(0));
  }
}

export function readProfileForm() {
  const isImperial = profileUnitMode === "imperial";

  const rawWeight = safeNumber(getElementValue("profileWeight"));
  const weightKg = isImperial ? lbsToKg(rawWeight) : rawWeight;

  let heightCm;
  if (isImperial) {
    heightCm = ftInToCm(
      safeNumber(getElementValue("profileHeightFt")),
      safeNumber(getElementValue("profileHeightIn")),
    );
  } else {
    heightCm = safeNumber(getElementValue("profileHeight"));
  }

  return {
    name: String(getElementValue("profileName")).trim(),
    age: safeNumber(getElementValue("profileAge")),
    weight: weightKg,
    height: heightCm,
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

export function handleSaveProfile(appUpdateFn, getSelectedDayFn) {
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
    { day: getSelectedDayFn(), days: state.days },
  );

  isProfileModalForcedOpen = false;
  setState({
    userProfile: nextProfile,
    targets: nextTargets,
    adaptiveTDEE: nextAdaptiveTDEE,
    safetyWarnings: nextSafetyWarnings,
  });

  appUpdateFn(["profile", "day"]);
}

export function bindProfileForm(appUpdateFn, getSelectedDayFn) {
  const profileForm = document.getElementById("profileForm");

  if (!profileForm || profileForm.dataset.bound === "true") {
    return;
  }

  profileForm.dataset.bound = "true";
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSaveProfile(appUpdateFn, getSelectedDayFn);
  });

  // Unit toggle buttons in profile modal
  const metricBtn = document.getElementById("profileUnitMetric");
  const imperialBtn = document.getElementById("profileUnitImperial");
  if (metricBtn && metricBtn.dataset.bound !== "true") {
    metricBtn.dataset.bound = "true";
    metricBtn.addEventListener("click", () => applyProfileUnitMode("metric"));
  }
  if (imperialBtn && imperialBtn.dataset.bound !== "true") {
    imperialBtn.dataset.bound = "true";
    imperialBtn.addEventListener("click", () => applyProfileUnitMode("imperial"));
  }
}

export function bindProfileActions(updateUIFn) {
  const editProfileButton = document.getElementById("editProfileBtn");

  if (!editProfileButton || editProfileButton.dataset.bound === "true") {
    return;
  }

  editProfileButton.dataset.bound = "true";
  editProfileButton.addEventListener("click", () => {
    isProfileModalForcedOpen = true;
    updateUIFn(["all"]);
  });
}
