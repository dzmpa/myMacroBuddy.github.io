import {
  extractOpenFoodFactsBarcode,
  fetchFoodByBarcode,
  searchFoodsByQuery as searchOpenFoodFactsFoods,
} from "./openFoodFacts.js";
import { safeNumber, uniqueStrings } from "./utils.js";

const LOCAL_RESULT_LIMIT = 8;
const OFF_PAGE_SIZE = 12;
const QUERY_STOP_WORDS = new Set([
  "a",
  "as",
  "o",
  "os",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "com",
  "sem",
]);

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getQueryTerms(query) {
  return normalizeSearchText(query)
    .split(/\s+/)
    .filter(Boolean);
}

function getSignificantQueryTerms(query) {
  return getQueryTerms(query).filter(
    (term) => term.length >= 3 && !QUERY_STOP_WORDS.has(term),
  );
}

function getAccentlessQuery(query) {
  return normalizeSearchText(query);
}

function buildSearchableText(food = {}) {
  return normalizeSearchText(
    [
      food.name,
      food.searchText,
      Array.isArray(food.tags) ? food.tags.join(" ") : "",
      food.barcode,
      food.externalId,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" "),
  );
}

function normalizeSearchResult(food = {}, overrides = {}) {
  const name = String(food.name ?? food.label ?? food.product_name ?? "").trim();
  const source = String(overrides.source ?? food.source ?? "manual").trim().toLowerCase();

  if (!name) {
    return null;
  }

  return {
    id: String(
      overrides.id ??
        food.id ??
        food.externalId ??
        food.barcode ??
        `${source || "manual"}:${name}`,
    ).trim(),
    name,
    kcal: safeNumber(food.kcal ?? food.energy),
    prot: safeNumber(food.prot ?? food.protein),
    carb: safeNumber(food.carb ?? food.carbs),
    fat: safeNumber(food.fat),
    fiber: safeNumber(food.fiber),
    source,
    externalId: String(overrides.externalId ?? food.externalId ?? "").trim(),
    barcode: String(overrides.barcode ?? food.barcode ?? "").trim(),
    tags: uniqueStrings([
      ...(Array.isArray(food.tags) ? food.tags : []),
      ...(Array.isArray(overrides.tags) ? overrides.tags : []),
    ]),
    alreadySaved: Boolean(overrides.alreadySaved ?? food.alreadySaved ?? false),
    matchedSources: uniqueStrings(
      Array.isArray(overrides.matchedSources)
        ? overrides.matchedSources
        : [source || "manual"],
    ),
    rawExternal: food.rawExternal ?? food.raw ?? null,
  };
}

function searchLocalFoods(query, foods = []) {
  const queryTerms = getQueryTerms(query);

  return foods
    .filter((food) => {
      const searchableText = buildSearchableText(food);
      return queryTerms.every((term) => searchableText.includes(term));
    })
    .map((food) =>
      normalizeSearchResult(food, {
        source: food.source || "manual",
        alreadySaved: true,
        matchedSources: ["local", String(food.source || "manual").trim().toLowerCase()],
        tags: food.tags || [],
      }),
    )
    .filter(Boolean)
    .slice(0, LOCAL_RESULT_LIMIT);
}

function searchLocalFoodsByBarcode(barcode, foods = []) {
  const cleanBarcode = String(barcode || "").trim();

  if (!cleanBarcode) {
    return [];
  }

  return foods
    .filter((food) => {
      const foodBarcode = String(food.barcode || "").trim();
      const foodExternalId = String(food.externalId || "").trim();
      return foodBarcode === cleanBarcode || foodExternalId === cleanBarcode;
    })
    .map((food) =>
      normalizeSearchResult(food, {
        source: food.source || "manual",
        alreadySaved: true,
        matchedSources: ["local", String(food.source || "manual").trim().toLowerCase()],
        tags: food.tags || [],
      }),
    )
    .filter(Boolean)
    .slice(0, LOCAL_RESULT_LIMIT);
}

function getResultKey(result) {
  return (
    result.barcode ||
    (result.externalId ? `${result.source}:${result.externalId}` : "") ||
    result.name.toLowerCase()
  );
}

function mergeMatchedSources(target, incoming) {
  return uniqueStrings([...(target.matchedSources || []), ...(incoming.matchedSources || [])]);
}

