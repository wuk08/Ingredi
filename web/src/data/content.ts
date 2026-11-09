import type { PersonaName } from "./people";
import type { IllustrationName } from "../components/Illustration";
import { photos } from "../assets/photos";

export const recommended = [
  { id: "kimchi-fried-rice", name: "Kimchi Fried Rice", photo: photos["kimchi-fried-rice"], time: "20 min", tag: "Uses 4 of your items" },
  { id: "spinach-tofu-bowl", name: "Spinach Tofu Bowl", photo: photos["spinach-tofu-bowl"], time: "15 min", tag: "Expiring soon" },
  { id: "egg-drop-soup", name: "Egg Drop Soup", photo: photos["egg-drop-soup"], time: "10 min", tag: "Quick" },
  { id: "bibimbap", name: "Bibimbap", photo: photos["bibimbap"], time: "25 min", tag: "Uses 7 of your items" },
];

export const groups: { title: string; date: string; menu: string; count: string; people: PersonaName[] }[] = [
  { title: "Korean Food Week", date: "11/6/2026", menu: "Bibimbap, Spicy Pork, Fried Rice", count: "3/4", people: ["Jack Lee", "Mason Mei", "Ari Kim"] },
  { title: "Veggie Batch Prep", date: "11/9/2026", menu: "Curry, Roasted Veg, Lentil Soup", count: "2/5", people: ["Priya R.", "Leo S."] },
];

export const nearbyPosts: { by: PersonaName; type: string; text: string; cta: string }[] = [
  { by: "Jack Lee", type: "Available · Free", text: "Anyone wants free avocados?", cta: "Share Food" },
  { by: "Mason Mei", type: "Wanted", text: "I need two eggs!!", cta: "Offer" },
];

export const fridge: { name: string; exp: string; art: IllustrationName }[] = [
  { name: "Eggs", exp: "5d", art: "eggs" },
  { name: "Spinach", exp: "2d", art: "spinach" },
  { name: "Tofu", exp: "3d", art: "tofu" },
  { name: "Rice", exp: "30d", art: "rice" },
  { name: "Kimchi", exp: "14d", art: "kimchi" },
];

export const randomPicks = ["Kimchi Jjigae", "Shakshuka", "Avocado Toast", "Japchae", "Cheesy Tomato Omelette"];

export const forYou = [
  { name: "Bibimbap", photo: photos["bibimbap"] },
  { name: "Spicy Pork Stir-fry", photo: photos["spicy-pork"] },
];

export const clearFridge = [
  { name: "Spinach Egg Scramble", photo: photos["spinach-egg-scramble"], meta: "10 min · Easy", uses: "Uses 3 expiring items" },
  { name: "Kimchi Tofu Soup", photo: photos["kimchi-tofu-soup"], meta: "20 min · Easy", uses: "Uses 2 expiring items" },
];

export const preferences = ["Korean", "Vegetarian", "Under 20 min", "High protein", "Spicy"];

export type RecipeData = {
  name: string; photo: string; meta: string[];
  ingredients: { name: string; importance: "Essential" | "Recommended" | "Optional"; have: boolean; sub: string }[];
  steps: string[];
};

