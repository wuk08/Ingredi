import { useState } from "react";
import { Link } from "react-router-dom";
import { BellButton } from "../components/BellButton";
import { Chip } from "../components/Chip";
import { Illustration } from "../components/Illustration";
import { Photo } from "../components/PhotoPlaceholder";
import { clearFridge, forYou, fridge, preferences, randomPicks, recipeHave, recipeLink } from "../data/content";
import { useStore } from "../data/store";

export function Cook() {
  const { unreadNotifs } = useStore();
  const [on, setOn] = useState<Record<string, boolean>>({ Korean: true });
  const [spin, setSpin] = useState(0);
  const pickName = randomPicks[spin % randomPicks.length];
  const pick = { name: pickName, ...recipeHave(pickName) };

  return (
    <div className="screen-scroll" style={{ padding: "56px 0 24px", gap: 26 }}>
      <section style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <h1 className="h1">What should we cook today?</h1>
          <BellButton count={unreadNotifs.length} />
        </header>
        <label style={{ height: 44, borderRadius: 26, background: "var(--surface-muted)", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input aria-label="Search recipes or ingredients" placeholder="Search recipes or ingredients"
            style={{ flex: 1, border: 0, background: "transparent", font: "inherit", fontSize: 15, color: "var(--text-primary)", outline: "none" }} />
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {preferences.map((p) => <Chip key={p} label={p} selected={!!on[p]} onToggle={() => setOn({ ...on, [p]: !on[p] })} />)}
        </div>
      </section>

      <section style={{ padding: "0 16px" }}>
        <div className="card" style={{ padding: "12px 8px 8px", display: "flex", flexDirection: "column", gap: 10, borderRadius: 20 }}>
          <span className="small" style={{ paddingLeft: 4 }}>Can’t decide? Roll for a random recipe</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <Link to={recipeLink(pick.name)} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{pick.name}</span>
              <span style={{ display: "flex", gap: 6 }}>
                <span className="tag">{pick.time}</span>
                <span className="tag">Have {pick.have}/{pick.total} ingredients</span>
              </span>
            </Link>
            <button type="button" className="btn btn--primary btn--sm" style={{ width: 100 }} onClick={() => setSpin(spin + 1 + Math.floor(Math.random() * 3))}>Roll</button>
          </div>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ padding: "0 8px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h2">My fridge</h2>
          <Link to="/fridge/add" className="btn btn--primary btn--sm">+ Fill up fridge</Link>
        </div>
        <div className="row-scroll" style={{ gap: 6 }}>
          {fridge.map((f) => (
            <div key={f.name} className="box" style={{ width: 88, height: 112, padding: "22px 8px 10px", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
              <span className="tag" style={{ position: "absolute", top: 8, right: 8, fontSize: 11, padding: "2px 7px" }}>{f.exp}</span>
              <Illustration name={f.art} label={f.name} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</span>
            </div>
          ))}
        </div>
      </section>

      {[{ title: "Based on your preference…", items: forYou.map((r) => { const h = recipeHave(r.name); return { ...r, meta: `${h.time} · ${h.have}/${h.total} ingredients`, uses: "" }; }) }, { title: "Let’s clear up fridge", items: clearFridge }].map((sec) => (
        <section key={sec.title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 className="h2" style={{ padding: "0 16px" }}>{sec.title}</h2>
          <div className="row-scroll">
            {sec.items.map((r) => (
              <Link key={r.name} to={recipeLink(r.name)} style={{ width: 236, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ position: "relative" }}>
                  <Photo src={r.photo} alt={r.name} style={{ width: "100%", height: 140, borderRadius: 20 }} />
                  {r.uses && <span className="tag" style={{ position: "absolute", left: 10, bottom: 10, background: "#fff", color: "var(--text-primary)" }}>{r.uses}</span>}
                </span>
                <span className="title" style={{ padding: "0 4px" }}>{r.name}</span>
                <span className="small" style={{ padding: "0 4px", marginTop: -4 }}>{r.meta}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