function pickPreferredResult(left, right) {
  if (left.alreadySaved !== right.alreadySaved) {
    return left.alreadySaved ? left : right;
  }

  if (left.externalId && !right.externalId) {
    return left;
  }

  if (right.externalId && !left.externalId) {
    return right;
  }

  return safeNumber(left.kcal) + safeNumber(left.prot) + safeNumber(left.carb) + safeNumber(left.fat)
    >= safeNumber(right.kcal) + safeNumber(right.prot) + safeNumber(right.carb) + safeNumber(right.fat)
    ? left
    : right;
}

function dedupeResults(results = []) {
  const byKey = new Map();

  results.forEach((result) => {
    if (!result) {
      return;
    }

    const key = getResultKey(result);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, result);
      return;
    }

    const preferred = pickPreferredResult(existing, result);
    const secondary = preferred === existing ? result : existing;

    byKey.set(key, {
      ...secondary,
      ...preferred,
      alreadySaved: existing.alreadySaved || result.alreadySaved,
      matchedSources: mergeMatchedSources(existing, result),
      tags: uniqueStrings([...(existing.tags || []), ...(result.tags || [])]),
      rawExternal: preferred.rawExternal ?? secondary.rawExternal ?? null,
    });
  });

  return Array.from(byKey.values());
}

function sortResults(results = [], query = "") {
  const normalizedQuery = normalizeSearchText(query);
  const queryTerms = getQueryTerms(query);

  return [...results].sort((left, right) => {
    const leftName = normalizeSearchText(left.name);
    const rightName = normalizeSearchText(right.name);
    const leftText = buildSearchableText(left);
    const rightText = buildSearchableText(right);
    const leftExact = leftName === normalizedQuery ? 1 : 0;
    const rightExact = rightName === normalizedQuery ? 1 : 0;
    if (leftExact !== rightExact) {
      return rightExact - leftExact;
    }

    const leftStarts = leftName.startsWith(normalizedQuery) ? 1 : 0;
    const rightStarts = rightName.startsWith(normalizedQuery) ? 1 : 0;
    if (leftStarts !== rightStarts) {
      return rightStarts - leftStarts;
    }

    const leftAllTerms = queryTerms.every((term) => leftText.includes(term)) ? 1 : 0;
    const rightAllTerms = queryTerms.every((term) => rightText.includes(term)) ? 1 : 0;
    if (leftAllTerms !== rightAllTerms) {
      return rightAllTerms - leftAllTerms;
    }

    const leftMatchCount = queryTerms.filter((term) => leftText.includes(term)).length;
    const rightMatchCount = queryTerms.filter((term) => rightText.includes(term)).length;
    if (leftMatchCount !== rightMatchCount) {
      return rightMatchCount - leftMatchCount;
    }

    if (left.alreadySaved !== right.alreadySaved) {
      return Number(right.alreadySaved) - Number(left.alreadySaved);
    }

    const leftLocal = left.matchedSources?.includes("local") ? 1 : 0;
    const rightLocal = right.matchedSources?.includes("local") ? 1 : 0;
    if (leftLocal !== rightLocal) {
      return rightLocal - leftLocal;
    }

    return left.name.localeCompare(right.name, "en");
  });
}

function normalizeExternalResults(items = []) {
  return items
    .map((food) =>
      normalizeSearchResult(food, {
        source: food.source,
        externalId: food.externalId,
        barcode: food.barcode,
        tags: food.tags,
        alreadySaved: Boolean(food.alreadySaved),
        matchedSources: Array.isArray(food.matchedSources)
          ? food.matchedSources
          : [String(food.source || "manual").trim().toLowerCase()],
      }),
    )
    .filter(Boolean);
}

function filterExternalResultsByQuery(
  results = [],
  query = "",
  { allowPartialMultiWord = false } = {},
) {
  const queryTerms = getSignificantQueryTerms(query);

  if (!queryTerms.length) {
    return results;
  }

  const strongMatches = results.filter((result) => {
    const searchableText = buildSearchableText(result);
    return queryTerms.every((term) => searchableText.includes(term));
  });

  if (strongMatches.length) {
    return strongMatches;
  }

  if (queryTerms.length > 1 && !allowPartialMultiWord) {
    return [];
  }

  const partialMatches = results.filter((result) => {
    const searchableText = buildSearchableText(result);
    return queryTerms.some((term) => searchableText.includes(term));
  });

  return partialMatches.length ? partialMatches : [];
}

