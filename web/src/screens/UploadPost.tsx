import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CameraIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import type { PostType } from "../data/content";
import type { PostDraft } from "./PostDone";

const typeCards: { label: PostType; hint: string }[] = [
  { label: "Available", hint: "Give away" },
  { label: "Wanted", hint: "Ask for" },
  { label: "Meal Prep", hint: "Start a group" },
];
const h = { fontFamily: "var(--font-display)", margin: 0, fontSize: 15, fontWeight: 500 } as const;

export function UploadPost() {
  const [type, setType] = useState<PostType>("Available");
  const [cat, setCat] = useState("Ingredients");
  const [deal, setDeal] = useState("Free");
  const [qty, setQty] = useState(1);
  const [photos, setPhotos] = useState(2);
  const [approx, setApprox] = useState(true);
  const [title, setTitle] = useState("");
  const nav = useNavigate();
  const mp = type === "Meal Prep", w = type === "Wanted";
  const deals = mp ? ["Split cost", "Free"] : ["Free", "Exchange"];

  return (
    <>
      <TopBar close title="New Post" right={<button type="button" style={{ border: 0, background: "transparent", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>Save draft</button>} />
      <main className="screen-scroll" style={{ padding: "18px 16px 24px", gap: 22, boxShadow: "inset 0 1px 0 var(--divider)" }}>
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h}>What are you posting?</h2>
          <div role="radiogroup" aria-label="Post type" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
            {typeCards.map((t) => {
              const on = type === t.label;
              return (
                <button key={t.label} type="button" role="radio" aria-checked={on} onClick={() => { setType(t.label); setDeal(t.label === "Meal Prep" ? "Split cost" : "Free"); }}
                  style={{ height: 64, borderRadius: 14, border: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                    background: on ? "var(--primary)" : "var(--surface)", color: on ? "var(--text-on-primary)" : "var(--text-primary)" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{t.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>{t.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h}>Photos <span style={{ fontWeight: 400, color: "var(--text-secondary)", fontFamily: "var(--font-text)" }}>{photos}/5</span></h2>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            <button type="button" aria-label="Add photo" onClick={() => setPhotos(Math.min(5, photos + 1))}
              style={{ flex: "0 0 88px", height: 88, borderRadius: 14, border: 0, background: "var(--surface-muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
              <CameraIcon />Add
            </button>
            {Array.from({ length: photos }, (_, i) => (
              <span key={i} style={{ flex: "0 0 88px", height: 88, borderRadius: 14, background: "var(--surface-muted)", position: "relative" }}>
                {i === 0 && <span className="tag" style={{ position: "absolute", left: 6, bottom: 6, fontSize: 10, padding: "2px 6px", background: "#fff", color: "var(--text-primary)" }}>Cover</span>}
              </span>
            ))}
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="post-title" style={{ fontSize: 15, fontWeight: 500 }}>Title</label>
          <input id="post-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={mp ? "e.g. Korean Food Week" : w ? "e.g. I need two eggs" : "e.g. 3 ripe avocados"} />
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h}>Category</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Ingredients", "Meals", "Equipment"].map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h}>Offer</h2>
          <div role="radiogroup" aria-label="Offer" className="seg">
            {deals.map((d) => <button key={d} type="button" role="radio" aria-checked={deal === d} onClick={() => setDeal(d)}>{d}</button>)}
          </div>
          {deal === "Exchange" && <input className="field" aria-label="What would you like in exchange?" placeholder="What would you like in exchange? (e.g. eggs, bread)" style={{ fontSize: 14 }} />}
        </section>

        <section className="rows">
          <div style={{ minHeight: 56 }}>
            <span>{mp ? "Spots open" : "Quantity"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button type="button" aria-label="Decrease" className="stepper" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span style={{ minWidth: 20, textAlign: "center", fontSize: 16, fontWeight: 600 }}>{qty}</span>
              <button type="button" aria-label="Increase" className="stepper" onClick={() => setQty(qty + 1)}>+</button>
            </span>
          </div>
          <div style={{ minHeight: 56 }}><span>{mp ? "Prep date" : w ? "Needed by" : "Best before"}</span><span style={{ color: "var(--text-body)" }}>{mp ? "Sat, Nov 6" : "Nov 4"} ▾</span></div>
          <div style={{ minHeight: 56 }}><span>{mp ? "Time" : "Pickup window"}</span><span style={{ color: "var(--text-body)" }}>Today, 5–8 PM ▾</span></div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="post-desc" style={{ fontSize: 15, fontWeight: 500 }}>Description</label>
          <textarea id="post-desc" className="field" rows={4} placeholder="Condition, how it was stored, pickup notes…" />
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h}>Pickup location</h2>
          <div className="mini-map" style={{ height: 120 }}>
            <div className="road" style={{ left: 0, right: 0, top: 54, height: 12 }} />
            <div className="road" style={{ top: 0, bottom: 0, left: 230, width: 12 }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 90, height: 90, margin: "-45px 0 0 -45px", borderRadius: 45, background: "rgba(43,43,43,.12)" }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 18, height: 18, margin: "-9px 0 0 -9px", borderRadius: 9, background: "var(--primary)", border: "3px solid #fff" }} />
            <span className="tag" style={{ position: "absolute", left: 10, bottom: 10, background: "#fff", color: "var(--text-primary)" }}>Near Main St &amp; 5th</span>
          </div>
          <button type="button" role="switch" aria-checked={approx} onClick={() => setApprox(!approx)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 48, padding: 0, border: 0, background: "transparent", fontSize: 15, cursor: "pointer", textAlign: "left" }}>
            <span>Show approximate location only</span><span className="switch" />
          </button>
        </section>
      </main>
      <div className="action-bar">
        <button type="button" className="btn btn--primary" style={{ borderRadius: 14 }}
          onClick={() => {
            const draft: PostDraft = { type, deal, qty, title: title.trim() || (mp ? "Korean Food Week" : w ? "Two eggs" : "3 ripe avocados"),
              when: mp ? "Sat, Nov 6" : "Today, 5–8 PM", where: approx ? "Near Main St & 5th" : "Main St & 5th" };
            nav("/post/done", { state: draft });
          }}>{mp ? "Create group" : "Post"}</button>
      </div>
    </>
  );
}
