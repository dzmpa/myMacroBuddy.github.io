import { state } from "./state.js";
import { formatDate, safeNumber } from "./utils.js";

function syncInputValue(id, value) {
  const input = document.getElementById(id);
  if (!input || document.activeElement === input) {
    return;
  }

  input.value = value ?? "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMacroLine({ kcal = 0, prot = 0, carb = 0, fat = 0, fiber = 0 }) {
  return `${Math.round(kcal)} kcal | P ${safeNumber(prot).toFixed(1)}g | C ${safeNumber(carb).toFixed(1)}g | F ${safeNumber(fat).toFixed(1)}g | Fiber ${safeNumber(fiber).toFixed(1)}g`;
}

function renderSourceBadge(source) {
  const normalizedSource = String(source || "manual");

  if (normalizedSource === "off") {
    return "Open Food Facts";
  }

  if (normalizedSource === "edamam") {
    return "Edamam";
  }

  if (normalizedSource === "usda") {
    return "USDA";
  }

  if (normalizedSource === "local") {
    return "Local database";
  }

  return "Manual";
}

function getSelectedDayForUi() {
  return state.days[formatDate(state.selectedDate)] || { foods: [], kcal: 0 };
}

function getSearchResultKey(food = {}) {
  if (food.barcode) {
    return String(food.barcode).trim();
  }

  if (food.externalId) {
    return `${String(food.source || "manual").trim()}:${String(food.externalId).trim()}`;
  }

  return String(food.name || "").trim().toLowerCase();
}

function renderSearchMeta(searchState = state.lastExternalImport) {
  const container = document.getElementById("searchResultsMeta");
  if (!container) {
    return;
  }

  const selectedDay = getSelectedDayForUi();
  const foodsToday = Array.isArray(selectedDay.foods) ? selectedDay.foods.length : 0;
  const todayKcal = Math.round(safeNumber(selectedDay.kcal));
  const items = Array.isArray(searchState?.items) ? searchState.items : [];
  const isGlobalSearch = searchState?.type === "global-food-search";
  const pagination = searchState?.pagination || null;
  const currentPage = Math.max(1, safeNumber(pagination?.page) || 1);
  const totalPages = Math.max(1, safeNumber(pagination?.totalPages) || 1);
  const localCount = Math.max(0, safeNumber(pagination?.localCount));
  const externalCount = Math.max(0, safeNumber(pagination?.externalCount));

  if (!isGlobalSearch || !items.length) {
    container.innerHTML = `
      <article class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Local database</p>
        <p class="mt-2 text-2xl font-semibold text-white">${state.foods.length}</p>
        <p class="mt-1 text-xs text-slate-400">saved food(s) ready for fast local matches.</p>
      </article>
      <article class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Today</p>
        <p class="mt-2 text-2xl font-semibold text-white">${foodsToday}</p>
        <p class="mt-1 text-xs text-slate-400">${todayKcal} kcal logged for the selected day.</p>
      </article>
      <article class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Search order</p>
        <p class="mt-2 text-sm font-medium text-white">Local database, then Open Food Facts</p>
        <p class="mt-1 text-xs text-slate-400">External food search is now simpler and fully name-first.</p>
      </article>
      <article class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Quick action</p>
        <p class="mt-2 text-sm font-medium text-white">Set grams, add to today, or save</p>
        <p class="mt-1 text-xs text-slate-400">You can also paste an Open Food Facts product link to load the exact item.</p>
      </article>
    `;
    return;
  }

  const savableCount = items.filter((food) => !food.alreadySaved).length;
  const savedCount = items.length - savableCount;
  const recentMessage = String(searchState?.message || "").trim();

  container.innerHTML = `
    <article class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Results</p>
      <p class="mt-2 text-2xl font-semibold text-white">${items.length}</p>
      <p class="mt-1 text-xs text-slate-400">${
        currentPage === 1 && localCount > 0
          ? `${localCount} local match(es) plus ${externalCount} Open Food Facts result(s) on this page.`
          : `${externalCount} Open Food Facts result(s) on this page.`
      }</p>
    </article>
    <article class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Saveable</p>
      <p class="mt-2 text-2xl font-semibold text-white">${savableCount}</p>
      <p class="mt-1 text-xs text-slate-400">result(s) not yet saved in your local database.</p>
    </article>
    <article class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">Page</p>
      <p class="mt-2 text-2xl font-semibold text-white">${currentPage} / ${totalPages}</p>
      <p class="mt-1 text-xs text-slate-400">${savedCount} result(s) already available in your local database.</p>
    </article>
    <article class="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
      <p class="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">Today</p>
      <p class="mt-2 text-2xl font-semibold text-white">${foodsToday}</p>
      <p class="mt-1 text-xs text-emerald-100/80">${todayKcal} kcal logged for the selected day.</p>
      ${
        recentMessage
          ? `<p class="mt-3 text-xs text-emerald-100">${escapeHtml(recentMessage)}</p>`
          : ""
      }
    </article>
  `;
}