async function fetchOffResultsForQueries(queries = []) {
  const uniqueQueries = uniqueStrings(queries);
  const settledResults = await Promise.allSettled(
    uniqueQueries.map((query) =>
      searchOpenFoodFactsFoods(query, {
        page: 1,
        pageSize: Math.min(8, OFF_PAGE_SIZE),
      }),
    ),
  );

  return settledResults
    .filter((entry) => entry.status === "fulfilled")
    .flatMap((entry) => entry.value.items || []);
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

function findLocalMatch(result, foods = []) {
  return (
    foods
      .map((food) =>
        normalizeSearchResult(food, {
          source: food.source || "manual",
          externalId: food.externalId,
          barcode: food.barcode,
          tags: food.tags,
          alreadySaved: true,
          matchedSources: [
            "local",
            String(food.source || "manual").trim().toLowerCase(),
          ],
        }),
      )
      .find((localFood) => localFood && isSameFoodCandidate(localFood, result)) || null
  );
}

function applyLocalMatchMetadata(results = [], foods = []) {
  return results.map((result) => {
    const localMatch = findLocalMatch(result, foods);

    if (!localMatch) {
      return result;
    }

    return {
      ...result,
      alreadySaved: true,
      matchedSources: uniqueStrings([
        ...(result.matchedSources || [String(result.source || "manual")]),
        "local",
        String(localMatch.source || "manual").trim().toLowerCase(),
      ]),
      tags: uniqueStrings([...(result.tags || []), ...(localMatch.tags || [])]),
    };
  });
}

function buildSearchMessage({
  itemsCount = 0,
  localCount = 0,
  externalCount = 0,
  page = 1,
  totalPages = 1,
  openFoodFactsAvailable = true,
} = {}) {
  if (!itemsCount) {
    if (!openFoodFactsAvailable) {
      return page > 1
        ? "Open Food Facts is unavailable right now. Try the previous page or run the search again."
        : "Open Food Facts is unavailable right now. Try again in a moment.";
    }

    return page > 1
      ? `No more Open Food Facts results on page ${page}. Try the previous page or a different search.`
      : "No foods found in your local database or Open Food Facts.";
  }

  const sourcesLabel =
    page === 1 && localCount > 0 && externalCount > 0
      ? "your local database and Open Food Facts"
      : externalCount > 0
        ? "Open Food Facts"
        : "your local database";
  const pageLabel = totalPages > 1 ? ` Page ${page} of ${totalPages}.` : "";
  const localHint =
    page === 1 && localCount > 0 && externalCount > 0
      ? ` ${localCount} local match(es) stay pinned first.`
      : "";

  return `Showing ${itemsCount} result(s) from ${sourcesLabel}.${pageLabel}${localHint}`;
}

export async function searchAllApis(query, sourceState, options = {}) {
  const cleanQuery = String(query ?? "").trim();
  const page = Math.max(1, safeNumber(options.page) || 1);
  const offReference = extractOpenFoodFactsBarcode(cleanQuery);
  const queryTerms = getQueryTerms(cleanQuery);
  const significantQueryTerms = getSignificantQueryTerms(cleanQuery);
  const previousPagination =
    sourceState?.lastExternalImport?.query === cleanQuery
      ? sourceState.lastExternalImport?.pagination || null
      : null;

  if (!cleanQuery) {
    return {
      items: [],
      message: "Type a food name to search.",
      pagination: null,
    };
  }

  if (offReference?.barcode) {
    const localBarcodeMatches = searchLocalFoodsByBarcode(
      offReference.barcode,
      sourceState.foods || [],
    );

    try {
      const offResult = await fetchFoodByBarcode(offReference.barcode);

      if (offResult?.error) {
        return {
          items: localBarcodeMatches,
          message:
            offReference.source === "url"
              ? "That Open Food Facts link could not be loaded right now."
              : offResult.error,
          pagination: null,
        };
      }

      const externalResults = applyLocalMatchMetadata(
        normalizeExternalResults([offResult]),
        sourceState.foods || [],
      );
      const items = sortResults(
        dedupeResults([...localBarcodeMatches, ...externalResults]),
        offResult.name || cleanQuery,
      );

      return {
        items,
        message:
          offReference.source === "url"
            ? `Loaded 1 exact Open Food Facts product from the pasted link.`
            : `Loaded 1 exact Open Food Facts product from barcode ${offReference.barcode}.`,
        pagination: null,
      };
    } catch {
      return {
        items: localBarcodeMatches,
        message:
          offReference.source === "url"
            ? "That Open Food Facts link could not be loaded right now."
            : "Open Food Facts is unavailable right now. Try again in a moment.",
        pagination: null,
      };
    }
  }

  const localResults = searchLocalFoods(cleanQuery, sourceState.foods || []);
  const shouldPinLocalResults = page === 1 && localResults.length > 0;

  try {
    const offPage = await searchOpenFoodFactsFoods(cleanQuery, {
      page,
      pageSize: OFF_PAGE_SIZE,
    });
    let externalResults = applyLocalMatchMetadata(
      filterExternalResultsByQuery(
        normalizeExternalResults(offPage.items),
        cleanQuery,
      ),
      sourceState.foods || [],
    );
    let usedRelatedFallback = false;

    if (!externalResults.length && significantQueryTerms.length > 1) {
      const accentlessQuery = getAccentlessQuery(cleanQuery);
      const rawLowerQuery = String(cleanQuery).trim().toLowerCase();
      const fallbackQueries = [
        accentlessQuery && accentlessQuery !== rawLowerQuery ? accentlessQuery : "",
        significantQueryTerms.join(" "),
        ...significantQueryTerms.slice(0, 2),
      ];
      const fallbackItems = await fetchOffResultsForQueries(fallbackQueries);
      externalResults = applyLocalMatchMetadata(
        filterExternalResultsByQuery(
          normalizeExternalResults(fallbackItems),
          cleanQuery,
          { allowPartialMultiWord: true },
        ),
        sourceState.foods || [],
      );
      usedRelatedFallback = externalResults.length > 0;
    }

    if (!externalResults.length && !localResults.length) {
      return {
        items: [],
        message:
          significantQueryTerms.length > 1
            ? "No foods matched the search terms in Open Food Facts."
            : "No foods found in your local database or Open Food Facts.",
        pagination: {
          page: 1,
          pageSize: offPage.pageSize,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          localCount: 0,
          externalCount: 0,
          localPinned: false,
        },
      };
    }

    const items = sortResults(
      dedupeResults(
        shouldPinLocalResults
          ? [...localResults, ...externalResults]
          : externalResults,
      ),
      cleanQuery,
    ).slice(
      0,
      shouldPinLocalResults ? LOCAL_RESULT_LIMIT + OFF_PAGE_SIZE : OFF_PAGE_SIZE,
    );
    const hasRelevantExternalMatches = externalResults.length > 0 && !usedRelatedFallback;
    const totalPages = hasRelevantExternalMatches ? offPage.totalPages : 1;
    const totalCount = hasRelevantExternalMatches ? offPage.totalCount : 0;
    const message = usedRelatedFallback
      ? `No exact Open Food Facts match for every term. Showing the closest related results for "${cleanQuery}".`
      : buildSearchMessage({
          itemsCount: items.length,
          localCount: localResults.length,
          externalCount: externalResults.length,
          page: offPage.page,
          totalPages,
          openFoodFactsAvailable: true,
        });

    return {
      items,
      message,
      pagination: {
        page: offPage.page,
        pageSize: offPage.pageSize,
        totalCount,
        totalPages,
        hasNextPage: hasRelevantExternalMatches ? offPage.hasNextPage : false,
        hasPreviousPage: hasRelevantExternalMatches ? offPage.hasPreviousPage : false,
        localCount: localResults.length,
        externalCount: externalResults.length,
        localPinned: shouldPinLocalResults,
      },
    };
  } catch {
    const fallbackItems = shouldPinLocalResults ? localResults : [];

    return {
      items: fallbackItems,
      message: buildSearchMessage({
        itemsCount: fallbackItems.length,
        localCount: localResults.length,
        externalCount: 0,
        page,
        totalPages: 1,
        openFoodFactsAvailable: false,
      }),
      pagination: {
        page,
        pageSize: Math.max(1, safeNumber(previousPagination?.pageSize) || OFF_PAGE_SIZE),
        totalCount: Math.max(0, safeNumber(previousPagination?.totalCount)),
        totalPages: Math.max(1, safeNumber(previousPagination?.totalPages) || 1),
        hasNextPage:
          page < Math.max(1, safeNumber(previousPagination?.totalPages) || 1),
        hasPreviousPage: page > 1,
        localCount: localResults.length,
        externalCount: 0,
        localPinned: shouldPinLocalResults,
      },
    };
  }
}

export function bindGlobalFoodSearch() {
  const searchButton = document.getElementById("searchAllApis");
  const searchInput = document.getElementById("globalFoodSearch");

  if (!searchButton || !searchInput || searchButton.dataset.bound === "true") {
    return;
  }

  searchButton.dataset.bound = "true";
  searchButton.addEventListener("click", () => {
    runGlobalFoodSearch(1);
  });

  if (searchInput.dataset.bound !== "true") {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runGlobalFoodSearch(1);
      }
    });
  }
}
