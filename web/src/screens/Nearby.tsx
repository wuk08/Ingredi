import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { filterPosts } from "../../../public/lib/community.mjs";
import { AnnArborMap } from "../components/AnnArborMap";
import { illustrations, type IllustrationName } from "../components/Illustration";
import { FilterIcon, ListIcon, MapIcon, PlusIcon, SearchIcon } from "../components/Icons";
import { useAppState } from "../data/AppState";

const typeColor: Record<string, string> = { available: "var(--brand-coral)", wanted: "var(--info)", meal_prep: "var(--accent)" };
const labels: Record<string, string> = { available: "Available", wanted: "Wanted", meal_prep: "Meal Prep", ingredients: "Ingredients", meals: "Meals", equipment: "Equipment", free: "Free", exchange: "Exchange" };
const artFor = (post: any): IllustrationName => /egg/i.test(post.food) ? "eggs" : /basil/i.test(post.food) ? "basil" : /rice cooker/i.test(post.food) ? "ricecooker" : /avocado/i.test(post.food) ? "avocado" : post.type === "meal_prep" ? "bento" : "bread";
const position = (index: number) => ({ x: [90, 265, 175, 318, 55][index % 5], y: [310, 260, 420, 505, 555][index % 5] });

function PostRow({ post }: { post: any }) {
  return <>
    <span aria-hidden="true" style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0, background: `var(--surface-muted) url("${illustrations[artFor(post)]}") center / 72% no-repeat` }} />
    <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span className="caption" style={{ display: "flex", justifyContent: "space-between", fontWeight: 400 }}><span>{post.owner === "you" ? "You" : post.owner}</span><span>{post.distance ? `${post.distance} mi` : "Your building"}</span></span>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{post.title}</span>
      <span style={{ display: "flex", gap: 6 }}><span className="tag">{labels[post.type] || post.type}</span><span className="tag">{labels[post.offer] || post.offer}</span></span>
    </span>
  </>;
}

export function Nearby() {
  const nav = useNavigate();
  const { community, home, setupReady, ensureCommunity, setDialog } = useAppState();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "list" ? "list" : "map";
  const [scope, setScope] = useState<"building" | "neighborhood">("building");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [offer, setOffer] = useState("all");
  const [distance, setDistance] = useState(1);
  const [search, setSearch] = useState(params.get("q") || "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const posts = useMemo(() => setupReady ? filterPosts(community.posts || [], { search, type, category, offer, distance, scope, residenceId: home?.id }) : [], [category, community.posts, distance, home?.id, offer, scope, search, setupReady, type]);
  const selectedPost = posts.find((post: any) => post.id === selected) || posts[0];
  const isMap = view === "map";
  const lift = isMap && selectedPost ? 120 : 20;

  if (!setupReady) return <main className="center-gate"><span className="gate-icon">⌂</span><p className="eyebrow">YOUR HOME COMMUNITY</p><h1 className="h1">Good neighbors start here.</h1><p className="body">Choose your apartment building or dorm to see building and neighborhood activity.</p><button type="button" className="btn btn--primary" onClick={() => setDialog("setup")}>Set up my residence</button><p className="small">Your Supabase kitchen remains available while community activity is simulated on this device.</p></main>;
  if (scope === "neighborhood" && !home?.center) return <main className="center-gate"><h1 className="h1">Add your building’s map location.</h1><p className="body">Your building list works now. Confirm a map location to browse the neighborhood.</p><button type="button" className="btn btn--primary" onClick={() => setDialog("setup")}>Add a map location</button><button type="button" className="btn btn--ghost" onClick={() => setScope("building")}>Back to my building</button></main>;

  return <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
    {isMap ? <><AnnArborMap>{posts.map((post: any, index: number) => { const pos = position(index); const on = post.id === selectedPost?.id; return <button key={post.id} type="button" className="map-pin" aria-label={post.title} aria-pressed={on} onClick={() => setSelected(post.id)} style={{ left: pos.x, top: pos.y, width: on ? 56 : 44, height: on ? 56 : 44, zIndex: on ? 3 : 1, background: `#fff url("${illustrations[artFor(post)]}") center / 74% no-repeat`, border: `${on ? 4 : 3}px solid ${typeColor[post.type] || "var(--primary)"}` }} />; })}</AnnArborMap>
      {selectedPost && <Link to={`/post/${selectedPost.id}`} className="nearby-preview"><PostRow post={selectedPost} /></Link>}</> : <main className="nearby-list"><p className="small">{posts.length} sample listing{posts.length === 1 ? "" : "s"} {scope === "building" ? "in your building" : `within ${distance} mi`}</p>{posts.map((post: any) => <Link key={post.id} to={`/post/${post.id}`} className="card nearby-row"><PostRow post={post} /></Link>)}{!posts.length && <div className="empty-state"><h2>No matching listings</h2><p>Try another search or clear your filters.</p></div>}</main>}

    <header className={`nearby-controls${isMap ? "" : " nearby-controls--solid"}`}>
      <button type="button" className="residence-chip" onClick={() => setDialog("setup")}>⌂ {home?.name}</button>
      <div role="tablist" className="seg"><button role="tab" aria-selected={scope === "building"} onClick={() => { setScope("building"); setSelected(null); }}>My building</button><button role="tab" aria-selected={scope === "neighborhood"} onClick={() => { setScope("neighborhood"); setSelected(null); }}>Neighborhood</button></div>
      <div style={{ display: "flex", gap: 8 }}><label className="floating-search"><SearchIcon /><input aria-label="Search nearby" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ingredients, meals, tools" /></label><button type="button" aria-label="All filters" className="icon-btn filter-toggle" aria-pressed={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}><FilterIcon /></button></div>
      <div className="nearby-type-row">{[["all", "All"], ["available", "Available"], ["wanted", "Wanted"], ["meal_prep", "Meal Prep"]].map(([value, label]) => <button key={value} type="button" className="chip" aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}</div>
      {filtersOpen && <div className="filter-panel"><select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option><option value="ingredients">Ingredients</option><option value="meals">Meals</option><option value="equipment">Equipment</option></select><select aria-label="Offer" value={offer} onChange={(e) => setOffer(e.target.value)}><option value="all">Free / Exchange</option><option value="free">Free</option><option value="exchange">Exchange</option></select>{scope === "neighborhood" && <select aria-label="Distance" value={distance} onChange={(e) => setDistance(Number(e.target.value))}><option value={0.5}>Within ½ mi</option><option value={1}>Within 1 mi</option><option value={2}>Within 2 mi</option></select>}<button type="button" className="btn btn--ghost btn--sm" onClick={() => { setType("all"); setCategory("all"); setOffer("all"); setDistance(1); }}>Clear</button></div>}
    </header>

    <button type="button" className="btn btn--primary nearby-view-button" onClick={() => setParams(isMap ? { view: "list" } : {}, { replace: true })} style={{ bottom: lift }}>{isMap ? <ListIcon /> : <MapIcon />}{isMap ? "List" : "Map"}</button>
    <button type="button" aria-label="Create post" className="nearby-add" style={{ bottom: lift }} onClick={() => { if (ensureCommunity(true)) nav("/post/new"); }}><PlusIcon /></button>
  </div>;
}
