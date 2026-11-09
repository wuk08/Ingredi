import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { ChevronIcon, PlusIcon } from "../components/Icons";
import { savedRecipes, recipeLink } from "../data/content";
import { useStore } from "../data/store";

const stat = (n: string, label: string) => (
  <div style={{ background: "var(--fill-on-surface)", borderRadius: 14, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontSize: 20, fontWeight: 600 }}>{n}</span><span className="caption" style={{ fontWeight: 400 }}>{label}</span>
  </div>
);

const row = (to: string, label: string, value?: string) => (
  <Link to={to} style={{ display: "flex", alignItems: "center", gap: 12, height: 56, boxShadow: "0 1px 0 var(--divider)", fontSize: 16 }}>
    <span style={{ flex: 1 }}>{label}</span>{value && <span className="small">{value}</span>}<ChevronIcon />
  </Link>
);

export function My() {
  const { tokens, points } = useStore();
  const next = 1500;
  return (
    <main className="screen-scroll" style={{ padding: "56px 16px 24px", gap: 22 }}>
      <section style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar name="Jason Park" size={72} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <h1 className="h1" style={{ fontSize: 22 }}>Jason Park</h1>
          <span style={{ fontSize: 14, color: "var(--text-body)" }}>Ann Arbor, MI<br />Joined Sep 2026</span>
        </div>
        <button type="button" className="btn btn--secondary btn--sm">Edit</button>
      </section>

      <section className="box" style={{ borderRadius: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 className="h3">My Impact</h2><span style={{ fontSize: 13 }}>Level 3 · Good Neighbor</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>{points.toLocaleString()} points</span><span style={{ color: "var(--text-body)" }}>{Math.max(0, next - points)} to Level 4</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#fff" }}>
            <div style={{ width: `${Math.min(100, (points / next) * 100)}%`, height: 8, borderRadius: 4, background: "var(--primary)", transition: "width .6s" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
          {stat("18", "Items shared")}{stat("27", "Meals rescued")}{stat("$86", "Est. savings")}
        </div>
      </section>

      <section style={{ borderRadius: 20, padding: "14px 14px 14px 16px", display: "flex", alignItems: "center", gap: 12, background: "var(--surface-muted)" }}>
        <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 22, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /></svg>
        </span>
        <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="small">My tokens</span><span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1 }}>{tokens}</span>
        </span>
        <Link to="/tokens" className="btn btn--primary" style={{ minHeight: 40, padding: "0 16px", fontSize: 14, fontWeight: 500, gap: 6 }}><PlusIcon size={16} color="#fff" />Get tokens</Link>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 className="h3">Saved Recipes</h2>
          <Link to="/cook" style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-ink)" }}>view all</Link>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
          {savedRecipes.map((r) => (
            <Link key={r.name} to={recipeLink(r.name)} style={{ flex: "0 0 132px", display: "flex", flexDirection: "column", gap: 6 }}>
              <span role="img" aria-label={r.name} style={{ height: 100, borderRadius: 16, background: `var(--surface-muted) url("${r.photo}") center / cover no-repeat` }} />
              <span style={{ fontSize: 14 }}>{r.name}</span>
            </Link>
          ))}
          <span aria-hidden="true" style={{ flex: "0 0 6px" }} />
        </div>
      </section>

      <div>
        {row("/post", "My Posts / Shares", "2 active")}
        {row("/cook", "Preferences", "Korean, Spicy")}
        {row("/my", "Settings")}
        <Link to="/" style={{ display: "flex", alignItems: "center", height: 56, color: "var(--text-body)", fontSize: 15 }}>Log out</Link>
      </div>
    </main>
  );
}
