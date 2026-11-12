import { useState } from "react";
import "./Logotype.css";

/** Animated original `ingredi.` wordmark. Plays on mount; tap to replay. */
export function Logotype() {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      aria-label="ingredi."
      className="logotype"
      onClick={() => setRun((n) => n + 1)}
      style={{ border: 0, padding: 0, background: "transparent", cursor: "pointer", width: 250, height: 84 }}
    >
      <span key={run} className="logotype__word" aria-hidden="true">ingredi<span className="logotype__period" /></span>
    </button>
  );
}