export function renderApiConfig(config = state.apiConfig || {}) {
  syncInputValue("usdaApiKey", config.usdaApiKey || "");
  syncInputValue("edamamAppId", config.edamamAppId || "");
  syncInputValue("edamamAppKey", config.edamamAppKey || "");

  const status = document.getElementById("apiConfigStatus");
  const warning = document.getElementById("edamamConfigWarning");
  const isConfigured = Boolean(config.edamamAppId && config.edamamAppKey);

  if (status) {
    status.textContent = "Open Food Facts search is built in. No API key is required.";
  }

  if (warning) {
    warning.textContent = isConfigured
      ? "Edamam is configured for optional extras outside the main search flow."
      : "Edamam is optional and is not used in the main search flow.";
  }
}

export function renderProfileSummary(profile = state.userProfile) {
  const summary = document.getElementById("profileSummary");
  if (!summary) {
    return;
  }

  syncInputValue("profileName", profile?.name || "");
  syncInputValue("profileAge", profile?.age || "");
  syncInputValue("profileWeight", profile?.weight || "");
  syncInputValue("profileHeight", profile?.height || "");
  syncInputValue("profileGender", profile?.gender || "");
  syncInputValue("profileGoal", profile?.goal || "maintenance");
  syncInputValue("profileActivityLevel", profile?.activityLevel || "");
  syncInputValue("profileMealsPerDay", profile?.mealsPerDay || 4);

  if (!profile || !state.targets) {
    summary.innerHTML = `
      <div class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        Your profile is not set yet. Search and quick logging still work, but targets and planning stay locked until you save a profile.
      </div>
    `;
    return;
  }

  summary.innerHTML = `
    <div class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Perfil ativo</p>
      <p class="mt-2 text-sm text-slate-300">
        <strong class="text-white">${escapeHtml(profile.name)}</strong> |
        ${escapeHtml(String(profile.age))} anos |
        ${escapeHtml(String(profile.weight))} kg |
        ${escapeHtml(String(profile.height))} cm
      </p>
      <p class="mt-2 text-sm text-slate-300">
        Objetivo <strong class="text-white">${escapeHtml(profile.goal)}</strong> |
        Atividade <strong class="text-white">${escapeHtml(profile.activityLevel)}</strong> |
        ${escapeHtml(String(profile.mealsPerDay))} refeicoes/dia
      </p>
      <p class="mt-3 text-sm text-emerald-200">
        Targets reais: ${Math.round(state.targets.kcal)} kcal | P ${state.targets.prot.toFixed(1)}g | H ${state.targets.carb.toFixed(1)}g | G ${state.targets.fat.toFixed(1)}g
      </p>
      <p class="mt-2 text-xs text-slate-400">
        Fibra ${state.targets.fiber.toFixed(1)}g | Agua ${state.targets.water.toFixed(1)}L | BMR ${state.targets.bmr.toFixed(0)} | TDEE ${state.targets.tdee.toFixed(0)}
      </p>
      <p class="mt-2 text-xs text-slate-500">
        ${
          state.adaptiveTDEE
            ? `TDEE estimado real: ${Math.round(state.adaptiveTDEE.kcal)} kcal`
            : "TDEE estimado real indisponivel por falta de historico."
        }
      </p>
    </div>
  `;
}

