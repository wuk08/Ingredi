import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { localDate } from "../../../public/lib/domain.mjs";
import { CheckIcon } from "../components/Icons";
import { TopBar } from "../components/TopBar";
import { useAppState, type ScanCandidate } from "../data/AppState";

type ReviewItem = { name: string; quantity: number; unit: string; expires_on: string | null; confidence?: string; raw_line?: string; selected: boolean };

export function ScanReview() {
  const nav = useNavigate();
  const location = useLocation();
  const { confirmReceipt, busy } = useAppState();
  const scan = (location.state as { scan?: ScanCandidate } | null)?.scan;
  const [items, setItems] = useState<ReviewItem[]>(() => (scan?.extracted_items || []).map((item: any, index: number) => ({ ...item, expires_on: localDate(index % 3 === 0 ? 3 : 7), selected: item.confidence !== "low" })));
  if (!scan) return <main className="center-gate"><h1 className="h1">No receipt to review</h1><Link to="/scan" className="btn btn--primary">Scan a receipt</Link></main>;
  const selected = items.filter((item) => item.selected);
  const update = (index: number, patch: Partial<ReviewItem>) => setItems(items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const save = async () => { const count = await confirmReceipt(scan, selected); nav("/scan/done", { state: { count, names: selected.map((item) => item.name) } }); };
  return <>
    <TopBar title="Review items" right={<Link to="/scan" className="btn btn--ghost btn--sm">Rescan</Link>} />
    <main className="screen-scroll scan-review"><section className="card scan-summary"><span>▤</span><div><b>We found {items.length} food items</b><small>{scan.metadata?.merchant || "Your receipt"} · {scan.metadata?.skipped_non_food || 0} non-food items skipped</small></div></section>
      {Boolean(scan.metadata?.warnings?.length) && <section className="review-warning">{scan.metadata?.warnings?.map((warning: string) => <p key={warning}>{warning}</p>)}</section>}
      <div className="section-heading"><h2 className="h3">Ingredients <small>{selected.length} selected</small></h2><button className="btn btn--ghost btn--sm" onClick={() => setItems(items.map((item) => ({ ...item, selected: selected.length !== items.length })))}>{selected.length === items.length ? "Deselect all" : "Select all"}</button></div>
      <section className="review-items">{items.map((item, index) => <div className={item.confidence === "low" ? "uncertain" : ""} key={`${item.raw_line}-${index}`}><div className="review-main"><button type="button" role="checkbox" aria-checked={item.selected} onClick={() => update(index, { selected: !item.selected })}>{item.selected && <CheckIcon size={14} color="#fff" />}</button><label>Ingredient<input value={item.name} maxLength={100} onChange={(e) => update(index, { name: e.target.value })} /></label></div><div className="review-fields"><label>Amount<input type="number" min="0.01" max="10000" step="0.01" value={item.quantity} onChange={(e) => update(index, { quantity: Number(e.target.value) })} /></label><label>Unit<input value={item.unit} maxLength={30} onChange={(e) => update(index, { unit: e.target.value })} /></label><label>Best before<input type="date" value={item.expires_on || ""} onChange={(e) => update(index, { expires_on: e.target.value || null })} /></label></div>{item.confidence !== "high" && <small>Check this item · {item.raw_line}</small>}</div>)}</section>
    </main>
    <div className="action-bar"><button type="button" className="btn btn--primary" disabled={busy || !selected.length} onClick={() => void save()}>{busy ? "Adding…" : `Add ${selected.length} item${selected.length === 1 ? "" : "s"} to fridge`}</button></div>
  </>;
}
