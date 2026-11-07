const tabs = [["home", "Home", "home"], ["cook", "Cook", "chef"], ["nearby", "Nearby", "pin"], ["message", "Message", "message"], ["my", "My", "user"]];
const views = /* @__PURE__ */ new Set(["home", "cook", "nearby", "message", "my", "welcome", "fridge", "recipe", "post", "compose", "group", "groups", "chat", "reward", "posts", "saved", "preferences", "settings", "profile"]);
function parseRoute(hash) {
  let [tab = "home", view, id = ""] = hash.replace(/^#\/?/, "").split("/");
  if (tab === "welcome") return { tab: "home", view: "welcome", id: "", path: "#/welcome" };
  if (!tabs.some((t) => t[0] === tab)) tab = "home";
  if (!views.has(view)) view = tab;
  try {
    id = decodeURIComponent(id);
  } catch {
    id = "";
  }
  return { tab, view, id, path: `#/${tab}${view !== tab ? `/${view}${id ? `/${encodeURIComponent(id)}` : ""}` : ""}` };
}
class Navigation {
  constructor(onChange) {
    this.onChange = onChange;
    this.positions = /* @__PURE__ */ new Map();
    this.route = parseRoute(location.hash);
    window.addEventListener("hashchange", () => this.changed());
  }
  changed() {
    this.route = parseRoute(location.hash);
    this.onChange(this.route);
    requestAnimationFrame(() => window.scrollTo(0, this.positions.get(this.route.path) || 0));
  }
  go(view, id = "", tab = this.route.tab, { replace = false } = {}) {
    this.positions.set(this.route.path, window.scrollY);
    const path = view === "welcome" ? "#/welcome" : `#/${tab}${view !== tab ? `/${view}${id ? `/${encodeURIComponent(id)}` : ""}` : ""}`;
    if (replace) {
      history.replaceState({ ingredi: true, depth: history.state?.depth || 0 }, "", path);
      this.changed();
    } else if (path !== location.hash) {
      history.pushState({ ingredi: true, depth: (history.state?.depth || 0) + 1 }, "", path);
      this.changed();
    } else this.onChange(this.route);
  }
  switchTab(tab) {
    this.go(tab, "", tab);
  }
  back() {
    if (history.state?.ingredi && history.state.depth > 0) {
      this.positions.set(this.route.path, window.scrollY);
      history.back();
    } else this.go(this.route.tab, "", this.route.tab, { replace: true });
  }
}
export {
  Navigation,
  parseRoute,
  tabs
};