/** Full recipes, keyed by the id used in the URL (/recipe/:id). */
export const recipes: Record<string, RecipeData> = {
  bibimbap: {
    name: "Bibimbap",
    photo: photos["bibimbap"],
    meta: ["25 min", "2 servings", "Easy", "Korean"],
    ingredients: [
      { name: "Cooked rice", importance: "Essential", have: true, sub: "" },
      { name: "Spinach", importance: "Essential", have: true, sub: "" },
      { name: "Eggs", importance: "Essential", have: true, sub: "" },
      { name: "Gochujang", importance: "Essential", have: false, sub: "sriracha + miso" },
      { name: "Bean sprouts", importance: "Optional", have: false, sub: "shredded cabbage" },
      { name: "Carrot", importance: "Optional", have: true, sub: "" },
      { name: "Sesame oil", importance: "Recommended", have: true, sub: "" },
      { name: "Garlic", importance: "Recommended", have: true, sub: "" },
      { name: "Soy sauce", importance: "Recommended", have: true, sub: "" },
    ],
    steps: [
      "Blanch spinach and bean sprouts; season each with sesame oil, garlic and a pinch of salt.",
      "Julienne the carrot and sauté briefly.",
      "Fry the eggs sunny-side up.",
      "Arrange vegetables over warm rice, top with egg and gochujang. Mix and enjoy.",
    ],
  },
  "kimchi-fried-rice": {
    name: "Kimchi Fried Rice",
    photo: photos["kimchi-fried-rice"],
    meta: ["20 min", "2 servings", "Easy", "Korean"],
    ingredients: [
      { name: "Cooked rice (day-old)", importance: "Essential", have: true, sub: "" },
      { name: "Kimchi", importance: "Essential", have: true, sub: "" },
      { name: "Eggs", importance: "Essential", have: true, sub: "" },
      { name: "Gochujang", importance: "Recommended", have: false, sub: "sriracha + miso" },
      { name: "Green onion", importance: "Recommended", have: false, sub: "chives or white onion" },
      { name: "Sesame oil", importance: "Recommended", have: true, sub: "" },
      { name: "Soy sauce", importance: "Optional", have: false, sub: "a pinch of salt" },
      { name: "Bacon or Spam", importance: "Optional", have: false, sub: "diced tofu" },
    ],
    steps: [
      "Chop the kimchi into small pieces and keep 2 tbsp of its juice.",
      "Fry the bacon or Spam (if using) in a hot pan until crisp, then add the kimchi and cook 3 minutes.",
      "Add the rice, kimchi juice and gochujang. Press and toss until every grain is red and starting to crisp.",
      "Turn off the heat and stir in sesame oil and sliced green onion.",
      "Top each bowl with a sunny-side-up egg.",
    ],
  },
  "spinach-tofu-bowl": {
    name: "Spinach Tofu Bowl",
    photo: photos["spinach-tofu-bowl"],
    meta: ["15 min", "2 servings", "Easy", "Vegetarian"],
    ingredients: [
      { name: "Firm tofu", importance: "Essential", have: true, sub: "" },
      { name: "Spinach", importance: "Essential", have: true, sub: "" },
      { name: "Cooked rice", importance: "Essential", have: true, sub: "" },
      { name: "Soy sauce", importance: "Recommended", have: true, sub: "" },
      { name: "Garlic", importance: "Recommended", have: false, sub: "garlic powder" },
      { name: "Sesame oil", importance: "Recommended", have: true, sub: "" },
      { name: "Green onion", importance: "Optional", have: false, sub: "chives" },
      { name: "Sesame seeds", importance: "Optional", have: false, sub: "crushed peanuts" },
    ],
    steps: [
      "Pat the tofu dry and cut into cubes.",
      "Pan-fry the tofu in a little oil until golden on all sides, then splash with soy sauce.",
      "In the same pan, sauté garlic for 30 seconds, add the spinach and cook until just wilted.",
      "Spoon rice into bowls, top with tofu and spinach, then drizzle with sesame oil and scatter sesame seeds and green onion.",
    ],
  },
  "egg-drop-soup": {
    name: "Egg Drop Soup",
    photo: photos["egg-drop-soup"],
    meta: ["10 min", "2 servings", "Easy", "Chinese"],
    ingredients: [
      { name: "Eggs", importance: "Essential", have: true, sub: "" },
      { name: "Chicken broth", importance: "Essential", have: false, sub: "water + bouillon cube" },
      { name: "Cornstarch", importance: "Recommended", have: false, sub: "flour" },
      { name: "Soy sauce", importance: "Recommended", have: true, sub: "" },
      { name: "White pepper", importance: "Recommended", have: true, sub: "" },
      { name: "Sesame oil", importance: "Optional", have: true, sub: "" },
      { name: "Green onion", importance: "Optional", have: false, sub: "chives" },
    ],
    steps: [
      "Bring the broth to a simmer with soy sauce and white pepper.",
      "Mix cornstarch with 2 tbsp cold water and stir it into the broth until slightly thick.",
      "Beat the eggs. Stir the soup in one direction and slowly pour the eggs in a thin stream to make ribbons.",
      "Turn off the heat, add a few drops of sesame oil and top with green onion.",
    ],
  },
  "kimchi-jjigae": {
    name: "Kimchi Jjigae",
    photo: photos["kimchi-jjigae"],
    meta: ["35 min", "2 servings", "Medium", "Korean"],
    ingredients: [
      { name: "Kimchi (well-fermented)", importance: "Essential", have: true, sub: "" },
      { name: "Tofu", importance: "Essential", have: true, sub: "" },
      { name: "Pork belly", importance: "Essential", have: false, sub: "canned tuna or mushrooms" },
      { name: "Gochugaru", importance: "Recommended", have: false, sub: "gochujang or chili flakes" },
      { name: "Garlic", importance: "Recommended", have: true, sub: "" },
      { name: "Green onion", importance: "Optional", have: false, sub: "chives" },
      { name: "Onion", importance: "Optional", have: false, sub: "leek" },
    ],
    steps: [
      "Cut the pork belly and kimchi into bite-size pieces.",
      "Sauté the pork in a pot until it browns, then add kimchi, garlic and gochugaru and stir-fry 3 minutes.",
      "Pour in 2 cups of water (and a splash of kimchi juice), bring to a boil and simmer 15 minutes.",
      "Add sliced onion and cubed tofu and simmer 5 more minutes.",
      "Finish with green onion. Serve bubbling with rice.",
    ],
  },
  "shakshuka": {
    name: "Shakshuka",
    photo: photos["shakshuka"],
    meta: ["25 min", "2 servings", "Easy", "Middle Eastern"],
    ingredients: [
      { name: "Eggs", importance: "Essential", have: true, sub: "" },
      { name: "Canned tomatoes", importance: "Essential", have: false, sub: "4 fresh tomatoes, chopped" },
      { name: "Onion", importance: "Essential", have: false, sub: "shallot or leek" },
      { name: "Bell pepper", importance: "Recommended", have: false, sub: "spinach" },
      { name: "Garlic", importance: "Recommended", have: true, sub: "" },
      { name: "Cumin & paprika", importance: "Recommended", have: false, sub: "chili flakes" },
      { name: "Feta", importance: "Optional", have: false, sub: "cheddar or tofu crumbles" },
    ],
    steps: [
      "Sauté diced onion and bell pepper in olive oil until soft, about 5 minutes.",
      "Add garlic, cumin and paprika and cook 1 minute.",
      "Pour in the tomatoes, season with salt and simmer until thick, about 10 minutes.",
      "Make 4 wells, crack an egg into each, cover and cook until the whites set.",
      "Crumble feta on top and serve with bread.",
    ],
  },
  "avocado-toast": {
    name: "Avocado Toast",
    photo: photos["three-avos"],
    meta: ["10 min", "1 serving", "Easy", "Breakfast"],
    ingredients: [
      { name: "Ripe avocado", importance: "Essential", have: false, sub: "ask a neighbor nearby" },
      { name: "Bread", importance: "Essential", have: false, sub: "rice cakes or crackers" },
      { name: "Lemon", importance: "Recommended", have: false, sub: "lime or a splash of vinegar" },
      { name: "Eggs", importance: "Optional", have: true, sub: "" },
    ],
    steps: [
      "Toast the bread until golden.",
      "Mash the avocado with lemon juice, salt and pepper.",
      "Spread it thickly on the toast.",
      "Top with a fried or poached egg and a pinch of chili flakes.",
    ],
  },
  "japchae": {
    name: "Japchae",
    photo: photos["japchae"],
    meta: ["45 min", "3 servings", "Medium", "Korean"],
    ingredients: [
      { name: "Sweet potato noodles", importance: "Essential", have: false, sub: "thin rice noodles" },
      { name: "Spinach", importance: "Essential", have: true, sub: "" },
      { name: "Soy sauce", importance: "Essential", have: true, sub: "" },
      { name: "Carrot", importance: "Recommended", have: false, sub: "zucchini" },
      { name: "Onion", importance: "Recommended", have: false, sub: "leek" },
      { name: "Mushrooms", importance: "Recommended", have: false, sub: "tofu strips" },
      { name: "Sesame oil", importance: "Recommended", have: true, sub: "" },
    ],
    steps: [
      "Boil the noodles 6 minutes, drain, rinse and toss with a little sesame oil.",
      "Blanch the spinach, squeeze dry and season with salt and sesame oil.",
      "Stir-fry onion, carrot and mushrooms separately until just tender.",
      "Mix noodles and vegetables with soy sauce, a spoon of sugar and more sesame oil.",
      "Toss well and finish with sesame seeds.",
    ],
  },
  "cheesy-tomato-omelette": {
    name: "Cheesy Tomato Omelette",
    photo: photos["cheesy-tomato-omelette"],
    meta: ["15 min", "1 serving", "Easy", "Breakfast"],
    ingredients: [
      { name: "Eggs", importance: "Essential", have: true, sub: "" },
      { name: "Tomatoes", importance: "Essential", have: true, sub: "" },
      { name: "Cheddar cheese", importance: "Essential", have: true, sub: "" },
      { name: "Milk", importance: "Optional", have: true, sub: "" },
    ],
    steps: [
      "Beat 3 eggs with a splash of milk, salt and pepper.",
      "Dice the tomato and grate the cheddar.",
      "Pour the eggs into a buttered pan over medium-low heat and let them set at the edges.",
      "Scatter tomato and cheese over one half, fold and cook 1 more minute.",
    ],
  },
  "spicy-pork-stir-fry": {
    name: "Spicy Pork Stir-fry",
    photo: photos["spicy-pork"],
    meta: ["30 min", "2 servings", "Medium", "Korean"],
    ingredients: [
      { name: "Pork shoulder, thinly sliced", importance: "Essential", have: false, sub: "chicken thighs" },
      { name: "Gochujang", importance: "Essential", have: false, sub: "sriracha + miso" },
      { name: "Soy sauce", importance: "Essential", have: true, sub: "" },
      { name: "Garlic", importance: "Recommended", have: true, sub: "" },
      { name: "Onion", importance: "Recommended", have: false, sub: "leek" },
      { name: "Sesame oil", importance: "Recommended", have: true, sub: "" },
      { name: "Green onion", importance: "Optional", have: false, sub: "chives" },
      { name: "Cooked rice", importance: "Optional", have: true, sub: "" },
    ],
    steps: [
      "Mix gochujang, soy sauce, garlic, a spoon of sugar and sesame oil into a sauce.",
      "Coat the pork in the sauce and rest 10 minutes.",
      "Stir-fry sliced onion in a hot pan, then add the pork and cook until caramelized.",
      "Toss in green onion and serve over rice.",
    ],
  },
  "spinach-egg-scramble": {
    name: "Spinach Egg Scramble",
    photo: photos["spinach-egg-scramble"],
    meta: ["10 min", "1 serving", "Easy", "Breakfast"],
    ingredients: [
      { name: "Eggs", importance: "Essential", have: true, sub: "" },
      { name: "Spinach", importance: "Essential", have: true, sub: "" },
      { name: "Butter or oil", importance: "Essential", have: true, sub: "" },
      { name: "Garlic", importance: "Optional", have: true, sub: "" },
      { name: "Cheese", importance: "Optional", have: true, sub: "" },
    ],
    steps: [
      "Wilt the spinach with garlic in a buttered pan.",
      "Beat the eggs with salt and pepper and pour them in.",
      "Stir gently over low heat until softly set.",
      "Top with grated cheese and serve.",
    ],
  },
  "kimchi-tofu-soup": {
    name: "Kimchi Tofu Soup",
    photo: photos["kimchi-tofu-soup"],
    meta: ["20 min", "2 servings", "Easy", "Korean"],
    ingredients: [
      { name: "Kimchi", importance: "Essential", have: true, sub: "" },
      { name: "Soft tofu", importance: "Essential", have: true, sub: "" },
      { name: "Garlic", importance: "Recommended", have: true, sub: "" },
      { name: "Gochugaru", importance: "Recommended", have: false, sub: "chili flakes" },
      { name: "Eggs", importance: "Optional", have: true, sub: "" },
      { name: "Green onion", importance: "Optional", have: false, sub: "chives" },
    ],
    steps: [
      "Sauté chopped kimchi and garlic in a little oil for 2 minutes.",
      "Add 2 cups of water and gochugaru and bring to a boil.",
      "Spoon in the tofu in big pieces and simmer 8 minutes.",
      "Crack in an egg, add green onion and serve hot.",
    ],
  },
  "chicken-spinach-stir-fry": {
    name: "Chicken & Spinach Stir-fry",
    photo: photos["chicken-spinach-stir-fry"],
    meta: ["20 min", "2 servings", "Easy", "Asian"],
    ingredients: [
      { name: "Chicken thighs", importance: "Essential", have: true, sub: "" },
      { name: "Baby spinach", importance: "Essential", have: true, sub: "" },
      { name: "Soy sauce", importance: "Essential", have: true, sub: "" },
      { name: "Garlic", importance: "Recommended", have: true, sub: "" },
      { name: "Tomatoes", importance: "Optional", have: true, sub: "" },
      { name: "Ginger", importance: "Optional", have: false, sub: "more garlic" },
    ],
    steps: [
      "Slice the chicken thinly and season with soy sauce.",
      "Stir-fry in a hot pan until browned and cooked through.",
      "Add garlic and ginger for 30 seconds, then the tomatoes.",
      "Toss in the spinach until just wilted and serve with rice.",
    ],
  },
};

