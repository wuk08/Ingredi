import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { photos } from "../assets/photos";
import { Avatar } from "../components/Avatar";
import { ChevronIcon } from "../components/Icons";
import { useAppState } from "../data/AppState";

export function My() {
  const nav = useNavigate();
  const { profile, community, home, signed, mockProvider, setDialog, updateProfile, runCommunity, resetCommunity, logout, busy } = useAppState();
  const [editing, setEditing] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const impact = community.impact || { points: 0, shares: 0, meals: 0, savings: 0 };
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); await updateProfile({ display_name: String(data.get("display_name")), city: String(data.get("city")) }); setEditing(false); };
  const togglePreference = async (value: string) => { const current = community.preferences || []; await runCommunity("preferences", current.includes(value) ? current.filter((item: string) => item !== value) : [...current, value]); };
  return <main className="screen-scroll profile-screen">
    <section className="profile-heading"><Avatar name={profile.display_name} size={70} /><span><h1 className="h1">{profile.display_name}</h1><p>{home?.name || profile.city || "Your neighborhood"}<br /><small>{signed ? "Private Supabase account" : mockProvider ? `${mockProvider} prototype account` : "Device demo"}</small></p></span><button className="btn btn--secondary btn--sm" onClick={() => setEditing(!editing)}>Edit</button></section>
    {editing && <form className="card form-stack profile-form" onSubmit={saveProfile}><label className="form-field">Display name<input name="display_name" defaultValue={profile.display_name} maxLength={80} required /></label><label className="form-field">City<input name="city" defaultValue={profile.city} maxLength={100} /></label><button className="btn btn--primary" disabled={busy}>Save profile</button></form>}
    <section className="box impact-card"><div><h2 className="h3">My Impact</h2><span>Level 3 · Good Neighbor</span></div><b className="impact-points">{impact.points.toLocaleString()} points</b><div className="impact-stats"><span><b>{impact.shares}</b><small>Items shared</small></span><span><b>{impact.meals}</b><small>Meals rescued</small></span><span><b>${impact.savings}</b><small>Est. savings</small></span></div></section>
    <section className="form-stack"><h2 className="h3">Saved recipes</h2>{community.saved?.length ? <div className="saved-row">{community.saved.map((key: string) => <Link to={`/recipe/${key.includes("kimchi") ? "kimchi-fried-rice" : key}`} key={key}><span style={{ backgroundImage: `url("${photos[key.includes("kimchi") ? "kimchi-fried-rice" : "bibimbap"]}")` }} /><small>{key}</small></Link>)}</div> : <Link to="/cook" className="card feature-link"><span><b>Keep a little inspiration</b><small>Save a recipe to find it here.</small></span><ChevronIcon /></Link>}</section>
    <section className="settings-list">
      <button type="button" onClick={() => setDialog("setup")}><span><b>Residence &amp; student status</b><small>{home?.name || "Set up your community"}</small></span><ChevronIcon /></button>
      {community.student?.isStudent && <button type="button" onClick={() => setDialog("verify")}><span><b>Sample student ID check</b><small>{community.student.verification === "demo_complete" ? "Demo check completed" : "Required before exchanging"}</small></span><ChevronIcon /></button>}
      <Link to="/my/posts"><span><b>My posts / shares</b><small>{community.posts.filter((post: any) => post.owner === "you" && post.status === "active").length} active</small></span><ChevronIcon /></Link>
      <button type="button" onClick={() => setPreferencesOpen(!preferencesOpen)}><span><b>Preferences</b><small>{community.preferences?.join(", ") || "Make it yours"}</small></span><ChevronIcon /></button>
      {preferencesOpen && <div className="settings-panel"><div className="chip-row">{["Korean", "Vegetarian", "Under 20 min", "High protein", "Spicy"].map((value) => <button type="button" className="chip" aria-pressed={community.preferences?.includes(value)} key={value} onClick={() => void togglePreference(value)}>{value}</button>)}</div></div>}
      <button type="button" onClick={() => setSettingsOpen(!settingsOpen)}><span><b>Settings</b><small>Kitchen connection and demo data</small></span><ChevronIcon /></button>
      {settingsOpen && <div className="settings-panel form-stack"><p className="small">{signed ? "Your receipt scans and fridge are saved privately to Supabase." : "Your sample fridge is saved on this device."}</p><button className="btn btn--secondary" disabled={busy} onClick={() => void resetCommunity()}>Reset community demo</button></div>}
      <button type="button" disabled={busy} onClick={() => void (signed ? logout().then(() => nav("/")) : Promise.resolve(nav("/")))}><span><b>{signed ? "Sign out" : "Back to welcome"}</b><small>{signed ? "Disconnect this Supabase session" : "Leave the device demo"}</small></span><ChevronIcon /></button>
    </section>
  </main>;
}
