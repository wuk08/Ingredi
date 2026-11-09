import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { localDate, MAX_IMAGE_BYTES, validateImage } from "../../../public/lib/domain.mjs";
import { CameraIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import { useAppState } from "../data/AppState";

type Kind = "available" | "wanted" | "meal_prep";

export function UploadPost() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { home, setupReady, verificationNeeded, setDialog, runCommunity, ensureCommunity, busy } = useAppState();
  const [type, setType] = useState<Kind>(params.get("type") === "meal_prep" ? "meal_prep" : "available");
  const [category, setCategory] = useState("ingredients");
  const [offer, setOffer] = useState("free");
  const [visibility, setVisibility] = useState<"building" | "neighborhood">("building");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("item");
  const [pickup, setPickup] = useState("");
  const [expires, setExpires] = useState(localDate(3));
  const [dish, setDish] = useState(params.get("dish") || "");
  const [photos, setPhotos] = useState<File[]>([]);
  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const draft = () => ({ type, category, offer, visibility, title, description, quantity, unit, pickup, expires_on: expires, photos, dish, date: localDate(2), time: "5 PM" });
  const saveDraft = async () => { if (setupReady) await runCommunity("saveDraft", draft()); else setDialog("setup"); };
  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!ensureCommunity(true)) return;
    const id = await runCommunity("publish", draft());
    nav(`/post/${id}`);
  };
  const choosePhotos = async (files: FileList | null) => {
    const chosen: File[] = [];
    for (const file of Array.from(files || []).slice(0, 5 - photos.length)) {
      if (file.size > MAX_IMAGE_BYTES) throw new Error("Choose photos under 6 MB each.");
      validateImage(new Uint8Array(await file.arrayBuffer()), file.type);
      chosen.push(file);
    }
    setPhotos([...photos, ...chosen]);
  };
  if (!setupReady) return <main className="center-gate"><h1 className="h1">Choose your home community first.</h1><button className="btn btn--primary" onClick={() => setDialog("setup")}>Set up residence</button></main>;
  if (verificationNeeded) return <main className="center-gate"><h1 className="h1">One sample step before sharing.</h1><p>Complete the restored student ID demo before posting or exchanging.</p><button className="btn btn--primary" onClick={() => setDialog("verify")}>Try the sample ID check</button></main>;
  return <>
    <TopBar close title="New Post" right={<button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => void saveDraft()}>Save draft</button>} />
    <form id="post-form" className="screen-scroll post-form" onSubmit={publish}>
      <fieldset><legend>What are you posting?</legend><div className="type-grid">{[["available", "Available", "Give away"], ["wanted", "Wanted", "Ask for"], ["meal_prep", "Meal Prep", "Start a group"]].map(([value, name, hint]) => <button key={value} type="button" className={type === value ? "selected" : ""} onClick={() => setType(value as Kind)}><b>{name}</b><small>{hint}</small></button>)}</div></fieldset>
      <fieldset><legend>Photos <small>{photos.length}/5</small></legend><div className="photo-picker"><label><CameraIcon />Add<input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => void choosePhotos(e.target.files).catch((cause) => alert(cause.message))} /></label>{previews.map((src, index) => <button type="button" key={src} aria-label={`Remove photo ${index + 1}`} onClick={() => setPhotos(photos.filter((_, i) => i !== index))} style={{ backgroundImage: `url("${src}")` }}>×</button>)}</div></fieldset>
      <label className="form-field">Title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder={type === "wanted" ? "I need two eggs" : type === "meal_prep" ? "Korean Food Week" : "3 ripe avocados"} /></label>
      <label className="form-field">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={800} placeholder="Condition, storage, and pickup notes…" /></label>
      <fieldset><legend>Category</legend><div className="chip-row">{["ingredients", "meals", "equipment"].map((value) => <button key={value} type="button" className="chip" aria-pressed={category === value} onClick={() => setCategory(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></fieldset>
      <fieldset><legend>Offer</legend><div className="seg"><button type="button" aria-selected={offer === "free"} onClick={() => setOffer("free")}>Free</button><button type="button" aria-selected={offer === "exchange"} onClick={() => setOffer("exchange")}>Exchange</button></div></fieldset>
      <div className="two-fields"><label className="form-field">{type === "meal_prep" ? "Spots" : "Quantity"}<input type="number" min="0.01" max="10000" step="0.01" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required /></label><label className="form-field">Unit<input value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={30} required /></label></div>
      {type === "meal_prep" && <label className="form-field">Your dish<input value={dish} onChange={(e) => setDish(e.target.value)} placeholder="Bibimbap" /></label>}
      <label className="form-field">{type === "meal_prep" ? "Meetup" : "Pickup location and time"}<input value={pickup} onChange={(e) => setPickup(e.target.value)} required placeholder={`${home?.name} lobby · today, 5–8 PM`} /></label>
      {type !== "meal_prep" && <label className="form-field">{type === "wanted" ? "Needed by" : "Best before"}<input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></label>}
      <fieldset><legend>Who can see this?</legend><div className="seg"><button type="button" aria-selected={visibility === "building"} onClick={() => setVisibility("building")}>My building</button><button type="button" aria-selected={visibility === "neighborhood"} disabled={!home?.center} onClick={() => setVisibility("neighborhood")}>Neighborhood</button></div>{!home?.center && <p className="small">Add a residence map location to share with the neighborhood.</p>}</fieldset>
    </form>
    <div className="action-bar"><button form="post-form" type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : type === "meal_prep" ? "Create group" : "Post"}</button></div>
  </>;
}
