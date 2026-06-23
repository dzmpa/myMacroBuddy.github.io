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

function assert(cond, msg) {
  if (!cond) {
    console.error('ASSERTION FAILED:', msg);
    process.exitCode = 2;
  }
}

const original = {
  gamification: { xp: 0, level: 1, badges: [] },
  days: { '2026-06-23': { kcal: 100, notes: '' } },
  arr: [1, 2, 3],
};

const patch = {
  gamification: { xp: 42 },
  days: { '2026-06-23': { kcal: 200, notes: 'updated' } },
  arr: [4, 5],
};

const next = deepMerge(original, patch);

console.log('original:', JSON.stringify(original));
console.log('next:    ', JSON.stringify(next));

// checks
assert(original.gamification.xp === 0, 'original gamification.xp must remain 0');
assert(next.gamification.xp === 42, 'next gamification.xp must be 42');
assert(original.days['2026-06-23'].kcal === 100, 'original day kcal unchanged');
assert(next.days['2026-06-23'].kcal === 200, 'next day kcal updated');
assert(Array.isArray(next.arr) && next.arr.length === 2 && next.arr[0] === 4, 'array replaced correctly');

if (process.exitCode !== 2) {
  console.log('\nALL TESTS PASS');
} else {
  console.error('\nSOME TESTS FAILED');
}
