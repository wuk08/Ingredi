import a01 from "../assets/avatars/ingredi-avatar-01.png";
import a02 from "../assets/avatars/ingredi-avatar-02.png";
import a03 from "../assets/avatars/ingredi-avatar-03.png";
import a05 from "../assets/avatars/ingredi-avatar-05.png";
import a06 from "../assets/avatars/ingredi-avatar-06.png";
import a07 from "../assets/avatars/ingredi-avatar-07.png";
import a08 from "../assets/avatars/ingredi-avatar-08.png";

/** Personas and their saved profile photos (PNG, 512px). Spare avatars: 04, 09, 10. */
export const personas = {
  "Jason Park": { photo: a07, level: 3, note: "The signed-in user" },
  "Jack Lee": { photo: a01, level: 4, distance: "0.2 mi" },
  "Mason Mei": { photo: a02, level: 2, distance: "0.4 mi" },
  "Ari Kim": { photo: a08, level: 3, distance: "0.6 mi" },
  "Dana P.": { photo: a05, level: 2, distance: "0.8 mi" },
  "Leo S.": { photo: a03, level: 1, distance: "0.9 mi" },
  "Priya R.": { photo: a06, level: 3, distance: "1.0 mi" },
} as const;

export type PersonaName = keyof typeof personas;
export const currentUser: PersonaName = "Jason Park";
