import { api, getSession, loadKitchen } from "./api.mjs";
import { validateItems, SAMPLE_ITEMS, localDate } from "./domain.mjs";
const LOCAL_KEY = "ingredi.local-pantry";
function localPantry() {
  try {
    const value = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function persistLocal(pantry) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(pantry));
}
function seedLocalPantry() {
  const existing = localPantry();
  if (existing.length) return existing;
  const items = SAMPLE_ITEMS.slice(0, 6).map((i, n) => ({ id: crypto.randomUUID(), name: i.name, quantity: i.quantity, unit: i.unit, expires_on: localDate([7, 14, 3, 3, 7, 30][n]), source: "manual" }));
  persistLocal(items);
  return items;
}
async function load() {
  return getSession() ? loadKitchen() : { pantry: localPantry(), scans: [], recipes: [] };
}
async function add(pantry, items) {
  const clean = validateItems(items);
  if (getSession()) {
    const saved = await api("/rest/v1/pantry_items", { method: "POST", body: clean.map((i) => ({ ...i, user_id: getSession().user.id, source: "manual" })), headers: { Prefer: "return=representation" } });
    return [...saved, ...pantry];
  }
  const next = [...clean.map((i) => ({ ...i, id: crypto.randomUUID(), source: "manual" })), ...pantry];
  persistLocal(next);
  return next;
}
async function remove(pantry, id) {
  if (getSession()) await api(`/rest/v1/pantry_items?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  const next = pantry.filter((i) => i.id !== id);
  if (!getSession()) persistLocal(next);
  return next;
}
async function setDate(pantry, id, date) {
  const item = pantry.find((i) => i.id === id);
  if (!item) throw new Error("Ingredient not found.");
  validateItems([{ ...item, expires_on: date }]);
  if (getSession()) await api(`/rest/v1/pantry_items?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { expires_on: date } });
  const next = pantry.map((i) => i.id === id ? { ...i, expires_on: date } : i);
  if (!getSession()) persistLocal(next);
  return next;
}
async function profile() {
  if (!getSession()) return null;
  return (await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(getSession().user.id)}&select=display_name,city`))[0] || null;
}
async function updateProfile(value) {
  if (getSession()) await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(getSession().user.id)}`, { method: "PATCH", body: { display_name: value.display_name, city: value.city } });
}
export {
  add,
  load,
  localPantry,
  persistLocal,
  profile,
  remove,
  seedLocalPantry,
  setDate,
  updateProfile
};
