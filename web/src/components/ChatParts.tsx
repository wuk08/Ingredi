import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon, PlusIcon, SendIcon } from "./Icons";

/** Chat header: back on the left, name + subline centered, avatar(s) on the right. */
export function ChatHeader({ title, sub, right }: { title: string; sub: string; right: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="topbar chat-head">
      <button type="button" className="icon-btn" aria-label="Back" onClick={() => (window.history.state?.idx ? nav(-1) : nav("/messages"))}><BackIcon /></button>
      <span className="chat-head__center">
        <h1 className="topbar__title">{title}</h1>
        <span className="chat-head__sub">{sub}</span>
      </span>
      {right}
    </header>
  );
}

/** Message input row. Calls onSend with the trimmed text. */
export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); const d = draft.trim(); if (d) { onSend(d); setDraft(""); } }}
      style={{ flexShrink: 0, padding: "10px 12px 28px", boxShadow: "0 -1px 0 var(--divider)", display: "flex", gap: 8, alignItems: "center" }}>
      <button type="button" className="icon-btn" aria-label="Attach photo"><PlusIcon size={20} /></button>
      <input aria-label="Message" placeholder="Message" value={draft} onChange={(e) => setDraft(e.target.value)} className="field"
        style={{ flex: 1, height: 44, borderRadius: 22, background: "var(--surface-muted)", padding: "0 16px", minWidth: 0 }} />
      <button type="submit" className="icon-btn" aria-label="Send" style={{ background: "var(--primary)" }}><SendIcon /></button>
    </form>
  );
}
