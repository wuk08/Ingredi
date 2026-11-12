import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "pill-white";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "sm";
  block?: boolean;
}

/** Flat button. Forest-green primary carries a white label; use secondary controls inside lime boxes. */
export function Button({ variant = "primary", size = "md", block, className = "", ...rest }: Props) {
  const cls = ["btn", `btn--${variant}`, size === "sm" && "btn--sm", block && "btn--block", className].filter(Boolean).join(" ");
  return <button type="button" className={cls} {...rest} />;
}
