import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { ChatHeader, Composer } from "../components/ChatParts";
import { illustrations } from "../components/Illustration";
import { groupChatSeed, groups } from "../data/content";

const group = groups.find((g) => g.title === "Korean Food Week")!;
const firstNames = [...group.people.map((p) => p.split(" ")[0]), "You"].join(", ");

export function GroupChat() {
  const [msgs, setMsgs] = useState(groupChatSeed);

  return (
    <>
      <ChatHeader title={group.title} sub={firstNames}
        right={<span className="avatar-stack" aria-label={`${group.people.length + 1} members`}>{group.people.map((p) => <Avatar key={p} name={p} size={28} ring="var(--bg)" />)}</span>} />

      <div className="card" style={{ flexShrink: 0, margin: "10px 16px 0", display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 14 }}>
        <Link to="/meal-swap" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: `var(--fill-on-surface) url("${illustrations.bento}") center / 72% no-repeat` }} />
          <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Meal Prep · Sat, Nov 6</span>
            <span className="caption" style={{ fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.menu}</span>
          </span>
        </Link>
        <Link to="/meal-swap" className="btn btn--secondary btn--sm" style={{ padding: "0 12px", background: "var(--fill-on-surface)" }}>View plan</Link>
      </div>

      <main className="screen-scroll" style={{ padding: 16, gap: 8 }}>
        <span className="caption" style={{ alignSelf: "center", fontWeight: 400, paddingBottom: 4 }}>Today</span>
        {msgs.map((m, i) => {
          // Show avatar + name only on the first message in a run from the same person
          const first = m.by && msgs[i - 1]?.by !== m.by;
          if (!m.by) {
            return <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginTop: msgs[i - 1]?.by ? 6 : 0 }}><span className="bubble bubble--me">{m.text}</span></div>;
          }
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: first && i > 0 ? 6 : 0 }}>
              {first ? <Avatar name={m.by} size={28} /> : <span aria-hidden="true" style={{ width: 28, flexShrink: 0 }} />}
              <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                {first && <span className="caption" style={{ fontWeight: 400 }}>{m.by.split(" ")[0]}</span>}
                <span className="bubble">{m.text}</span>
              </span>
            </div>
          );
        })}
      </main>

      <Composer onSend={(text) => setMsgs([...msgs, { text }])} />
    </>
  );
}
