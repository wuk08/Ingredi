import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { captureNativeReceipt } from "../../../public/lib/capture.mjs";
import { MAX_IMAGE_BYTES, validateImage } from "../../../public/lib/domain.mjs";
import { CameraIcon, CloseIcon } from "../components/Icons";
import { useAppState } from "../data/AppState";

export function ScanCamera() {
  const nav = useNavigate();
  const { signed, busy, startReceiptScan } = useAppState();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const choose = async (value: File | null) => {
    if (!value) return;
    try {
      if (value.size > MAX_IMAGE_BYTES) throw new Error("Choose a receipt photo under 6 MB.");
      validateImage(new Uint8Array(await value.arrayBuffer()), value.type);
      if (preview) URL.revokeObjectURL(preview);
      setFile(value); setPreview(URL.createObjectURL(value)); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "That image could not be opened."); }
  };
  const native = async (source: "camera" | "photos") => {
    try { await choose(await captureNativeReceipt(source)); }
    catch (cause) { const message = cause instanceof Error ? cause.message : String(cause); if (!/cancel/i.test(message)) setError(message); }
  };
  const scan = async (mode: "sample" | "live") => {
    setError("");
    try {
      if (mode === "live" && !signed) {
        nav("/", { state: { returnTo: "/scan" } });
        return;
      }
      if (mode === "live" && !file) throw new Error("Take or choose a receipt photo first.");
      if (mode === "live" && !consent) throw new Error("Agree to the live AI receipt processing notice before continuing.");
      const result = await startReceiptScan(file, mode);
      nav("/scan/review", { state: { scan: result } });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The receipt could not be scanned."); }
  };

  const nativePlatform = Capacitor.isNativePlatform();

  return <div className="scan-screen">
    <header className="topbar"><button type="button" className="icon-btn scan-glass" aria-label="Close" onClick={() => nav("/fridge/add", { replace: true })}><CloseIcon color="#fff" /></button><b>Scan a real receipt</b><span className="topbar__side" /></header>
    {!signed ? <main className="scan-auth-gate">
      <span className="scan-auth-icon"><CameraIcon size={38} color="#fff" /></span>
      <h1>Scan groceries into your fridge</h1>
      <p>Sign in with email to take or choose a receipt photo. Ingredi uploads it privately to your Supabase kitchen, reads the food lines, and lets you review every item before saving.</p>
      <button type="button" className="btn btn--primary btn--block scan-auth-primary" onClick={() => nav("/", { state: { returnTo: "/scan" } })}>Sign in to scan a receipt</button>
      <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => void scan("sample")}>{busy ? "Opening…" : "Preview the labeled sample instead"}</button>
      <small>The Apple and Google buttons are mock sign-ins. Use email/password for private receipt uploads.</small>
    </main> : <>
      <main className="scan-content">
        <div className="scan-frame">{preview ? <img src={preview} alt="Receipt preview" /> : <div className="scan-ready"><span><CameraIcon size={42} color="#fff" /></span><b>Ready for your receipt</b><small>Take a clear photo of the whole receipt.</small></div>}<i className="scan-corner scan-corner--tl" /><i className="scan-corner scan-corner--tr" /><i className="scan-corner scan-corner--bl" /><i className="scan-corner scan-corner--br" /></div>
        <p className="scan-help">Your photo is uploaded to your private Supabase storage. You’ll review every food item before it reaches your fridge.</p>
        <div className="scan-picker">{nativePlatform ? <>
          <button type="button" className="btn btn--primary scan-capture" disabled={busy} onClick={() => void native("camera")}><CameraIcon size={20} color="#fff" />{preview ? "Retake photo" : "Take receipt photo"}</button>
          <button type="button" className="btn btn--secondary scan-library" disabled={busy} onClick={() => void native("photos")}>{preview ? "Choose another" : "Choose from Photos"}</button>
        </> : <label className="btn btn--primary scan-file-picker"><CameraIcon size={20} color="#fff" />{preview ? "Choose another receipt" : "Choose receipt photo"}<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => void choose(e.target.files?.[0] || null)} /></label>}</div>
        {file && <label className="choice-row scan-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>I agree to send this receipt image to OpenAI through Ingredi’s Supabase function for grocery extraction.</span></label>}
        {error && <p className="form-error scan-error" role="alert">{error}</p>}
        <button type="button" className="btn btn--ghost scan-sample-link" disabled={busy} onClick={() => void scan("sample")}>Use the labeled sample instead</button>
      </main>
      <div className="scan-actions"><button type="button" className="btn btn--primary" disabled={busy || !file || !consent} onClick={() => void scan("live")}>{busy ? "Reading your receipt…" : "Scan receipt"}</button></div>
    </>}
  </div>;
}
