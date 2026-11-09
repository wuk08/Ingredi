import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { PlusIcon, SearchIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import { swapDishes, swapMembers } from "../data/content";
import { photos } from "../assets/photos";
import type { PersonaName } from "../data/people";

const DISH_PHOTO: Record<string, string> = {
  Bibimbap: photos["bibimbap"], "Spicy Pork": photos["spicy-pork"], "Kimchi Fried Rice": photos["kimchi-fried-rice"],
  "Kimchi Jjigae": photos["kimchi-jjigae"], Japchae: photos["japchae"],
};
const dishBg = (d: string, base = "var(--surface-muted)") => (DISH_PHOTO[d] ? `${base} url("${DISH_PHOTO[d]}") center / cover no-repeat` : base);
const h2: CSSProperties = { fontFamily: "var(--font-display)", margin: 0, fontSize: 18, fontWeight: 500 };
const cooksBase = [
  { name: "Jack Lee", dish: "Bibimbap", tag: "Host" },
  { name: "Mason Mei", dish: "Spicy Pork", tag: "Cooking" },
  { name: "Ari Kim", dish: "Kimchi Fried Rice", tag: "Ready" },
];
const steps = ["Cook your dish ×4 portions", "Bring them to the swap", "Leave with 1 of each dish"];
const chatIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19c-1.08 0-2.11-.16-3.07-.45L4 20l1.43-3.73C3.92 15.05 3 13.36 3 11.5 3 7.36 7.03 4 12 4z" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth="2.6" /></svg>;

export function MealSwap() {
  const [pick, setPick] = useState("Kimchi Jjigae");
  const [joined, setJoined] = useState(false);
  const [tab, setTab] = useState<"fridge" | "popular" | "all">("fridge");
  const [query, setQuery] = useState("");
  const [more, setMore] = useState(false);

  const cooks = joined ? [...cooksBase, { name: "you", dish: pick, tag: "New" }] : cooksBase;
  const q = query.trim().toLowerCase();
  let list = swapDishes;
  if (q) list = list.filter((d) => d.name.toLowerCase().includes(q) || d.meta.toLowerCase().includes(q));
  else if (tab === "fridge") list = list.filter((d) => d.have >= 2).sort((a, b) => b.have / b.total - a.have / a.total);
  else if (tab === "popular") list = list.filter((d) => d.pop);
  const limit = 3;
  const shown = more ? list : list.slice(0, limit);
  const exact = swapDishes.some((d) => d.name.toLowerCase() === q);
  const members = joined ? [...swapMembers, { name: "Jason (you)", key: "Jason Park" as PersonaName, role: "New", info: `Level 3 · cooking ${pick}`, canMsg: false }] : swapMembers;

  return (
    <>
      <TopBar title="Meal Swap" />
      <main className="screen-scroll" style={{ padding: "12px 16px 24px", gap: 22 }}>
        <section className="box" style={{ borderRadius: 20, padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h1 className="h1" style={{ fontSize: 22 }}>Korean Food Week</h1><span style={{ fontSize: 14 }}>{cooks.length}/4 cooks</span>
          </div>
          <span style={{ fontSize: 15 }}>Cook one dish at home, swap portions, take home 4 different meals.</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="tag" style={{ color: "var(--text-primary)" }}>Swap Sat 11/6 · 5 PM</span>
            <span className="tag" style={{ color: "var(--text-primary)" }}>Ann Arbor Library lobby</span>
          </div>
        </section>

        <section aria-label="How it works" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
          {steps.map((s, i) => (
            <div key={s} className="card" style={{ borderRadius: 14, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ width: 24, height: 24, borderRadius: 12, background: "var(--primary)", color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <span style={{ fontSize: 13, lineHeight: 1.3 }}>{s}</span>
            </div>
          ))}
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={h2}>Members <span style={{ fontWeight: 400, color: "var(--text-secondary)", fontSize: 15 }}>{cooks.length}/4</span></h2>
            <button type="button" className="btn btn--sm" style={{ background: "var(--primary-tint)", color: "var(--primary-ink)", fontSize: 14, fontWeight: 600, padding: "0 14px 0 10px", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M19 8v6M16 11h6" /></svg>Invite
            </button>
          </div>
          <div>
            {members.map((m) => (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", boxShadow: "0 1px 0 var(--divider)" }}>
                <Avatar name={m.key} size={44} />
                <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</span>
                    {m.role && <span className="tag" style={{ fontSize: 11, padding: "2px 8px", background: "var(--primary)", color: "#fff" }}>{m.role}</span>}
                  </span>
                  <span className="caption" style={{ fontWeight: 400 }}>{m.info}</span>
                </span>
                {m.canMsg && <Link to="/chat" aria-label={`Message ${m.name}`} className="icon-btn" style={{ background: "var(--surface-muted)" }}>{chatIcon}</Link>}
              </div>
            ))}
            {!joined && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
                <span style={{ width: 44, height: 44, borderRadius: 22, background: "var(--surface-muted)", flexShrink: 0 }} />
                <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>1 spot open — could be you</span>
              </div>
            )}
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h2}>Dishes in this swap</h2>
          {cooks.map((c) => (
            <div key={c.name} className="card" style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 14, padding: 10 }}>
              <span role="img" aria-label={c.dish} style={{ width: 52, height: 52, borderRadius: 12, background: dishBg(c.dish), flexShrink: 0 }} />
              <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{c.dish}</span>
                <span className="small">by {c.name} · 4 portions</span>
              </span>
              <span className="tag" style={{ fontSize: 11, padding: "3px 8px" }}>{c.tag}</span>
            </div>
          ))}
        </section>

        {!joined && (
          <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={h2}>Pick your dish</h2>
            <p className="small" style={{ margin: 0 }}>1 spot left · anything goes, as long as no one else is making it</p>
            <label className="card" style={{ height: 48, borderRadius: 24, display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
              <SearchIcon />
              <input aria-label="Search any dish" placeholder="Search any dish or recipe" value={query} onChange={(e) => { setQuery(e.target.value); setMore(false); }}
                style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", font: "inherit", fontSize: 15, color: "var(--text-primary)", outline: "none" }} />
            </label>
            <div role="tablist" aria-label="Suggestions" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {([["fridge", "From my fridge"], ["popular", "Popular"], ["all", "All dishes"]] as const).map(([id, label]) => (
                <button key={id} type="button" role="tab" className="chip" aria-selected={!q && tab === id} aria-pressed={!q && tab === id} style={{ flexShrink: 0 }}
                  onClick={() => { setTab(id); setQuery(""); setMore(false); }}>{label}</button>
              ))}
            </div>
            {!q && tab === "fridge" && <p className="caption" style={{ margin: 0, fontWeight: 400 }}>Based on your fridge: Eggs, Spinach, Tofu, Rice, Kimchi</p>}
            <div role="radiogroup" aria-label="Your dish" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {shown.map((d) => {
                const on = pick === d.name, taken = !!d.taken, good = d.have / d.total >= 0.5;
                return (
                  <button key={d.name} type="button" role="radio" aria-checked={on} disabled={taken} onClick={() => setPick(d.name)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: 0, cursor: taken ? "not-allowed" : "pointer",
                      background: on ? "var(--primary-tint)" : "var(--surface)", opacity: taken ? 0.75 : 1 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 9, flexShrink: 0, boxShadow: on ? "inset 0 0 0 5px var(--primary)" : "inset 0 0 0 2px var(--text-tertiary)" }} />
                    <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, textAlign: "left", minWidth: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{d.name}</span>
                      <span className="caption" style={{ fontWeight: 400 }}>{d.meta}</span>
                    </span>
                    <span className="tag" style={{ fontSize: 11, padding: "3px 8px", ...(taken ? {} : good ? { background: "var(--primary)", color: "#fff" } : { color: "var(--text-primary)" }) }}>
                      {taken ? `Taken by ${d.taken}` : `Have ${d.have}/${d.total}`}
                    </span>
                  </button>
                );
              })}
              {query.trim() && !exact && (
                <button type="button" onClick={() => setPick(query.trim())} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, border: 0, background: "var(--surface-muted)", fontSize: 15, textAlign: "left", cursor: "pointer" }}>
                  <PlusIcon size={18} />Cook “{query.trim()}” (your own recipe)
                </button>
              )}
              {q && list.length === 0 && <p className="small" style={{ margin: 0 }}>No matching dishes yet. Add it as your own recipe above.</p>}
              {list.length > limit && (
                <button type="button" className="btn btn--secondary" style={{ minHeight: 44, fontSize: 14, fontWeight: 500 }} onClick={() => setMore(!more)}>
                  {more ? "Show less" : `Show ${list.length - limit} more`}
                </button>
              )}
            </div>
          </section>
        )}

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h2}>You’ll take home</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            {[["Bibimbap", "Bibimbap"], ["Spicy Pork", "Spicy Pork"], ["Kimchi Fried Rice", "Kimchi Fried Rice"], [pick, `${pick} (yours)`]].map(([d, n]) => (
              <div key={n} className="card" style={{ borderRadius: 14, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <span role="img" aria-label={n} style={{ height: 64, borderRadius: 10, background: dishBg(d, "var(--map-land)") }} />
                <span style={{ fontSize: 14 }}>{n}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rows">
          <div style={{ fontSize: 14 }}><span style={{ color: "var(--text-secondary)" }}>Portion size</span><span>~400 g per container</span></div>
          <div style={{ fontSize: 14 }}><span style={{ color: "var(--text-secondary)" }}>Containers</span><span>Bring 4, labeled</span></div>
          <div style={{ fontSize: 14 }}><span style={{ color: "var(--text-secondary)" }}>Allergens</span><span>List on your dish</span></div>
        </section>
      </main>
      <div className="action-bar">
        {joined ? (
          <>
            <button type="button" className="btn btn--secondary" style={{ borderRadius: 14, fontSize: 15, fontWeight: 500 }} onClick={() => setJoined(false)}>Joined ✓</button>
            <Link to="/chat" className="btn btn--primary" style={{ borderRadius: 14, fontSize: 15 }}>Swap chat</Link>
          </>
        ) : (
          <button type="button" className="btn btn--primary" style={{ borderRadius: 14 }} onClick={() => setJoined(true)}>Join &amp; cook {pick}</button>
        )}
      </div>
    </>
  );
}