/** Default recipe when no id is given. */
export const recipe = recipes.bibimbap;

/** Recipe page link from a display name, e.g. "Kimchi Jjigae" -> /recipe/kimchi-jjigae. */
export const recipeId = (name: string) => name.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const recipeLink = (name: string) => (recipes[recipeId(name)] ? `/recipe/${recipeId(name)}` : "/recipe");
/** "Have X of Y" and time, read from the recipe itself so cards and pages always agree. */
export const recipeHave = (name: string) => {
  const r = recipes[recipeId(name)];
  return r ? { have: r.ingredients.filter((i) => i.have).length, total: r.ingredients.length, time: r.meta[0] } : { have: 0, total: 0, time: "" };
};

export type PostType = "Available" | "Wanted" | "Meal Prep";
export const nearby: { id: number; by: PersonaName; dist: string; text: string; type: PostType; deal: string; art: IllustrationName; photo?: string; x: number; y: number }[] = [
  { id: 1, by: "Jack Lee", dist: "0.2 mi", text: "Anyone wants free avocados?", type: "Available", deal: "Free", art: "avocado", photo: photos["three-avos"], x: 296, y: 392 },
  { id: 2, by: "Mason Mei", dist: "0.4 mi", text: "I need two eggs!!", type: "Wanted", deal: "Exchange", art: "eggsMap", x: 436, y: 330 },
  { id: 3, by: "Ari Kim", dist: "0.6 mi", text: "Korean Food Week · 1 spot", type: "Meal Prep", deal: "Split cost", art: "bento", x: 166, y: 520 },
  { id: 4, by: "Dana P.", dist: "0.8 mi", text: "Lending a rice cooker", type: "Available", deal: "Free", art: "ricecooker", x: 470, y: 720 },
  { id: 5, by: "Leo S.", dist: "0.9 mi", text: "Looking for fresh basil", type: "Wanted", deal: "Free", art: "basil", x: 160, y: 196 },
  { id: 6, by: "Priya R.", dist: "1.0 mi", text: "Extra sourdough loaf", type: "Available", deal: "Exchange", art: "bread", x: 300, y: 700 },
];

