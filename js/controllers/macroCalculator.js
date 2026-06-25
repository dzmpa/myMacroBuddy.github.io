import { state } from "../state.js";
import { calculateBaseMacros, calculateNavyBodyFat, getBodyFatRecommendation } from "../algorithm.js?v=navy2";
import { lbsToKg, kgToLbs, ftInToCm, cmToFtIn, inToCm, cmToIn } from "../core/units.js";
import { safeNumber, getElementValue, syncInputValueIfBlank } from "../utils.js";

export let calcUnitMode = "metric"; // "metric" | "imperial"

export function applyCalcUnitMode(mode) {
  calcUnitMode = mode === "imperial" ? "imperial" : "metric";
  const isImperial = calcUnitMode === "imperial";

  const metricBtn = document.getElementById("calcUnitMetric");
  const imperialBtn = document.getElementById("calcUnitImperial");
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

  // Weight label + placeholder
  const weightLabel = document.getElementById("calcWeightLabel");
  const weightInput = document.getElementById("calcWeight");
  if (weightLabel) weightLabel.textContent = isImperial ? "Weight (lbs)" : "Weight (kg)";
  if (weightInput) {
    const currentVal = safeNumber(weightInput.value);
    // currentVal is still in the OLD unit when this runs
    if (isImperial && currentVal > 0) weightInput.value = Number(kgToLbs(currentVal).toFixed(1));
    if (!isImperial && currentVal > 0) weightInput.value = Number(lbsToKg(currentVal).toFixed(1));
    weightInput.placeholder = isImperial ? "160" : "72";
    weightInput.step = "0.1";
  }

  // Height: swap cm field vs ft+in fields
  const cmWrap = document.getElementById("calcHeightCmWrap");
  const imperialWrap = document.getElementById("calcHeightImperialWrap");
  const cmInput = document.getElementById("calcHeight");
  const ftInput = document.getElementById("calcHeightFt");
  const inInput = document.getElementById("calcHeightIn");
  if (cmWrap) cmWrap.classList.toggle("hidden", isImperial);
  if (imperialWrap) imperialWrap.classList.toggle("hidden", !isImperial);
  if (isImperial && cmInput && cmInput.value) {
    const { ft, inches } = cmToFtIn(safeNumber(cmInput.value));
    if (ftInput) ftInput.value = ft;
    if (inInput) inInput.value = inches;
  } else if (!isImperial && ftInput && inInput && ftInput.value) {
    if (cmInput) cmInput.value = Number(ftInToCm(safeNumber(ftInput.value), safeNumber(inInput.value)).toFixed(0));
  }

  // Circumference labels + placeholders
  const neckLabel = document.getElementById("calcNeckLabel");
  const waistLabel = document.getElementById("calcWaistLabel");
  const hipLabel = document.getElementById("calcHipLabel");
  const neckInput = document.getElementById("calcNeck");
  const waistInput = document.getElementById("calcWaist");
  const hipInput = document.getElementById("calcHip");
  const navyHint = document.getElementById("calcNavyHint");
  const unit = isImperial ? "in" : "cm";
  if (neckLabel) neckLabel.textContent = `Neck (${unit})`;
  if (waistLabel) waistLabel.textContent = `Waist (${unit})`;
  if (hipLabel) hipLabel.textContent = `Hip (${unit}, female only)`;
  if (navyHint) navyHint.textContent = `Add circumference measurements in ${unit} for a body-fat estimate and a recommendation.`;
  // Convert circumference values
  if (neckInput && neckInput.value) {
    const val = safeNumber(neckInput.value);
    neckInput.value = isImperial ? cmToIn(val) : Number(inToCm(val).toFixed(1));
    neckInput.placeholder = isImperial ? "15" : "38";
  }
  if (waistInput && waistInput.value) {
    const val = safeNumber(waistInput.value);
    waistInput.value = isImperial ? cmToIn(val) : Number(inToCm(val).toFixed(1));
    waistInput.placeholder = isImperial ? "33" : "84";
  }
  if (hipInput && hipInput.value) {
    const val = safeNumber(hipInput.value);
    hipInput.value = isImperial ? cmToIn(val) : Number(inToCm(val).toFixed(1));
    hipInput.placeholder = isImperial ? "38" : "98";
  }
}

