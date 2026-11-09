import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { TopBar } from "../components/TopBar";
import { useAppState } from "../data/AppState";

export function MealSwap() {
  const { id } = useParams();
  const nav = useNavigate();
  const { community, ensureCommunity, runCommunity, busy } = useAppState();
  const group = (community.groups || []).find((item: any) => item.id === id) || community.groups?.[0];
  const taken = new Set(group?.members.map((member: any) => member.dish) || []);
  const available = group?.dishes.filter((dish: string) => !taken.has(dish)) || [];
  const [dish, setDish] = useState(available[0] || "My dish");
  if (!group) return <main className="center-gate"><h1>No meal prep group found</h1><Link to="/nearby" className="btn btn--primary">Browse nearby</Link></main>;
  const member = group.members.find((item: any) => item.person === "you");
  const chat = community.conversations.find((item: any) => item.groupId === group.id);
  const join = async () => { if (!ensureCommunity(true)) return; const chatId = await runCommunity("join", { id: group.id, dish }); nav(`/chat/group/${chatId}`); };
  return <>
    <TopBar title="Meal Swap" />
    <main className="screen-scroll meal-swap"><section className="box meal-heading"><span><h1 className="h1">{group.title}</h1><p>{group.description}</p></span><b>{group.members.length}/{group.capacity} cooks</b><div className="tag-row"><span className="tag">{group.date} · {group.time}</span><span className="tag">{group.location}</span></div></section>
      <section className="steps-grid">{["Cook your dish for the group", "Bring it to the meetup", "Leave with each shared dish"].map((step, index) => <div className="card" key={step}><b>{index + 1}</b><span>{step}</span></div>)}</section>
      <section><h2 className="h2">Members</h2><div className="member-list">{group.members.map((entry: any) => { const person = community.people[entry.person]; return <div key={entry.person}><Avatar name={person.name} size={48} /><span><b>{person.name}{entry.person === "you" ? " (you)" : ""}</b><small>{entry.dish}{entry.host ? " · Host" : ""}</small></span></div>; })}</div></section>
      {!member && <section className="form-stack"><h2 className="h2">Pick your dish</h2><p className="small">Choose an available dish; the original duplicate-dish and capacity checks are enforced.</p><div role="radiogroup" className="dish-list">{available.map((value: string) => <button type="button" role="radio" aria-checked={dish === value} key={value} onClick={() => setDish(value)}><span className="radio-dot" />{value}</button>)}</div><label className="form-field">Or bring your own listed dish<select value={dish} onChange={(e) => setDish(e.target.value)}>{available.map((value: string) => <option key={value}>{value}</option>)}</select></label></section>}
    </main>
    <div className="action-bar">{member && chat ? <Link to={`/chat/group/${chat.id}`} className="btn btn--primary">Open swap chat</Link> : <button className="btn btn--primary" disabled={busy || !dish || !available.length} onClick={() => void join()}>{available.length ? `Join & cook ${dish}` : "Group is full"}</button>}</div>
  </>;
}
