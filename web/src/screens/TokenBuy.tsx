import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import { setStore, useStore } from "../data/store";

const packs = [
  { amount: 10, price: "$0.99", tag: "Most popular" },
  { amount: 25, price: "$1.99", tag: "" },
  { amount: 60, price: "$3.99", tag: "Best value" },
];
const apple = "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

export function TokenBuy() {
  const { tokens } = useStore();
  const [pick, setPick] = useState(0);
  const [added, setAdded] = useState(0);
  const sel = packs[pick];
  const buy = () => { setAdded(sel.amount); setStore({ tokens: tokens + sel.amount }); };

  if (added) {
    return (
      <>
        <TopBar title="Get tokens" />
        <main style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center" }}>
          <span className="pop-in" style={{ width: 72, height: 72, borderRadius: 36, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon size={34} color="#fff" /></span>
          <h2 className="h1" style={{ marginTop: 8 }}>+{added} tokens</h2>
          <p className="body" style={{ margin: 0, fontSize: 15 }}>New balance: {tokens} tokens</p>
        </main>
        <div className="action-bar"><Link to="/my" className="btn btn--primary" style={{ minHeight: 56, borderRadius: 16, fontSize: 17 }}>Done</Link></div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Get tokens" />
      <main className="screen-scroll" style={{ padding: "16px 16px 24px", gap: 24 }}>
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center", paddingTop: 8 }}>
          <span style={{ fontSize: 14, color: "var(--text-body)" }}>You have</span>
          <span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{tokens}</span>
          <span style={{ fontSize: 14, color: "var(--text-body)" }}>tokens</span>
        </section>
        <p className="body" style={{ margin: 0, textAlign: "center", fontSize: 15, lineHeight: 1.4 }}>1 token = 1 request or 1 swap spot.<br />Tokens never expire.</p>
        <div role="radiogroup" aria-label="Choose a pack" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {packs.map((p, i) => {
            const on = pick === i;
            return (
              <button key={p.amount} type="button" role="radio" aria-checked={on} onClick={() => setPick(i)}
                style={{ height: 64, padding: "0 18px", borderRadius: 16, border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: on ? "var(--primary-tint)" : "var(--bg)" }}>
                <span style={{ width: 20, height: 20, borderRadius: 10, flexShrink: 0, boxShadow: on ? "inset 0 0 0 6px var(--primary)" : "inset 0 0 0 2px var(--text-tertiary)" }} />
                <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 500 }}>{p.amount} tokens</span>
                  {p.tag && <span className="tag" style={{ fontSize: 11, padding: "2px 8px", background: "var(--primary)", color: "#fff" }}>{p.tag}</span>}
                </span>
                <span style={{ fontSize: 17, fontWeight: 500 }}>{p.price}</span>
              </button>
            );
          })}
        </div>
      </main>
      <div className="action-bar" style={{ flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 4px" }}>
          <span className="small" style={{ fontSize: 14 }}>Total</span><span style={{ fontSize: 17, fontWeight: 600 }}>{sel.price}</span>
        </div>
        {/* Apple Pay button follows Apple's guidelines: black, system font. Use the real Apple Pay JS button in production. */}
        <button type="button" onClick={buy} aria-label="Buy with Apple Pay" className="btn" style={{ borderRadius: 14, background: "#000", color: "#fff", fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif", fontSize: 17, fontWeight: 500, gap: 5 }}>
          <span>Buy with</span><svg width="17" height="17" viewBox="0 0 24 24" fill="#fff" aria-hidden="true" style={{ margin: "-3px -2px 0 3px" }}><path d={apple} /></svg><span style={{ fontWeight: 600 }}>Pay</span>
        </button>
        <button type="button" onClick={buy} className="btn btn--primary" style={{ borderRadius: 14 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h3" /></svg>Pay with card
        </button>
        <span className="caption" style={{ textAlign: "center", fontWeight: 400 }}>One-time purchase · No subscription</span>
      </div>
    </>
  );
}
