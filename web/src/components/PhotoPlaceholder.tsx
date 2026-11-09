import type { CSSProperties } from "react";

/** Stand-in for a real food photo. Swap `src` in once photos exist (see README > Photos). */
export function Photo({ src, alt, style }: { src?: string; alt: string; style?: CSSProperties }) {
  if (src) return <img src={src} alt={alt} style={{ objectFit: "cover", display: "block", ...style }} />;
  return (
    <span role="img" aria-label={alt} style={{ background: "var(--surface-muted)", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" />
      </svg>
    </span>
  );
}