export function seedMacroCalculatorFromProfile(profile = state.userProfile) {
  if (!profile) {
    return;
  }

  const isImperial = calcUnitMode === "imperial";

  syncInputValueIfBlank("calcAge", profile.age || "");
  syncInputValueIfBlank("calcGender", profile.gender || "");
  syncInputValueIfBlank("calcActivityLevel", profile.activityLevel || "");
  syncInputValueIfBlank("calcGoal", profile.goal || "maintenance");
  syncInputValueIfBlank("calcMealsPerDay", profile.mealsPerDay || 4);

  if (isImperial) {
    const weightLbs = profile.weight ? Number(kgToLbs(profile.weight).toFixed(1)) : "";
    syncInputValueIfBlank("calcWeight", weightLbs || "");
    if (profile.height) {
      const { ft, inches } = cmToFtIn(profile.height);
      syncInputValueIfBlank("calcHeightFt", ft || "");
      syncInputValueIfBlank("calcHeightIn", inches || "");
    }
  } else {
    syncInputValueIfBlank("calcWeight", profile.weight || "");
    syncInputValueIfBlank("calcHeight", profile.height || "");
  }
}

export function readMacroCalculatorForm() {
  const isImperial = calcUnitMode === "imperial";

  // Weight: convert lbs → kg if imperial
  const rawWeight = safeNumber(getElementValue("calcWeight"));
  const weightKg = isImperial ? lbsToKg(rawWeight) : rawWeight;

  // Height: convert ft+in → cm if imperial
  let heightCm;
  if (isImperial) {
    heightCm = ftInToCm(
      safeNumber(getElementValue("calcHeightFt")),
      safeNumber(getElementValue("calcHeightIn")),
    );
  } else {
    heightCm = safeNumber(getElementValue("calcHeight"));
  }

  // Circumferences: convert inches → cm if imperial
  const rawNeck = safeNumber(getElementValue("calcNeck"));
  const rawWaist = safeNumber(getElementValue("calcWaist"));
  const rawHip = safeNumber(getElementValue("calcHip"));
  const neckCm = isImperial && rawNeck > 0 ? inToCm(rawNeck) : rawNeck;
  const waistCm = isImperial && rawWaist > 0 ? inToCm(rawWaist) : rawWaist;
  const hipCm = isImperial && rawHip > 0 ? inToCm(rawHip) : rawHip;

  return {
    name: state.userProfile?.name || "Macro calculator",
    age: safeNumber(getElementValue("calcAge")),
    weight: weightKg,
    height: heightCm,
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
    neck: neckCm,
    waist: waistCm,
    hip: hipCm,
  };
}

export function setMacroCalculatorMetric(id, value, suffix = "") {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.textContent =
    value === null || value === undefined || value === ""
      ? "--"
      : `${value}${suffix}`;
}

export function resetMacroCalculatorOutput(message) {
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

export function renderMacroCalculator() {
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

export function bindMacroCalculator() {
  const calcForm = document.getElementById("macroCalculatorForm");
  if (calcForm) {
    calcForm.addEventListener("input", renderMacroCalculator);
    calcForm.addEventListener("submit", (e) => {
      e.preventDefault();
      renderMacroCalculator();
    });
  }

  document.getElementById("calculateMacrosBtn")?.addEventListener("click", renderMacroCalculator);

  document.getElementById("calcUnitMetric")?.addEventListener("click", () => {
    applyCalcUnitMode("metric");
    renderMacroCalculator();
  });
  document.getElementById("calcUnitImperial")?.addEventListener("click", () => {
    applyCalcUnitMode("imperial");
    renderMacroCalculator();
  });
}
