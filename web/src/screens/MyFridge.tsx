import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { daysUntil } from "../../../public/lib/domain.mjs";
import { FoodCategoryIcon } from "../components/FoodCategoryIcon";
import { SearchIcon, TrashIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import { useAppState } from "../data/AppState";

type FridgeFilter = "all" | "soon";

export function MyFridge() {
  const nav = useNavigate();
  const { pantry, removePantry, setPantryDate, busy } = useAppState();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FridgeFilter>("all");
  const items = useMemo(() => pantry.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
    const remaining = daysUntil(item.expires_on);
    return matchesSearch && (filter === "all" || (remaining != null && remaining <= 7));
  }), [filter, pantry, search]);

  return <>
    <TopBar title="My fridge" onBack={() => nav("/cook", { replace: true })} />
    <main className="screen-scroll my-fridge-screen">
      <section className="my-fridge-heading">
        <h1 className="h1">My fridge <small>{pantry.length}</small></h1>
        <Link to="/fridge/add" className="btn btn--primary btn--sm">+ Fill up fridge</Link>
      </section>
      <label className="search-field"><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Find an ingredient" placeholder="Find an ingredient" /></label>
      <div role="tablist" className="seg fridge-tabs">
        <button role="tab" aria-selected={filter === "all"} onClick={() => setFilter("all")}>All ingredients</button>
        <button role="tab" aria-selected={filter === "soon"} onClick={() => setFilter("soon")}>Use soon</button>
      </div>
      {items.length ? <section className="fridge-list" aria-label="Fridge ingredients">{items.map((item) => {
        const remaining = daysUntil(item.expires_on);
        return <article className="fridge-row" key={item.id}>
          <span className="fridge-row__art"><FoodCategoryIcon name={item.name} size={44} /></span>
          <span className="fridge-row__copy"><b>{item.name}</b><small>{item.quantity} {item.unit}{remaining == null ? "" : ` · ${remaining < 0 ? "expired" : remaining === 0 ? "use today" : `${remaining}d left`}`}</small></span>
          <label className="fridge-date"><span>{item.expires_on ? "Best before" : "Set date"}</span><input type="date" aria-label={`Best before for ${item.name}`} value={item.expires_on || ""} disabled={busy} onChange={(event) => void setPantryDate(item.id, event.target.value || null)} /></label>
          <button className="fridge-remove" type="button" aria-label={`Remove ${item.name}`} disabled={busy} onClick={() => void removePantry(item.id)}><TrashIcon /></button>
        </article>;
      })}</section> : <div className="empty-state"><h2>{pantry.length ? "Nothing matches" : "Your fridge is empty"}</h2><p>{pantry.length ? "Try another search or view all ingredients." : "Add ingredients manually or scan a receipt."}</p>{!pantry.length && <Link to="/fridge/add" className="btn btn--primary btn--sm">Fill up fridge</Link>}</div>}
      <p className="small fridge-note">Dates are optional. Your fridge stays connected to the same kitchen data used for recipe matching.</p>
    </main>
  </>;
}
