import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fridgeAddedSvg } from "../assets/celebrate";
import { CameraIcon } from "../components/Icons";
import type { PostType } from "../data/content";
import "./celebrate.css";

/** What New Post hands over when you tap Post. Falls back to a sample if opened directly. */
export type PostDraft = { type: PostType; title: string; deal: string; qty: number; when: string; where: string };

const fallback: PostDraft = { type: "Available", title: "3 ripe avocados", deal: "Free", qty: 3, when: "Today, 5–8 PM", where: "Near Main St & 5th" };

const copy: Record<PostType, { title: string; sub: string; qtyLabel: string; next: string[] }> = {
  Available: {
    title: "Your post is live",
    sub: "Neighbors nearby can see it now. We'll let you know as soon as someone asks for it.",
    qtyLabel: "left",
    next: ["Neighbors message you", "You pick who gets it", "Meet up and hand it off"],
  },
  Wanted: {
    title: "Your request is live",
    sub: "Neighbors nearby can see what you need. We'll let you know when someone can help.",
    qtyLabel: "needed",
    next: ["Neighbors offer to help", "You choose an offer", "Meet up and pick it up"],
  },
  "Meal Prep": {
    title: "Your group is live",
    sub: "Neighbors nearby can join now. We'll let you know as each spot fills.",
    qtyLabel: "spots",
    next: ["Neighbors ask to join", "You confirm the group", "Cook together on prep day"],
  },
};

export function PostDone() {
  const post = (useLocation().state as PostDraft | null) ?? fallback;
  const c = copy[post.type];
  const [run, setRun] = useState(0);
  useEffect(() => { const t = setTimeout(() => setRun(1), 150); return () => clearTimeout(t); }, []);

  return (
    <>
      <main className="screen-scroll" style={{ padding: "96px var(--space-4) var(--space-6)", gap: "var(--space-6)" }}>
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
          <button type="button" aria-label="Play again" onClick={() => setRun(run + 1)}
            style={{ width: 140, height: 140, border: 0, padding: 0, background: "transparent", cursor: "pointer", marginTop: -24 }}>
            {run > 0 && <span key={run} style={{ display: "block" }} dangerouslySetInnerHTML={{ __html: fridgeAddedSvg }} />}
          </button>
          <h1 className="h1">{c.title}</h1>
          <p className="body" style={{ margin: 0, fontSize: 15 }}>{c.sub}</p>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 className="h3" style={{ fontSize: 15 }}>Your post</h2>
          <div className="card" style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", padding: 10 }}>
            <span aria-hidden="true" style={{ width: 72, height: 72, borderRadius: "var(--radius-md)", flexShrink: 0, background: "var(--surface-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CameraIcon />
            </span>
            <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</span>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="tag">{post.type}</span>
                <span className="tag">{post.deal}</span>
                <span className="tag">{post.qty} {c.qtyLabel}</span>
              </span>
              <span className="caption" style={{ fontWeight: 400 }}>{post.when} · {post.where}</span>
            </span>
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 className="h3" style={{ fontSize: 15 }}>What happens next</h2>
          <ol className="rows" style={{ margin: 0, listStyle: "none" }}>
            {c.next.map((step, i) => (
              <li key={step} style={{ justifyContent: "flex-start", gap: "var(--space-3)", minHeight: 52 }}>
                <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: "var(--radius-full)", flexShrink: 0, background: "var(--primary-tint)", color: "var(--primary-ink)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <div className="action-bar">
        <Link to="/post/new" className="btn btn--secondary" style={{ borderRadius: 14, fontSize: 15, fontWeight: 500 }}>Post another</Link>
        <Link to="/nearby" className="btn btn--primary" style={{ borderRadius: 14, fontSize: 15 }}>Done</Link>
      </div>
    </>
  );
}
