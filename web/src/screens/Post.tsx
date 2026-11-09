import { useState } from "react";
import { Link } from "react-router-dom";
import { photos } from "../assets/photos";
import { Avatar } from "../components/Avatar";
import { ChevronIcon, MoreIcon } from "../components/Icons";
import { Photo } from "../components/PhotoPlaceholder";
import { TopBar } from "../components/TopBar";
import { personas } from "../data/people";

export function Post() {
  const [requested, setRequested] = useState(false);
  return (
    <>
      <TopBar title="Post" right={<button type="button" className="icon-btn" aria-label="More options"><MoreIcon /></button>} />
      <main className="screen-scroll" style={{ padding: "12px 16px 24px", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name="Jack Lee" size={44} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span className="title">Jack Lee</span>
            <span className="small">Community Level {personas["Jack Lee"].level} · 32 shares</span>
          </div>
          <span className="small">0.2 mi</span>
        </div>

        <Photo src={photos["three-avos"]} alt="Three ripe avocados" style={{ height: 240, borderRadius: 20 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="tag" style={{ background: "var(--primary)", color: "var(--text-on-primary)" }}>Available</span>
            <span className="tag" style={{ color: "var(--text-primary)" }}>Free</span>
            <span className="tag" style={{ color: "var(--text-primary)" }}>Ingredients</span>
          </div>
          <h2 className="h2" style={{ fontSize: 22, lineHeight: "28px" }}>Anyone wants free avocados?</h2>
          <p className="body" style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Bought too many — 3 ripe avocados, best this week. Happy to hand off at my building lobby.</p>
        </div>

        <div className="rows">
          <div><span style={{ color: "var(--text-secondary)" }}>Quantity</span><span>3</span></div>
          <div><span style={{ color: "var(--text-secondary)" }}>Best before</span><span>Nov 4</span></div>
          <div><span style={{ color: "var(--text-secondary)" }}>Pickup</span><span>Today, 5–8 PM</span></div>
        </div>

        <div className="mini-map" style={{ height: 120 }}>
          <div className="road" style={{ left: 0, right: 0, top: 54, height: 12 }} />
          <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: 40, marginLeft: -18 }}><Avatar name="Jack Lee" size={36} ring="#fff" /></span>
          <span className="tag" style={{ position: "absolute", left: 10, bottom: 10, background: "#fff", color: "var(--text-primary)" }}>Approx. location</span>
        </div>

        <Link to="/recipe" className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span className="small">Cook with this</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Avocado egg rice bowl</span>
          </span>
          <ChevronIcon />
        </Link>
      </main>
      <div className="action-bar">
        <Link to="/chat" className="btn btn--secondary" style={{ borderRadius: 14, fontSize: 15, fontWeight: 500 }}>Message</Link>
        <button type="button" className={`btn ${requested ? "btn--secondary" : "btn--primary"}`} style={{ borderRadius: 14, fontSize: 15 }} onClick={() => setRequested(!requested)}>
          {requested ? "Requested ✓" : "Request item"}
        </button>
      </div>
    </>
  );
}
