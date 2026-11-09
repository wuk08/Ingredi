import { useNavigate } from "react-router-dom";

/** Filled bell with a red sticker badge. Rings every 4s; tap to open Notifications. */
export function BellButton({ count }: { count: number }) {
  const nav = useNavigate();
  return (
    <button type="button" className="icon-btn" aria-label={count > 0 ? `Notifications, ${count} new` : "Notifications"} onClick={() => nav("/notifications")}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
        style={{ display: "block", overflow: "visible", transformOrigin: "50% 12%", animation: "hb-ring 4s .4s ease-in-out infinite" }}>
        <path d="M12 2.6c.8 0 1.4.6 1.4 1.4v.6A6.4 6.4 0 0 1 18.4 11v3.3c0 1 .5 1.9 1.3 2.5l.4.3c.6.5.3 1.5-.5 1.5H4.4c-.8 0-1.1-1-.5-1.5l.4-.3c.8-.6 1.3-1.5 1.3-2.5V11a6.4 6.4 0 0 1 5-6.4V4c0-.8.6-1.4 1.4-1.4z" fill="var(--text-primary)" />
        <path d="M9.6 19.6h4.8a2.4 2.4 0 0 1-4.8 0z" fill="var(--text-primary)"
          style={{ transformBox: "fill-box", transformOrigin: "50% 0", animation: "hb-clap 4s .45s ease-in-out infinite" }} />
      </svg>
      {count > 0 && <span className="badge">{count}</span>}
    </button>
  );
}