export function renderFoodList({ onEdit, onDelete }) {
  const list = document.getElementById("foodList");
  const recipeSelect = document.getElementById("recipeFoodSelect");
  const quickSelect = document.getElementById("quickFoodSelect");

  if (!list) return;

  // Clear once
  list.innerHTML = "";

  if (recipeSelect) recipeSelect.innerHTML = `<option value="">Seleciona alimento...</option>`;
  if (quickSelect) quickSelect.innerHTML = `<option value="">Seleciona alimento...</option>`;

  if (!state.foods.length) {
    list.innerHTML =
      '<div class="card border-dashed text-sm text-slate-400">Sem alimentos guardados.</div>';
    return;
  }

  const listFragment = document.createDocumentFragment();
  const recipeSelectFragment = document.createDocumentFragment();
  const quickSelectFragment = document.createDocumentFragment();

  state.foods.forEach((food) => {
    if (recipeSelect) recipeSelectFragment.appendChild(new Option(food.name, food.id));
    if (quickSelect) quickSelectFragment.appendChild(new Option(food.name, food.id));

    const item = document.createElement("article");
    item.className = "card rounded-3xl p-6";

    item.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <h3 class="text-lg font-semibold text-white">${escapeHtml(food.name)}</h3>
          <p class="text-sm text-slate-300">${renderMacroLine(food)}</p>
          <p class="text-[11px] text-slate-500">
            Fonte: ${escapeHtml(renderSourceBadge(food.source))}
            ${food.barcode ? ` | Barcode: ${escapeHtml(food.barcode)}` : ""}
            ${food.externalId ? ` | External ID: ${escapeHtml(food.externalId)}` : ""}
          </p>
          <p class="text-[11px] text-slate-500">${escapeHtml((food.tags || []).join(" | "))}</p>
        </div>
        <div class="flex gap-2">
          <button type="button" data-edit="${food.id}" class="btn transition px-3 py-1 text-xs">Editar</button>
          <button type="button" data-delete="${food.id}" class="btn transition px-3 py-1 text-xs">Apagar</button>
        </div>
      </div>
    `;

    item.querySelector("[data-edit]").addEventListener("click", () => onEdit(food.id));
    item.querySelector("[data-delete]").addEventListener("click", () => onDelete(food.id));

    listFragment.appendChild(item);
  });

  list.appendChild(listFragment);
  if (recipeSelect) recipeSelect.appendChild(recipeSelectFragment);
  if (quickSelect) quickSelect.appendChild(quickSelectFragment);
}

export function renderExternalFoodResults(
  lastExternalImport = state.lastExternalImport,
  { onSaveFood } = {},
) {
  const container = document.getElementById("edamamFoodResults");
  const status = document.getElementById("edamamFoodStatus");

  if (!container || !status) {
    return;
  }

  container.innerHTML = "";

  const isSearchResult =
    lastExternalImport?.source === "edamam" &&
    Array.isArray(lastExternalImport.items) &&
    lastExternalImport.items.length > 0;

  status.textContent =
    lastExternalImport?.message ||
    (state.apiConfig?.edamamAppId && state.apiConfig?.edamamAppKey
      ? "Search generic foods by name."
      : "Add Edamam if you want an extra search source.");

  if (!isSearchResult) {
    container.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
        No external results to show yet.
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  lastExternalImport.items.forEach((food, index) => {
    const card = document.createElement("article");
    card.className = "card rounded-3xl p-6";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <h3 class="text-lg font-semibold text-white">${escapeHtml(food.name)}</h3>
          <p class="text-sm text-slate-300">${renderMacroLine(food)}</p>
          <p class="text-[11px] text-slate-500">
            Source: ${escapeHtml(renderSourceBadge(food.source))}
            ${food.externalId ? ` | ${escapeHtml(food.externalId)}` : ""}
          </p>
        </div>
        <button
          type="button"
          data-save-external="${index}"
          class="btn bg-emerald-500 text-slate-950 font-semibold"
        >
          Save food
        </button>
      </div>
    `;

    card.querySelector("[data-save-external]").addEventListener("click", () => onSaveFood?.(food));
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

export function renderSearchResults(
  searchState = state.lastExternalImport,
  { onAddFood, onAddFoodToDay, onChangePage } = {},
) {
  const container = document.getElementById("searchResults");
  const paginationContainer = document.getElementById("searchResultsPagination");
  const status = document.getElementById("globalFoodSearchStatus");

  if (!container || !status) {
    return;
  }

  const items = Array.isArray(searchState?.items) ? searchState.items : [];
  const isGlobalSearch = searchState?.type === "global-food-search";
  const recentFoodKey = String(searchState?.recentFoodKey || "").trim();
  const recentAction = String(searchState?.recentAction || "").trim();

  status.textContent = isGlobalSearch
    ? searchState.message || "Search ready."
    : "Search foods by name, barcode, or paste an Open Food Facts product link.";

  renderSearchMeta(searchState);

  if (!isGlobalSearch || !items.length) {
    container.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
        Search a food name, paste an Open Food Facts link, or enter a barcode. Then pick the result, set grams, and add it straight to today.
      </div>
    `;
    if (paginationContainer) {
      paginationContainer.innerHTML = "";
      paginationContainer.classList.add("hidden");
    }
    return;
  }

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  items.forEach((food, index) => {
    const card = document.createElement("article");
    const isDisabled = Boolean(food.alreadySaved);
    const isRecentMatch = getSearchResultKey(food) === recentFoodKey;
    const sourceLabels = Array.isArray(food.matchedSources)
      ? food.matchedSources
          .map((source) => (source === "local" ? "Local database" : renderSourceBadge(source)))
          .join(" + ")
      : renderSourceBadge(food.source);

    card.className =
      `card rounded-3xl transition ${
        isRecentMatch
          ? "border-emerald-500/40 shadow-emerald-950/30"
          : "border-slate-700"
      }`;

    card.innerHTML = `
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-lg font-semibold text-white">${escapeHtml(food.name)}</h3>
            <span class="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
              ${escapeHtml(sourceLabels)}
            </span>
          </div>
          <p class="text-sm text-slate-300">${renderMacroLine(food)} / 100g</p>
          <p class="text-xs text-slate-500">
            ${food.barcode ? `Barcode ${escapeHtml(food.barcode)} | ` : ""}
            ${food.externalId ? `ID ${escapeHtml(food.externalId)} | ` : ""}
            ${isDisabled ? "Already saved in your local database." : "You can save it or add it straight to today."}
          </p>
          ${
            isRecentMatch
              ? `<p class="text-xs ${
                  recentAction === "saved" ? "text-sky-200" : "text-emerald-200"
                }">${escapeHtml(searchState.message || "Action completed for this result.")}</p>`
              : ""
          }
        </div>

        <div class="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
          <label class="flex items-center gap-2 rounded-3xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-400">
            <span>Grams</span>
            <input
              type="number"
              min="1"
              step="1"
              value="100"
              data-search-grams="${index}"
              class="w-20 bg-transparent text-sm font-semibold text-white outline-none"
            />
            <span>g</span>
          </label>

          <button
            type="button"
            data-log-search-result="${index}"
            class="btn px-4 py-3 text-sm font-semibold text-slate-950 ${
              isRecentMatch && recentAction === "logged"
                ? "bg-emerald-400 hover:bg-emerald-300"
                : "bg-emerald-500 hover:bg-emerald-400"
            }"
          >
            ${isRecentMatch && recentAction === "logged" ? "Add again" : "Add to today"}
          </button>

          <button
            type="button"
            data-add-search-result="${index}"
            class="btn px-4 py-3 text-sm font-semibold transition ${
              isDisabled
                ? "cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500"
                : "border border-sky-500/40 bg-sky-500/10 text-sky-100 hover:border-sky-400 hover:bg-sky-500/20"
            }"
            ${isDisabled ? "disabled" : ""}
          >
            ${isDisabled ? "Saved" : "Save food"}
          </button>
        </div>
      </div>
    `;

    const gramsInput = card.querySelector("[data-search-grams]");
    const resolveGrams = () => {
      const grams = safeNumber(gramsInput?.value);
      return grams > 0 ? grams : 100;
    };

    const logButton = card.querySelector("[data-log-search-result]");
    if (logButton) {
      logButton.addEventListener("click", () => onAddFoodToDay?.(food, resolveGrams()));
    }

    if (gramsInput) {
      gramsInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onAddFoodToDay?.(food, resolveGrams());
        }
      });
    }

    const actionButton = card.querySelector("[data-add-search-result]");
    if (actionButton && !isDisabled) {
      actionButton.addEventListener("click", () => onAddFood?.(food));
    }

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  if (paginationContainer) {
    const pagination = searchState?.pagination || null;
    const currentPage = Math.max(1, safeNumber(pagination?.page) || 1);
    const totalPages = Math.max(1, safeNumber(pagination?.totalPages) || 1);
    const hasPreviousPage = Boolean(pagination?.hasPreviousPage);
    const hasNextPage = Boolean(pagination?.hasNextPage);
    const localPinned = Boolean(pagination?.localPinned);
    const localCount = Math.max(0, safeNumber(pagination?.localCount));
    const externalCount = Math.max(0, safeNumber(pagination?.externalCount));

    if (totalPages <= 1 && !hasPreviousPage && !hasNextPage) {
      paginationContainer.innerHTML = "";
      paginationContainer.classList.add("hidden");
      return;
    }

    paginationContainer.classList.remove("hidden");
    paginationContainer.innerHTML = `
      <div class="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Search pages</p>
          <p class="mt-1 text-sm font-medium text-white">Open Food Facts page ${currentPage} of ${totalPages}</p>
          <p class="mt-1 text-xs text-slate-400">${
            localPinned && localCount > 0
              ? `${localCount} local match(es) stay pinned above ${externalCount} Open Food Facts result(s).`
              : `${externalCount} Open Food Facts result(s) on this page.`
          }</p>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            data-search-page="previous"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition ${
              hasPreviousPage
                ? "border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-white"
                : "cursor-not-allowed border-slate-800 text-slate-500"
            }"
            ${hasPreviousPage ? "" : "disabled"}
          >
            Previous page
          </button>
          <button
            type="button"
            data-search-page="next"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition ${
              hasNextPage
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400 hover:bg-emerald-500/20"
                : "cursor-not-allowed border-slate-800 text-slate-500"
            }"
            ${hasNextPage ? "" : "disabled"}
          >
            Next page
          </button>
        </div>
      </div>
    `;

    const previousButton = paginationContainer.querySelector('[data-search-page="previous"]');
    if (previousButton && hasPreviousPage) {
      previousButton.addEventListener("click", () => onChangePage?.(currentPage - 1));
    }

    const nextButton = paginationContainer.querySelector('[data-search-page="next"]');
    if (nextButton && hasNextPage) {
      nextButton.addEventListener("click", () => onChangePage?.(currentPage + 1));
    }
  }
}

export function renderPantryList() {
  const pantryList = document.getElementById("pantryFoodList");
  if (!pantryList) {
    return;
  }

  const selectedPantryFoods = new Set(state.pantry?.foodIds || []);
  pantryList.innerHTML = "";

  if (!state.foods.length) {
    pantryList.innerHTML =
      '<div class="card border-dashed text-sm text-slate-400">Sem alimentos disponiveis para a despensa.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  state.foods.forEach((food) => {
    const label = document.createElement("label");
    label.className =
      "flex items-center gap-3 card p-4 text-sm text-slate-200";

    label.innerHTML = `
      <input
        type="checkbox"
        value="${food.id}"
        data-pantry-food-id="${food.id}"
        class="h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-400 focus:ring-emerald-500"
        ${selectedPantryFoods.has(food.id) ? "checked" : ""}
      />
      <span class="flex-1">
        <strong class="block text-white">${escapeHtml(food.name)}</strong>
        <span class="text-xs text-slate-400">
          ${renderMacroLine(food)}
        </span>
        <span class="mt-1 block text-[11px] text-slate-500">${escapeHtml((food.tags || []).join(" | "))}</span>
      </span>
    `;

    fragment.appendChild(label);
  });

  pantryList.appendChild(fragment);
}

export function renderRecipeBuilder({ onRemove }) {
  const list = document.getElementById("recipeBuilderList");
  const totals = document.getElementById("recipeBuilderTotals");

  if (!list || !totals) return;

  list.innerHTML = "";

  let totalKcal = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;

  if (!state.builder.length) {
    list.innerHTML =
      '<li class="card border-dashed p-3 text-sm text-slate-400">Sem ingredientes no builder.</li>';
  }

  state.builder.forEach((item) => {
    const food = state.foods.find((candidate) => candidate.id === item.foodId);
    if (!food) return;

    const factor = safeNumber(item.grams) / 100;
    totalKcal += safeNumber(food.kcal) * factor;
    totalProt += safeNumber(food.prot) * factor;
    totalCarb += safeNumber(food.carb) * factor;
    totalFat += safeNumber(food.fat) * factor;

    const row = document.createElement("li");
    row.className =
      "flex items-center justify-between card p-3";

    row.innerHTML = `
      <span>${item.grams}g | ${escapeHtml(food.name)}</span>
      <button type="button" data-remove="${item.id}" class="rounded-full border border-rose-500/40 px-3 py-1 text-xs text-rose-300">Remover</button>
    `;

    row.querySelector("[data-remove]").addEventListener("click", () => onRemove(item.id));
    list.appendChild(row);
  });

  totals.textContent =
    `Total: ${Math.round(totalKcal)} kcal | ` +
    `P ${totalProt.toFixed(1)}g | H ${totalCarb.toFixed(1)}g | G ${totalFat.toFixed(1)}g`;
}

export function renderRecipesList({ onDelete }) {
  const list = document.getElementById("recipesList");
  if (!list) return;

  list.innerHTML = "";

  if (!state.recipes.length) {
    list.innerHTML =
      '<div class="card border-dashed text-sm text-slate-400">Sem receitas guardadas.</div>';
    return;
  }

  state.recipes.forEach((recipe) => {
    const card = document.createElement("article");
    card.className =
      "card rounded-3xl p-6";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <h3 class="font-semibold text-white">${escapeHtml(recipe.name)}</h3>
          <p class="text-xs text-slate-400">${renderMacroLine(recipe.totals || recipe)}</p>
        </div>
        <button type="button" data-delete="${recipe.id}" class="rounded-full border border-rose-500/40 px-3 py-1 text-xs text-rose-300">Apagar</button>
      </div>
    `;

    card.querySelector("[data-delete]").addEventListener("click", () => onDelete(recipe.id));
    list.appendChild(card);
  });
}

