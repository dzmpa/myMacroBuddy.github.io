import assert from 'node:assert/strict';
import {
  parseNumberOrNull,
  isValidUSDAFood,
  isValidEdamamFoodHit,
  isValidEdamamRecipe,
  isValidOFFProduct,
} from '../js/validators.js';

function run() {
  // USDA valid
  const goodUsda = {
    description: 'Apple, raw',
    fdcId: '12345',
    foodNutrients: [
      { nutrient: { id: 1008, name: 'Energy', amount: 52 } },
      { nutrientId: 1003, nutrientName: 'Protein', amount: '0.3' },
    ],
  };

  const badUsda = {
    description: 'Bad Food',
    fdcId: '999',
    foodNutrients: [
      { nutrient: { id: 1008, name: 'Energy', amount: 'not-a-number' } },
    ],
  };

  assert.equal(isValidUSDAFood(goodUsda), true, 'good USDA should be valid');
  assert.equal(isValidUSDAFood(badUsda), false, 'bad USDA should be invalid');

  // Edamam hit valid / invalid
  const goodHit = { food: { label: 'Banana', nutrients: { ENERC_KCAL: 89 } } };
  const badHit = { food: { label: 'Weird', nutrients: { ENERC_KCAL: 'abc' } } };

  assert.equal(isValidEdamamFoodHit(goodHit), true, 'good Edamam hit valid');
  assert.equal(isValidEdamamFoodHit(badHit), false, 'bad Edamam hit invalid');

  // Edamam recipe
  const goodRecipe = { label: 'Smoothie', calories: 320 };
  const badRecipe = { label: '', calories: 'nope' };

  assert.equal(isValidEdamamRecipe(goodRecipe), true, 'good recipe valid');
  assert.equal(isValidEdamamRecipe(badRecipe), false, 'bad recipe invalid');

  // OFF product
  const goodOff = { product_name: 'Yogurt', nutriments: { proteins_100g: 3.4 } };
  const badOff = { nutriments: {} };

  assert.equal(isValidOFFProduct(goodOff), true, 'good OFF product valid');
  assert.equal(isValidOFFProduct(badOff), false, 'bad OFF product invalid');

  console.log('\nALL BOUNDARY VALIDATION TESTS PASS');
}

try {
  run();
} catch (err) {
  console.error('TESTS FAILED');
  console.error(err && err.message ? err.message : err);
  process.exitCode = 2;
}
