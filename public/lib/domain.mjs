export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SAMPLE_ITEMS = [
  { name: 'Milk', quantity: 1, unit: 'gal', confidence: 'high', raw_line: 'ORG WHOLE MILK 1 GAL' },
  { name: 'Eggs', quantity: 12, unit: 'item', confidence: 'high', raw_line: 'CAGE FREE EGGS 12 CT' },
  { name: 'Chicken thighs', quantity: 1.5, unit: 'lb', confidence: 'high', raw_line: 'BNLS CHKN THGH 1.5 LB' },
  { name: 'Baby spinach', quantity: 5, unit: 'oz', confidence: 'high', raw_line: 'BABY SPINACH 5 OZ' },
  { name: 'Tomatoes', quantity: 4, unit: 'item', confidence: 'high', raw_line: 'ROMA TOMATOES 4 CT' },
  { name: 'Cheddar cheese', quantity: 8, unit: 'oz', confidence: 'high', raw_line: 'SHARP CHEDDAR 8 OZ' },
  { name: 'Green onion', quantity: 2, unit: 'bunch', confidence: 'low', raw_line: 'GRN ONI 2' },
];
export const SAMPLE_SCAN = {
  merchant: 'Ingredi Market · sample receipt',
  skipped_non_food: 3,
  warnings: ['GRN ONI 2 is unclear. Check the suggested name before adding it.'],
  items: SAMPLE_ITEMS,
};
export const DEMO_RECIPES = [
  { id: 'omelette', name: 'Spinach & cheddar omelette', description: 'A little fridge magic, in fifteen minutes.', ingredients: ['eggs', 'spinach', 'cheddar cheese'], instructions: ['Whisk the eggs.', 'Wilt spinach in a lightly oiled pan.', 'Add eggs, then cheddar. Fold and cook until set.'], cook_minutes: 15 },
  { id: 'stirfry', name: 'Chicken & spinach skillet', description: 'One pan, a warm dinner, less to waste.', ingredients: ['chicken thighs', 'spinach', 'tomato'], instructions: ['Cut chicken into small pieces and season.', 'Cook in a lightly oiled pan until cooked through.', 'Add chopped tomatoes and spinach. Cook until the greens wilt.'], cook_minutes: 20 },
  { id: 'rice', name: 'Kimchi fried rice', description: 'Give yesterday’s rice another delicious day.', ingredients: ['rice', 'kimchi', 'eggs', 'green onion'], instructions: ['Sauté chopped kimchi in a little oil.', 'Add cooked rice and stir until piping hot.', 'Top with a fried egg and sliced green onion.'], cook_minutes: 20 },
];
export function validateItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error('Select between 1 and 50 food items.');
  return items.map((item) => {
    if (!item || typeof item.name !== 'string' || !item.name.trim() || item.name.trim().length > 100) throw new Error('Each item needs a name of 1–100 characters.');
    if (typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity < 0.01 || item.quantity > 10000 || Math.abs(item.quantity * 100 - Math.round(item.quantity * 100)) > 1e-7) throw new Error('Quantities must be 0.01–10,000, with at most two decimal places.');
    if (typeof item.unit !== 'string' || !item.unit.trim() || item.unit.trim().length > 30) throw new Error('Choose a unit of 1–30 characters.');
    const date = item.expires_on || null;
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) throw new Error('Choose a valid best-before date.');
    return { name: item.name.trim(), quantity: item.quantity, unit: item.unit.trim(), expires_on: date };
  });
}
export function validateExtraction(value) {
  if (!value || !Array.isArray(value.items) || value.items.length > 50 || !Array.isArray(value.warnings) || !Number.isInteger(value.skipped_non_food) || value.skipped_non_food < 0) throw new Error('The receipt could not be read. Try a clearer photo.');
  const quantityWarnings = [];
  const items = value.items.map((item,index) => {
    // Receipts often print weights with three decimals, while pantry storage
    // uses two. Normalize the candidate, preserve raw_line and request review.
    // If the model cannot infer a usable quantity, keep the grocery line and
    // make that one field reviewable instead of failing the entire receipt.
    const quantity = item?.quantity;
    const rounded = typeof quantity === 'number' && Number.isFinite(quantity) ? Math.round((quantity+Number.EPSILON)*100)/100 : quantity;
    const adjusted = typeof quantity === 'number' && quantity >= 0.01 && quantity <= 10000 && Math.abs(quantity-rounded)>1e-7;
    const defaulted = quantity === 0;
    const clean = validateItems([{ ...item, quantity:defaulted?1:adjusted?rounded:quantity, unit:defaulted?'item':item?.unit, expires_on: null }])[0];
    if (!['high', 'medium', 'low'].includes(item.confidence) || typeof item.raw_line !== 'string') throw new Error('Invalid receipt extraction.');
    if (adjusted) quantityWarnings.push(`The quantity on food line ${index+1} was rounded to two decimal places. Check it against the receipt.`);
    if (defaulted) quantityWarnings.push(`The quantity on food line ${index+1} could not be verified, so it was set to 1 item. Check it against the receipt.`);
    return { ...clean, confidence: defaulted?'low':adjusted&&item.confidence==='high'?'medium':item.confidence, raw_line: item.raw_line.slice(0, 160) };
  });
  return { items, merchant: typeof value.merchant === 'string' ? value.merchant.slice(0, 100) : null, warnings: [...quantityWarnings,...value.warnings.filter(w => typeof w === 'string')].slice(0, 10).map(w => w.slice(0, 240)), skipped_non_food: value.skipped_non_food };
}
export function validateImage(bytes, mime) {
  if (!IMAGE_TYPES.includes(mime)) throw new Error('Use a JPEG, PNG, or WebP receipt photo.');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('Your receipt photo must be under 6 MB.');
  const valid = mime === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : mime === 'image/png' ? [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b)
    : String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (!valid) throw new Error('This file is not a valid receipt image.');
}
const aliases = { egg: 'eggs', 'baby spinach': 'spinach', tomatoes: 'tomato', 'roma tomatoes': 'tomato', 'green onions': 'green onion', 'whole milk': 'milk', 'cooked rice': 'rice' };
export function normalizeIngredient(value) {
  const name = String(value).toLowerCase().trim().replace(/\s+/g, ' ');
  return aliases[name] || name;
}
export function matchRecipes(recipes, pantry) {
  const available = new Set(pantry.map(item => normalizeIngredient(item.name)));
  return recipes.map(recipe => {
    const needed = recipe.ingredients.map(i => typeof i === 'string' ? i : i.name);
    const missing = needed.filter(name => !available.has(normalizeIngredient(name)));
    return { ...recipe, missing, have: needed.length - missing.length, total: needed.length };
  }).sort((a,b) => a.missing.length - b.missing.length || b.have - a.have);
}
export function localDate(offset = 0) {
  const date = new Date(); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function daysUntil(date) {
  if (!date) return null;
  return Math.round((Date.parse(date) - Date.parse(localDate())) / 86400000);
}
