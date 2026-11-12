import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { appleToGiftSvg } from "../assets/celebrate";
import { CloseIcon } from "../components/Icons";
import { setStore, useStore } from "../data/store";
import { useAppState } from "../data/AppState";
import "./celebrate.css";

const shades = ["#8BAE4D", "#DDEAAF", "#234D3C", "#E8EFDF"];
const START = 1240, GAIN = 50, NEXT = 1500;

/** Fireworks around the gift: 3 bursts, each a ring plus rays and dots. */
function sparks(): { wrap: CSSProperties; dot: CSSProperties }[] {
  const out: { wrap: CSSProperties; dot: CSSProperties }[] = [];
  const bursts = [
    { x: 0, y: 0, d: 1.55, n: 18, kf: ["ig-shoot-l", "ig-shoot-m"] },
    { x: -120, y: 60, d: 1.9, n: 12, kf: ["ig-shoot-m", "ig-shoot-s"] },
    { x: 118, y: 40, d: 2.15, n: 12, kf: ["ig-shoot-m", "ig-shoot-s"] },
  ];
  for (const b of bursts) {
    out.push({ wrap: { position: "absolute", left: b.x, top: b.y, width: 0, height: 0 },
      dot: { position: "absolute", left: -12, top: -12, width: 24, height: 24, borderRadius: "50%", border: "2px solid #8BAE4D", animation: `ig-ring .8s ${b.d}s cubic-bezier(.1,.7,.3,1) both` } });
    for (let k = 0; k < b.n; k++) {
      const tip = k % 3 === 0;
      out.push({ wrap: { position: "absolute", left: b.x, top: b.y, width: 0, height: 0, transform: `rotate(${(360 / b.n) * k}deg)` },
        dot: { position: "absolute", left: tip ? -3 : -1.5, top: 0, width: tip ? 6 : 3, height: tip ? 6 : 14, borderRadius: tip ? "50%" : 2, background: shades[k % 3],
          transformOrigin: "50% 0", animation: `${b.kf[k % 2]} 1s ${b.d + (tip ? 0.06 : 0)}s cubic-bezier(.12,.75,.3,1) both` } });
    }
  }
  return out;
}
const SPARKS = sparks();
const CONFETTI: CSSProperties[] = Array.from({ length: 16 }, (_, i) => {
  const size = 6 + (i % 4) * 2;
  return { position: "absolute", top: 0, left: (i * 37) % 380, width: size, height: i % 2 ? size : size * 1.6, borderRadius: i % 3 === 0 ? "50%" : 2,
    background: shades[i % 4], animation: `ig-fall ${1.4 + ((i * 3) % 7) / 10}s ${1.7 + ((i * 7) % 10) / 20}s ease-in both` };
});