export function renderDayFoods({ onRemove }) {
  const list = document.getElementById("dayFoodList");
  if (!list) return;

  // Clear once
  list.innerHTML = "";

  const day = state.days[formatDate(state.selectedDate)];

  if (!day || !Array.isArray(day.foods) || day.foods.length === 0) {
    list.innerHTML =
      '<li class="card border-dashed p-3 text-sm text-slate-400">Sem alimentos registados.</li>';
    return;
  }

  const fragment = document.createDocumentFragment();
  day.foods.forEach((food, index) => {
    const row = document.createElement("li");
    row.className = "flex items-center justify-between card p-3";

    row.innerHTML = `
      <div>
        <p class="font-medium text-white">${safeNumber(food.grams).toFixed(0)}g | ${escapeHtml(food.name)}</p>
        <p class="text-xs text-slate-400">${renderMacroLine(food)}</p>
        <p class="text-[11px] text-slate-500">Fonte: ${escapeHtml(renderSourceBadge(food.source))}</p>
      </div>
      <button type="button" data-remove="${index}" class="rounded-full border border-rose-500/40 px-3 py-1 text-xs text-rose-300">Remover</button>
    `;

    row.querySelector("[data-remove]").addEventListener("click", () => onRemove(index));
    fragment.appendChild(row);
  });

  list.appendChild(fragment);
}

