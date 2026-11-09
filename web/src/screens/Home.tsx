import { Link } from "react-router-dom";
import { uniqueCommunityFeed } from "../../../public/lib/community.mjs";
import { photos } from "../assets/photos";
import { Avatar } from "../components/Avatar";
import { BellButton } from "../components/BellButton";
import { useAppState } from "../data/AppState";
import { recommended } from "../data/content";

export function Home() {
  const { profile, community, setupReady, setDialog } = useAppState();
  const unread = (community.conversations || []).reduce((sum: number, chat: any) => sum + chat.unread, 0);
  const activeOwn = (community.posts || []).filter((post: any) => post.owner === "you" && post.status === "active").length;
  const groups = uniqueCommunityFeed(community.groups || [], "groups").slice(0, 4);
  const posts = uniqueCommunityFeed(community.posts || [], "posts").filter((post: any) => post.owner !== "you" && post.status === "active").slice(0, 4);
  return <div className="screen-scroll home-screen">
    <header className="screen-heading"><span><h1 className="h1">Good morning, {profile.display_name.split(" ")[0]}!</h1><p className="body">What do we want to cook today?</p></span><BellButton count={unread} /></header>
    <section className="row-scroll">{recommended.map((recipe) => <Link className="home-recipe" key={recipe.id} to={`/recipe/${recipe.id}`} style={{ backgroundImage: `url("${recipe.photo}")` }}><span className="tag">{recipe.tag}</span><span><b>{recipe.name}</b><small>{recipe.time}</small></span></Link>)}</section>
    {!setupReady && <section className="home-community-cta"><span>⌂</span><div><b>Find your home community</b><small>Choose your apartment building or dorm.</small></div><button className="btn btn--primary btn--sm" onClick={() => setDialog("setup")}>Set up</button></section>}
    <Link to="/messages" className="card feature-link home-activity"><span><b>Active shares &amp; requests</b><small>{activeOwn} active · {unread} unread message{unread === 1 ? "" : "s"}</small></span><b>›</b></Link>
    <section className="form-stack"><div className="section-heading"><h2 className="h2">Join a meal prep group</h2><Link to="/nearby">See all</Link></div><div className="row-scroll">{groups.map((group: any) => <div className="box home-group" key={group.id}><div className="home-group-heading"><span className="avatar-stack">{group.members.slice(0, 3).map((member: any) => <Avatar key={member.person} name={community.people[member.person]?.name || "Neighbor"} size={32} ring="var(--surface)" />)}</span><span><b>{group.title}</b><small>{group.date} · {group.time}</small></span></div><p>{group.members.map((member: any) => member.dish).join(", ")}</p><Link to={`/meal-swap/${group.id}`} className="btn btn--secondary btn--sm">{group.members.some((member: any) => member.person === "you") ? "View group" : `Join group · ${group.members.length}/${group.capacity}`}</Link></div>)}</div></section>
    <section className="form-stack"><div className="section-heading"><h2 className="h2">What’s up around you</h2><Link to="/nearby">View all</Link></div>{setupReady ? <div className="home-posts">{posts.map((post: any) => { const ownerName = community.people[post.owner]?.name || "Neighbor"; return <article className="card" key={post.id}><span className="post-mini-art" style={{ backgroundImage: `url("${photos[/avocado/i.test(post.food) ? "three-avos" : /egg/i.test(post.food) ? "egg-drop-soup" : "bibimbap"]}")` }} /><span><small className="home-post-author"><Avatar name={ownerName} size={24} />{ownerName}</small><b>{post.title}</b><em>{post.type === "wanted" ? "Wanted" : post.type === "meal_prep" ? "Meal Prep" : "Available"} · {post.offer}</em></span><div><Link to={`/post/${post.id}`} className="btn btn--secondary btn--sm">View</Link><Link to={post.type === "meal_prep" ? `/meal-swap/${post.groupId}` : `/post/${post.id}`} className="btn btn--primary btn--sm">{post.type === "wanted" ? "Offer" : post.type === "meal_prep" ? "Join" : "Request"}</Link></div></article>; })}</div> : <p className="small">Set up your residence to see posts from your building and neighborhood.</p>}</section>
  </div>;
}
