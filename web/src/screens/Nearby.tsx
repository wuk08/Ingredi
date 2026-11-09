import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { illustrations } from "../components/Illustration";
import { AnnArborMap } from "../components/AnnArborMap";
import { FilterIcon, ListIcon, MapIcon, PlusIcon, SearchIcon } from "../components/Icons";
import { nearby, type PostType } from "../data/content";

const typeColor: Record<PostType, string> = { Available: "var(--brand-coral)", Wanted: "var(--info)", "Meal Prep": "var(--accent)" };
const types = ["All", "Available", "Wanted", "Meal Prep"] as const;
const filters = ["Within 1 mi ▾", "Free / Exchange ▾", "Ingredients", "Meals", "Equipment"];
const floatShadow = "0 2px 8px rgba(58,48,42,.12)";

/** Real photo fills the frame; illustrations sit centered with padding. */
function Thumb({ art, photo, label, bg = "var(--surface-muted)" }: { art: keyof typeof illustrations; photo?: string; label: string; bg?: string }) {
  const img = photo ? `url("${photo}") center / cover no-repeat` : `url("${illustrations[art]}") center / 72% no-repeat`;
  return <span role="img" aria-label={label} style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0, background: `${bg} ${img}` }} />;
}

function PostRow({ p, bg, tagBg }: { p: (typeof nearby)[number]; bg: string; tagBg: string }) {
  return (
    <>
      <Thumb art={p.art} photo={p.photo} label={p.text} bg={bg === "var(--bg)" ? "var(--surface-muted)" : "var(--bg)"} />
      <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <span className="caption" style={{ display: "flex", justifyContent: "space-between", fontWeight: 400 }}><span>{p.by}</span><span>{p.dist}</span></span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{p.text}</span>
        <span style={{ display: "flex", gap: 6 }}>
          <span className="tag" style={{ fontSize: 11, padding: "2px 8px", background: tagBg }}>{p.type}</span>
          <span className="tag" style={{ fontSize: 11, padding: "2px 8px", background: tagBg }}>{p.deal}</span>
        </span>
      </span>
    </>
  );
}

export function Nearby() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "list" ? "list" : "map";
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [selId, setSelId] = useState(0);
  const list = nearby.filter((p) => type === "All" || p.type === type);
  const sel = list.find((p) => p.id === selId) ?? list[0];
  const isMap = view === "map";
  const lift = isMap && sel ? 120 : 20;

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {isMap ? (
        <>
          <AnnArborMap>
            {list.map((p) => {
              const on = p.id === sel?.id;
              const s = on ? 56 : 44;
              return (
                <button key={p.id} type="button" aria-label={p.text} aria-pressed={on} onClick={() => setSelId(p.id)} className="map-pin"
                  style={{ left: p.x - (on ? 6 : 0), top: p.y - (on ? 6 : 0), width: s, height: s, zIndex: on ? 3 : 1,
                    background: p.photo ? `#fff url("${p.photo}") center / cover no-repeat` : `#fff url("${illustrations[p.art]}") center / 74% no-repeat`, border: `${on ? 4 : 3}px solid ${typeColor[p.type]}`,
                    boxShadow: `0 4px 12px rgba(58,48,42,${on ? 0.22 : 0.14})` }} />
              );
            })}
          </AnnArborMap>
          {sel && (
            <Link to="/post" style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", gap: 12, background: "#fff", borderRadius: 18, padding: 10, boxShadow: "var(--shadow-md)" }}>
              <PostRow p={sel} bg="var(--bg)" tagBg="var(--surface-muted)" />
            </Link>
          )}
        </>
      ) : (
        <main style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "calc(var(--overlay-top) + 148px) 16px 88px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="small" style={{ margin: "0 0 2px" }}>{list.length} posts within 1 mi</p>
          {list.map((p) => (
            <Link key={p.id} to="/post" className="card" style={{ display: "flex", gap: 12, padding: 10, flexShrink: 0 }}>
              <PostRow p={p} bg="var(--surface)" tagBg="var(--fill-on-surface)" />
            </Link>
          ))}
        </main>
      )}

      <header style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "var(--overlay-top) 16px 12px", display: "flex", flexDirection: "column", gap: 10,
        background: isMap ? "transparent" : "var(--bg)", boxShadow: isMap ? undefined : "0 1px 0 var(--divider)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1, height: 48, borderRadius: 24, background: "#fff", boxShadow: floatShadow, display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
            <SearchIcon />
            <input aria-label="Search nearby" placeholder="Search ingredients, meals, tools"
              style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", font: "inherit", fontSize: 15, color: "var(--text-primary)", outline: "none" }} />
          </label>
          <button type="button" aria-label="All filters" className="icon-btn" style={{ width: 48, height: 48, background: "#fff", boxShadow: floatShadow }}><FilterIcon /></button>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {types.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={type === t} style={{ flexShrink: 0, boxShadow: "0 1px 4px rgba(58,48,42,.10)" }}
              onClick={() => { setType(t); setSelId(0); }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {filters.map((f) => <span key={f} className="tag tag--outline tag--md">{f}</span>)}
        </div>
      </header>

      <button type="button" className="btn btn--primary" onClick={() => setParams(isMap ? { view: "list" } : {}, { replace: true })}
        style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: lift, minHeight: 44, padding: "0 18px", fontSize: 15, fontWeight: 500, boxShadow: "0 4px 12px rgba(58,48,42,.2)" }}>
        {isMap ? <ListIcon /> : <MapIcon />}{isMap ? "List" : "Map"}
      </button>

      <Link to="/post/new" aria-label="Create post" style={{ position: "absolute", right: 16, bottom: lift, width: 48, height: 48, borderRadius: 24, background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(58,48,42,.18)" }}><PlusIcon /></Link>
    </div>
  );
}
