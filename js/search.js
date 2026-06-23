// js/search.js
// Lightweight in-memory search index with debounce-friendly sync query
import { state } from "./state.js";

const Search = {
  index: [],
  initialized: false,

  init() {
    // Build initial index from in-memory state (fast) - can be refreshed
    this.refreshIndex();
    this.initialized = true;
  },

  refreshIndex() {
    // Normalize minimal fields to keep index small and fast to scan
    this.index = Array.isArray(state.foods)
      ? state.foods.map((f) => ({
          id: f.id,
          name: String(f.name || "").trim(),
          nameLower: String(f.name || "").toLowerCase(),
          prot: f.prot,
          carb: f.carb,
          fat: f.fat,
          kcal: f.kcal,
          source: f.source,
          barcode: f.barcode,
          externalId: f.externalId,
          tags: Array.isArray(f.tags) ? f.tags : [],
        }))
      : [];
  },

  // Simple fuzzy: require all tokens to be included in the name (case-insensitive)
  query(q = "", { limit = 40 } = {}) {
    const query = String(q || "").trim().toLowerCase();
    if (!query || query.length < 1) return [];

    const tokens = query.split(/\s+/).filter(Boolean);

    const scored = [];

    for (const item of this.index) {
      let score = 0;
      const name = item.nameLower;
      let matchedAll = true;

      for (const t of tokens) {
        const idx = name.indexOf(t);
        if (idx === -1) {
          matchedAll = false;
          break;
        }

        // token at start is slightly more relevant
        score += idx === 0 ? 10 : 5;
        // shorter distance from start increases score
        score += Math.max(0, 20 - idx);
      }

      if (matchedAll) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.item);
  },
};

export const initSearch = async () => {
  // synchronous init is fine; keep API async to allow future IndexedDB warm-up
  Search.init();
  return Search;
};

export const querySearch = (q, opts = {}) => Search.query(q, opts);

export const refreshSearchIndex = () => Search.refreshIndex();

export default Search;