export function renderMealPlan(result, { onEatMeal } = {}) {
  const container = document.getElementById("mealPlanContainer");
  if (!container) return;

  container.classList.remove("hidden");
  container.innerHTML = "";

  if (!result || result.error) {
    container.innerHTML = `
      <div class="card p-4" style="border-color: rgba(245,158,11,0.15); background: rgba(245,158,11,0.06);">
        ${escapeHtml(result?.error || "Sem plano disponivel.")}
      </div>
    `;
    return;
  }

  if (!Array.isArray(result.plan) || result.plan.length === 0) {
    container.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
        Ainda nao existe plano para mostrar.
      </div>
    `;
    return;
  }

  result.plan.forEach((meal, index) => {
    const itemsHtml = meal.items
      .map(
        (item) => `
          <li class="flex items-center justify-between gap-3">
            <span>${safeNumber(item.grams).toFixed(0)}g | ${escapeHtml(item.name)}</span>
            <span class="text-slate-500">${Math.round(item.kcal)} kcal</span>
          </li>
        `,
      )
      .join("");

    const card = document.createElement("article");
    card.className =
      "flex flex-col rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-sm";

    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 class="font-semibold text-white">${escapeHtml(meal.name)}</h3>
            <p class="text-xs text-slate-400">
              Meta: ${meal.target.kcal} kcal | P ${meal.target.prot}g | H ${meal.target.carb}g | G ${meal.target.fat}g
            </p>
          </div>
          <span class="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-200">
            ${Math.round(meal.actual.kcal)} kcal
          </span>
        </div>

        <ul class="space-y-2 text-sm text-slate-300">
          ${itemsHtml || '<li class="text-slate-500">Sem alimentos compativeis para esta refeicao.</li>'}
        </ul>
      </div>

      <div class="mt-4 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
        <span>Desvio: ${Math.round(meal.accuracy * 100)}%</span>
        <button
          type="button"
          data-eat="${index}"
          class="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          ${meal.items.length === 0 ? "disabled" : ""}
        >
          Comer isto
        </button>
      </div>
    `;

    const eatButton = card.querySelector("[data-eat]");
    if (eatButton && meal.items.length > 0) {
      eatButton.addEventListener("click", () => onEatMeal?.(meal));
    }

    container.appendChild(card);
  });
}

