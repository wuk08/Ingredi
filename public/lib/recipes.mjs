import { DEMO_RECIPES, matchRecipes, normalizeIngredient } from "./domain.mjs";
const extras = [
  { id: "bibimbap", name: "Bibimbap", description: "A colorful bowl that makes a little of everything go further.", ingredients: ["cooked rice", "spinach", "eggs", "carrot", "gochujang"], instructions: ["Cook the rice according to the package.", "Sauté the spinach and carrot separately until tender.", "Fry the eggs until set. Arrange everything over rice and serve with gochujang."], cook_minutes: 25 },
  { id: "jjigae", name: "Kimchi jjigae", description: "A warming Korean stew for the odds and ends in your fridge.", ingredients: ["kimchi", "tofu", "green onion", "onion"], instructions: ["Simmer chopped kimchi and onion in water or vegetable stock for 10 minutes.", "Add cubed tofu and simmer until heated through.", "Finish with sliced green onion and serve hot."], cook_minutes: 35 },
  { id: "curry", name: "Golden vegetable curry", description: "A bright, easy supper for your extra vegetables.", ingredients: ["carrot", "spinach", "onion", "coconut milk"], instructions: ["Sauté chopped onion with curry powder.", "Add carrot and coconut milk; simmer until the carrot is tender.", "Stir in spinach until wilted and season to taste."], cook_minutes: 25 }
];
const metadata = {
  "spinach & cheddar omelette": { tags: ["Vegetarian", "High protein"], servings: 2, cuisine: "Everyday" },
  "chicken & spinach skillet": { tags: ["High protein"], servings: 2, cuisine: "Everyday" },
  "kimchi fried rice": { tags: ["Korean", "Spicy"], servings: 2, cuisine: "Korean" },
  bibimbap: { tags: ["Korean", "Vegetarian", "Spicy"], servings: 2, cuisine: "Korean" },
  "kimchi jjigae": { tags: ["Korean", "Spicy", "Vegetarian"], servings: 2, cuisine: "Korean" },
  "golden vegetable curry": { tags: ["Vegetarian", "Spicy"], servings: 2, cuisine: "Indian-inspired" }
};
const recipeKey = (r) => r.name.trim().toLowerCase();
function catalog(loaded = []) {
  const merged = new Map([...DEMO_RECIPES, ...extras, ...loaded].map((r) => [recipeKey(r), r]));
  return [...merged.values()].map((r) => ({ ...r, key: recipeKey(r), difficulty: "Easy", ...metadata[recipeKey(r)], tags: metadata[recipeKey(r)]?.tags || [] }));
}
function discover(recipes, pantry, { search = "", tags = [], preferences = [] } = {}) {
  const query = search.trim().toLowerCase();
  return matchRecipes(recipes, pantry).filter((r) => (!query || [r.name, ...r.ingredients.map((i) => typeof i === "string" ? i : i.name)].join(" ").toLowerCase().includes(query)) && tags.every((t) => t === "Under 20 min" ? r.cook_minutes <= 20 : r.tags.includes(t))).sort((a, b) => a.missing.length - b.missing.length || b.tags.filter((t) => preferences.includes(t)).length - a.tags.filter((t) => preferences.includes(t)).length);
}
function hasIngredient(pantry, name) {
  return pantry.some((i) => normalizeIngredient(i.name) === normalizeIngredient(name));
}
const preferenceOptions = ["Korean", "Vegetarian", "Under 20 min", "High protein", "Spicy"];
export {
  catalog,
  discover,
  hasIngredient,
  preferenceOptions,
  recipeKey
};