export const dmThreads: { name: string; by: PersonaName; time: string; context: string; last: string; unread: number }[] = [
  { name: "Jack Lee", by: "Jack Lee", time: "9:41 AM", context: "Re: Free avocados", last: "Sure! Lobby at 6 works for me.", unread: 2 },
  { name: "Mason Mei", by: "Mason Mei", time: "Yesterday", context: "Re: I need two eggs!!", last: "Thank you so much!", unread: 0 },
  { name: "Dana P.", by: "Dana P.", time: "Mon", context: "Re: Rice cooker", last: "You can keep it through the weekend.", unread: 0 },
];

export const groupThreads: { name: string; art: IllustrationName; tint: string; time: string; context: string; last: string; unread: number }[] = [
  { name: "Korean Food Week", art: "groupKorean", tint: "var(--primary-tint)", time: "10:02 AM", context: "4 members · Sat 11/6", last: "Ari: I’ll bring the gochujang", unread: 5 },
  { name: "Veggie Batch Prep", art: "groupVeggie", tint: "var(--info-tint)", time: "Sun", context: "2 members · Mon 11/9", last: "Who has a big pot?", unread: 0 },
];

/** Korean Food Week group chat. `by` is empty for my own messages. */
export const groupChatSeed: { by?: PersonaName; text: string }[] = [
  { by: "Ari Kim", text: "Hi all! Korean Food Week is this Saturday." },
  { by: "Jack Lee", text: "I’m hosting at my place on State St. Bibimbap is on me." },
  { by: "Mason Mei", text: "I’ll make the spicy pork!" },
  { text: "I can do kimchi fried rice. Anything else we need?" },
  { by: "Jack Lee", text: "Maybe one more side. And someone with a big pot?" },
  { by: "Ari Kim", text: "I’ll bring the gochujang" },
];

