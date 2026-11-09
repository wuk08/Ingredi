import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { BellButton } from "../components/BellButton";
import { useStore } from "../data/store";
import { Photo } from "../components/PhotoPlaceholder";
import { groups, nearbyPosts, recommended } from "../data/content";
import shareBag from "../assets/illustrations/share-bag.svg";

const chevron = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;

export function Home() {
  const { unreadNotifs } = useStore();
  return (
    <div className="screen-scroll" style={{ padding: "var(--screen-top) 0 24px", gap: 28 }}>
      <header style={{ padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 className="h1">Good morning, Jason!</h1>
          <p className="body" style={{ margin: 0 }}>What do we want to cook today?</p>
        </div>
        <BellButton count={unreadNotifs.length} />
      </header>

      <section aria-label="Recipe recommendations" className="row-scroll">
        {recommended.map((r) => (
          <Link key={r.name} to={`/recipe/${r.id}`} style={{ width: 300, height: 180, borderRadius: 20, position: "relative", overflow: "hidden", display: "block" }}>
            <Photo src={r.photo} alt={r.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            <span className="tag" style={{ position: "absolute", left: 12, top: 12, background: "#fff", color: "var(--text-primary)" }}>{r.tag}</span>
            <span className="photo-scrim" aria-hidden="true" />
            <span style={{ position: "absolute", left: 16, right: 16, bottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end", color: "#fff" }}>
              <span className="title">{r.name}</span>
              <span style={{ font: "400 13px/18px var(--font-text)", color: "rgba(255,255,255,.85)" }}>{r.time}</span>
            </span>
          </Link>
        ))}
      </section>

      <section style={{ padding: "0 16px" }}>
        <Link to="/messages" className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 16, background: "var(--primary-tint)", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <img src={shareBag} width={46} height={46} alt="" />
          </span>
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span className="title" style={{ fontSize: 15 }}>Active shares &amp; requests</span>
            <span className="small">1 item shared · 2 new requests</span>
          </span>
          {chevron}
        </Link>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 className="h2" style={{ padding: "0 16px" }}>Join Meal Prep Group!</h2>
        <div className="row-scroll">
          {groups.map((g) => (
            <div key={g.title} className="box" style={{ width: 276, display: "flex", flexDirection: "column", gap: 12, padding: "12px 8px 8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 2px" }}>
                <span className="title">{g.title}</span>
                <span className="small">{g.date}</span>
              </div>
              <span style={{ fontSize: 14, padding: "0 2px" }}>{g.menu}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="avatar-stack">{g.people.map((p) => <Avatar key={p} name={p} size={28} ring="var(--accent-tint)" />)}</span>
                <Link to="/meal-swap" className="btn btn--pill-white btn--sm" style={{ flex: 1, gap: 8 }}>
                  Join Group <span className="caption">{g.count}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 className="h2">What’s up around you</h2>
          <Link to="/nearby" style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-ink)" }}>view all</Link>
        </div>
        <div className="row-scroll">
          {nearbyPosts.map((p) => (
            <div key={p.text} className="card" style={{ width: 236, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={p.by} size={28} />
                <span style={{ flex: 1, fontSize: 14 }}>{p.by}</span>
              </div>
              <span className="tag" style={{ alignSelf: "flex-start" }}>{p.type}</span>
              <span style={{ fontSize: 15, minHeight: 40 }}>{p.text}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <Link to="/post" className="btn btn--pill-white btn--sm" style={{ flex: 1 }}>View Detail</Link>
                <Link to="/chat" className="btn btn--primary btn--sm" style={{ flex: 1, fontWeight: 600 }}>{p.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
