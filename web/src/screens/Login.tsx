import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Logotype } from "../components/Logotype";
import { useAppState } from "../data/AppState";

/** Supabase-backed sign in with a device-local demo fallback. */
export function Login() {
  const go = useNavigate();
  const { authenticate, enterDemo, signed, busy } = useAppState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const values = new FormData(event.currentTarget);
    try {
      const result = await authenticate(mode, String(values.get("email")), String(values.get("password")));
      if (result === "confirm") setMessage("Check your email to confirm your Supabase account, then sign in.");
      else go("/home");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Sign in failed.");
    }
  };

  return <div className="login-screen">
    <div className="login-brand"><h1><Logotype /></h1><p className="body">Cook what you have.<br />Share what you don’t need.</p></div>
    {signed ? <div className="form-stack"><p className="small">Your private Supabase kitchen is connected.</p><button type="button" className="btn btn--primary" onClick={() => go("/home")}>Continue to my kitchen</button></div> : <>
      <form className="login-form" onSubmit={submit}>
        <label className="form-field">Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label className="form-field">Password<input name="password" type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} required placeholder="At least 8 characters" /></label>
        {message && <p className="form-message" role="status">{message}</p>}
        <button className="btn btn--primary login-submit" disabled={busy}>{busy ? "Connecting…" : mode === "signup" ? "Create my kitchen" : "Sign in with email"}</button>
      </form>
      <button type="button" className="btn btn--secondary login-submit" disabled={busy} onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>{mode === "signin" ? "Create an account" : "Already have an account? Sign in"}</button>
      <button type="button" className="btn btn--ghost login-submit" disabled={busy} onClick={() => void enterDemo().then(() => go("/home"))}>Explore the device demo</button>
      <p className="caption login-note">Signed-in pantry, receipt scans, recipes, and profile use Supabase. Demo community activity stays on this device.</p>
    </>}
  </div>;
}
