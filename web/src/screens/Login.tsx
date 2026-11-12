import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logotype } from "../components/Logotype";
import { useAppState } from "../data/AppState";

/** Supabase-backed sign in with a device-local demo fallback. */
export function Login() {
  const go = useNavigate();
  const location = useLocation();
  const { authenticate, mockAuthenticate, enterDemo, signed, busy } = useAppState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const returnTo = location.state && typeof location.state === "object" && "returnTo" in location.state && location.state.returnTo === "/scan" ? "/scan" : "/home";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const values = new FormData(event.currentTarget);
    try {
      const result = await authenticate(mode, String(values.get("email")), String(values.get("password")));
      if (result === "confirm") setMessage("Check your email to confirm your Supabase account, then sign in.");
      else go(returnTo, { replace: true });
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Sign in failed.");
    }
  };

  const useMockProvider = async (provider: "Apple" | "Google") => {
    setMessage("");
    await mockAuthenticate(provider, mode);
    go("/home");
  };

  return <div className="login-screen">
    <div className="login-brand"><h1><Logotype /></h1><p className="body">Cook what you have.<br />Share what you don’t need.</p></div>
    {signed ? <div className="form-stack"><p className="small">Your private Supabase kitchen is connected.</p><button type="button" className="btn btn--primary" onClick={() => go(returnTo, { replace: true })}>{returnTo === "/scan" ? "Continue to receipt scanner" : "Continue to my kitchen"}</button></div> : <>
      {returnTo === "/scan" && <p className="login-scan-note">Email sign-in is required so your receipt can be uploaded privately and the extracted groceries can be saved to your Supabase fridge.</p>}
      <div className="login-providers" aria-describedby="mock-auth-note">
        <button type="button" className="btn login-submit login-provider login-provider--apple" disabled={busy} onClick={() => void useMockProvider("Apple")}><span className="login-provider__mark" aria-hidden="true"></span>{mode === "signup" ? "Sign up with Apple" : "Sign in with Apple"}<small>Mock</small></button>
        <button type="button" className="btn login-submit login-provider login-provider--google" disabled={busy} onClick={() => void useMockProvider("Google")}><span className="login-provider__mark login-provider__mark--google" aria-hidden="true">G</span>{mode === "signup" ? "Sign up with Google" : "Sign in with Google"}<small>Mock</small></button>
      </div>
      <div className="login-divider"><span>or use email</span></div>
      <form className="login-form" onSubmit={submit}>
        <label className="form-field">Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label className="form-field">Password<input name="password" type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} required placeholder="At least 8 characters" /></label>
        {message && <p className="form-message" role="status">{message}</p>}
        <button className="btn btn--primary login-submit" disabled={busy}>{busy ? "Connecting…" : mode === "signup" ? "Create my kitchen" : "Sign in with email"}</button>
      </form>
      <button type="button" className="btn btn--secondary login-submit" disabled={busy} onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>{mode === "signin" ? "Create an account" : "Already have an account? Sign in"}</button>
      <button type="button" className="btn btn--ghost login-submit" disabled={busy} onClick={() => void enterDemo().then(() => go("/home"))}>Explore the device demo</button>
      <p id="mock-auth-note" className="caption login-note">Apple and Google are prototype-only and do not create a real provider session. Email/password keeps using Supabase for your private pantry, receipt scans, recipes, and profile.</p>
    </>}
  </div>;
}
