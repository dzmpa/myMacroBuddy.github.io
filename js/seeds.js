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
  {
    id: "seed-food-bispo",
    name: "Bispo",
    kcal: 420,
    prot: 5,
    carb: 50,
    fat: 22,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-sweet-potato-cooked",
    name: "Batata doce cozida",
    kcal: 86,
    prot: 1.6,
    carb: 20,
    fat: 0.1,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-pasta-cooked",
    name: "Massa cozida",
    kcal: 131,
    prot: 5,
    carb: 25,
    fat: 1.1,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-canned-tuna-water",
    name: "Atum em lata ao natural",
    kcal: 116,
    prot: 26,
    carb: 0,
    fat: 1,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-beef-steak",
    name: "Bife de vaca",
    kcal: 250,
    prot: 26,
    carb: 0,
    fat: 15,
    tags: ["protein", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-semi-skimmed-milk",
    name: "Leite meio gordo",
    kcal: 47,
    prot: 3.3,
    carb: 4.8,
    fat: 1.5,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-edam-cheese",
    name: "Queijo flamengo",
    kcal: 349,
    prot: 23,
    carb: 0,
    fat: 28,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-black-beans-cooked",
    name: "Feijao preto cozido",
    kcal: 132,
    prot: 9,
    carb: 24,
    fat: 0.5,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-hake-cooked",
    name: "Pescada cozida",
    kcal: 78,
    prot: 17,
    carb: 0,
    fat: 0.5,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-apple",
    name: "Maca",
    kcal: 52,
    prot: 0.3,
    carb: 14,
    fat: 0.2,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-avocado",
    name: "Abacate",
    kcal: 160,
    prot: 2,
    carb: 9,
    fat: 15,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-walnuts",
    name: "Nozes",
    kcal: 654,
    prot: 15,
    carb: 14,
    fat: 65,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-carrot",
    name: "Cenoura",
    kcal: 41,
    prot: 0.9,
    carb: 10,
    fat: 0.2,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-chickpeas-cooked",
    name: "Grao de bico cozido",
    kcal: 164,
    prot: 9,
    carb: 27,
    fat: 2.6,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-chicken-slice",
    name: "Fiambre de frango",
    kcal: 104,
    prot: 17,
    carb: 3,
    fat: 2.5,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-fresh-cheese-lowfat",
    name: "Queijo fresco magro",
    kcal: 70,
    prot: 11,
    carb: 3,
    fat: 1,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-honey",
    name: "Mel",
    kcal: 304,
    prot: 0.3,
    carb: 82,
    fat: 0,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-dark-chocolate-70",
    name: "Chocolate preto 70%",
    kcal: 598,
    prot: 8,
    carb: 46,
    fat: 43,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-pork-loin",
    name: "Lombo de porco",
    kcal: 143,
    prot: 26,
    carb: 0,
    fat: 4,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-turkey-breast",
    name: "Peito de peru",
    kcal: 114,
    prot: 24,
    carb: 0,
    fat: 1.5,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-almonds",
    name: "Amendoas",
    kcal: 579,
    prot: 21,
    carb: 22,
    fat: 50,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-strawberries",
    name: "Morangos",
    kcal: 32,
    prot: 0.7,
    carb: 8,
    fat: 0.3,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-spinach",
    name: "Espinafres",
    kcal: 23,
    prot: 2.9,
    carb: 3.6,
    fat: 0.4,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-couscous-cooked",
    name: "Cuscuz cozido",
    kcal: 112,
    prot: 3.8,
    carb: 23,
    fat: 0.2,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-cod-raw",
    name: "Bacalhau cru",
    kcal: 82,
    prot: 18,
    carb: 0,
    fat: 0.7,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-lentils-cooked",
    name: "Lentilhas cozidas",
    kcal: 116,
    prot: 9,
    carb: 20,
    fat: 0.4,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-red-beans-cooked",
    name: "Feijao encarnado cozido",
    kcal: 127,
    prot: 8.7,
    carb: 22.8,
    fat: 0.5,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-bacon",
    name: "Bacon",
    kcal: 541,
    prot: 37,
    carb: 1.4,
    fat: 42,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-parmesan-cheese",
    name: "Queijo parmesao ralado",
    kcal: 431,
    prot: 38,
    carb: 4,
    fat: 29,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-soy-sauce",
    name: "Molho de soja",
    kcal: 53,
    prot: 8,
    carb: 5,
    fat: 0,
    tags: ["snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-lean-ground-beef",
    name: "Carne de vaca magra picada",
    kcal: 212,
    prot: 26,
    carb: 0,
    fat: 11,
    tags: ["protein", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-mustard",
    name: "Mostarda",
    kcal: 60,
    prot: 4,
    carb: 5,
    fat: 3,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-ketchup",
    name: "Ketchup",
    kcal: 112,
    prot: 1,
    carb: 26,
    fat: 0,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-light-mozzarella-grated",
    name: "Queijo mozarela light ralado",
    kcal: 260,
    prot: 26,
    carb: 2,
    fat: 16,
    tags: ["protein", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  // Adiciona isto à tua lista existente de seedFoodDefinitions
  {
    id: "seed-food-tomato-paste",
    name: "Polpa de tomate",
    kcal: 38,
    prot: 2,
    carb: 7.3,
    fat: 0.1,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-onion",
    name: "Cebola",
    kcal: 40,
    prot: 1.1,
    carb: 9.3,
    fat: 0.1,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-garlic",
    name: "Alho",
    kcal: 149,
    prot: 6.4,
    carb: 33,
    fat: 0.5,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-carrot",
    name: "Cenoura",
    kcal: 41,
    prot: 0.9,
    carb: 10,
    fat: 0.2,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-bell-pepper",
    name: "Pimentos",
    kcal: 26,
    prot: 1,
    carb: 6,
    fat: 0.3,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-mushrooms",
    name: "Cogumelos",
    kcal: 22,
    prot: 3.1,
    carb: 3.3,
    fat: 0.3,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-pasta-cooked",
    name: "Massa cozida",
    kcal: 131,
    prot: 5,
    carb: 25,
    fat: 1.1,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-soy-cream-light",
    name: "Natas de soja light",
    kcal: 131,
    prot: 3,
    carb: 4.5,
    fat: 12,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-noodles-cooked",
    name: "Noodles cozidos",
    kcal: 138,
    prot: 4.5,
    carb: 25,
    fat: 2.1,
    tags: ["carb", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-mozarela-cheese",
    name: "Queijo Mozarela",
    kcal: 280,
    prot: 22,
    carb: 2.2,
    fat: 20,
    tags: ["protein", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-potato-baking",
    name: "Batatas para assar",
    kcal: 77,
    prot: 2,
    carb: 17,
    fat: 0.1,
    tags: ["carb", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-worcestershire-sauce",
    name: "Molho ingles",
    kcal: 78,
    prot: 0,
    carb: 19,
    fat: 0,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-coconut-milk-light",
    name: "Leite de coco light",
    kcal: 75,
    prot: 0.7,
    carb: 2.8,
    fat: 6.8,
    tags: ["fat", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-tomato",
    name: "Tomate",
    kcal: 18,
    prot: 0.9,
    carb: 3.9,
    fat: 0.2,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-shrimp",
    name: "Miolo de camarao",
    kcal: 99,
    prot: 24,
    carb: 0.2,
    fat: 0.3,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-squid",
    name: "Lulas / Chocos",
    kcal: 92,
    prot: 16,
    carb: 3,
    fat: 1.5,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-leek",
    name: "Alho frances",
    kcal: 61,
    prot: 1.5,
    carb: 14,
    fat: 0.3,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-black-olives",
    name: "Azeitonas pretas",
    kcal: 115,
    prot: 0.8,
    carb: 6,
    fat: 11,
    tags: ["fat", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-tofu",
    name: "Tofu",
    kcal: 76,
    prot: 8,
    carb: 2,
    fat: 4,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-tempeh",
    name: "Tempeh",
    kcal: 193,
    prot: 19,
    carb: 9,
    fat: 11,
    tags: ["protein", "main", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-seitan",
    name: "Seitan",
    kcal: 104,
    prot: 21,
    carb: 4,
    fat: 0.5,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-soy-granules",
    name: "Soja granulada desidratada",
    kcal: 350,
    prot: 50,
    carb: 30,
    fat: 1,
    tags: ["protein", "main", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-wrap-tortilla",
    name: "Wrap / Tortilha",
    kcal: 290,
    prot: 8,
    carb: 48,
    fat: 7,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-light-mayonnaise",
    name: "Maionese magra",
    kcal: 260,
    prot: 0.5,
    carb: 10,
    fat: 25,
    tags: ["fat", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-light-cream-cheese",
    name: "Queijo de barrar light",
    kcal: 150,
    prot: 10,
    carb: 5,
    fat: 10,
    tags: ["fat", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-pickles",
    name: "Pickles",
    kcal: 11,
    prot: 0.5,
    carb: 2,
    fat: 0,
    tags: ["carb", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-burger-bun",
    name: "Pao de hamburguer",
    kcal: 270,
    prot: 8,
    carb: 50,
    fat: 4,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-bread-roll",
    name: "Pao Biju / Carcaca",
    kcal: 270,
    prot: 9,
    carb: 52,
    fat: 2,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-pork-ham",
    name: "Fiambre de porco",
    kcal: 110,
    prot: 18,
    carb: 2,
    fat: 3,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-light-cheese-slice",
    name: "Queijo magro fatiado",
    kcal: 260,
    prot: 30,
    carb: 2,
    fat: 14,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-egg-whites",
    name: "Claras de ovo pasteurizadas",
    kcal: 50,
    prot: 11,
    carb: 1,
    fat: 0,
    tags: ["protein", "snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-fino-cerveja",
    name: "Fino / Cerveja (25cl)",
    kcal: 105,
    prot: 1.2,
    carb: 9,
    fat: 0,
    tags: ["carb", "snack", "cheat"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-ovomaltine-crunchy",
    name: "Barra Ovomaltine Crunchy (100g)",
    kcal: 514,
    prot: 7.6,
    carb: 62.2,
    fat: 25.6,
    tags: ["fat", "carb", "snack", "cheat"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-estrelitas",
    name: "Cereais Estrelitas",
    kcal: 376,
    prot: 7.5,
    carb: 74,
    fat: 4.5,
    tags: ["carb", "snack", "bulk"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-coffee-espresso",
    name: "Cafe Expresso",
    kcal: 2,
    prot: 0.1,
    carb: 0.3,
    fat: 0,
    tags: ["snack", "cut"],
    source: "manual",
    barcode: "",
  },
  {
    id: "seed-food-francesinha-sauce",
    name: "Molho de Francesinha (100ml)",
    kcal: 65,
    prot: 1,
    carb: 6,
    fat: 4,
    tags: ["fat", "snack", "cheat"],
    source: "manual",
    barcode: "",
  },
];

const seedRecipeDefinitions = [
  {
    id: "seed-recipe-chicken-rice-bowl",
    name: "Chicken Rice Bowl",
    items: [
      {
        id: "seed-recipe-chicken-rice-bowl-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-prego-pao",
        name: "5.5 Prego No Pao",
        items: [
          {
            id: "seed-recipe-prego-1",
            foodId: "seed-food-bread-roll",
            grams: 60,
          }, // Pão Biju
          {
            id: "seed-recipe-prego-2",
            foodId: "seed-food-beef-steak",
            grams: 80,
          }, // Bife magro 80g
          {
            id: "seed-recipe-prego-3",
            foodId: "seed-food-light-cheese-slice",
            grams: 20,
          }, // Aprox. 1 fatia
          {
            id: "seed-recipe-prego-4",
            foodId: "seed-food-pork-ham",
            grams: 30,
          }, // Fiambre
          { id: "seed-recipe-prego-5", foodId: "seed-food-mustard", grams: 8 },
          {
            id: "seed-recipe-prego-6",
            foodId: "seed-food-olive-oil",
            grams: 3,
          }, // Spray na frigideira
        ],
      },
      {
        id: "seed-recipe-wrap-atum",
        name: "5.6 Wrap De Atum",
        items: [
          {
            id: "seed-recipe-wrap-atum-1",
            foodId: "seed-food-wrap-tortilla",
            grams: 60,
          },
          {
            id: "seed-recipe-wrap-atum-2",
            foodId: "seed-food-canned-tuna-water",
            grams: 70,
          }, // Metade de uma lata
          {
            id: "seed-recipe-wrap-atum-3",
            foodId: "seed-food-light-mayonnaise",
            grams: 8,
          },
          {
            id: "seed-recipe-wrap-atum-4",
            foodId: "seed-food-carrot",
            grams: 20,
          },
          {
            id: "seed-recipe-wrap-atum-5",
            foodId: "seed-food-tomato",
            grams: 30,
          },
          {
            id: "seed-recipe-wrap-atum-6",
            foodId: "seed-food-onion",
            grams: 15,
          },
        ],
      },
      {
        id: "seed-recipe-tortilha-espanhola",
        name: "5.7 Tortilha Espanhola Individual",
        items: [
          {
            id: "seed-recipe-tortilha-1",
            foodId: "seed-food-eggs",
            grams: 100,
          }, // 2 ovos
          {
            id: "seed-recipe-tortilha-2",
            foodId: "seed-food-egg-whites",
            grams: 60,
          }, // Claras extra
          {
            id: "seed-recipe-tortilha-3",
            foodId: "seed-food-potato-baking",
            grams: 200,
          }, // Base de hidratos do plano
          {
            id: "seed-recipe-tortilha-4",
            foodId: "seed-food-onion",
            grams: 30,
          },
          {
            id: "seed-recipe-tortilha-5",
            foodId: "seed-food-spinach",
            grams: 30,
          }, // Vegetais a gosto
          {
            id: "seed-recipe-tortilha-6",
            foodId: "seed-food-olive-oil",
            grams: 5,
          }, // Spray frigideira antiaderente
        ],
      },
      {
        id: "seed-recipe-chicken-rice-bowl-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-chicken-rice-bowl-3",
        foodId: "seed-food-broccoli",
        grams: 120,
      },
      {
        id: "seed-recipe-chicken-rice-bowl-4",
        foodId: "seed-food-olive-oil",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-protein-oats",
    name: "Protein Oats Fit",
    items: [
      { id: "seed-recipe-protein-oats-1", foodId: "seed-food-oats", grams: 60 },
      {
        id: "seed-recipe-protein-oats-2",
        foodId: "seed-food-greek-yogurt",
        grams: 200,
      },
      {
        id: "seed-recipe-protein-oats-3",
        foodId: "seed-food-banana",
        grams: 100,
      },
      { id: "seed-recipe-protein-oats-4", foodId: "seed-food-whey", grams: 30 },
      {
        id: "seed-recipe-protein-oats-5",
        foodId: "seed-food-peanut-butter",
        grams: 15,
      },
    ],
  },
  {
    id: "seed-recipe-salmon-plate",
    name: "Salmao com arroz",
    items: [
      {
        id: "seed-recipe-salmon-plate-1",
        foodId: "seed-food-salmon",
        grams: 150,
      },
      {
        id: "seed-recipe-salmon-plate-2",
        foodId: "seed-food-rice-cooked",
        grams: 160,
      },
      {
        id: "seed-recipe-salmon-plate-3",
        foodId: "seed-food-broccoli",
        grams: 120,
      },
    ],
  },
  {
    id: "seed-recipe-eggs-toast",
    name: "Eggs Toast Fit",
    items: [
      { id: "seed-recipe-eggs-toast-1", foodId: "seed-food-eggs", grams: 120 },
      {
        id: "seed-recipe-eggs-toast-2",
        foodId: "seed-food-wholegrain-bread",
        grams: 80,
      },
      {
        id: "seed-recipe-eggs-toast-3",
        foodId: "seed-food-greek-yogurt",
        grams: 170,
      },
    ],
  },
  {
    id: "seed-recipe-burger-fries",
    name: "Burger & Fries Flex",
    items: [
      {
        id: "seed-recipe-burger-fries-1",
        foodId: "seed-food-burger",
        grams: 180,
      },
      {
        id: "seed-recipe-burger-fries-2",
        foodId: "seed-food-fries",
        grams: 180,
      },
    ],
  },
  {
    id: "seed-recipe-pizza-night",
    name: "Pizza Night Flex",
    items: [
      {
        id: "seed-recipe-pizza-night-1",
        foodId: "seed-food-pizza",
        grams: 260,
      },
      {
        id: "seed-recipe-pizza-night-2",
        foodId: "seed-food-greek-yogurt",
        grams: 170,
      },
    ],
  },
  {
    id: "seed-recipe-donut-snack",
    name: "Donut Yogurt Snack",
    items: [
      { id: "seed-recipe-donut-snack-1", foodId: "seed-food-donut", grams: 75 },
      {
        id: "seed-recipe-donut-snack-2",
        foodId: "seed-food-greek-yogurt",
        grams: 170,
      },
    ],
  },
  {
    id: "seed-recipe-chicken-rice-bowl",
    name: "Chicken Rice Bowl",
    items: [
      {
        id: "seed-recipe-chicken-rice-bowl-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-chicken-rice-bowl-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-chicken-rice-bowl-3",
        foodId: "seed-food-broccoli",
        grams: 120,
      },
      {
        id: "seed-recipe-chicken-rice-bowl-4",
        foodId: "seed-food-olive-oil",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-pequeno-almoco-classico",
    name: "Pequeno-almoco Classico",
    items: [
      {
        id: "seed-recipe-pa-classico-1",
        foodId: "seed-food-eggs",
        grams: 100, // aprox. 2 ovos
      },
      {
        id: "seed-recipe-pa-classico-2",
        foodId: "seed-food-wholegrain-bread",
        grams: 50, // aprox. 2 fatias
      },
      {
        id: "seed-recipe-pa-classico-3",
        foodId: "seed-food-banana",
        grams: 100, // aprox. 1 banana média
      },
      {
        id: "seed-recipe-pa-classico-4",
        foodId: "seed-food-semi-skimmed-milk",
        grams: 150, // meia de leite
      },
    ],
  },
  {
    id: "seed-recipe-almoco-peixe-limpo",
    name: "Almoco de Peixe Limpo",
    items: [
      {
        id: "seed-recipe-peixe-limpo-1",
        foodId: "seed-food-hake-cooked",
        grams: 160,
      },
      {
        id: "seed-recipe-peixe-limpo-2",
        foodId: "seed-food-rice-cooked",
        grams: 125,
      },
    ],
  },
  {
    id: "seed-recipe-papas-aveia-proteicas",
    name: "Papas de Aveia Proteicas",
    items: [
      {
        id: "seed-recipe-papas-aveia-1",
        foodId: "seed-food-oats",
        grams: 60,
      },
      {
        id: "seed-recipe-papas-aveia-2",
        foodId: "seed-food-semi-skimmed-milk",
        grams: 200,
      },
      {
        id: "seed-recipe-papas-aveia-3",
        foodId: "seed-food-whey",
        grams: 30,
      },
      {
        id: "seed-recipe-papas-aveia-4",
        foodId: "seed-food-peanut-butter",
        grams: 15,
      },
    ],
  },
  {
    id: "seed-recipe-jantar-bife-batata",
    name: "Jantar de Bife com Batata Doce",
    items: [
      {
        id: "seed-recipe-bife-batata-1",
        foodId: "seed-food-beef-steak",
        grams: 200,
      },
      {
        id: "seed-recipe-bife-batata-2",
        foodId: "seed-food-sweet-potato-cooked",
        grams: 200,
      },
      {
        id: "seed-recipe-bife-batata-3",
        foodId: "seed-food-spinach",
        grams: 100,
      },
      {
        id: "seed-recipe-bife-batata-4",
        foodId: "seed-food-olive-oil",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-lanche-iogurte-fruta",
    name: "Taca Iogurte Grego e Fruta",
    items: [
      {
        id: "seed-recipe-taca-iogurte-1",
        foodId: "seed-food-greek-yogurt",
        grams: 150,
      },
      {
        id: "seed-recipe-taca-iogurte-2",
        foodId: "seed-food-strawberries",
        grams: 100,
      },
      {
        id: "seed-recipe-taca-iogurte-3",
        foodId: "seed-food-walnuts",
        grams: 20,
      },
      {
        id: "seed-recipe-taca-iogurte-4",
        foodId: "seed-food-honey",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-combo-francesinha",
    name: "Combo Francesinha",
    items: [
      {
        id: "seed-recipe-combo-francesinha-1",
        foodId: "seed-food-francesinha",
        grams: 400, // Francesinha média
      },
      {
        id: "seed-recipe-combo-francesinha-2",
        foodId: "seed-food-fries",
        grams: 150, // Dose de batatas
      },
    ],
  },
  {
    id: "seed-recipe-pequeno-almoco-classico",
    name: "Pequeno-almoco Classico",
    items: [
      { id: "seed-recipe-pa-classico-1", foodId: "seed-food-eggs", grams: 100 }, // aprox. 2 ovos
      {
        id: "seed-recipe-pa-classico-2",
        foodId: "seed-food-wholegrain-bread",
        grams: 50,
      }, // aprox. 2 fatias
      {
        id: "seed-recipe-pa-classico-3",
        foodId: "seed-food-banana",
        grams: 100,
      }, // aprox. 1 banana média
      {
        id: "seed-recipe-pa-classico-4",
        foodId: "seed-food-semi-skimmed-milk",
        grams: 150,
      }, // meia de leite
    ],
  },
  {
    id: "seed-recipe-almoco-peixe-limpo",
    name: "Almoco de Peixe Limpo",
    items: [
      {
        id: "seed-recipe-peixe-limpo-1",
        foodId: "seed-food-hake-cooked",
        grams: 160,
      },
      {
        id: "seed-recipe-peixe-limpo-2",
        foodId: "seed-food-rice-cooked",
        grams: 125,
      },
    ],
  },
  {
    id: "seed-recipe-frango-estufado-arroz",
    name: "1.1 Peito De Frango Estufado Com Arroz",
    items: [
      {
        id: "seed-recipe-frango-estufado-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-frango-estufado-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-frango-estufado-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      }, // conforme detalhe foto
      {
        id: "seed-recipe-frango-estufado-4",
        foodId: "seed-food-onion",
        grams: 50,
      },
      {
        id: "seed-recipe-frango-estufado-5",
        foodId: "seed-food-garlic",
        grams: 5,
      },
      {
        id: "seed-recipe-frango-estufado-6",
        foodId: "seed-food-carrot",
        grams: 80,
      },
    ],
  },
  {
    id: "seed-recipe-frango-salteado-arroz",
    name: "1.2 Peito De Frango Salteado Com Arroz",
    items: [
      {
        id: "seed-recipe-frango-salteado-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-frango-salteado-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-frango-salteado-3",
        foodId: "seed-food-carrot",
        grams: 50,
      },
      {
        id: "seed-recipe-frango-salteado-4",
        foodId: "seed-food-bell-pepper",
        grams: 50,
      },
      {
        id: "seed-recipe-frango-salteado-5",
        foodId: "seed-food-mushrooms",
        grams: 50,
      },
      {
        id: "seed-recipe-frango-salteado-6",
        foodId: "seed-food-broccoli",
        grams: 50,
      },
      {
        id: "seed-recipe-frango-salteado-7",
        foodId: "seed-food-olive-oil",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-massa-natas-frango",
    name: "1.3 Massa Com Natas E Frango (Alfredo's)",
    items: [
      {
        id: "seed-recipe-massa-natas-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-massa-natas-2",
        foodId: "seed-food-pasta-cooked",
        grams: 200,
      },
      {
        id: "seed-recipe-massa-natas-3",
        foodId: "seed-food-soy-cream-light",
        grams: 60,
      }, // conforme detalhe foto
      { id: "seed-recipe-massa-natas-4", foodId: "seed-food-garlic", grams: 5 },
      {
        id: "seed-recipe-massa-natas-5",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-massa-frango-tomate",
    name: "1.4 Massa De Frango",
    items: [
      {
        id: "seed-recipe-massa-frango-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-massa-frango-2",
        foodId: "seed-food-pasta-cooked",
        grams: 200,
      },
      {
        id: "seed-recipe-massa-frango-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      }, // conforme detalhe foto
      {
        id: "seed-recipe-massa-frango-4",
        foodId: "seed-food-onion",
        grams: 50,
      },
      {
        id: "seed-recipe-massa-frango-5",
        foodId: "seed-food-garlic",
        grams: 5,
      },
      {
        id: "seed-recipe-massa-frango-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-noodles-salteados-frango",
    name: "1.5 Noodles Salteados Com Frango",
    items: [
      {
        id: "seed-recipe-noodles-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-noodles-2",
        foodId: "seed-food-noodles-cooked",
        grams: 200,
      },
      { id: "seed-recipe-noodles-3", foodId: "seed-food-carrot", grams: 40 },
      {
        id: "seed-recipe-noodles-4",
        foodId: "seed-food-bell-pepper",
        grams: 40,
      },
      { id: "seed-recipe-noodles-5", foodId: "seed-food-mushrooms", grams: 40 },
      { id: "seed-recipe-noodles-6", foodId: "seed-food-olive-oil", grams: 10 },
    ],
  },
  {
    id: "seed-recipe-frango-recheado-mozarela",
    name: "1.6 Peito De Frango Recheado Com Mozarela",
    items: [
      {
        id: "seed-recipe-frango-recheado-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-frango-recheado-2",
        foodId: "seed-food-mozarela-cheese",
        grams: 60,
      }, // conforme detalhe foto
      {
        id: "seed-recipe-frango-recheado-3",
        foodId: "seed-food-tomato",
        grams: 50,
      },
      {
        id: "seed-recipe-frango-recheado-4",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-frango-assado-batata",
    name: "1.7 Peito/Perna De Frango Assado Com Batata Assada",
    items: [
      {
        id: "seed-recipe-frango-assado-1",
        foodId: "seed-food-chicken-breast",
        grams: 250,
      }, // porção maior com osso
      {
        id: "seed-recipe-frango-assado-2",
        foodId: "seed-food-potato-baking",
        grams: 200,
      }, // gramas cruas
      {
        id: "seed-recipe-frango-assado-3",
        foodId: "seed-food-onion",
        grams: 50,
      },
      {
        id: "seed-recipe-frango-assado-4",
        foodId: "seed-food-garlic",
        grams: 10,
      },
      {
        id: "seed-recipe-frango-assado-5",
        foodId: "seed-food-olive-oil",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-bifinhos-champignon",
    name: "1.8 Bifinhos A Champignon",
    items: [
      {
        id: "seed-recipe-bifinhos-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-bifinhos-2",
        foodId: "seed-food-mushrooms",
        grams: 100,
      },
      {
        id: "seed-recipe-bifinhos-3",
        foodId: "seed-food-soy-cream-light",
        grams: 60,
      }, // conforme detalhe foto
      { id: "seed-recipe-bifinhos-4", foodId: "seed-food-onion", grams: 30 },
      { id: "seed-recipe-bifinhos-5", foodId: "seed-food-garlic", grams: 5 },
      {
        id: "seed-recipe-bifinhos-6",
        foodId: "seed-food-worcestershire-sauce",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-bifinhos-frango-legumes",
    name: "1.9 Bifinhos De Frango Com Legumes E Arroz",
    items: [
      {
        id: "seed-recipe-bifinhos-legumes-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-bifinhos-legumes-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-bifinhos-legumes-3",
        foodId: "seed-food-bell-pepper",
        grams: 50,
      },
      {
        id: "seed-recipe-bifinhos-legumes-4",
        foodId: "seed-food-mushrooms",
        grams: 50,
      },
      {
        id: "seed-recipe-bifinhos-legumes-5",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-bifinhos-legumes-6",
        foodId: "seed-food-tomato-paste",
        grams: 30,
      },
    ],
  },
  {
    id: "seed-recipe-curry-frango-arroz",
    name: "1.10 Curry De Frango Com Arroz",
    items: [
      {
        id: "seed-recipe-curry-frango-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-curry-frango-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-curry-frango-3",
        foodId: "seed-food-coconut-milk-light",
        grams: 60,
      }, // conforme detalhe foto
      {
        id: "seed-recipe-curry-frango-4",
        foodId: "seed-food-tomato-paste",
        grams: 15,
      }, // conforme detalhe foto
      {
        id: "seed-recipe-curry-frango-5",
        foodId: "seed-food-onion",
        grams: 50,
      },
      {
        id: "seed-recipe-curry-frango-6",
        foodId: "seed-food-garlic",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-arroz-tomate-frango",
    name: "1.11 Arroz De Tomate E Feijao Com Bife De Frango",
    items: [
      {
        id: "seed-recipe-arroz-tomate-1",
        foodId: "seed-food-chicken-breast",
        grams: 180,
      },
      {
        id: "seed-recipe-arroz-tomate-2",
        foodId: "seed-food-rice-cooked",
        grams: 120,
      }, // 20g extra permitidas pelo plano
      {
        id: "seed-recipe-arroz-tomate-3",
        foodId: "seed-food-red-beans-cooked",
        grams: 60,
      },
      {
        id: "seed-recipe-arroz-tomate-4",
        foodId: "seed-food-tomato",
        grams: 50,
      },
      {
        id: "seed-recipe-arroz-tomate-5",
        foodId: "seed-food-tomato-paste",
        grams: 30,
      },
      {
        id: "seed-recipe-arroz-tomate-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-carbonara-frango",
    name: "1.12 Carbonara De Frango",
    items: [
      {
        id: "seed-recipe-carbonara-1",
        foodId: "seed-food-chicken-breast",
        grams: 230,
      }, // 50g extras conforme plano
      {
        id: "seed-recipe-carbonara-2",
        foodId: "seed-recipe-carbonara-2",
        foodId: "seed-food-pasta-cooked",
        grams: 200,
      },
      { id: "seed-recipe-carbonara-3", foodId: "seed-food-bacon", grams: 15 }, // 15g s/ gordura visual
      { id: "seed-recipe-carbonara-4", foodId: "seed-food-eggs", grams: 50 }, // aprox. 1 ovo
      {
        id: "seed-recipe-carbonara-5",
        foodId: "seed-food-soy-cream-light",
        grams: 20,
      },
      {
        id: "seed-recipe-carbonara-6",
        foodId: "seed-food-parmesan-cheese",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-fried-rice-frango",
    name: "1.13 Fried Rice Arroz Frito Com Frango",
    items: [
      {
        id: "seed-recipe-fried-rice-1",
        foodId: "seed-food-chicken-breast",
        grams: 140,
      }, // menos 40g conforme plano
      {
        id: "seed-recipe-fried-rice-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      { id: "seed-recipe-fried-rice-3", foodId: "seed-food-eggs", grams: 50 }, // 1 ovo extra
      { id: "seed-recipe-fried-rice-4", foodId: "seed-food-carrot", grams: 30 },
      {
        id: "seed-recipe-fried-rice-5",
        foodId: "seed-food-bell-pepper",
        grams: 30,
      },
      {
        id: "seed-recipe-fried-rice-6",
        foodId: "seed-food-soy-sauce",
        grams: 15,
      },
      {
        id: "seed-recipe-fried-rice-7",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-bolonhesa",
    name: "2.1 Bolonhesa",
    items: [
      {
        id: "seed-recipe-bolonhesa-1",
        foodId: "seed-food-lean-ground-beef",
        grams: 180,
      },
      {
        id: "seed-recipe-bolonhesa-2",
        foodId: "seed-food-pasta-cooked",
        grams: 200,
      },
      {
        id: "seed-recipe-bolonhesa-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      {
        id: "seed-recipe-bolonhesa-4",
        foodId: "seed-food-light-mozzarella-grated",
        grams: 10,
      },
      { id: "seed-recipe-bolonhesa-5", foodId: "seed-food-onion", grams: 30 },
      {
        id: "seed-recipe-bolonhesa-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-bife-batata-arroz",
    name: "2.2 Bife Com Batata Frita e Arroz",
    items: [
      {
        id: "seed-recipe-bife-misto-1",
        foodId: "seed-food-beef-steak",
        grams: 180,
      },
      {
        id: "seed-recipe-bife-misto-2",
        foodId: "seed-food-potato-baking",
        grams: 70,
      }, // proporção mista da observação
      {
        id: "seed-recipe-bife-misto-3",
        foodId: "seed-food-rice-cooked",
        grams: 50,
      }, // proporção mista da observação
      {
        id: "seed-recipe-bife-misto-4",
        foodId: "seed-food-olive-oil",
        grams: 5,
      }, // spray
    ],
  },
  {
    id: "seed-recipe-chilli-vaca",
    name: "2.3 Chilli De Vaca",
    items: [
      {
        id: "seed-recipe-chilli-1",
        foodId: "seed-food-lean-ground-beef",
        grams: 180,
      },
      {
        id: "seed-recipe-chilli-2",
        foodId: "seed-food-red-beans-cooked",
        grams: 100,
      },
      {
        id: "seed-recipe-chilli-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      {
        id: "seed-recipe-chilli-4",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      { id: "seed-recipe-chilli-5", foodId: "seed-food-onion", grams: 30 },
      { id: "seed-recipe-chilli-6", foodId: "seed-food-olive-oil", grams: 5 },
    ],
  },
  {
    id: "seed-recipe-loaded-fries",
    name: "2.4 Loaded Fries - Batata Frita Com Carne Picada",
    items: [
      {
        id: "seed-recipe-loaded-fries-1",
        foodId: "seed-food-lean-ground-beef",
        grams: 180,
      },
      {
        id: "seed-recipe-loaded-fries-2",
        foodId: "seed-food-potato-baking",
        grams: 200,
      }, // base
      {
        id: "seed-recipe-loaded-fries-3",
        foodId: "seed-food-tomato-paste",
        grams: 50,
      },
      {
        id: "seed-recipe-loaded-fries-4",
        foodId: "seed-food-light-mozzarella-grated",
        grams: 10,
      },
      {
        id: "seed-recipe-loaded-fries-5",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-strogonoff-vaca",
    name: "2.5 Strogonoff De Vaca Com Arroz",
    items: [
      {
        id: "seed-recipe-strogonoff-1",
        foodId: "seed-food-beef-steak",
        grams: 180,
      },
      {
        id: "seed-recipe-strogonoff-2",
        foodId: "seed-food-mushrooms",
        grams: 80,
      },
      {
        id: "seed-recipe-strogonoff-3",
        foodId: "seed-food-soy-cream-light",
        grams: 60,
      },
      { id: "seed-recipe-strogonoff-4", foodId: "seed-food-mustard", grams: 6 },
      { id: "seed-recipe-strogonoff-5", foodId: "seed-food-ketchup", grams: 8 },
      {
        id: "seed-recipe-strogonoff-6",
        foodId: "seed-food-worcestershire-sauce",
        grams: 5,
      }, // pitada
      {
        id: "seed-recipe-strogonoff-7",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
    ],
  },
  {
    id: "seed-recipe-carne-estufada-arroz",
    name: "2.6 Carne Estufada Com Arroz (Misto)",
    items: [
      {
        id: "seed-recipe-carne-estufada-1",
        foodId: "seed-food-beef-steak",
        grams: 180,
      },
      {
        id: "seed-recipe-carne-estufada-2",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      {
        id: "seed-recipe-carne-estufada-3",
        foodId: "seed-food-carrot",
        grams: 50,
      },
      {
        id: "seed-recipe-carne-estufada-4",
        foodId: "seed-food-potato-baking",
        grams: 70,
      }, // proporção de acompanhamento misto
      {
        id: "seed-recipe-carne-estufada-5",
        foodId: "seed-food-rice-cooked",
        grams: 50,
      }, // proporção de acompanhamento misto
      {
        id: "seed-recipe-carne-estufada-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-lombo-porco-mostarda",
    name: "2.7 Lombo De Porco Com Mostarda E Arroz",
    items: [
      {
        id: "seed-recipe-lombo-porco-1",
        foodId: "seed-food-pork-loin",
        grams: 180,
      },
      {
        id: "seed-recipe-lombo-porco-2",
        foodId: "seed-food-mustard",
        grams: 10,
      },
      {
        id: "seed-recipe-lombo-porco-3",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
    ],
  },
  {
    id: "seed-recipe-almondegas-massa",
    name: "2.8 Almondegas Com Massa/Arroz",
    items: [
      {
        id: "seed-recipe-almondegas-1",
        foodId: "seed-food-lean-ground-beef",
        grams: 180,
      },
      {
        id: "seed-recipe-almondegas-2",
        foodId: "seed-food-pasta-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-almondegas-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      { id: "seed-recipe-almondegas-4", foodId: "seed-food-onion", grams: 30 },
      {
        id: "seed-recipe-almondegas-5",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-bacalhau-natas",
    name: "3.1 Bacalhau Com Natas",
    items: [
      {
        id: "seed-recipe-bacalhau-natas-1",
        foodId: "seed-food-cod-raw",
        grams: 180,
      },
      {
        id: "seed-recipe-bacalhau-natas-2",
        foodId: "seed-food-potato-baking",
        grams: 200,
      },
      {
        id: "seed-recipe-bacalhau-natas-3",
        foodId: "seed-food-soy-cream-light",
        grams: 60,
      },
      {
        id: "seed-recipe-bacalhau-natas-4",
        foodId: "seed-food-light-mozzarella-grated",
        grams: 10,
      },
      {
        id: "seed-recipe-bacalhau-natas-5",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-bacalhau-natas-6",
        foodId: "seed-food-carrot",
        grams: 30,
      },
    ],
  },
  {
    id: "seed-recipe-massada-camaroes",
    name: "3.2 Massada De Camaroes",
    items: [
      {
        id: "seed-recipe-massada-camaroes-1",
        foodId: "seed-food-shrimp",
        grams: 180,
      },
      {
        id: "seed-recipe-massada-camaroes-2",
        foodId: "seed-food-pasta-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-massada-camaroes-3",
        foodId: "seed-food-tomato-paste",
        grams: 50,
      },
      {
        id: "seed-recipe-massada-camaroes-4",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-massada-camaroes-5",
        foodId: "seed-food-garlic",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-salmao-batata",
    name: "3.3 Posta De Salmao Com Batata",
    items: [
      {
        id: "seed-recipe-salmao-batata-1",
        foodId: "seed-food-salmon",
        grams: 150,
      }, // Peixe gordo, dose ligeiramente menor
      {
        id: "seed-recipe-salmao-batata-2",
        foodId: "seed-food-potato-baking",
        grams: 200,
      },
      {
        id: "seed-recipe-salmao-batata-3",
        foodId: "seed-food-broccoli",
        grams: 100,
      },
    ],
  },
  {
    id: "seed-recipe-lulas-estufadas",
    name: "3.4 Lulas/Chocos Estufadas Com Arroz",
    items: [
      {
        id: "seed-recipe-lulas-estufadas-1",
        foodId: "seed-food-squid",
        grams: 180,
      },
      {
        id: "seed-recipe-lulas-estufadas-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-lulas-estufadas-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      {
        id: "seed-recipe-lulas-estufadas-4",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-lulas-estufadas-5",
        foodId: "seed-food-carrot",
        grams: 30,
      },
      {
        id: "seed-recipe-lulas-estufadas-6",
        foodId: "seed-food-bell-pepper",
        grams: 30,
      },
    ],
  },
  {
    id: "seed-recipe-lulas-grelhadas",
    name: "3.5 Lulas Grelhadas Com Batata Cozida",
    items: [
      {
        id: "seed-recipe-lulas-grelhadas-1",
        foodId: "seed-food-squid",
        grams: 180,
      },
      {
        id: "seed-recipe-lulas-grelhadas-2",
        foodId: "seed-food-potato-baking",
        grams: 200,
      },
      {
        id: "seed-recipe-lulas-grelhadas-3",
        foodId: "seed-food-broccoli",
        grams: 100,
      },
      {
        id: "seed-recipe-lulas-grelhadas-4",
        foodId: "seed-food-garlic",
        grams: 5,
      },
      {
        id: "seed-recipe-lulas-grelhadas-5",
        foodId: "seed-food-olive-oil",
        grams: 5,
      }, // spray azeite
    ],
  },
  {
    id: "seed-recipe-bacalhau-bras-fit",
    name: "3.6 Bacalhau A Bras Fit",
    items: [
      { id: "seed-recipe-bras-fit-1", foodId: "seed-food-cod-raw", grams: 180 },
      {
        id: "seed-recipe-bras-fit-2",
        foodId: "seed-food-potato-baking",
        grams: 200,
      },
      { id: "seed-recipe-bras-fit-3", foodId: "seed-food-eggs", grams: 25 }, // O plano diz 1 ovo para 2 doses (logo ~25g)
      { id: "seed-recipe-bras-fit-4", foodId: "seed-food-onion", grams: 30 },
      { id: "seed-recipe-bras-fit-5", foodId: "seed-food-leek", grams: 30 },
      {
        id: "seed-recipe-bras-fit-6",
        foodId: "seed-food-black-olives",
        grams: 10,
      },
    ],
  },
  {
    id: "seed-recipe-fried-rice-camarao",
    name: "3.7 Fried Rice Arroz Frito De Camarao",
    items: [
      {
        id: "seed-recipe-fried-rice-camarao-1",
        foodId: "seed-food-shrimp",
        grams: 140,
      }, // Menos 40g conforme o plano
      {
        id: "seed-recipe-fried-rice-camarao-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-fried-rice-camarao-3",
        foodId: "seed-food-eggs",
        grams: 50,
      }, // Leva 1 ovo inteiro
      {
        id: "seed-recipe-fried-rice-camarao-4",
        foodId: "seed-food-carrot",
        grams: 30,
      },
      {
        id: "seed-recipe-fried-rice-camarao-5",
        foodId: "seed-food-bell-pepper",
        grams: 30,
      },
      {
        id: "seed-recipe-fried-rice-camarao-6",
        foodId: "seed-food-soy-sauce",
        grams: 15,
      },
      {
        id: "seed-recipe-fried-rice-camarao-7",
        foodId: "seed-food-onion",
        grams: 30,
      },
    ],
  },
  {
    id: "seed-recipe-peixe-pimentos",
    name: "3.8 Pescada/Tilapia Com Pimentos E Arroz",
    items: [
      {
        id: "seed-recipe-peixe-pimentos-1",
        foodId: "seed-food-hake-cooked",
        grams: 180,
      }, // Pescada como peixe magro base
      {
        id: "seed-recipe-peixe-pimentos-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-peixe-pimentos-3",
        foodId: "seed-food-bell-pepper",
        grams: 50,
      },
      {
        id: "seed-recipe-peixe-pimentos-4",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      {
        id: "seed-recipe-peixe-pimentos-5",
        foodId: "seed-food-onion",
        grams: 30,
      },
    ],
  },
  {
    id: "seed-recipe-peixe-assado",
    name: "3.9 Peixe Assado",
    items: [
      {
        id: "seed-recipe-peixe-assado-1",
        foodId: "seed-food-hake-cooked",
        grams: 180,
      }, // Pescada/Dourada
      {
        id: "seed-recipe-peixe-assado-2",
        foodId: "seed-food-potato-baking",
        grams: 200,
      },
      {
        id: "seed-recipe-peixe-assado-3",
        foodId: "seed-food-onion",
        grams: 50,
      },
      {
        id: "seed-recipe-peixe-assado-4",
        foodId: "seed-food-tomato",
        grams: 50,
      },
      {
        id: "seed-recipe-peixe-assado-5",
        foodId: "seed-food-bell-pepper",
        grams: 50,
      },
      {
        id: "seed-recipe-peixe-assado-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      }, // spray azeite
    ],
  },
  {
    id: "seed-recipe-massa-atum",
    name: "3.10 Massa De Atum",
    items: [
      {
        id: "seed-recipe-massa-atum-1",
        foodId: "seed-food-canned-tuna-water",
        grams: 150,
      }, // Aprox. 2 latas escorridas
      {
        id: "seed-recipe-massa-atum-2",
        foodId: "seed-food-pasta-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-massa-atum-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      { id: "seed-recipe-massa-atum-4", foodId: "seed-food-onion", grams: 30 },
      {
        id: "seed-recipe-massa-atum-5",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-curry-tofu",
    name: "4.1 Curry De Tofu/Tempeh",
    items: [
      { id: "seed-recipe-curry-tofu-1", foodId: "seed-food-tofu", grams: 180 },
      {
        id: "seed-recipe-curry-tofu-2",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-curry-tofu-3",
        foodId: "seed-food-coconut-milk-light",
        grams: 60,
      },
      { id: "seed-recipe-curry-tofu-4", foodId: "seed-food-onion", grams: 30 },
      { id: "seed-recipe-curry-tofu-5", foodId: "seed-food-carrot", grams: 50 },
      {
        id: "seed-recipe-curry-tofu-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-bolonhesa-soja",
    name: "4.2 Bolonhesa De Soja",
    items: [
      {
        id: "seed-recipe-bolonhesa-soja-1",
        foodId: "seed-food-soy-granules",
        grams: 50,
      }, // Peso em cru desidratado
      {
        id: "seed-recipe-bolonhesa-soja-2",
        foodId: "seed-food-pasta-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-bolonhesa-soja-3",
        foodId: "seed-food-tomato-paste",
        grams: 60,
      },
      {
        id: "seed-recipe-bolonhesa-soja-4",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-bolonhesa-soja-5",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-arroz-feijao-tofu",
    name: "4.3 Arroz De Feijao Com Tofu/Tempeh/Seita",
    items: [
      {
        id: "seed-recipe-arroz-feijao-tofu-1",
        foodId: "seed-food-tofu",
        grams: 150,
      },
      {
        id: "seed-recipe-arroz-feijao-tofu-2",
        foodId: "seed-food-rice-cooked",
        grams: 120,
      }, // 20g extra por causa do feijão
      {
        id: "seed-recipe-arroz-feijao-tofu-3",
        foodId: "seed-food-red-beans-cooked",
        grams: 60,
      },
      {
        id: "seed-recipe-arroz-feijao-tofu-4",
        foodId: "seed-food-tomato-paste",
        grams: 30,
      },
      {
        id: "seed-recipe-arroz-feijao-tofu-5",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-arroz-feijao-tofu-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-chilli-vegan",
    name: "4.4 Chilli Vegan",
    items: [
      {
        id: "seed-recipe-chilli-vegan-1",
        foodId: "seed-food-soy-granules",
        grams: 50,
      }, // Peso em cru
      {
        id: "seed-recipe-chilli-vegan-2",
        foodId: "seed-food-red-beans-cooked",
        grams: 100,
      },
      {
        id: "seed-recipe-chilli-vegan-3",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-chilli-vegan-4",
        foodId: "seed-food-tomato-paste",
        grams: 50,
      },
      {
        id: "seed-recipe-chilli-vegan-5",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-chilli-vegan-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-fried-rice-vegetais",
    name: "4.5 Fried Rice De Vegetais",
    items: [
      {
        id: "seed-recipe-fried-rice-veg-1",
        foodId: "seed-food-rice-cooked",
        grams: 180,
      },
      {
        id: "seed-recipe-fried-rice-veg-2",
        foodId: "seed-food-eggs",
        grams: 100,
      }, // 2 ovos
      {
        id: "seed-recipe-fried-rice-veg-3",
        foodId: "seed-food-carrot",
        grams: 40,
      },
      {
        id: "seed-recipe-fried-rice-veg-4",
        foodId: "seed-food-bell-pepper",
        grams: 40,
      },
      {
        id: "seed-recipe-fried-rice-veg-5",
        foodId: "seed-food-onion",
        grams: 30,
      },
      {
        id: "seed-recipe-fried-rice-veg-6",
        foodId: "seed-food-olive-oil",
        grams: 5,
      },
    ],
  },
  {
    id: "seed-recipe-quiche-wrap",
    name: "5.1 Quiche Com Wrap",
    items: [
      {
        id: "seed-recipe-quiche-wrap-1",
        foodId: "seed-food-wrap-tortilla",
        grams: 40,
      },
      { id: "seed-recipe-quiche-wrap-2", foodId: "seed-food-eggs", grams: 100 }, // 2 ovos
      {
        id: "seed-recipe-quiche-wrap-3",
        foodId: "seed-food-light-mozzarella-grated",
        grams: 15,
      },
      {
        id: "seed-recipe-quiche-wrap-4",
        foodId: "seed-food-mushrooms",
        grams: 30,
      },
      {
        id: "seed-recipe-quiche-wrap-5",
        foodId: "seed-food-tomato",
        grams: 30,
      },
    ],
  },
  {
    id: "seed-recipe-tosta-pate-atum",
    name: "5.2 Tosta De Pate De Atum",
    items: [
      {
        id: "seed-recipe-tosta-atum-1",
        foodId: "seed-food-canned-tuna-water",
        grams: 85,
      }, // 1 lata
      {
        id: "seed-recipe-tosta-atum-2",
        foodId: "seed-food-wholegrain-bread",
        grams: 60,
      }, // Pão de forma integral
      { id: "seed-recipe-tosta-atum-3", foodId: "seed-food-eggs", grams: 50 }, // 1 ovo cozido
      {
        id: "seed-recipe-tosta-atum-4",
        foodId: "seed-food-light-mayonnaise",
        grams: 8,
      },
      { id: "seed-recipe-tosta-atum-5", foodId: "seed-food-onion", grams: 10 },
    ],
  },
  {
    id: "seed-recipe-pizza-calzone-wrap",
    name: "5.3 Pizza OU Calzone De Wrap",
    items: [
      {
        id: "seed-recipe-pizza-wrap-1",
        foodId: "seed-food-wrap-tortilla",
        grams: 60,
      },
      {
        id: "seed-recipe-pizza-wrap-2",
        foodId: "seed-food-tomato-paste",
        grams: 30,
      },
      {
        id: "seed-recipe-pizza-wrap-3",
        foodId: "seed-food-light-mozzarella-grated",
        grams: 40,
      },
      {
        id: "seed-recipe-pizza-wrap-4",
        foodId: "seed-food-olive-oil",
        grams: 3,
      }, // Spray
    ],
  },
  {
    id: "seed-recipe-big-mac-saudavel",
    name: "5.4 Big Mac Saudavel",
    items: [
      {
        id: "seed-recipe-big-mac-1",
        foodId: "seed-food-burger-bun",
        grams: 60,
      }, // Pão
      {
        id: "seed-recipe-big-mac-2",
        foodId: "seed-food-lean-ground-beef",
        grams: 100,
      }, // Carne
      { id: "seed-recipe-big-mac-3", foodId: "seed-food-pickles", grams: 20 }, // 5 fatias de pickle
      { id: "seed-recipe-big-mac-4", foodId: "seed-food-ketchup", grams: 8 },
      { id: "seed-recipe-big-mac-5", foodId: "seed-food-mustard", grams: 6 },
      {
        id: "seed-recipe-big-mac-6",
        foodId: "seed-food-light-mayonnaise",
        grams: 6,
      },
      {
        id: "seed-recipe-big-mac-7",
        foodId: "seed-food-light-mozzarella-grated",
        grams: 10,
      }, // Equivalente a 1/2 fatia
      { id: "seed-recipe-big-mac-8", foodId: "seed-food-onion", grams: 10 },
      { id: "seed-recipe-big-mac-9", foodId: "seed-food-olive-oil", grams: 3 }, // Spray
    ],
  },
];

function calculateRecipeTotals(items) {
  return items.reduce(
    (acc, item) => {
      const food = seedDefaultFoods.find(
        (candidate) => candidate.id === item.foodId,
      );
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
  const shouldSeedFoods =
    !Array.isArray(currentState.foods) || currentState.foods.length === 0;
  const nextFoods = shouldSeedFoods
    ? seedDefaultFoods.map((food) => ({ ...food }))
    : currentState.foods;
  const hasSeedFoodsAvailable = seedDefaultFoods.every((seedFood) =>
    nextFoods.some((food) => food.id === seedFood.id),
  );
  const shouldSeedRecipes =
    (!Array.isArray(currentState.recipes) ||
      currentState.recipes.length === 0) &&
    hasSeedFoodsAvailable;

  return {
    ...(shouldSeedFoods
      ? { foods: seedDefaultFoods.map((food) => ({ ...food })) }
      : {}),
    ...(shouldSeedRecipes
      ? {
          recipes: seedDefaultRecipes.map((recipe) => ({
            ...recipe,
            items: recipe.items.map((item) => ({ ...item })),
            totals: { ...recipe.totals },
          })),
        }
      : {}),
  };
}
