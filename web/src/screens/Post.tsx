import { Link, useNavigate, useParams } from "react-router-dom";
import { illustrations } from "../components/Illustration";
import { MoreIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import { useAppState } from "../data/AppState";

const label: Record<string, string> = { available: "Available", wanted: "Wanted", meal_prep: "Meal Prep", free: "Free", exchange: "Exchange", ingredients: "Ingredients", meals: "Meals", equipment: "Equipment" };

export function Post() {
  const { id } = useParams();
  const nav = useNavigate();
  const { community, setupReady, setDialog, ensureCommunity, runCommunity, busy } = useAppState();
  const post = (community.posts || []).find((item: any) => item.id === id) || (community.posts || []).find((item: any) => item.status === "active");
  if (!setupReady) return <main className="center-gate"><h1 className="h1">Set up your residence</h1><p>Posts are scoped to your building and neighborhood.</p><button className="btn btn--primary" onClick={() => setDialog("setup")}>Continue setup</button></main>;
  if (!post) return <main className="center-gate"><h1 className="h1">Post not found</h1><Link to="/nearby" className="btn btn--primary">Back to nearby</Link></main>;
  const person = community.people?.[post.owner] || { name: post.owner === "you" ? "You" : "Neighbor" };
  const chat = (community.conversations || []).find((item: any) => item.postId === post.id);
  const request = async () => {
    if (!ensureCommunity(true)) return;
    const chatId = await runCommunity("request", post.id);
    nav(`/chat/${chatId}`);
  };
  const cancel = async () => { if (confirm("Cancel this post?")) await runCommunity("cancel", post.id); };
  return <>
    <TopBar title="Post" right={post.owner === "you" ? <button type="button" className="icon-btn" aria-label="Cancel post" disabled={busy} onClick={() => void cancel()}><MoreIcon /></button> : undefined} />
    <main className="screen-scroll post-detail">
      <div className="post-owner"><span className="message-avatar">{person.name.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2)}</span><span><b>{person.name}</b><small>{post.owner === "you" ? "Your post" : `${person.distance || post.distance || 0} mi away`}</small></span><small>{post.visibility === "building" ? "My building" : "Neighborhood"}</small></div>
      <div className="post-hero" style={{ backgroundImage: `url("${illustrations[post.type === "meal_prep" ? "bento" : /egg/i.test(post.food) ? "eggs" : /avocado/i.test(post.food) ? "avocado" : "bread"]}")` }} />
      <section className="form-stack"><div className="tag-row"><span className="tag tag--primary">{label[post.type]}</span><span className="tag">{label[post.offer]}</span><span className="tag">{label[post.category]}</span></div><h1 className="h1">{post.title}</h1><p className="body">{post.description || "A little extra to share with the neighborhood."}</p></section>
      <div className="rows"><div><span>Quantity</span><b>{post.quantity} {post.unit}</b></div>{post.expires_on && <div><span>Best before</span><b>{post.expires_on}</b></div>}<div><span>Pickup / meetup</span><b>{post.pickup}</b></div><div><span>Visibility</span><b>{post.visibility === "building" ? "My building" : "Neighborhood"}</b></div></div>
      {post.type === "meal_prep" && <Link to={`/meal-swap/${post.groupId}`} className="card feature-link"><span><b>View meal prep plan</b><small>Choose a dish and join the group chat</small></span><b>›</b></Link>}
    </main>
    <div className="action-bar">{post.owner === "you" ? chat ? <Link to={`/chat/${chat.id}`} className="btn btn--primary">Open requests</Link> : <button className="btn btn--secondary" disabled>No requests yet</button> : post.type === "meal_prep" ? <Link to={`/meal-swap/${post.groupId}`} className="btn btn--primary">View &amp; join group</Link> : <><button type="button" className="btn btn--secondary" disabled={busy} onClick={() => void request()}>Message</button><button type="button" className="btn btn--primary" disabled={busy || post.status === "completed" || post.status === "cancelled"} onClick={() => void request()}>{post.status === "reserved" ? "Open request" : "Request item"}</button></>}</div>
  </>;
}
