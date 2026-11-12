import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fridgeAddedSvg } from "../assets/celebrate";
import { ChevronIcon } from "../components/Icons";
import { Illustration, illustrationFor } from "../components/Illustration";
import { recipeLink } from "../data/content";
import "./celebrate.css";

const cookNow = [
  { name: "Chicken & Spinach Stir-fry", time: "20 min", have: "Have 5/6 ingredients" },
  { name: "Cheesy Tomato Omelette", time: "15 min", have: "Have 4/4 ingredients" },
];

export function ScanDone() {
  const location = useLocation();
  const result = (location.state as { count?: number; names?: string[] } | null) || {};
  const count = result.count || result.names?.length || 0;
  const names = result.names || [];
  const [run, setRun] = useState(0);
  useEffect(() => { const t = setTimeout(() => setRun(1), 150); return () => clearTimeout(t); }, []);
  return (
    <>
      <main className="screen-scroll" style={{ padding: "max(96px, calc(var(--safe-top) + 52px)) 16px 24px", gap: 24 }}>
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <button type="button" aria-label="Play again" onClick={() => setRun(run + 1)} style={{ width: 140, height: 140, border: 0, padding: 0, background: "transparent", cursor: "pointer", marginTop: -24 }}>
            {run > 0 && <span key={run} style={{ display: "block" }} dangerouslySetInnerHTML={{ __html: fridgeAddedSvg }} />}
          </button>
          <h1 className="h1">{count} item{count === 1 ? "" : "s"} added to your fridge</h1>
          <p className="body" style={{ margin: 0, fontSize: 15 }}>{names.join(", ") || "Your reviewed ingredients are ready."}</p>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 className="h3" style={{ fontSize: 15 }}>Use these soon</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Baby spinach · 3 days", "Chicken thighs · 3 days"].map((t) => <span key={t} className="tag" style={{ fontSize: 13, padding: "6px 12px", color: "var(--text-primary)" }}>{t}</span>)}
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 className="h3" style={{ fontSize: 15 }}>You can cook now</h2>
          {cookNow.map((r) => (
            <Link key={r.name} to={recipeLink(r.name)} className="card" style={{ display: "flex", gap: 12, alignItems: "center", padding: 10 }}>
              <span className="scan-done-art"><Illustration name={illustrationFor(r.name)} size={64} label={r.name} /></span>
              <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{r.name}</span>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><span className="tag">{r.time}</span><span className="tag">{r.have}</span></span>
              </span>
              <ChevronIcon />
            </Link>
          ))}
        </section>
      </main>
      <div className="action-bar">
        <Link to="/scan" className="btn btn--secondary" style={{ borderRadius: 14, fontSize: 15, fontWeight: 500 }}>Scan another</Link>
        <Link to="/cook" className="btn btn--primary" style={{ borderRadius: 14, fontSize: 15 }}>Done</Link>
      </div>
    </>
  );
}
