import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { catalog, discover, preferenceOptions } from "../../../public/lib/recipes.mjs";
import { daysUntil } from "../../../public/lib/domain.mjs";
import { photos } from "../assets/photos";
import { BellButton } from "../components/BellButton";
import { Illustration, type IllustrationName } from "../components/Illustration";
import { useAppState } from "../data/AppState";

const artFor = (name: string): IllustrationName => /egg/i.test(name) ? "eggs" : /spinach/i.test(name) ? "spinach" : /tofu/i.test(name) ? "tofu" : /rice/i.test(name) ? "rice" : /kimchi/i.test(name) ? "kimchi" : /bread/i.test(name) ? "bread" : /basil/i.test(name) ? "basil" : "avocado";
const photoFor = (name: string) => photos[name.toLowerCase().includes("kimchi") ? "kimchi-fried-rice" : name.toLowerCase().includes("bibimbap") ? "bibimbap" : name.toLowerCase().includes("omelette") ? "cheesy-tomato-omelette" : name.toLowerCase().includes("spinach") ? "spinach-tofu-bowl" : "shakshuka"];

export function Cook() {
  const { pantry, recipes, community, runCommunity, removePantry, setPantryDate, busy } = useAppState();
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<string[]>(community.preferences || []);
  const [roll, setRoll] = useState(0);
  const [manage, setManage] = useState(false);
  const matches = useMemo(() => discover(catalog(recipes), pantry, { search, tags, preferences: community.preferences || [] }), [community.preferences, pantry, recipes, search, tags]);
  const pick = matches[roll % Math.max(matches.length, 1)];
  const toggleTag = async (tag: string) => {
    const next = tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag];
    setTags(next); setRoll(0); await runCommunity("preferences", next);
  };
  return <div className="screen-scroll cook-screen">
    <section className="form-stack"><header className="screen-heading"><h1 className="h1">What should we cook today?</h1><BellButton count={(community.conversations || []).reduce((sum: number, chat: any) => sum + chat.unread, 0)} /></header><label className="search-field"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search recipes or ingredients" placeholder="Search recipes or ingredients" /></label><div className="chip-row">{preferenceOptions.map((tag: string) => <button type="button" className="chip" aria-pressed={tags.includes(tag)} key={tag} onClick={() => void toggleTag(tag)}>{tag}</button>)}</div></section>
    {pick && <section className="card roll-card"><small>Can’t decide? Let your fridge pick.</small><div><Link to={`/recipe/${pick.id}`}><b>{pick.name}</b><span>{pick.cook_minutes} min · Have {pick.have}/{pick.total} ingredients</span></Link><button className="btn btn--primary btn--sm" onClick={() => setRoll(roll + 1 + Math.floor(Math.random() * Math.max(1, matches.length - 1)))}>Roll</button></div></section>}
    <section className="form-stack"><div className="section-heading"><h2 className="h2">My fridge <small>{pantry.length}</small></h2><span><button className="btn btn--ghost btn--sm" onClick={() => setManage(!manage)}>{manage ? "Done" : "Manage"}</button><Link to="/fridge/add" className="btn btn--primary btn--sm">+ Fill up fridge</Link></span></div>
      {!pantry.length ? <Link to="/fridge/add" className="empty-state"><h3>Your fridge is empty</h3><p>Add ingredients manually or scan a receipt.</p></Link> : manage ? <div className="fridge-manage">{pantry.map((item) => <div key={item.id}><Illustration name={artFor(item.name)} label={item.name} /><span><b>{item.name}</b><small>{item.quantity} {item.unit}</small></span><input type="date" aria-label={`Best before for ${item.name}`} value={item.expires_on || ""} onChange={(e) => void setPantryDate(item.id, e.target.value || null)} /><button type="button" aria-label={`Remove ${item.name}`} disabled={busy} onClick={() => void removePantry(item.id)}>×</button></div>)}</div> : <div className="row-scroll fridge-strip">{pantry.slice(0, 10).map((item) => <div className="box" key={item.id}><span className="tag">{daysUntil(item.expires_on) == null ? "—" : `${daysUntil(item.expires_on)}d`}</span><Illustration name={artFor(item.name)} label={item.name} /><b>{item.name}</b></div>)}</div>}
    </section>
    <section className="form-stack"><h2 className="h2">{tags.length ? "Picked for your preferences" : "A few ideas for your fridge"}</h2><div className="recipe-grid-new">{matches.map((recipe: any) => <Link key={recipe.id} to={`/recipe/${recipe.id}`}><span style={{ backgroundImage: `url("${photoFor(recipe.name)}")` }} /><b>{recipe.name}</b><small>{recipe.cook_minutes} min · Have {recipe.have}/{recipe.total}</small></Link>)}</div>{!matches.length && <div className="empty-state"><h3>No recipes match yet</h3><p>Clear a filter or try another ingredient.</p></div>}</section>
  </div>;
}
