import { state } from "../state.js";
import { addFood, updateFood } from "../food.js";
import { getElementValue, safeNumber } from "../utils.js";
import { setLastExternalImport, getExternalSearchResults, resetPantryAfterFoodChange, persistAndUpdate } from "../main.js";

function parseJsonValue(rawValue, fallback = null) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

export function getSelectedFoodTags() {
  return Array.from(document.querySelectorAll(".foodTag:checked")).map(
    (checkbox) => checkbox.value,
  );
}

export function setFoodTagSelection(tags = []) {
  document.querySelectorAll(".foodTag").forEach((checkbox) => {
    checkbox.checked = tags.includes(checkbox.value);
  });
}

export function getEditingFoodId() {
  return String(getElementValue("foodEditingId")).trim();
}

export function setFoodFormState({
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

export function renderFoodImportStatus() {
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

export function clearFoodForm() {
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

export function readFoodForm() {
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

export function bindFoodForm() {
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
