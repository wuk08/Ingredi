import { Fragment, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { illustrations } from "../components/Illustration";
import { TopBar } from "../components/TopBar";
import { notifications } from "../data/content";
import { setStore, useStore } from "../data/store";

type Notif = (typeof notifications)[number];

/** Bold the `strong` phrase inside the sentence. */
function withBold(text: string, strong?: string): ReactNode {
  if (!strong || !text.includes(strong)) return text;
  const [a, b] = text.split(strong);
  return <>{a}<b>{strong}</b>{b}</>;
}

function Lead({ n }: { n: Notif }) {
  if (n.actor) return <Avatar name={n.actor} size={40} />;
  if (n.kind === "reward") return <span aria-hidden="true" className="notif__tile notif__tile--reward">+50</span>;
  return <span aria-hidden="true" className="notif__tile notif__tile--warning" style={{ backgroundImage: n.art ? `url("${illustrations[n.art]}")` : undefined }} />;
}

function Trail({ n }: { n: Notif }) {
  if (n.photo) return <span aria-hidden="true" className="notif__thumb" style={{ backgroundImage: `url("${n.photo}")` }} />;
  if (n.art && n.actor) return <span aria-hidden="true" className="notif__thumb notif__thumb--art" style={{ backgroundImage: `url("${illustrations[n.art]}")` }} />;
  return null;
}

export function Notifications() {
  const nav = useNavigate();
  const { unreadNotifs } = useStore();
  const read = (id: number) => setStore({ unreadNotifs: unreadNotifs.filter((x) => x !== id) });
  const open = (n: Notif, to = n.to) => { read(n.id); nav(to); };

  const markAll = (
    <button type="button" className="btn btn--ghost btn--sm topbar__action" disabled={unreadNotifs.length === 0} onClick={() => setStore({ unreadNotifs: [] })}>
      Mark all read
    </button>
  );

  return (
    <>
      <TopBar title="Notifications" right={markAll} />
      <main className="screen-scroll" style={{ paddingBottom: "var(--space-6)" }}>
        {(["Today", "Earlier"] as const).map((section) => (
          <Fragment key={section}>
            <h2 className="section-label">{section}</h2>
            <div>
              {notifications.filter((n) => n.section === section).map((n) => {
                const unread = unreadNotifs.includes(n.id);
                return (
                  <div key={n.id} role="link" tabIndex={0} className={`notif${unread ? " notif--unread" : ""}`}
                    aria-label={`${unread ? "Unread. " : ""}${n.actor ? n.actor + " " : ""}${n.text}. ${n.time}`}
                    onClick={() => open(n)} onKeyDown={(e) => { if (e.key === "Enter") open(n); }}>
                    <Lead n={n} />
                    <span className="notif__body">
                      <span>{n.actor && <b>{n.actor} </b>}{withBold(n.text, n.strong)}</span>
                      {n.quote && <span className="notif__quote">“{n.quote}”</span>}
                      <span className="notif__meta">
                        {unread && <span className="notif__dot" aria-hidden="true" />}
                        <span className="caption" style={{ fontWeight: 400 }}>{n.time}</span>
                      </span>
                      {n.action && (
                        <span style={{ marginTop: "var(--space-1)" }}>
                          <button type="button" className="btn btn--secondary btn--sm" onClick={(e) => { e.stopPropagation(); open(n, n.action!.to); }}>{n.action.label}</button>
                        </span>
                      )}
                    </span>
                    <Trail n={n} />
                  </div>
                );
              })}
            </div>
          </Fragment>
        ))}
        <p className="small" style={{ textAlign: "center", margin: "var(--space-6) var(--space-4) 0" }}>You’re all caught up.</p>
      </main>
    </>
  );
}
