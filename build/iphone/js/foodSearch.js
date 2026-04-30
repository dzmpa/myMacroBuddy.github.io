import { hasEdamamConfig, searchFood as searchEdamamFood } from "./edamam.js";
import { searchFoodsByQuery as searchOpenFoodFactsFoods } from "./openFoodFacts.js";
import { searchFoods as searchUsdaFoods } from "./usdaFoodData.js";
import { safeNumber, uniqueStrings } from "./utils.js";

const PRIMARY_RESULT_LIMIT = 16;
const OFF_FALLBACK_THRESHOLD = 10;
const EDAMAM_FALLBACK_THRESHOLD = 6;

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
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  return foods
    .filter((food) => {
      const normalizedName = String(food.name || "").trim().toLowerCase();
      return queryTerms.every((term) => normalizedName.includes(term));
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
    .slice(0, 8);
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
  const normalizedQuery = query.toLowerCase();

  return [...results].sort((left, right) => {
    const leftName = left.name.toLowerCase();
    const rightName = right.name.toLowerCase();
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

function buildSearchMessage(items = [], activeSources = [], failedSources = []) {
  if (!items.length) {
    return failedSources.length
      ? `No foods found. Some sources were unavailable: ${failedSources.join(", ")}.`
      : "No foods found in your local database, USDA, or fallback sources.";
  }

  const sourcesLabel = activeSources.length
    ? activeSources.join(", ")
    : "your available sources";

  if (failedSources.length) {
    return `Showing ${items.length} result(s) from ${sourcesLabel}. Some sources were unavailable: ${failedSources.join(", ")}.`;
  }

  return `Showing ${items.length} result(s) from ${sourcesLabel}.`;
}

export async function searchAllApis(query, sourceState) {
  const cleanQuery = String(query ?? "").trim();

  if (!cleanQuery) {
    return {
      items: [],
      message: "Type a food name to search.",
    };
  }

  const activeSources = [];
  const failedSources = [];
  const localResults = searchLocalFoods(cleanQuery, sourceState.foods || []);
  const aggregatedResults = [...localResults];

  if (localResults.length) {
    activeSources.push("your local database");
  }

  try {
    const usdaResults = await searchUsdaFoods(cleanQuery, sourceState.apiConfig);
    aggregatedResults.push(...usdaResults);

    if (usdaResults.length) {
      activeSources.push("USDA");
    }
  } catch (error) {
    failedSources.push(
      error instanceof Error && error.message.includes("rate-limited")
        ? "USDA demo access (rate-limited)"
        : "USDA",
    );
  }

  let normalizedItems = sortResults(
    dedupeResults(normalizeExternalResults(aggregatedResults)),
    cleanQuery,
  );

  if (normalizedItems.length < OFF_FALLBACK_THRESHOLD) {
    try {
      const offResults = await searchOpenFoodFactsFoods(cleanQuery);
      normalizedItems = sortResults(
        dedupeResults([
          ...normalizedItems,
          ...normalizeExternalResults(offResults),
        ]),
        cleanQuery,
      );

      if (offResults.length) {
        activeSources.push("Open Food Facts");
      }
    } catch {
      failedSources.push("Open Food Facts");
    }
  }

  if (normalizedItems.length < EDAMAM_FALLBACK_THRESHOLD && hasEdamamConfig(sourceState.apiConfig)) {
    try {
      const edamamResults = await searchEdamamFood(cleanQuery, sourceState.apiConfig);
      normalizedItems = sortResults(
        dedupeResults([
          ...normalizedItems,
          ...normalizeExternalResults(edamamResults),
        ]),
        cleanQuery,
      );

      if (edamamResults.length) {
        activeSources.push("Edamam");
      }
    } catch {
      failedSources.push("Edamam");
    }
  }

  const items = normalizedItems.slice(0, PRIMARY_RESULT_LIMIT);

  return {
    items,
    message: buildSearchMessage(items, uniqueStrings(activeSources), uniqueStrings(failedSources)),
  };
}