export function Shared() {
  const { id } = useParams();
  const { community, runCommunity } = useAppState();
  const post = community.posts?.find((item: any) => item.id === id);
  const personKey = post?.owner === "you" ? community.conversations?.find((chat: any) => chat.postId === id)?.person : post?.owner;
  const personName = community.people?.[personKey]?.name || "your neighbor";
  const startPoints = Math.max(0, (community.impact?.points || START) - 50);
  const { tokens } = useStore();
  const [run, setRun] = useState(0);
  const [pts, setPts] = useState(startPoints);
  const [claimed, setClaimed] = useState(false);
  const [rating, setRating] = useState(Number(community.ratings?.[id || ""] || 0));
  const [tags, setTags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t0 = setTimeout(() => setRun(1), 250);
    let iv: ReturnType<typeof setInterval>;
    const t1 = setTimeout(() => {
      iv = setInterval(() => setPts((p) => { const n = Math.min(startPoints + GAIN, p + 2); if (n >= startPoints + GAIN) clearInterval(iv); return n; }), 28);
    }, 1900);
    setStore({ points: START + GAIN });
    return () => { clearTimeout(t0); clearTimeout(t1); clearInterval(iv); };
  }, []); // animation runs once for this completion

  const pct = Math.max(0, Math.min(100, (pts - 1000) / 5));
  const stat = (n: string, d: string, l: string) => (
    <div className="card" style={{ borderRadius: 14, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontSize: 20, fontWeight: 600 }}>{n}</span><span className="caption" style={{ fontWeight: 400 }}>{d}</span></span>
      <span className="caption" style={{ fontWeight: 400 }}>{l}</span>
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", minHeight: 0 }}>
      {run > 0 && (
        <div key={`c${run}`} aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 560, pointerEvents: "none", overflow: "hidden", zIndex: 2 }}>
          {CONFETTI.map((s, i) => <span key={i} style={s} />)}
        </div>
      )}
      <header style={{ flexShrink: 0, padding: "var(--overlay-top) 16px 0", display: "flex", justifyContent: "flex-end" }}>
        <Link to="/home" aria-label="Close" className="icon-btn"><CloseIcon /></Link>
      </header>

      <main className="screen-scroll" style={{ padding: "4px 16px 24px", gap: 22 }}>
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <button type="button" aria-label="Celebrate again" onClick={() => setRun(run + 1)}
            style={{ position: "relative", width: 140, height: 140, border: 0, padding: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, cursor: "pointer" }}>
            {run > 0 && (
              <span key={run}>
                <span dangerouslySetInnerHTML={{ __html: appleToGiftSvg }} />
                <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, pointerEvents: "none" }}>
                  {SPARKS.map((p, i) => <span key={i} style={p.wrap}><span style={p.dot} /></span>)}
                </span>
              </span>
            )}
          </button>
          <span className="caption" style={{ fontWeight: 400 }}>Tap the gift to celebrate again</span>
          <h1 className="h1" style={{ marginTop: 4 }}>Shared with {personName}!</h1>
          <p className="body" style={{ margin: 0, fontSize: 15, maxWidth: 290, lineHeight: 1.4 }}>{post?.title || "An ingredient"} found a new home instead of the bin.</p>
        </section>

        <section className="card" style={{ borderRadius: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="small" style={{ display: "flex", justifyContent: "space-between" }}><span>Your points</span><span>{NEXT - pts} to Level 4</span></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>{pts.toLocaleString("en-US")}</span>
            <span style={{ fontSize: 15, fontWeight: 600, background: "var(--primary)", color: "#fff", borderRadius: 999, padding: "2px 10px", animation: "sc-pop .5s 1.9s ease-out both" }}>+{GAIN}</span>
          </div>
          <span className="small" style={{ marginTop: -6 }}>{startPoints.toLocaleString("en-US")} → {pts.toLocaleString("en-US")}</span>
          <div style={{ height: 10, borderRadius: 5, background: "var(--surface-muted)", overflow: "hidden", display: "flex", gap: 2 }}>
            <div style={{ height: 10, background: "var(--primary)", width: "48%", flexShrink: 0 }} />
            <div style={{ height: 10, background: "var(--accent)", borderRadius: "0 5px 5px 0", width: `${Math.max(0, pct - 48)}%`, flexShrink: 0 }} />
          </div>
          <div className="caption" style={{ display: "flex", gap: 14, fontWeight: 400 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--primary)" }} />Before</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--accent)" }} />This share +{GAIN}</span>
          </div>
          <div className="caption" style={{ display: "flex", justifyContent: "space-between", fontWeight: 400 }}><span>Level 3 · Good Neighbor</span><span>Level 4</span></div>
        </section>

        {claimed ? (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, animation: "sc-pop .5s .15s ease-out both" }}>
            {stat("19", "+1", "Items shared")}{stat("28", "+1", "Meals rescued")}{stat("$90", "+$4", "Est. savings")}
          </section>
        ) : (
          <button type="button" className="btn btn--primary" style={{ minHeight: 56, borderRadius: 16 }} onClick={() => { setClaimed(true); setStore({ tokens: tokens + 1 }); }}>Tap to claim +1 Token</button>
        )}

        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 className="h3">How was it with {personName}?</h2>
          <div role="radiogroup" aria-label="Rate your exchange" style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => { setRating(n); if (id) void runCommunity("rate", { id, rating: n }); }}
                style={{ width: 48, height: 48, borderRadius: 24, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={n <= rating ? "#F2C66D" : "none"} stroke="#E0AE4A" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" /></svg>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["On time", "Super friendly", "Great food", "Easy pickup"].map((l) => (
              <button key={l} type="button" className="chip" aria-pressed={!!tags[l]} onClick={() => setTags({ ...tags, [l]: !tags[l] })}>{l}</button>
            ))}
          </div>
          {rating > 0 && <p className="small" style={{ margin: 0 }}>Thanks! Your rating is saved with this device-local community exchange.</p>}
        </section>
      </main>
      <div className="action-bar">
        <Link to="/post/new" className="btn btn--secondary" style={{ borderRadius: 14, fontSize: 15, fontWeight: 500, whiteSpace: "nowrap", padding: "0 12px" }}>Share something else</Link>
        <Link to="/home" className="btn btn--primary" style={{ borderRadius: 14, fontSize: 15 }}>Done</Link>
      </div>
    </div>
  );
}
