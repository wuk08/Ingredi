// Type scale from the Ingredi design system. Max weight is 600.
import type { CSSProperties } from "react";

export const type = {
  "display": {
    "fontFamily": "var(--font-display)",
    "fontSize": "34px",
    "lineHeight": "40px",
    "fontWeight": 600,
    "letterSpacing": "-0.01em"
  },
  "h1": {
    "fontFamily": "var(--font-display)",
    "fontSize": "28px",
    "lineHeight": "34px",
    "fontWeight": 600,
    "letterSpacing": "-0.01em"
  },
  "h2": {
    "fontFamily": "var(--font-display)",
    "fontSize": "22px",
    "lineHeight": "28px",
    "fontWeight": 600
  },
  "h3": {
    "fontFamily": "var(--font-display)",
    "fontSize": "18px",
    "lineHeight": "24px",
    "fontWeight": 500
  },
  "points": {
    "fontFamily": "var(--font-display)",
    "fontSize": "40px",
    "lineHeight": "44px",
    "fontWeight": 600
  },
  "title": {
    "fontFamily": "var(--font-text)",
    "fontSize": "16px",
    "lineHeight": "22px",
    "fontWeight": 600
  },
  "body": {
    "fontFamily": "var(--font-text)",
    "fontSize": "16px",
    "lineHeight": "24px",
    "fontWeight": 400
  },
  "body-sm": {
    "fontFamily": "var(--font-text)",
    "fontSize": "14px",
    "lineHeight": "20px",
    "fontWeight": 400
  },
  "caption": {
    "fontFamily": "var(--font-text)",
    "fontSize": "12px",
    "lineHeight": "16px",
    "fontWeight": 500,
    "letterSpacing": "0.01em"
  },
  "button": {
    "fontFamily": "var(--font-text)",
    "fontSize": "16px",
    "lineHeight": "20px",
    "fontWeight": 600
  },
  "overline": {
    "fontFamily": "var(--font-text)",
    "fontSize": "12px",
    "lineHeight": "16px",
    "fontWeight": 600,
    "letterSpacing": "0.06em"
  }
} satisfies Record<string, CSSProperties>;

export type TypeStyle = keyof typeof type;
