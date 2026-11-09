import { useState } from "react";
import svg from "../assets/logotype.svg?raw";
import "./Logotype.css";

/** Animated "Ingredi" logotype (Outfit 500). Plays on mount; tap to replay. */
export function Logotype() {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      aria-label="Ingredi"
      className="logotype"
      onClick={() => setRun((n) => n + 1)}
      style={{ border: 0, padding: 0, background: "transparent", cursor: "pointer", width: 196, height: 70 }}
    >
      <span key={run} style={{ display: "block" }} dangerouslySetInnerHTML={{ __html: svg }} />
    </button>
  );
}
