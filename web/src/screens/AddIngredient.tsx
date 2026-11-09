import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { localDate } from "../../../public/lib/domain.mjs";
import { CameraIcon, CheckIcon, CloseIcon, SearchIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import { useAppState } from "../data/AppState";

const exps = ["3 days", "1 week", "2 weeks", "1 month"];
const expiryOffsets = [3, 7, 14, 30];
const quickList = ["Milk", "Eggs", "Onion", "Garlic", "Chicken", "Tomato", "Carrot", "Cheese", "Bread", "Green onion"];
type Item = { name: string; e: number; on: boolean };

export function AddIngredient() {
  const nav = useNavigate();
  const { addPantry, busy } = useAppState();
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<Item[]>([{ name: "Milk", e: 1, on: true }, { name: "Onion", e: 2, on: true }]);
  const has = (n: string) => items.some((x) => x.name.toLowerCase() === n.toLowerCase());
  const add = (n: string) => { if (n && !has(n)) { setItems([...items, { name: n, e: 1, on: true }]); setDraft(""); } };
  const remove = (n: string) => setItems(items.filter((x) => x.name !== n));
  const upd = (n: string, f: (x: Item) => Item) => setItems(items.map((x) => (x.name === n ? f(x) : x)));
  const count = items.filter((x) => x.on).length;
  const save = async () => {
    const selected = items.filter((item) => item.on).map((item) => ({ name: item.name, quantity: 1, unit: "item", expires_on: localDate(expiryOffsets[item.e % expiryOffsets.length]) }));
    if (selected.length) await addPantry(selected);
    nav("/cook");
  };

  return (
    <>
      <TopBar close title="Fill up fridge" />
      <main className="screen-scroll" style={{ padding: "12px 16px 24px", gap: 22 }}>
        <form style={{ display: "flex", gap: 8 }} onSubmit={(e) => { e.preventDefault(); add(draft.trim()); }}>
          <label className="card" style={{ flex: 1, height: 48, borderRadius: 24, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", minWidth: 0 }}>
            <SearchIcon />
            <input aria-label="Ingredient name" placeholder="Type an ingredient" value={draft} onChange={(e) => setDraft(e.target.value)}
              style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", font: "inherit", fontSize: 15, color: "var(--text-primary)", outline: "none" }} />
          </label>
          <button type="submit" className="btn btn--primary" style={{ minHeight: 48, padding: "0 18px", fontSize: 15, fontWeight: 500 }}>Add</button>
        </form>

        <Link to="/scan" className="btn btn--secondary" style={{ minHeight: 48, borderRadius: 14, fontSize: 15, fontWeight: 500 }}>
          <CameraIcon size={20} color="var(--text-primary)" />Scan receipt or groceries
        </Link>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 className="h3" style={{ fontSize: 15 }}>Quick add</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {quickList.map((l) => {
              const on = has(l);
              return <button key={l} type="button" className="chip" aria-pressed={on} onClick={() => (on ? remove(l) : add(l))}>{on ? "✓ " : "+ "}{l}</button>;
            })}
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 className="h3" style={{ fontSize: 15 }}>Adding ({count})</h2>
            <span className="caption" style={{ fontWeight: 400 }}>Tap the date to change it</span>
          </div>
          {items.length === 0 && <p className="small" style={{ margin: "8px 0 0", fontSize: 14 }}>Nothing yet. Type an ingredient or tap one above.</p>}
          {items.map((x) => (
            <div key={x.name} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 56, boxShadow: "0 1px 0 var(--divider)" }}>
              <button type="button" role="checkbox" aria-checked={x.on} aria-label={`Add ${x.name}`} onClick={() => upd(x.name, (y) => ({ ...y, on: !y.on }))}
                style={{ width: 32, height: 32, borderRadius: 16, border: 0, padding: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  background: x.on ? "var(--primary-tint)" : "var(--surface-muted)" }}>
                <CheckIcon size={16} color={x.on ? "var(--primary)" : "#CFC5BA"} />
              </button>
              <span style={{ flex: 1, fontSize: 15, minWidth: 0, color: x.on ? "var(--text-primary)" : "var(--text-tertiary)" }}>{x.name}</span>
              <button type="button" className="tag" aria-label={`Change best-before for ${x.name}`} onClick={() => upd(x.name, (y) => ({ ...y, e: y.e + 1 }))}
                style={{ height: 32, padding: "0 12px", fontSize: 13, border: 0, cursor: "pointer", color: "var(--text-primary)" }}>{exps[x.e % exps.length]} ▾</button>
              <button type="button" aria-label={`Remove ${x.name}`} onClick={() => remove(x.name)}
                style={{ width: 36, height: 36, borderRadius: 18, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <CloseIcon size={16} color="var(--text-secondary)" />
              </button>
            </div>
          ))}
        </section>
      </main>
      <div className="action-bar">
        <button type="button" className="btn btn--primary" disabled={busy} style={{ borderRadius: 14 }} onClick={() => void save()}>{busy ? "Adding…" : count ? `Add ${count} item${count > 1 ? "s" : ""} to fridge` : "Done"}</button>
      </div>
    </>
  );
}