export function renderPantrySuggestions(
  result = state.recipeSuggestions,
  { onEatSuggestion } = {},
) {
  const container = document.getElementById("pantrySuggestions");
  if (!container) return;

  container.innerHTML = "";

  const selectedFoodIds = state.pantry?.foodIds || [];
  const suggestions = Array.isArray(result?.items) ? result.items : [];

  if (!selectedFoodIds.length) {
    container.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
        Escolhe alimentos da despensa e clica em "Sugerir receitas".
      </div>
    `;
    return;
  }

  if (result?.message) {
    const note = document.createElement("div");
    note.className =
      suggestions.length > 0
        ? "rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-100"
        : "rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100";
    note.textContent = result.message;
    container.appendChild(note);
  }

  if (!suggestions.length) {
    return;
  }

  suggestions.forEach((recipe, index) => {
    const ingredientLines = (recipe.ingredientLines || []).slice(0, 8);
    const labels = [...(recipe.healthLabels || []), ...(recipe.dietLabels || [])]
      .slice(0, 6)
      .map((label) => `<span class="rounded-full border border-slate-700 px-2 py-1">${escapeHtml(label)}</span>`)
      .join("");
    const buttonLabel = recipe.source === "local" ? "Comer isto" : "Adicionar receita ao dia";
    const card = document.createElement("article");

    card.className =
      "rounded-3xl border border-slate-700 bg-slate-900/80 p-5 shadow-sm";

    card.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold text-white">${escapeHtml(recipe.title)}</h3>
              <span class="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                ${escapeHtml(renderSourceBadge(recipe.source))}
              </span>
            </div>
            <p class="text-xs text-slate-400">${renderMacroLine(recipe)}</p>
            <p class="text-sm text-slate-300">${escapeHtml((recipe.reasons || []).join(" "))}</p>
          </div>
          <div class="text-right text-xs text-slate-500">
            <p>Score ${Math.round(safeNumber(recipe.score) * 100)}</p>
            <p>${safeNumber(recipe.servings).toFixed(0)} dose(s)</p>
          </div>
        </div>

        ${
          recipe.url
            ? `<a href="${escapeHtml(recipe.url)}" target="_blank" rel="noreferrer" class="text-sm text-sky-300 underline-offset-2 hover:underline">Abrir fonte da receita</a>`
            : ""
        }

        <ul class="grid gap-2 text-sm text-slate-300">
          ${
            ingredientLines.length
              ? ingredientLines
                  .map(
                    (line) =>
                      `<li class="rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2">${escapeHtml(line)}</li>`,
                  )
                  .join("")
              : '<li class="text-slate-500">Sem lista detalhada de ingredientes.</li>'
          }
        </ul>

        ${
          labels
            ? `<div class="flex flex-wrap gap-2 text-[11px] text-slate-300">${labels}</div>`
            : ""
        }

        <div class="flex items-center justify-between border-t border-slate-800 pt-4">
          <span class="text-xs text-slate-500">
            ${recipe.image ? "Receita com imagem/fonte externa disponivel." : "Sugestao pronta para adicionar ao dia."}
          </span>
          <button
            type="button"
            data-eat-suggestion="${index}"
            class="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            ${buttonLabel}
          </button>
        </div>
      </div>
    `;

    card
      .querySelector("[data-eat-suggestion]")
      .addEventListener("click", () => onEatSuggestion?.(recipe));

    container.appendChild(card);
  });
}

export function renderOnboardingModal({ isOpen }) {
  const overlay = document.getElementById("profileModal");
  if (!overlay) return;

  overlay.classList.toggle("hidden", !isOpen);
  overlay.classList.toggle("flex", Boolean(isOpen));
  overlay.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("overflow-hidden", Boolean(isOpen));
}

// High-level view renderers used by the router
export function renderSettings() {
  try {
    renderProfileSummary();
  } catch (e) {
    console.error('renderSettings: profile summary failed', e);
  }

  try {
    renderApiConfig();
  } catch (e) {
    console.error('renderSettings: api config failed', e);
  }

  try {
    // These renderers are safe to call even if their containers are not present
    renderFoodList();
    renderRecipesList();
    renderPantryList();
    renderPantrySuggestions();
  } catch (e) {
    console.error('renderSettings: auxiliary renderers failed', e);
  }
}

export function renderDiary() {
  try {
    renderDayFoods();
  } catch (e) {
    console.error('renderDiary: renderDayFoods failed', e);
  }
}
