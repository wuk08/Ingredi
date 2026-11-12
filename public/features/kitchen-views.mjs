import { escape, icon, art, avatar, badge, empty, sectionTitle } from "../lib/ui.mjs";
import { daysUntil } from "../lib/domain.mjs";
import { discover, hasIngredient, preferenceOptions } from "../lib/recipes.mjs";
import { postCard, groupCard } from "./community-views.mjs";
function recipeCard(r, compact = false) {
  return `<button class="recipe-card ${compact ? "compact" : ""}" data-go="recipe" data-id="${escape(r.id)}"><div class="recipe-picture">${art(r.name)}<span class="picture-badge">${r.have === r.total ? "Ready to cook" : `Uses ${r.have} of your items`}</span></div><div class="recipe-caption"><strong>${escape(r.name)}</strong><span>${r.cook_minutes} min</span></div></button>`;
}
function expiry(item) {
  const days = daysUntil(item.expires_on);
  return days === null ? "Set date" : days < 0 ? `${-days}d past date` : days === 0 ? "Today" : `${days}d`;
}
function ingredientCard(i) {
  return `<div class="ingredient-card">${art(i.name)}<button class="expiry ${daysUntil(i.expires_on) !== null && daysUntil(i.expires_on) <= 3 ? "soon" : ""}" data-date="${escape(i.id)}" aria-label="Edit ${escape(i.name)} best-before date">${expiry(i)}</button><strong>${escape(i.name)}</strong></div>`;
}
function welcome() {
  return `<div class="welcome"><div class="welcome-top"><span class="brand">ingredi<span>.</span></span><span class="eyebrow">A LITTLE MORE POSSIBILITY</span></div><div class="welcome-art">${art("Bibimbap")}</div><h1>Good food.<br>Better together.</h1><p>Cook what you have.<br>Share what you don’t need.</p><div class="welcome-actions"><button class="button primary full" data-action="auth">Sign in with email ${icon("arrow")}</button><button class="button outline full" data-action="signup">Create an account</button><button class="text-button" data-action="explore">Explore the demo ${icon("arrow")}</button></div><small>Demo community activity stays on this device.<br>Your signed-in fridge is private to your account.</small></div>`;
}
function home(ctx) {
  const { state, recipes, photoURL } = ctx;
  const d = { ...ctx.d, posts: ctx.d.posts.filter(p => p.residenceId === ctx.d.activeResidenceId), groups: ctx.d.groups.filter(g => g.residenceId === ctx.d.activeResidenceId) };
  const first = state.profile?.display_name || d.profile.display_name;
  const hour = (/* @__PURE__ */ new Date()).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const matches = discover(recipes, state.pantry, { preferences: d.preferences });
  const soon = state.pantry.filter((i) => daysUntil(i.expires_on) !== null && daysUntil(i.expires_on) <= 3);
  const requests = d.conversations.filter((c) => c.unread).length;
  return `<div class="home-greeting"><div><p class="eyebrow">YOUR EVERYDAY, A LITTLE GREENER</p><h1>${greeting}, ${escape(first.split(" ")[0])}!</h1><p>What do we want to cook today?</p></div><span class="greeting-leaf">${icon("leaf")}</span></div><div class="horizontal recipe-carousel">${matches.slice(0, 4).map((r) => recipeCard(r)).join("")}</div>${soon.length ? `<button class="soon-nudge" data-go="fridge">${icon("clock")}<span><strong>A little love, a little sooner</strong><small>${soon.length} ingredient${soon.length === 1 ? "" : "s"} to check and use first</small></span>${icon("arrow")}</button>` : ""}<button class="activity-card" data-go="posts"><span class="circle-icon">${icon("gift")}</span><span><strong>Active shares & requests</strong><small>${d.posts.filter((p) => p.owner === "you" && p.status === "active").length} active · ${requests} new request${requests===1?"":"s"}</small></span>${icon("arrow")}</button>${!d.activeResidenceId ? `<button class="activity-card" data-action="residence-setup">${icon("pin")}<span><strong>Find your home community</strong><small>Choose your apartment building or dorm.</small></span>${icon("arrow")}</button>` : ""}${sectionTitle("Join a meal prep group!", "See all", 'data-action="groups"')}<div class="horizontal groups-carousel">${d.groups.map((g) => groupCard(g, d)).join("")}</div>${sectionTitle("What’s up around you", "View all", 'data-tab="nearby"')}<div class="home-posts">${d.posts.filter((p) => p.owner !== "you" && p.status === "active").slice(0, 3).map((p) => postCard(p, d, photoURL)).join("")}</div>`;
}
function cook(ctx) {
  const { state, d, recipes } = ctx;
  const matches = discover(recipes, state.pantry, { ...state.cook, preferences: d.preferences });
  const roll = matches[state.roll % Math.max(1, matches.length)];
  return `<h1>What should we cook today?</h1><label class="search-field">${icon("search")}<input id="cook-search" type="search" data-search="cook" placeholder="Search recipes or ingredients" value="${escape(state.cook.search)}"></label><div class="chip-row filters">${preferenceOptions.map((t) => `<button class="chip ${state.cook.tags.includes(t) ? "selected" : ""}" data-cook-tag="${t}" aria-pressed="${state.cook.tags.includes(t)}">${t}</button>`).join("")}</div>${roll ? `<div class="roll-card"><span>Can’t decide? Let your fridge pick.</span><div><button class="roll-title" data-go="recipe" data-id="${escape(roll.id)}"><strong>${escape(roll.name)}</strong><small>${roll.cook_minutes} min · Have ${roll.have}/${roll.total} ingredients</small></button><button class="button primary small" data-action="roll">${icon("refresh")} Roll</button></div></div>` : ""}<div class="section-heading"><h2>My fridge <span class="count">${state.pantry.length}</span></h2><div><button class="text-button" data-go="fridge">View all</button><button class="button primary small" data-action="manual">${icon("plus")} Fill up fridge</button></div></div><div class="horizontal fridge-strip">${state.pantry.slice(0, 8).map(ingredientCard).join("") || `<button class="empty-fridge" data-action="manual">${icon("fridge")} Add your first ingredient ${icon("plus")}</button>`}</div>${state.scans.some((s) => s.status === "processed") ? `<div class="resume-scans">${state.scans.filter((s) => s.status === "processed").map((s) => `<button class="activity-card" data-resume="${s.id}">${icon("receipt")}<span>Receipt ready to review<small>${s.extracted_items.length} food items</small></span>${icon("arrow")}</button>`).join("")}</div>` : ""}${sectionTitle(state.cook.tags.length ? "Picked for your preferences" : "A few ideas for your fridge")}<div class="recipe-grid">${matches.map((r) => recipeCard(r)).join("") || empty("No recipes match yet", "Try clearing a filter or searching for another ingredient.")}</div><p class="fine-print">Demo recipe collection. Matches compare ingredient names; check amounts and freshness before cooking.</p>`;
}
function fridge({ state }) {
  const filtered = state.pantry.filter((i) => i.name.toLowerCase().includes(state.fridge.search.toLowerCase()) && (state.fridge.filter !== "soon" || daysUntil(i.expires_on) !== null && daysUntil(i.expires_on) <= 3));
  return `<div class="section-heading"><h1>My fridge <span class="count">${state.pantry.length}</span></h1><button class="button primary small" data-action="manual">${icon("plus")} Fill up fridge</button></div><label class="search-field">${icon("search")}<input id="fridge-search" type="search" data-search="fridge" placeholder="Find an ingredient" value="${escape(state.fridge.search)}"></label><div class="segmented"><button data-fridge-filter="all" class="${state.fridge.filter === "all" ? "selected" : ""}">All ingredients</button><button data-fridge-filter="soon" class="${state.fridge.filter === "soon" ? "selected" : ""}">Use soon</button></div><div class="fridge-list">${filtered.map((i) => `<div class="ingredient-row">${art(i.name)}<span><strong>${escape(i.name)}</strong><small>${escape(i.quantity)} ${escape(i.unit)}</small></span><button class="chip ${daysUntil(i.expires_on) !== null && daysUntil(i.expires_on) <= 3 ? "soon" : ""}" data-date="${escape(i.id)}">${expiry(i)} ${icon("arrow")}</button><button class="icon-button" data-delete="${escape(i.id)}" aria-label="Remove ${escape(i.name)}">${icon("trash")}</button></div>`).join("") || empty("Nothing in this corner of the fridge", "Add an ingredient or try another filter.")}</div><p class="fine-print">Dates are reminders chosen by you, not freshness guarantees.</p>`;
}
function recipe(ctx, id) {
  const { state, d, recipes } = ctx;
  const r = discover(recipes, state.pantry).find((r2) => r2.id === id);
  if (!r) return empty("Recipe not found");
  const steps = state.recipeTabs[id] === "steps";
  const saved = d.saved.includes(r.key);
  return `<div class="detail-hero">${art(r.name)}<button class="icon-button bookmark ${saved ? "saved" : ""}" data-save="${escape(r.key)}" aria-label="${saved ? "Unsave" : "Save"} recipe" aria-pressed="${saved}">${icon("bookmark")}</button></div><div class="detail-copy"><p class="eyebrow">SOMETHING GOOD IS ALREADY HERE</p><h1>${escape(r.name)}</h1><div class="chip-row">${badge(`${r.cook_minutes} min`)}${badge(`${r.servings || 2} servings`)}${badge(r.difficulty)}${badge(r.cuisine || "Everyday")}</div><p class="muted">${escape(r.description)}</p><div class="match-card"><div><strong>You have ${r.have} of ${r.total} ingredients</strong><span>${r.missing.length} missing</span></div><progress value="${r.have}" max="${r.total}" aria-label="Ingredient match"></progress></div><div class="segmented"><button data-recipe-tab="ingredients" class="${!steps ? "selected" : ""}">Ingredients</button><button data-recipe-tab="steps" class="${steps ? "selected" : ""}">Steps</button></div>${steps ? `<ol class="recipe-steps">${r.instructions.map((s) => `<li>${escape(s)}</li>`).join("")}</ol>` : `<div class="recipe-ingredients">${r.ingredients.map((i) => {
    const n = typeof i === "string" ? i : i.name, have = hasIngredient(state.pantry, n);
    return `<div class="recipe-ingredient"><div><span class="ingredient-dot ${have ? "have" : ""}"></span><strong>${escape(n)}</strong><span class="have-label">${have ? "Have" : "Missing"}</span></div>${have ? "" : `<button class="text-button" data-find="${escape(n)}">Find nearby ${icon("arrow")}</button>`}</div>`;
  }).join("")}</div>`}<p class="fine-print">Demo recipe · check amounts and freshness. Oil and seasoning are assumed pantry basics. Use vegetarian kimchi for vegetarian dishes.</p></div><div class="bottom-actions"><button class="button outline" data-find="${escape(r.missing[0] || r.name)}">Find nearby</button><button class="button primary" data-plan="${escape(r.id)}">Plan meal prep</button></div>`;
}
export {
  cook,
  expiry,
  fridge,
  home,
  ingredientCard,
  recipe,
  recipeCard,
  welcome
};
