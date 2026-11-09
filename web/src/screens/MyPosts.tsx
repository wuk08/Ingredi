import { Link } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { useAppState } from "../data/AppState";

export function MyPosts() {
  const { community } = useAppState();
  const posts = community.posts.filter((post: any) => post.owner === "you");
  return <><TopBar title="My posts / shares" /><main className="screen-scroll simple-list"><Link to="/post/new" className="btn btn--primary">Share something</Link>{posts.map((post: any) => <Link to={`/post/${post.id}`} className="card feature-link" key={post.id}><span><b>{post.title}</b><small>{post.status} · {post.visibility === "building" ? "My building" : "Neighborhood"}</small></span><b>›</b></Link>)}{!posts.length && <div className="empty-state"><h2>A little extra?</h2><p>Share it with your building here.</p></div>}</main></>;
}