export const chatSeed = [
  { me: true, text: "Hi Jack! Are the avocados still available?" },
  { me: false, text: "Yes! All 3 are still here." },
  { me: true, text: "Could I pick them up around 6?" },
  { me: false, text: "Sure! Lobby at 6 works for me." },
];

export const savedRecipes = [
  { name: "Bibimbap", photo: photos["bibimbap"] },
  { name: "Kimchi Jjigae", photo: photos["kimchi-jjigae"] },
  { name: "Shakshuka", photo: photos["shakshuka"] },
  { name: "Japchae", photo: photos["japchae"] },
  { name: "Egg Drop Soup", photo: photos["egg-drop-soup"] },
];

export const swapMembers: { name: string; key: PersonaName; role: string; info: string; canMsg: boolean }[] = [
  { name: "Jack Lee", key: "Jack Lee", role: "Host", info: "Level 4 · 0.2 mi · 12 swaps", canMsg: true },
  { name: "Mason Mei", key: "Mason Mei", role: "", info: "Level 2 · 0.4 mi · 3 swaps", canMsg: true },
  { name: "Ari Kim", key: "Ari Kim", role: "", info: "Level 3 · 0.6 mi · 7 swaps · vegetarian-friendly", canMsg: true },
];

export const swapDishes: { name: string; meta: string; have: number; total: number; pop: boolean; taken?: string }[] = [
  { name: "Kimchi Jjigae", meta: "Stew · 35 min · freezes well", have: 3, total: 5, pop: true },
  { name: "Kimbap", meta: "Rice rolls · 50 min", have: 3, total: 7, pop: true },
  { name: "Sundubu Jjigae", meta: "Soft tofu stew · 30 min", have: 3, total: 6, pop: false },
  { name: "Gyeran-mari", meta: "Rolled omelette · 15 min", have: 2, total: 3, pop: false },
  { name: "Japchae", meta: "Glass noodles · 45 min · reheats well", have: 2, total: 7, pop: true },
  { name: "Doenjang Jjigae", meta: "Soybean stew · 30 min · vegetarian option", have: 2, total: 6, pop: false },
  { name: "Dakgalbi", meta: "Spicy chicken · 40 min", have: 1, total: 6, pop: true },
  { name: "Tteokbokki", meta: "Spicy rice cakes · 25 min", have: 0, total: 5, pop: true },
  { name: "Bulgogi", meta: "Marinated beef · 40 min", have: 0, total: 6, pop: true },
  { name: "Bibimbap", meta: "Mixed rice bowl", have: 3, total: 9, pop: true, taken: "Jack" },
  { name: "Spicy Pork", meta: "Jeyuk bokkeum", have: 1, total: 7, pop: true, taken: "Mason" },
  { name: "Kimchi Fried Rice", meta: "Fried rice · 20 min", have: 4, total: 5, pop: true, taken: "Ari" },
];

