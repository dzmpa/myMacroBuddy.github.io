import { safeNumber } from "./utils.js";

export const seedDefaultFoods = [
  {
    id: "seed-food-chicken-breast",
    name: "Peito de frango",
    kcal: 165,
    prot: 31,
    carb: 0,
    fat: 3.6,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-rice-cooked",
    name: "Arroz cozido",
    kcal: 130,
    prot: 2.7,
    carb: 28,
    fat: 0.3,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-oats",
    name: "Flocos de aveia",
    kcal: 389,
    prot: 16.9,
    carb: 66.3,
    fat: 6.9,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-greek-yogurt",
    name: "Iogurte grego 0%",
    kcal: 59,
    prot: 10.3,
    carb: 3.6,
    fat: 0.4,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-eggs",
    name: "Ovos inteiros",
    kcal: 143,
    prot: 12.6,
    carb: 0.7,
    fat: 9.5,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-salmon",
    name: "Salmao",
    kcal: 208,
    prot: 20,
    carb: 0,
    fat: 13,
    tags: ["protein", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-banana",
    name: "Banana",
    kcal: 89,
    prot: 1.1,
    carb: 23,
    fat: 0.3,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-broccoli",
    name: "Brocolos",
    kcal: 35,
    prot: 2.8,
    carb: 7,
    fat: 0.4,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-olive-oil",
    name: "Azeite",
    kcal: 884,
    prot: 0,
    carb: 0,
    fat: 100,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-peanut-butter",
    name: "Manteiga de amendoim",
    kcal: 588,
    prot: 25,
    carb: 20,
    fat: 50,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-whey",
    name: "Whey protein",
    kcal: 404,
    prot: 80,
    carb: 8,
    fat: 7,
    tags: ["protein", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-wholegrain-bread",
    name: "Pao integral",
    kcal: 247,
    prot: 13,
    carb: 41,
    fat: 4.2,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-pizza",
    name: "Pizza congelada",
    kcal: 266,
    prot: 11,
    carb: 33,
    fat: 10,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-donut",
    name: "Donut",
    kcal: 452,
    prot: 4.9,
    carb: 51,
    fat: 25,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-burger",
    name: "Hamburguer de vaca",
    kcal: 295,
    prot: 17,
    carb: 30,
    fat: 13,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-fries",
    name: "Batatas fritas",
    kcal: 312,
    prot: 3.4,
    carb: 41,
    fat: 15,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
];

const seedRecipeDefinitions = [
  {
    id: "seed-recipe-chicken-rice-bowl",
    name: "Chicken Rice Bowl",
    items: [
      { id: "seed-recipe-chicken-rice-bowl-1", foodId: "seed-food-chicken-breast", grams: 180 },
      { id: "seed-recipe-chicken-rice-bowl-2", foodId: "seed-food-rice-cooked", grams: 180 },
      { id: "seed-recipe-chicken-rice-bowl-3", foodId: "seed-food-broccoli", grams: 120 },
      { id: "seed-recipe-chicken-rice-bowl-4", foodId: "seed-food-olive-oil", grams: 10 },
    ],
  },
  {
    id: "seed-recipe-protein-oats",
    name: "Protein Oats Fit",
    items: [
      { id: "seed-recipe-protein-oats-1", foodId: "seed-food-oats", grams: 60 },
      { id: "seed-recipe-protein-oats-2", foodId: "seed-food-greek-yogurt", grams: 200 },
      { id: "seed-recipe-protein-oats-3", foodId: "seed-food-banana", grams: 100 },
      { id: "seed-recipe-protein-oats-4", foodId: "seed-food-whey", grams: 30 },
      { id: "seed-recipe-protein-oats-5", foodId: "seed-food-peanut-butter", grams: 15 },
    ],
  },
  {
    id: "seed-recipe-salmon-plate",
    name: "Salmao com arroz",
    items: [
      { id: "seed-recipe-salmon-plate-1", foodId: "seed-food-salmon", grams: 150 },
      { id: "seed-recipe-salmon-plate-2", foodId: "seed-food-rice-cooked", grams: 160 },
      { id: "seed-recipe-salmon-plate-3", foodId: "seed-food-broccoli", grams: 120 },
    ],
  },
  {
    id: "seed-recipe-eggs-toast",
    name: "Eggs Toast Fit",
    items: [
      { id: "seed-recipe-eggs-toast-1", foodId: "seed-food-eggs", grams: 120 },
      { id: "seed-recipe-eggs-toast-2", foodId: "seed-food-wholegrain-bread", grams: 80 },
      { id: "seed-recipe-eggs-toast-3", foodId: "seed-food-greek-yogurt", grams: 170 },
    ],
  },
  {
    id: "seed-recipe-burger-fries",
    name: "Burger & Fries Flex",
    items: [
      { id: "seed-recipe-burger-fries-1", foodId: "seed-food-burger", grams: 180 },
      { id: "seed-recipe-burger-fries-2", foodId: "seed-food-fries", grams: 180 },
    ],
  },
  {
    id: "seed-recipe-pizza-night",
    name: "Pizza Night Flex",
    items: [
      { id: "seed-recipe-pizza-night-1", foodId: "seed-food-pizza", grams: 260 },
      { id: "seed-recipe-pizza-night-2", foodId: "seed-food-greek-yogurt", grams: 170 },
    ],
  },
  {
    id: "seed-recipe-donut-snack",
    name: "Donut Yogurt Snack",
    items: [
      { id: "seed-recipe-donut-snack-1", foodId: "seed-food-donut", grams: 75 },
      { id: "seed-recipe-donut-snack-2", foodId: "seed-food-greek-yogurt", grams: 170 },
    ],
  },
];

function calculateRecipeTotals(items) {
  return items.reduce(
    (acc, item) => {
      const food = seedDefaultFoods.find((candidate) => candidate.id === item.foodId);
      if (!food) return acc;

      const factor = safeNumber(item.grams) / 100;

      return {
        kcal: acc.kcal + safeNumber(food.kcal) * factor,
        prot: acc.prot + safeNumber(food.prot) * factor,
        carb: acc.carb + safeNumber(food.carb) * factor,
        fat: acc.fat + safeNumber(food.fat) * factor,
      };
    },
    { kcal: 0, prot: 0, carb: 0, fat: 0 },
  );
}

export const seedDefaultRecipes = seedRecipeDefinitions.map((recipe) => ({
  ...recipe,
  totals: calculateRecipeTotals(recipe.items),
}));

export function getSeedStatePatch(currentState) {
  const shouldSeedFoods = !Array.isArray(currentState.foods) || currentState.foods.length === 0;
  const nextFoods = shouldSeedFoods
    ? seedDefaultFoods.map((food) => ({ ...food }))
    : currentState.foods;
  const hasSeedFoodsAvailable = seedDefaultFoods.every((seedFood) =>
    nextFoods.some((food) => food.id === seedFood.id),
  );
  const shouldSeedRecipes =
    (!Array.isArray(currentState.recipes) || currentState.recipes.length === 0) &&
    hasSeedFoodsAvailable;

  return {
    ...(shouldSeedFoods ? { foods: seedDefaultFoods.map((food) => ({ ...food })) } : {}),
    ...(shouldSeedRecipes
      ? { recipes: seedDefaultRecipes.map((recipe) => ({
          ...recipe,
          items: recipe.items.map((item) => ({ ...item })),
          totals: { ...recipe.totals },
        })) }
      : {}),
  };
}
