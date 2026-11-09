import { personas, type PersonaName } from "../data/people";

interface Props {
  name: PersonaName;
  size?: number;
  ring?: string;
}

/** Profile photo from the persona's PNG. `ring` cuts the avatar out of a busy background. */
export function Avatar({ name, size = 40, ring }: Props) {
  return (
    <span
      role="img"
      aria-label={name}
      className="avatar"
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${personas[name].photo}")`,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    />
  );
}
