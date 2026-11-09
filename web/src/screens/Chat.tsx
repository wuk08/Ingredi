import { useState } from "react";
import { Link } from "react-router-dom";
import { photos } from "../assets/photos";
import { Avatar } from "../components/Avatar";
import { ChatHeader, Composer } from "../components/ChatParts";
import { CheckIcon } from "../components/Icons";
import { chatSeed } from "../data/content";

export function Chat() {
  const [msgs, setMsgs] = useState(chatSeed);
  return (
    <>
      <ChatHeader title="Jack Lee" sub="0.2 mi away" right={<Avatar name="Jack Lee" size={36} />} />

      <div className="card" style={{ flexShrink: 0, margin: "10px 16px 0", display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 14 }}>
        <Link to="/post" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: `var(--surface-muted) url("${photos["three-avos"]}") center / cover no-repeat` }} />
          <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Anyone wants free avocados?</span>
            <span className="caption" style={{ fontWeight: 400 }}>Available · Free · Today 5–8 PM</span>
          </span>
        </Link>
        <Link to="/shared" className="btn btn--primary btn--sm" style={{ padding: "0 12px", gap: 6 }}><CheckIcon size={14} color="#fff" />Mark shared</Link>
      </div>

      <main className="screen-scroll" style={{ padding: 16, gap: 8 }}>
        <span className="caption" style={{ alignSelf: "center", fontWeight: 400, paddingBottom: 4 }}>Today</span>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.me ? "flex-end" : "flex-start" }}>
            <span className={`bubble${m.me ? " bubble--me" : ""}`}>{m.text}</span>
          </div>
        ))}
      </main>

      <Composer onSend={(text) => setMsgs([...msgs, { me: true, text }])} />
    </>
  );
}
