import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { captureNativeReceipt } from "../../../public/lib/capture.mjs";
import { MAX_IMAGE_BYTES, validateImage } from "../../../public/lib/domain.mjs";
import { CloseIcon } from "../components/Icons";
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
      if (mode === "live" && !signed) throw new Error("Sign in first so the receipt can be processed by your private Supabase kitchen.");
      if (mode === "live" && !consent) throw new Error("Agree to the live AI receipt processing notice before continuing.");
      const result = await startReceiptScan(file, mode);
      nav("/scan/review", { state: { scan: result } });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The receipt could not be scanned."); }
  };

  return <div className="scan-screen">
    <header className="topbar"><button type="button" className="icon-btn scan-glass" aria-label="Close" onClick={() => nav("/fridge/add", { replace: true })}><CloseIcon color="#fff" /></button><b>Scan receipt</b><span className="topbar__side" /></header>
    <main className="scan-content"><div className="scan-frame">{preview ? <img src={preview} alt="Receipt preview" /> : <div className="receipt-placeholder"><b>RECEIPT</b>{Array.from({ length: 12 }, (_, index) => <span key={index} />)}</div>}<i className="scan-corner scan-corner--tl" /><i className="scan-corner scan-corner--tr" /><i className="scan-corner scan-corner--bl" /><i className="scan-corner scan-corner--br" /></div><p>Fit the whole receipt in the frame.<br />You’ll review every food item before saving.</p>
      <div className="scan-picker">{Capacitor.isNativePlatform() ? <><button className="btn btn--secondary" onClick={() => void native("photos")}>Choose photos</button><button className="scan-shutter" aria-label="Take photo" onClick={() => void native("camera")} /></> : <label className="btn btn--secondary">Choose receipt photo<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => void choose(e.target.files?.[0] || null)} /></label>}</div>
      {file && <label className="choice-row scan-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />I agree to send this receipt image to OpenAI through Ingredi’s Supabase function for extraction.</label>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </main>
    <div className="scan-actions"><button type="button" className="btn btn--secondary" disabled={busy} onClick={() => void scan("sample")}>Use sample receipt</button><button type="button" className="btn btn--primary" disabled={busy || !file} onClick={() => void scan("live")}>{busy ? "Reading…" : "Read my receipt"}</button></div>
  </div>;
}