/** Notifications. `actor` is bold at the start; `strong` is bolded inside the text. Unread ids live in the store. */
export type NotifKind = "message" | "expiry" | "group" | "reward" | "nearby";
export const notifications: {
  id: number; kind: NotifKind; section: "Today" | "Earlier"; time: string; to: string;
  actor?: PersonaName; text: string; strong?: string; quote?: string;
  art?: IllustrationName; photo?: string; action?: { label: string; to: string };
}[] = [
  { id: 1, kind: "group", section: "Today", time: "10:02 AM", to: "/meal-swap", actor: "Ari Kim", text: "added a dish to Korean Food Week", strong: "Korean Food Week", quote: "I’ll bring the gochujang" },
  { id: 2, kind: "message", section: "Today", time: "9:41 AM", to: "/chat", actor: "Jack Lee", text: "replied about Free avocados", strong: "Free avocados", quote: "Sure! Lobby at 6 works for me.", photo: photos["three-avos"] },
  { id: 3, kind: "expiry", section: "Today", time: "8:00 AM", to: "/cook", text: "Baby spinach and Chicken thighs expire in 3 days. Cook them tonight?", strong: "Baby spinach and Chicken thighs", art: "spinach", action: { label: "See recipes", to: "/cook" } },
  { id: 4, kind: "reward", section: "Earlier", time: "Yesterday", to: "/my", text: "You earned 50 points for sharing with Jack", strong: "50 points" },
  { id: 5, kind: "message", section: "Earlier", time: "Yesterday", to: "/chat", actor: "Mason Mei", text: "thanked you for the eggs", quote: "Thank you so much!" },
  { id: 6, kind: "nearby", section: "Earlier", time: "Mon", to: "/nearby", actor: "Priya R.", text: "posted Extra sourdough loaf · 1.0 mi away", strong: "Extra sourdough loaf", art: "bread" },
  { id: 7, kind: "nearby", section: "Earlier", time: "Mon", to: "/nearby", actor: "Leo S.", text: "is looking for fresh basil · 0.9 mi away", strong: "fresh basil", art: "basil" },
];
