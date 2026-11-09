import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloseIcon } from "../components/Icons";

const widths = [62, 48, 70, 54, 44, 66, 58, 50, 40];
const corner = (pos: Record<string, number>, sides: string, radius: string) => (
  <span aria-hidden="true" style={{ position: "absolute", ...pos, width: 36, height: 36, [radius]: 14,
    ...Object.fromEntries(sides.split(" ").map((s) => [`border${s}`, "4px solid #fff"])) }} />
);
const glass = "rgba(255,255,255,.14)";

/** Camera view. Always dark, like the native camera. Swap the mock frame for getUserMedia later. */
export function ScanCamera() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"Receipt" | "Groceries">("Receipt");
  const [flash, setFlash] = useState(false);
  const r = mode === "Receipt";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#1E1B18", color: "#fff" }}>
      <header className="topbar" style={{ paddingBottom: 12 }}>
        <button type="button" className="icon-btn" aria-label="Close" style={{ background: glass }} onClick={() => nav("/fridge/add")}><CloseIcon color="#fff" /></button>
        <div role="tablist" aria-label="Scan mode" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", background: glass, borderRadius: 999, padding: 3 }}>
            {(["Receipt", "Groceries"] as const).map((l) => (
              <button key={l} type="button" role="tab" aria-selected={mode === l} onClick={() => setMode(l)}
                style={{ height: 36, padding: "0 16px", border: 0, borderRadius: 999, fontSize: 14, cursor: "pointer",
                  background: mode === l ? "#fff" : "transparent", color: mode === l ? "var(--text-primary)" : "#fff", fontWeight: mode === l ? 600 : 400 }}>{l}</button>
            ))}
          </div>
        </div>
        <button type="button" className="icon-btn" aria-label="Flash" aria-pressed={flash} onClick={() => setFlash(!flash)}
          style={{ background: flash ? "#fff" : glass, color: flash ? "var(--text-primary)" : "#fff" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 3 5 14h6l-1 7 8-11h-6z" /></svg>
        </button>
      </header>

      <main style={{ flex: 1, position: "relative", margin: "8px 16px", borderRadius: 24, background: "#2A2622", overflow: "hidden" }}>
        {r ? (
          <div aria-hidden="true" style={{ position: "absolute", left: 82, right: 82, top: 54, bottom: 54, background: "#FFF8F1", borderRadius: 4, transform: "rotate(-2deg)", padding: "22px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ height: 10, width: "60%", alignSelf: "center", background: "#D8CEC4", borderRadius: 3 }} />
            <span style={{ height: 6, width: "40%", alignSelf: "center", background: "#E6DCD0", borderRadius: 3, marginBottom: 10 }} />
            {widths.map((w, i) => (
              <span key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ height: 6, width: `${w}%`, background: "#E6DCD0", borderRadius: 3 }} /><span style={{ height: 6, width: 22, background: "#E6DCD0", borderRadius: 3 }} />
              </span>
            ))}
            <span style={{ height: 1, background: "#E6DCD0", margin: "6px 0" }} />
            <span style={{ display: "flex", justifyContent: "space-between" }}><span style={{ height: 8, width: "36%", background: "var(--primary)", borderRadius: 3 }} /><span style={{ height: 8, width: 28, background: "var(--primary)", borderRadius: 3 }} /></span>
          </div>
        ) : (
          <div aria-hidden="true" style={{ position: "absolute", left: 40, right: 40, top: 120, bottom: 120, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, alignContent: "center" }}>
            {[[88, "44px", "#E46F5A"], [110, "14px", "#E6B85A"], [72, "36px", "#A9412F"], [64, "12px", "#F2C66D"], [96, "48px 48px 16px 16px", "#BF4F3B"], [80, "16px", "#D9705C"]].map(([h, br, c], i) => (
              <span key={i} style={{ height: h as number, borderRadius: br as string, background: c as string, alignSelf: i === 2 ? "end" : undefined }} />
            ))}
          </div>
        )}
        {corner({ left: 24, top: 24 }, "Left Top", "borderTopLeftRadius")}
        {corner({ right: 24, top: 24 }, "Right Top", "borderTopRightRadius")}
        {corner({ left: 24, bottom: 24 }, "Left Bottom", "borderBottomLeftRadius")}
        {corner({ right: 24, bottom: 24 }, "Right Bottom", "borderBottomRightRadius")}
      </main>

      <p style={{ flexShrink: 0, margin: "10px 24px 0", textAlign: "center", fontSize: 15, lineHeight: 1.4 }}>
        {r ? <>Fit the whole receipt in the frame.<br />We’ll read the food items for you.</> : "Lay your groceries out and snap. We’ll recognize what’s there."}
      </p>

      <div style={{ flexShrink: 0, height: 150, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px 12px" }}>
        <button type="button" aria-label="Choose from photos" style={{ width: 52, height: 52, borderRadius: 12, border: "2px solid rgba(255,255,255,.6)", background: "#34302B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" /></svg>
        </button>
        <Link to="/scan/review" aria-label="Take photo" style={{ width: 76, height: 76, borderRadius: 38, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, background: "#fff" }} />
        </Link>
        <span style={{ width: 52, textAlign: "center", fontSize: 12, color: "#B3A79B" }}>{r ? "Long receipt? Take 2+" : ""}</span>
      </div>
    </div>
  );
}
