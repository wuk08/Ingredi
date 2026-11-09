import { personas } from "../data/people";

interface Props {
  name: string;
  size?: number;
  ring?: string;
  className?: string;
}

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

/** Profile photo from the persona's PNG, with initials for custom profile names. */
export function Avatar({ name, size = 40, ring, className = "" }: Props) {
  const persona = (personas as Record<string, { photo: string }>)[name];
  return (
    <span
      role="img"
      aria-label={name}
      className={`avatar${className ? ` ${className}` : ""}`}
      style={{
        width: size,
        height: size,
        backgroundImage: persona ? `url("${persona.photo}")` : undefined,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    >{persona ? null : initials(name)}</span>
  );
}
