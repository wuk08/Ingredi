import { NavLink } from "react-router-dom";

type Tab = { to: string; label: string; outline: JSX.Element; solid: JSX.Element };

const ink = "var(--primary-ink)";
const muted = "var(--text-tertiary)";
const pill = "var(--primary-tint)";
const line = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const tabs: Tab[] = [
  {
    to: "/home", label: "Home",
    outline: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" stroke={muted} {...line} />,
    solid: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill={ink} stroke={ink} strokeWidth={1.8} strokeLinejoin="round" />,
  },
  {
    to: "/cook", label: "Cook",
    outline: <><path d="M6 13.9A4 4 0 0 1 7.5 6.1a4.5 4.5 0 0 1 9 0A4 4 0 0 1 18 13.9V20H6z" stroke={muted} {...line} /><path d="M6 17h12" stroke={muted} {...line} /></>,
    solid: <><path d="M6 13.9A4 4 0 0 1 7.5 6.1a4.5 4.5 0 0 1 9 0A4 4 0 0 1 18 13.9V20H6z" fill={ink} stroke={ink} strokeWidth={1.8} strokeLinejoin="round" /><path d="M7 16.6h10" stroke={pill} {...line} /></>,
  },
  {
    to: "/nearby", label: "Nearby",
    outline: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" stroke={muted} {...line} /><circle cx="12" cy="9.5" r="2.5" stroke={muted} {...line} /></>,
    solid: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" fill={ink} stroke={ink} strokeWidth={1.8} strokeLinejoin="round" /><circle cx="12" cy="9.5" r="2.5" fill={pill} /></>,
  },
  {
    to: "/messages", label: "Message",
    outline: <><path d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19c-1.08 0-2.11-.16-3.07-.45L4 20l1.43-3.73C3.92 15.05 3 13.36 3 11.5 3 7.36 7.03 4 12 4z" stroke={muted} {...line} /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke={muted} {...line} strokeWidth={2.6} /></>,
    solid: <><path d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19c-1.08 0-2.11-.16-3.07-.45L4 20l1.43-3.73C3.92 15.05 3 13.36 3 11.5 3 7.36 7.03 4 12 4z" fill={ink} stroke={ink} strokeWidth={1.8} strokeLinejoin="round" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke={pill} {...line} strokeWidth={2.6} /></>,
  },
  {
    to: "/my", label: "My",
    outline: <><circle cx="12" cy="8" r="4" stroke={muted} {...line} /><path d="M4 21a8 8 0 0 1 16 0" stroke={muted} {...line} /></>,
    solid: <><circle cx="12" cy="8" r="4" fill={ink} stroke={ink} strokeWidth={1.8} /><path d="M4 21a8 8 0 0 1 16 0z" fill={ink} stroke={ink} strokeWidth={1.8} strokeLinejoin="round" /></>,
  },
];

/** Bottom tab bar. The active tab gets a forest-green tint pill and a solid icon. */
export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className="tab">
          {({ isActive }) => (
            <>
              <span className="tab__pill">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">{isActive ? t.solid : t.outline}</svg>
              </span>
              {t.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
