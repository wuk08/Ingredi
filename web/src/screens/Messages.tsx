import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { illustrations, type IllustrationName } from "../components/Illustration";
import { dmThreads, groupThreads } from "../data/content";
import type { PersonaName } from "../data/people";

export function Messages() {
  const [tab, setTab] = useState<"dm" | "grp">("dm");
  const threads: { name: string; by?: PersonaName; art?: IllustrationName; tint?: string; time: string; context: string; last: string; unread: number }[] = tab === "dm" ? dmThreads : groupThreads;
  return (
    <>
      <header style={{ flexShrink: 0, padding: "var(--screen-top) 16px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 className="h1">Message</h1>
        <div role="tablist" className="seg">
          <button role="tab" aria-selected={tab === "dm"} onClick={() => setTab("dm")}>1:1</button>
          <button role="tab" aria-selected={tab === "grp"} onClick={() => setTab("grp")}>Group</button>
        </div>
      </header>
      <main className="screen-scroll" style={{ padding: "0 16px 16px" }}>
        {threads.map((t) => (
          <Link key={t.name} to={t.name === "Korean Food Week" ? "/chat/group" : "/chat"} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", boxShadow: "0 1px 0 var(--divider)" }}>
            {t.by ? <Avatar name={t.by} size={52} /> : <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: `${t.tint ?? "var(--surface-muted)"} ${t.art ? `url("${illustrations[t.art]}") center / 78% no-repeat` : ""}` }} />}
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span className="title">{t.name}</span><span className="caption" style={{ fontWeight: 400 }}>{t.time}</span></span>
              <span className="caption" style={{ fontWeight: 400 }}>{t.context}</span>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "var(--text-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.last}</span>
                {t.unread > 0 && <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{t.unread}</span>}
              </span>
            </span>
          </Link>
        ))}
      </main>
    </>
  );
}
