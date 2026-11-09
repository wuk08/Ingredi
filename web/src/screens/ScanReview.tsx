import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";

const exps = ["3 days", "1 week", "2 weeks", "1 month"];
type Item = { name: string; qty: string; e: number; on: boolean };
const seed: Item[] = [
  { name: "Milk", qty: "1 gal", e: 1, on: true },
  { name: "Eggs", qty: "12 ct", e: 2, on: true },
  { name: "Chicken thighs", qty: "1.5 lb", e: 0, on: true },
  { name: "Baby spinach", qty: "5 oz", e: 0, on: true },
  { name: "Tomatoes", qty: "4", e: 1, on: true },
  { name: "Cheddar cheese", qty: "8 oz", e: 3, on: true },
  { name: "Tortillas", qty: "10 ct", e: 2, on: false },
];

export function ScanReview() {
  const [items, setItems] = useState(seed);
  const [guessOpen, setGuessOpen] = useState(true);
  const upd = (n: string, f: (x: Item) => Item) => setItems(items.map((x) => (x.name === n ? f(x) : x)));
  const count = items.filter((x) => x.on).length;
  const allOn = count === items.length;

  return (
    <>
      <TopBar title="Review items" right={<Link to="/scan" style={{ height: 44, padding: "0 6px", display: "flex", alignItems: "center", fontSize: 14, color: "var(--text-body)" }}>Rescan</Link>} />
      <main className="screen-scroll" style={{ padding: "8px 16px 24px", gap: 18 }}>
        <section className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
          <span aria-hidden="true" style={{ width: 44, height: 60, borderRadius: 4, background: "var(--surface-muted)", flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, padding: "8px 6px" }}>
            {["100%", "70%", "100%", "60%"].map((w, i) => <span key={i} style={{ height: 3, width: w, background: "#D9CFC4", borderRadius: 2 }} />)}
          </span>
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>We found {items.length} food items</span>
            <span className="small">Kroger · Nov 1 · 3 non-food items skipped</span>
          </span>
        </section>

        {guessOpen && (
          <section style={{ borderRadius: 16, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, background: "var(--surface-muted)" }}>
            <span className="small">We couldn’t read one line: <span style={{ fontFamily: "ui-monospace, Menlo, monospace", background: "var(--surface)", padding: "1px 6px", borderRadius: 4 }}>GRN ONI 2</span></span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ flex: 1, fontSize: 15 }}>Is it <b style={{ fontWeight: 600 }}>Green onion</b>?</span>
              <button type="button" className="btn btn--pill-white btn--sm" style={{ padding: "0 12px" }} onClick={() => setGuessOpen(false)}>Skip</button>
              <button type="button" className="btn btn--primary btn--sm" style={{ padding: "0 14px" }} onClick={() => { setItems([...items, { name: "Green onion", qty: "2 bunches", e: 1, on: true }]); setGuessOpen(false); }}>Yes, add</button>
            </div>
          </section>
        )}

        <section style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 4 }}>
            <h2 className="h3" style={{ fontSize: 15 }}>Items</h2>
            <button type="button" onClick={() => setItems(items.map((x) => ({ ...x, on: !allOn })))} style={{ height: 36, padding: "0 4px", border: 0, background: "transparent", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>{allOn ? "Deselect all" : "Select all"}</button>
          </div>
          {items.map((x) => (
            <div key={x.name} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 56, boxShadow: "0 1px 0 var(--divider)" }}>
              <button type="button" role="checkbox" aria-checked={x.on} aria-label={`Include ${x.name}`} onClick={() => upd(x.name, (y) => ({ ...y, on: !y.on }))}
                style={{ width: 28, height: 28, borderRadius: 8, border: 0, padding: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  background: x.on ? "var(--primary)" : "var(--bg)", boxShadow: x.on ? undefined : "inset 0 0 0 1.5px var(--text-tertiary)" }}>
                {x.on && <CheckIcon size={14} color="#fff" />}
              </button>
              <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1, opacity: x.on ? 1 : 0.5 }}>
                <span style={{ fontSize: 15 }}>{x.name}</span><span className="caption" style={{ fontWeight: 400 }}>{x.qty}</span>
              </span>
              <button type="button" className="tag" aria-label={`Change best-before for ${x.name}`} onClick={() => upd(x.name, (y) => ({ ...y, e: y.e + 1 }))}
                style={{ height: 32, padding: "0 12px", fontSize: 13, border: 0, cursor: "pointer", color: "var(--text-primary)" }}>{exps[x.e % exps.length]} ▾</button>
            </div>
          ))}
        </section>
        <p className="caption" style={{ margin: 0, fontWeight: 400 }}>Best-before dates are estimated. Tap one to change it.</p>
      </main>
      <div className="action-bar">
        <Link to="/scan/done" className="btn btn--primary" style={{ borderRadius: 14 }}>{count ? `Add ${count} item${count > 1 ? "s" : ""} to fridge` : "Select items to add"}</Link>
      </div>
    </>
  );
}
