
export function readApiConfigForm() {
  return {
    usdaApiKey: String(getElementValue("usdaApiKey")).trim(),
    edamamAppId: String(getElementValue("edamamAppId")).trim(),
    edamamAppKey: String(getElementValue("edamamAppKey")).trim(),
  };
}

export function bindApiConfig() {
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
    saveToStorage(state, activeStorageKey);
    updateUI(["all"]);
  });
}
