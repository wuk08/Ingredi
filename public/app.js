import { getSession, signOut } from "./lib/api.mjs";
import { isNativeApp } from "./lib/capture.mjs";
import { validateImage, MAX_IMAGE_BYTES, localDate } from "./lib/domain.mjs";
import * as kitchen from "./lib/kitchen.mjs";
import { DemoRepository, seedCommunity, filterPosts, communityView } from "./lib/community.mjs";
import { mountMap, defaultView } from './lib/nearby-map.mjs';
import { activeResidence, setupComplete, needsStudentCheck } from './lib/residence.mjs';
import { createResidenceFlows } from './features/residence-flows.mjs';
import { catalog, discover } from "./lib/recipes.mjs";
import { Navigation, tabs } from "./lib/navigation.mjs";
import { icon, escape, avatar, empty } from "./lib/ui.mjs";
import * as kitchenViews from "./features/kitchen-views.mjs";
import * as communityViews from "./features/community-views.mjs";
import { createKitchenFlows } from "./features/kitchen-flows.mjs";
const $ = (selector) => document.querySelector(selector);
document.documentElement.classList.toggle("native-app", isNativeApp());
const state = { pantry: getSession() ? [] : kitchen.localPantry(), recipes: [], scans: [], profile: null, signed: Boolean(getSession()), loading: true, error: "", storageError: "", repo: null, communityBusy: false, busy: false, modal: null, preview: null, file: null, scan: null, review: [], live: null, authMode: "signin", staged: [], cook: { search: "", tags: [] }, fridge: { search: "", filter: "all" }, nearby: { search: "", type: "all", category: "all", offer: "all", distance: 1, view: "map", scope: "building" }, inbox: "individual", selectedPost: null, recipeTabs: {}, groupDishes: {}, roll: 0, composer: null };
let residenceFlows;
let identityGeneration = 0;
const nav = new Navigation(() => {
  render();
  $("#main-content")?.focus({ preventScroll: true });
});
const fallback = seedCommunity();
let photoUrls = [];
let disposeMap = () => {};
const photoURL = (blob) => {
  const url = URL.createObjectURL(blob);
  photoUrls.push(url);
  return url;
};
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 4500);
}
const titleFor = { recipe: "Recipe", fridge: "My fridge", post: "Post", compose: "New post", group: "Meal swap", groups: "Meal prep groups", chat: "Conversation", reward: "A little good goes a long way", posts: "My posts / shares", saved: "Saved recipes", preferences: "Preferences", settings: "Settings", profile: "Edit profile" };
function context() {
  const stored = communityView(state.repo?.data || fallback);
  const d = state.profile ? { ...stored, profile: state.profile, people: { ...stored.people, you: { name: state.profile.display_name, city: state.profile.city } } } : stored;
  return { state, d, recipes: discover(catalog(state.recipes), state.pantry), photoURL };
}
function render() {
  disposeMap();
  disposeMap = () => {};
  photoUrls.forEach(URL.revokeObjectURL);
  photoUrls = [];
  const route = nav.route, ctx = context(), d = ctx.d, home = activeResidence(d);
  document.title = `${route.view === "welcome" ? "Welcome" : titleFor[route.view] || tabs.find((t) => t[0] === route.tab)?.[1]} · Ingredi`;
  if (route.view === "welcome") {
    $("#app").innerHTML = kitchenViews.welcome();
    return;
  }
  const root = route.view === route.tab;
  let content = "";
  const communityRoutes = ['nearby', 'message', 'post', 'compose', 'group', 'groups', 'chat', 'reward', 'posts'];
  if (communityRoutes.includes(route.view) && !setupComplete(d)) content = communityViews.setupGate();
  else if (route.view === 'compose' && needsStudentCheck(d)) content = communityViews.studentGate();
  else if (route.view === "home") content = kitchenViews.home(ctx);
  else if (route.view === "cook") content = kitchenViews.cook(ctx);
  else if (route.view === "fridge") content = kitchenViews.fridge(ctx);
  else if (route.view === "recipe") content = kitchenViews.recipe(ctx, route.id);
  else if (route.view === "nearby") content = communityViews.nearby(ctx);
  else if (route.view === "message") content = communityViews.inbox(ctx);
  else if (route.view === "my") content = communityViews.my(ctx);
  else if (route.view === "post") content = communityViews.post(ctx, route.id);
  else if (route.view === "compose") {
    state.composer ||= structuredClone(d.draft || newDraft());
    content = communityViews.composer(ctx);
  } else if (route.view === "chat") content = communityViews.chat(ctx, route.id);
  else if (route.view === "group") content = communityViews.group(ctx, route.id);
  else if (route.view === "reward") content = communityViews.reward(ctx, route.id);
  else content = communityViews.extra(ctx, route.view);
  const unread = d.conversations.reduce((sum, c) => sum + c.unread, 0);
  const navButtons = tabs.map(([id, label, i]) => `<button data-tab="${id}" class="nav-item ${route.tab === id ? "active" : ""}" ${route.tab === id ? 'aria-current="page"' : ""}><span class="nav-icon">${icon(i)}${id === "message" && unread ? `<b class="nav-dot">${unread}</b>` : ""}</span><span>${label}</span></button>`).join("");
  let headerTitle = titleFor[route.view] || "";
  if (route.view === "chat") {
    const chat = d.conversations.find((c) => c.id === route.id);
    headerTitle = chat?.groupId ? d.groups.find((g) => g.id === chat.groupId)?.title : d.people[chat?.person]?.name || "Conversation";
  }
  $("#app").innerHTML = `<aside class="sidebar"><button class="brand" data-tab="home">${icon("leaf")} ingredi<span>.</span></button><p class="brand-note">Cook. Share. Belong.</p><nav aria-label="Main navigation">${navButtons}</nav><div class="sidebar-bottom">${icon("leaf")}<h3>A little less waste.<br>A little more together.</h3><p>Good things happen<br>in your neighborhood.</p><span class="mode-badge">Demo community</span></div></aside><div class="workspace ${root ? "root-view" : "detail-view"} ${route.view === "nearby" ? "nearby-workspace" : ""}"><header class="app-header ${root ? "root-header" : "detail-header"}">${root ? `<button class="mobile-brand brand" data-tab="home">${icon("leaf")} ingredi<span>.</span></button><span class="desktop-location">${icon("pin")} ${escape(home?.name || state.profile?.city || 'Your kitchen')}</span><button class="account-avatar" data-tab="my" aria-label="My profile">${avatar(state.profile?.display_name || d.profile.display_name)}</button>` : `<button class="icon-button" data-action="back" aria-label="Back">${icon("back")}</button><strong>${escape(headerTitle)}</strong>${route.view === "compose" ? '<button class="text-button" data-action="save-draft">Save draft</button>' : '<span class="header-spacer"></span>'}`}</header><main id="main-content" tabindex="-1" class="page ${route.view}-page">${state.error ? `<div class="error-banner" role="alert"><span>${escape(state.error)}</span><button class="icon-button" data-action="dismiss-error" aria-label="Dismiss error">${icon("close")}</button></div>` : ""}${state.storageError ? `<div class="error-banner" role="alert"><span>${escape(state.storageError)}</span><button class="text-button" data-action="retry-storage">Retry</button></div>` : ""}${root && ["home", "cook"].includes(route.view) ? `<div class="kitchen-status"><span class="status-dot ${state.signed ? "connected" : ""}"></span>${state.loading ? "Opening your kitchen…" : state.signed ? "Private fridge · account connected" : "Sample fridge · on this device"}${!state.signed ? '<button class="text-button" data-action="auth">Sign in</button>' : ""}</div>` : ""}${content}</main>${root ? `<nav class="mobile-nav" aria-label="Mobile navigation">${navButtons}</nav>` : ""}</div>`;
  if (route.view === 'nearby' && $('#nearby-map-canvas') && state.mapLocation) {
    const posts=filterPosts(d.posts,{...state.nearby,residenceId:home.id});
    disposeMap=mountMap({element:$('#nearby-map-canvas'),posts,selected:state.selectedPost||posts[0]?.id,view:state.mapView||defaultView(state.mapLocation),location:state.mapLocation,residenceId:home.id,residenceName:home.name,onSelect:id=>{state.selectedPost=id;render();},onView:view=>{state.mapView=view;}});
  }
  if (route.view === "chat") requestAnimationFrame(() => {
    $(".chat-messages")?.lastElementChild?.scrollIntoView({ block: "nearest" });
  });
}
let modalReturnFocus;
function showModal(title, content, wide = false) {
  if (!state.modal) modalReturnFocus = document.activeElement;
  state.modal = true;
  $("#app").inert = true;
  $("#overlay-root").innerHTML = `<div class="modal-backdrop"><section class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><header class="modal-header"><button class="icon-button" id="close-modal" aria-label="Close">${icon("close")}</button><h2 id="modal-title">${title}</h2><span></span></header><div class="modal-body">${content}</div></section></div>`;
  document.body.classList.add("modal-open");
  $("#close-modal").onclick = closeModal;
  $(".modal").focus();
}
function closeModal() {
  if (state.busy) return;
  residenceFlows?.onClose();
  $("#overlay-root").innerHTML = "";
  $("#app").inert = false;
  document.body.classList.remove("modal-open");
  state.modal = null;
  if (state.preview) URL.revokeObjectURL(state.preview);
  state.preview = null;
  state.file = null;
  if (modalReturnFocus?.isConnected) modalReturnFocus.focus();
  else $("#main-content")?.focus({ preventScroll: true });
}
function modalError(message) {
  let el = $("#modal-error");
  if (!el) {
    el = document.createElement("div");
    el.id = "modal-error";
    el.className = "error-banner";
    el.setAttribute("role", "alert");
    $(".modal-body").prepend(el);
  }
  el.textContent = message;
  el.scrollIntoView({ block: "nearest" });
}
document.addEventListener("keydown", (event) => {
  if (!state.modal) return;
  if (event.key === "Escape") {
    closeModal();
    return;
  }
  if (event.key === "Tab") {
    const items = [...$(".modal").querySelectorAll('button,input,select,textarea,a,[tabindex="0"]')].filter((i) => !i.disabled && i.offsetParent !== null);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === $(".modal"))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});
