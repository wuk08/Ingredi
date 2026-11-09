import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LocateIcon } from "./Icons";

/**
 * Stylized map of downtown Ann Arbor around State Street.
 * Not to scale; street names and order roughly match the real grid.
 * Drag to pan a little; everything inside uses canvas coordinates (W x H).
 */
export const MAP_W = 720;
export const MAP_H = 1040;
/** Where "You are here" sits on the canvas (center point). */
export const ME = { x: 349, y: 571 };

type VStreet = { name: string; x: number; w: number; y0: number; y1: number; labels: number[] };
type HStreet = { name: string; y: number; h: number; x0: number; x1: number; labels: number[] };

// North-south streets, west to east
const vStreets: VStreet[] = [
  { name: "Division St", x: 120, w: 14, y0: 0, y1: MAP_H, labels: [380, 820] },
  { name: "Maynard St", x: 260, w: 12, y0: 300, y1: 654, labels: [530] },
  { name: "State St", x: 380, w: 20, y0: 0, y1: MAP_H, labels: [220, 700] },
  { name: "Thayer St", x: 540, w: 12, y0: 0, y1: 466, labels: [200] },
  { name: "E University Ave", x: 680, w: 12, y0: 452, y1: MAP_H, labels: [620] },
];

// East-west streets, north to south
const hStreets: HStreet[] = [
  { name: "E Huron St", y: 130, h: 18, x0: 0, x1: MAP_W, labels: [160, 430] },
  { name: "E Washington St", y: 300, h: 14, x0: 0, x1: 552, labels: [150, 420] },
  { name: "N University Ave", y: 452, h: 14, x0: 390, x1: MAP_W, labels: [570] },
  { name: "E Liberty St", y: 470, h: 14, x0: 0, x1: 390, labels: [150] },
  { name: "E William St", y: 640, h: 14, x0: 0, x1: 390, labels: [150] },
  { name: "S University Ave", y: 880, h: 14, x0: 390, x1: MAP_W, labels: [430] },
];

// Building blocks: [x, y, w, h]
const blocks: [number, number, number, number][] = [
  [18, 148, 88, 138], [146, 20, 220, 96], [146, 328, 100, 128], [286, 500, 82, 126],
  [18, 500, 88, 124], [146, 668, 220, 140], [412, 160, 116, 126], [566, 20, 140, 96],
  [566, 330, 100, 108], [18, 700, 88, 200], [146, 840, 220, 180], [412, 906, 256, 110],
];

const PARK = { x: 412, y: 478, w: 256, h: 390 };
const floatShadow = "var(--shadow-sm)";

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

export function AnnArborMap({ children }: { children?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [anim, setAnim] = useState(false);
  const drag = useRef<{ px: number; py: number; ox: number; oy: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const limit = (x: number, y: number) => {
    const el = box.current;
    if (!el) return { x, y };
    return { x: clamp(x, el.clientWidth - MAP_W, 0), y: clamp(y, el.clientHeight - MAP_H, 0) };
  };
  // Put "You are here" a bit above the middle, clear of the search bar and the preview card
  const recenter = (animate: boolean) => {
    const el = box.current;
    if (!el) return;
    setAnim(animate);
    setOff(limit(el.clientWidth / 2 - ME.x, el.clientHeight * 0.55 - ME.y));
  };
  useLayoutEffect(() => recenter(false), []);

  const canvas: CSSProperties = {
    position: "absolute", left: 0, top: 0, width: MAP_W, height: MAP_H, background: "var(--map-land)",
    transform: `translate3d(${off.x}px, ${off.y}px, 0)`, transition: anim ? "transform .35s cubic-bezier(.3,.8,.3,1)" : "none",
  };

  return (
    <div ref={box} aria-label="Map of nearby posts around State Street, Ann Arbor"
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--map-land)", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: drag.current?.moved ? "grabbing" : "grab" }}
      onPointerDown={(e) => { drag.current = { px: e.clientX, py: e.clientY, ox: off.x, oy: off.y, moved: false }; }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.px, dy = e.clientY - d.py;
        if (!d.moved && Math.hypot(dx, dy) < 5) return;
        if (!d.moved) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); setAnim(false); }
        setOff(limit(d.ox + dx, d.oy + dy));
      }}
      onPointerUp={() => { justDragged.current = !!drag.current?.moved; drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
      // A drag that ends on a pin should not also select it
      onClickCapture={(e) => { if (justDragged.current) { e.stopPropagation(); e.preventDefault(); justDragged.current = false; } }}>
      <div style={canvas}>
        {blocks.map(([x, y, w, h], i) => <div key={i} className="map-block" style={{ left: x, top: y, width: w, height: h }} />)}

        <div className="map-park" style={{ left: PARK.x, top: PARK.y, width: PARK.w, height: PARK.h }}>
          {/* The Diag: two crossing footpaths */}
          <svg width={PARK.w} height={PARK.h} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
            <path d={`M0 0 L${PARK.w} ${PARK.h} M${PARK.w} 0 L0 ${PARK.h} M${PARK.w / 2} 0 V${PARK.h}`} stroke="var(--map-road)" strokeWidth={6} strokeLinecap="round" />
          </svg>
          <span className="map-label map-label--area" style={{ left: 0, right: 0, top: 120, textAlign: "center" }}>Central Campus</span>
          <span className="map-label" style={{ left: 0, right: 0, top: PARK.h / 2 + 12, textAlign: "center" }}>The Diag</span>
        </div>

        {hStreets.map((s) => (
          <div key={s.name} className="road" style={{ left: s.x0, width: s.x1 - s.x0, top: s.y, height: s.h }}>
            {s.labels.map((lx) => <span key={lx} className="map-label" style={{ left: lx - s.x0, top: (s.h - 14) / 2 }}>{s.name}</span>)}
          </div>
        ))}
        {vStreets.map((s) => (
          <div key={s.name} className="road" style={{ left: s.x, width: s.w, top: s.y0, height: s.y1 - s.y0 }}>
            {s.labels.map((ly) => (
              <span key={ly} className="map-label" style={{ left: s.w / 2, top: ly - s.y0, transform: "translate(-50%, -50%) rotate(-90deg)" }}>{s.name}</span>
            ))}
          </div>
        ))}

        <div style={{ position: "absolute", left: ME.x - 28, top: ME.y - 28, width: 56, height: 56, borderRadius: "var(--radius-full)", background: "var(--text-primary)", opacity: 0.12 }} />
        <div role="img" aria-label="You are here" style={{ position: "absolute", left: ME.x - 11, top: ME.y - 11, width: 22, height: 22, borderRadius: "var(--radius-full)", background: "var(--primary)", border: "4px solid var(--map-road)" }} />

        {children}
      </div>

      <button type="button" className="icon-btn" aria-label="Center on my location" onClick={() => recenter(true)}
        style={{ position: "absolute", right: 16, top: 212, background: "var(--fill-on-surface)", boxShadow: floatShadow }}><LocateIcon /></button>
    </div>
  );
}
