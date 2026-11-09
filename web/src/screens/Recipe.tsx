import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BackIcon, BookmarkIcon } from "../components/Icons";
import { recipes } from "../data/content";

const dot = (have: boolean) => ({
  width: 10, height: 10, borderRadius: 5, flexShrink: 0,
  background: have ? "var(--primary)" : "var(--bg)",
  boxShadow: have ? undefined : "inset 0 0 0 2px var(--text-disabled)",
});

export function Recipe() {
  const nav = useNavigate();
  const { id } = useParams();
  const recipe = (id && recipes[id]) || recipes.bibimbap;
  const [tab, setTab] = useState<"ing" | "steps">("ing");
  const [saved, setSaved] = useState(false);
  const have = recipe.ingredients.filter((i) => i.have).length;
  const total = recipe.ingredients.length;

  return (
    <>
      <main className="screen-scroll" style={{ gap: 20, paddingBottom: 24 }}>
        <div role="img" aria-label={recipe.name} style={{ height: 260, position: "relative", background: `var(--surface-muted) url("${recipe.photo}") center / cover no-repeat` }}>
          <button type="button" className="icon-btn icon-btn--over-media" aria-label="Back" style={{ position: "absolute", left: 16, top: "var(--overlay-top)" }}
            onClick={() => (window.history.state?.idx ? nav(-1) : nav("/cook"))}><BackIcon /></button>
          <button type="button" className="icon-btn icon-btn--over-media" aria-label={saved ? "Saved" : "Save recipe"} aria-pressed={saved}
            style={{ position: "absolute", right: 16, top: "var(--overlay-top)" }} onClick={() => setSaved(!saved)}>
            <BookmarkIcon filled={saved} color={saved ? "var(--primary)" : undefined} />
          </button>
        </div>

        <section style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <h1 className="h1" style={{ fontSize: 26, lineHeight: "32px" }}>{recipe.name}</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {recipe.meta.map((m) => <span key={m} className="tag" style={{ fontSize: 13, padding: "6px 12px", color: "var(--text-primary)" }}>{m}</span>)}
          </div>
          <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ fontWeight: 600 }}>You have {have} of {total} ingredients</span>
              <span style={{ color: "var(--text-secondary)" }}>{total - have} missing</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--surface-muted)" }}>
              <div style={{ width: `${Math.round((have / total) * 100)}%`, height: 8, borderRadius: 4, background: "var(--primary)" }} />
            </div>
          </div>
        </section>

        <div role="tablist" className="seg" style={{ margin: "0 16px" }}>
          <button role="tab" aria-selected={tab === "ing"} onClick={() => setTab("ing")}>Ingredients</button>
          <button role="tab" aria-selected={tab === "steps"} onClick={() => setTab("steps")}>Steps</button>
        </div>

        {tab === "ing" ? (
          <section style={{ padding: "0 16px", display: "flex", flexDirection: "column" }}>
            {recipe.ingredients.map((i) => (
              <div key={i.name} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={dot(i.have)} />
                  <span style={{ flex: 1, fontSize: 15 }}>{i.name}</span>
                  <span className="tag" style={{ fontSize: 11, padding: "2px 8px" }}>{i.importance}</span>
                  <span className="small" style={{ width: 56, textAlign: "right" }}>{i.have ? "Have" : "Missing"}</span>
                </div>
                {!i.have && (
                  <div style={{ marginLeft: 20, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="small" style={{ background: "var(--surface-muted)", borderRadius: 8, padding: "6px 10px" }}>Swap: {i.sub}</span>
                    <Link to="/nearby" style={{ fontSize: 13, textDecoration: "underline" }}>Find nearby</Link>
                  </div>
                )}
              </div>
            ))}
          </section>
        ) : (
          <ol style={{ margin: 0, padding: "0 16px 0 40px", display: "flex", flexDirection: "column", gap: 14, fontSize: 15, lineHeight: 1.5 }}>
            {recipe.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        )}
      </main>

      <div className="action-bar">
        <Link to="/nearby" className="btn btn--secondary" style={{ borderRadius: 14, fontWeight: 500, fontSize: 15 }}>Find nearby</Link>
        <Link to="/meal-swap" className="btn btn--primary" style={{ borderRadius: 14, fontSize: 15 }}>Plan meal prep</Link>
      </div>
    </>
  );
}