async function refresh() {
  const generation = identityGeneration;
  state.loading = true;
  render();
  try {
    const loaded = await kitchen.load();
    if (generation !== identityGeneration) return;
    Object.assign(state, loaded);
    state.error = "";
    if (getSession()) {
      const profile = await kitchen.profile();
      if (generation === identityGeneration) state.profile = profile;
    }
  } catch (error) {
    if (generation === identityGeneration && state.signed && !getSession()) {
      await sessionChanged();
      toast("Your session expired. Sign in again to open your private fridge.");
    } else if (generation === identityGeneration) state.error = error.message;
  } finally {
    if (generation === identityGeneration) {
      state.loading = false;
      render();
    }
  }
}
function syncResidence() {
  const home = activeResidence(state.repo?.data);
  state.mapLocation = home?.center || null;
  state.mapView = home?.center ? { ...defaultView(home.center), zoom: 17 } : null;
  state.selectedPost = null;
  state.composer = null;
  state.groupDishes = {};
  state.nearby.scope = 'building';
  state.error = '';
}
function promptSetup() {
  const data = state.repo?.data;
  if (data && !state.storageError && !setupComplete(data) && !data.onboardingSkipped && !state.modal && nav.route.view !== 'welcome') residenceFlows.openSetup();
}
async function loadCommunity() {
  const repo = new DemoRepository(getSession()?.user.id || "anonymous-demo");
  state.repo = repo;
  try {
    await repo.load();
    if (state.repo === repo) {
      state.storageError = "";
      syncResidence();
      if (nav.route.view === "compose") state.composer = structuredClone(repo.data.draft || newDraft());
    }
  } catch (error) {
    if (state.repo === repo) state.storageError = error.message;
  }
}
async function sessionChanged() {
  identityGeneration++;
  residenceFlows?.resetIdentity();
  if (state.modal && !state.busy) closeModal();
  state.signed = Boolean(getSession());
  state.pantry = state.signed ? [] : kitchen.localPantry();
  state.recipes = [];
  state.scans = [];
  state.profile = null;
  state.mapLocation = null;
  state.mapView = null;
  state.staged = [];
  state.composer = null;
  state.cook = { search: "", tags: [] };
  state.recipeTabs = {};
  state.inbox = "individual";
  await loadCommunity();
  nav.go("home", "", "home", { replace: true });
  await refresh();
  promptSetup();
}
const flows = createKitchenFlows({ state, render, toast, showModal, closeModal, modalError, onSessionChanged: sessionChanged, onKitchenSaved: () => nav.switchTab("cook"), openRecipe: (id) => nav.go("recipe", id, "cook") });
residenceFlows = createResidenceFlows({ state, render, toast, showModal, closeModal, modalError, onResidenceChanged: syncResidence, onSkip: () => nav.switchTab('home') });
async function demo(action2, value, rerender = true) {
  if (state.communityBusy) throw new Error("Please wait for the current action to finish.");
  if (!state.repo?.data || state.storageError) throw new Error(state.storageError || "Demo storage is still opening. Please try again.");
  const repo = state.repo;
  if (['saveDraft', 'publish', 'request', 'read', 'send', 'join', 'complete', 'rate', 'cancel'].includes(action2)) {
    const exchange = ['publish', 'request', 'send', 'join', 'complete', 'rate'].includes(action2);
    if (!await residenceFlows.ensureReady(exchange) || repo !== state.repo) throw Object.assign(new Error('Community action cancelled.'), { code: 'COMMUNITY_CANCELLED' });
  }
  state.communityBusy = true;
  try {
    const result = await repo.run(action2, value);
    if (repo !== state.repo) throw new Error("Your account changed. Please try again.");
    if (rerender) render();
    return result;
  } finally {
    state.communityBusy = false;
  }
}
function newDraft() {
  return { type: "available", category: "ingredients", offer: "free", visibility: "building", title: "", description: "", quantity: 1, unit: "item", pickup: "", expires_on: "", photos: [], dish: "", date: localDate(2), time: "5 PM" };
}
async function openComposer(draft) {
  if (!await residenceFlows.ensureReady(true)) return;
  state.composer = structuredClone(draft || state.repo?.data?.draft || newDraft());
  nav.go("compose", "", "nearby");
}
async function openChat(id) {
  await demo("read", id, false);
  nav.go("chat", id, "message");
}
function preserveInput(input) {
  const id = input.id, pos = input.selectionStart;
  render();
  const next = document.getElementById(id);
  next?.focus({ preventScroll: true });
  try {
    next?.setSelectionRange(pos, pos);
  } catch {
  }
}
async function action(name) {
  if (name === "back") {
    nav.back();
    return;
  }
  if (name === "auth" || name === "signup") {
    state.authMode = name === "signup" ? "signup" : "signin";
    flows.openAuth();
    return;
  }
  if (name === "manual") {
    flows.openManual();
    return;
  }
  if (name === "scan") {
    flows.openScan();
    return;
  }
  if (name === "explore") {
    if (getSession()) {
      nav.switchTab("home");
      await refresh();
      promptSetup();
      return;
    }
    state.pantry = kitchen.seedLocalPantry();
    localStorage.setItem("ingredi.demo-entered", "1");
    nav.switchTab("home");
    promptSetup();
    return;
  }
  if (name === "roll") {
    const count = discover(catalog(state.recipes), state.pantry, state.cook).length;
    state.roll = count > 1 ? (state.roll + 1 + Math.floor(Math.random() * (count - 1))) % count : 0;
    render();
    return;
  }
  if (name === "refresh") {
    await refresh();
    return;
  }
  if (name === "new-post") {
    await openComposer();
    return;
  }
  if (name === "save-draft") {
    await demo("saveDraft", state.composer, false);
    toast("Draft saved on this device.");
    return;
  }
  if (name === "toggle-map") {
    state.nearby.view = state.nearby.view === "map" ? "list" : "map";
    render();
    return;
  }
  if(name==='center-map'){const home=activeResidence(state.repo?.data);if(home?.center){state.mapView={...defaultView(home.center),zoom:state.nearby.scope==='building'?17:14};render();}return;}
  if (name === 'residence-setup') { residenceFlows.openSetup(); return; }
  if (name === 'residence-location') { residenceFlows.openSetup({ updateCurrent: true }); return; }
  if (name === 'student-check') { await residenceFlows.ensureReady(true); render(); return; }
  if (name === 'clear-nearby-filters') {
    Object.assign(state.nearby, { type: 'all', category: 'all', offer: 'all', distance: 1 });
    state.selectedPost = null;
    render();
    return;
  }
  if (name === 'nearby-filters') {
    const building = state.nearby.scope !== 'neighborhood';
    showModal('Nearby filters', `<p class="muted">Find what you need ${building ? 'in your building' : 'in the neighborhood'}.</p><label class="form-label">Post type<select id="filter-type"><option value="all">All posts</option><option value="available">Available</option><option value="wanted">Wanted</option><option value="meal_prep">Meal prep</option></select></label><label class="form-label" ${building ? 'hidden' : ''}>Distance<select id="filter-distance"><option value=".5">Within ½ mi</option><option value="1">Within 1 mi</option><option value="2">Within 2 mi</option></select></label><label class="form-label">Category<select id="filter-category"><option value="all">All categories</option><option value="ingredients">Ingredients</option><option value="meals">Meals</option><option value="equipment">Equipment</option></select></label><label class="form-label">Offer<select id="filter-offer"><option value="all">Free / Exchange</option><option value="free">Free</option><option value="exchange">Exchange</option></select></label><div class="modal-footer"><button class="button outline" id="clear-filters">Clear all</button><button class="button primary" id="apply-filters">Show listings</button></div>`);
    const fields = ['type', 'distance', 'category', 'offer'];
    for (const key of fields) $(`#filter-${key}`).value = state.nearby[key];
    $('#clear-filters').onclick = () => {
      for (const key of fields) $(`#filter-${key}`).value = key === 'distance' ? '1' : 'all';
    };
    $('#apply-filters').onclick = () => {
      for (const key of fields) state.nearby[key] = $(`#filter-${key}`).value;
      state.selectedPost = null;
      closeModal();
      render();
    };
    return;
  }
  if (name === "groups") {
    nav.go("groups");
    return;
  }
  if (name === "signout") {
    await signOut().catch(() => {
    });
    await sessionChanged();
    nav.go("welcome");
    return;
  }
  if (name === "leave-demo") {
    nav.go("welcome");
    return;
  }
  if (name === "reset-community") {
    showModal("Reset demo community?", `<p>Reset all saved residences, student status, sample ID checks, posts, messages, groups, bookmarks, preferences, and demo impact for this identity?</p><p class="muted">Your fridge and sign-in are preserved.</p><div class="modal-footer"><button class="button outline" id="keep-demo">Keep activity</button><button class="button primary" id="reset-demo">Reset demo</button></div>`);
    $("#keep-demo").onclick = closeModal;
    $("#reset-demo").onclick = async () => {
      if (state.busy) return;
      state.busy = true;
      $("#reset-demo").disabled = true;
      try {
        await state.repo.reset();
        syncResidence();
        state.composer = null;
        state.cook.tags = [];
        state.busy = false;
        closeModal();
        render();
        toast("Community demo reset. Your fridge is unchanged.");
      } catch (error) {
        state.busy = false;
        $("#reset-demo").disabled = false;
        modalError(error.message);
      }
    };
    return;
  }
  if (name === "dismiss-error") {
    state.error = "";
    render();
    return;
  }
  if (name === "retry-storage") {
    await loadCommunity();
    render();
  }
}
$("#app").addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  try {
    if (state.signed !== Boolean(getSession())) {
      await sessionChanged();
      toast("Your session changed. Please try that action again.");
      return;
    }
    if (button.dataset.tab) {
      nav.switchTab(button.dataset.tab);
      return;
    }
    if (button.dataset.action) {
      await action(button.dataset.action);
      return;
    }
    if (button.dataset.go) {
      nav.go(button.dataset.go, button.dataset.id || "");
      return;
    }
    if (button.dataset.cookTag) {
      const t = button.dataset.cookTag;
      state.cook.tags = state.cook.tags.includes(t) ? state.cook.tags.filter((x) => x !== t) : [...state.cook.tags, t];
      state.roll = 0;
      render();
      return;
    }
    if (button.dataset.fridgeFilter) {
      state.fridge.filter = button.dataset.fridgeFilter;
      render();
      return;
    }
    if (button.dataset.date) {
      flows.editDate(button.dataset.date);
      return;
    }
    if (button.dataset.delete) {
      flows.removeItem(button.dataset.delete);
      return;
    }
    if (button.dataset.resume) {
      flows.openReview(state.scans.find((s) => s.id === button.dataset.resume));
      return;
    }
    if (button.dataset.recipeTab) {
      state.recipeTabs[nav.route.id] = button.dataset.recipeTab;
      render();
      return;
    }
    if (button.dataset.save) {
      await demo("bookmark", button.dataset.save);
      toast("Recipe collection updated.");
      return;
    }
    if (button.dataset.find) {
      state.nearby = { ...state.nearby, search: button.dataset.find, type: "all", category: "all", offer: "all", view: "list" };
      nav.go("nearby", "", "nearby");
      return;
    }
    if (button.dataset.plan) {
      const r = catalog(state.recipes).find((r2) => r2.id === button.dataset.plan);
      await openComposer({ ...newDraft(), type: "meal_prep", category: "meals", title: `${r.name} meal swap`, dish: r.name, description: "Cook one dish at home, then swap portions with your neighbors." });
      return;
    }
    if (button.dataset.nearbyType) {
      state.nearby.type = button.dataset.nearbyType;
      render();
      return;
    }
    if (button.dataset.communityScope) {
      state.nearby.scope = button.dataset.communityScope;
      const home = activeResidence(state.repo?.data);
      state.mapView = home?.center ? { ...defaultView(home.center), zoom: state.nearby.scope === 'building' ? 17 : 14 } : null;
      state.selectedPost = null;
      render(); return;
    }
    if (button.dataset.marker) {
      state.selectedPost = button.dataset.marker;
      render();
      return;
    }
    if (button.dataset.draftOption) {
      state.composer[button.dataset.draftOption] = button.dataset.value;
      render();
      return;
    }
    if (button.dataset.removePhoto) {
      state.composer.photos.splice(Number(button.dataset.removePhoto), 1);
      render();
      return;
    }
    if (button.dataset.request) {
      const id = await demo("request", button.dataset.request, false);
      await openChat(id);
      return;
    }
    if (button.dataset.chat) {
      await openChat(button.dataset.chat);
      return;
    }
    if (button.dataset.inbox) {
      state.inbox = button.dataset.inbox;
      render();
      return;
    }
    if (button.dataset.complete) {
      const id = await demo("complete", button.dataset.complete, false);
      nav.go("reward", id, "message");
      return;
    }
    if (button.dataset.rating) {
      await demo("rate", { id: button.dataset.post, rating: Number(button.dataset.rating) });
      return;
    }
    if (button.dataset.join) {
      const g = state.repo.data.groups.find((g2) => g2.id === button.dataset.join), dish = $("#join-dish")?.value || g.members.find((m) => m.person === "you")?.dish;
      const id = await demo("join", { id: g.id, dish }, false);
      state.inbox = "group";
      await openChat(id);
      return;
    }
    if (button.dataset.preference) {
      const prefs = state.repo.data.preferences, t = button.dataset.preference;
      const next = prefs.includes(t) ? prefs.filter((p) => p !== t) : [...prefs, t];
      await demo("preferences", next, false);
      state.cook.tags = [...next];
      render();
      return;
    }
    if (button.dataset.cancelPost) {
      await demo("cancel", button.dataset.cancelPost);
      toast("Demo post cancelled.");
    }
  } catch (error) {
    if (error.code === 'COMMUNITY_CANCELLED') return;
    state.error = error.message;
    render();
  }
});
$("#app").addEventListener("input", (event) => {
  const input = event.target;
  if (input.dataset.search) {
    state[input.dataset.search].search = input.value;
    state.roll = 0;
    preserveInput(input);
  }
  if (input.dataset.draftField) state.composer[input.dataset.draftField] = input.dataset.draftField === "quantity" ? Number(input.value) : input.value;
});
$("#app").addEventListener("change", async (event) => {
  const input = event.target;
  if (input.dataset.nearbyField) {
    state.nearby[input.dataset.nearbyField] = input.value;
    render();
  }
  if (input.id === "join-dish") state.groupDishes[nav.route.id] = input.value;
  if (input.id === "post-photos") {
    const draft = state.composer;
    const generation = identityGeneration;
    try {
      for (const file of input.files) {
        if (draft.photos.length >= 5) break;
        if (file.size > MAX_IMAGE_BYTES) throw new Error("Choose photos under 6 MB each.");
        validateImage(new Uint8Array(await file.arrayBuffer()), file.type);
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
        if (!blob) throw new Error("This photo could not be prepared.");
        if (state.composer !== draft || generation !== identityGeneration) return;
        draft.photos.push(blob);
      }
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }
});
$("#app").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.communityBusy) return;
  const form = event.target;
  try {
    if (state.signed !== Boolean(getSession())) {
      await sessionChanged();
      toast("Your session changed. Please try that action again.");
      return;
    }
    if (form.id === "post-form") {
      const id = await demo("publish", state.composer, false);
      const post = state.repo.data.posts.find((p) => p.id === id);
      state.composer = null;
      nav.go(post.groupId ? "group" : "post", post.groupId || id, "nearby");
      toast(post.groupId ? "Demo group created." : "Posted! A sample neighbor sent you a request.");
    }
    if (form.id === "message-form") {
      const input = form.elements.text, text = input.value;
      await demo("send", { id: nav.route.id, text });
      $("#chat-text")?.focus();
    }
    if (form.id === "profile-form") {
      const value = Object.fromEntries(new FormData(form));
      if (!value.display_name.trim()) throw new Error("Enter your name.");
      const button = form.querySelector("button");
      button.disabled = true;
      try {
        await kitchen.updateProfile(value);
        await demo("profile", value, false);
        if (state.signed) state.profile = value;
        nav.back();
        toast("Profile saved.");
      } finally {
        button.disabled = false;
      }
    }
  } catch (error) {
    if (error.code === 'COMMUNITY_CANCELLED') return;
    state.error = error.message;
    render();
  }
});
async function initialize() {
  if (!location.hash) {
    let entered = false;
    try {
      entered = Boolean(localStorage.getItem("ingredi.demo-entered"));
    } catch {
    }
    nav.go(state.signed || entered || state.pantry.length ? "home" : "welcome", "", "home", { replace: true });
  }
  render();
  await loadCommunity();
  render();
  await refresh();
  promptSetup();
}
initialize().catch((error) => {
  state.error = error.message;
  state.loading = false;
  render();
});
