import { useMemo, useState, type FormEvent } from "react";
import { createResidenceLookup } from "../../../public/lib/residence.mjs";
import { currentPosition } from "../../../public/lib/nearby-map.mjs";
import { useAppState } from "../data/AppState";
import { CloseIcon } from "./Icons";

const lookup = createResidenceLookup({ baseUrl: "https://photon.komoot.io" });

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const { setDialog, busy } = useAppState();
  return <div className="modal-backdrop" role="presentation"><section className="react-modal" role="dialog" aria-modal="true" aria-labelledby="community-dialog-title">
    <header><button type="button" className="icon-btn" aria-label="Close" disabled={busy} onClick={() => setDialog(null)}><CloseIcon /></button><h2 id="community-dialog-title" className="h2">{title}</h2><span /></header>
    <div className="react-modal__body">{children}</div>
  </section></div>;
}

function SetupDialog() {
  const { community, runCommunity, setDialog, busy } = useAppState();
  const [step, setStep] = useState<"student" | "search" | "confirm">("student");
  const [isStudent, setIsStudent] = useState<boolean | null>(community.student?.isStudent ?? null);
  const [school, setSchool] = useState(community.student?.school || "");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [candidate, setCandidate] = useState<any>({ name: "", address: "", kind: "apartment", center: null });

  const saved = community.residences || [];
  const submitStudent = async (event: FormEvent) => {
    event.preventDefault();
    if (isStudent === null) { setMessage("Choose your student status."); return; }
    try { await runCommunity("student", { isStudent, school }); setMessage(""); setStep("search"); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not save your status."); }
  };
  const search = async (useLocation = false) => {
    setSearching(true); setMessage("");
    try {
      const found = useLocation ? await lookup.reverse(await currentPosition()) : await lookup.search(query);
      setResults(found);
      setMessage(found.length ? "Choose a building, then confirm it." : "No match found. Enter your building manually.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Address lookup is unavailable."); }
    finally { setSearching(false); }
  };
  const choose = (value: any) => {
    setCandidate(value.building === false ? { ...value, id: null, name: "", approximate: true } : value);
    setStep("confirm");
  };
  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await runCommunity("residence", { ...candidate, name: form.get("name"), address: form.get("address"), kind: form.get("kind"), center: candidate.center || null, approximate: Boolean(candidate.approximate) });
      setDialog(null);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not save your residence."); }
  };

  return <Shell title={step === "student" ? "Find your people" : step === "search" ? "Where do you live?" : "Confirm your building"}>
    {step === "student" && <form className="form-stack" onSubmit={submitStudent}>
      <p className="eyebrow">YOUR COMMUNITY · 1 OF 2</p><h3 className="h1">Are you a student?</h3><p className="small">This helps Ingredi apply the original sample verification step before exchanges.</p>
      <label className="choice-row"><input type="radio" name="student" checked={isStudent === true} onChange={() => setIsStudent(true)} />Yes, I’m a student</label>
      <label className="choice-row"><input type="radio" name="student" checked={isStudent === false} onChange={() => setIsStudent(false)} />No, I’m not a student</label>
      {isStudent && <label className="form-field">School or university<input value={school} onChange={(e) => setSchool(e.target.value)} maxLength={120} required placeholder="University of Michigan" /></label>}
      {message && <p className="form-error" role="alert">{message}</p>}
      <button className="btn btn--primary" disabled={busy}>Continue</button>
    </form>}
    {step === "search" && <div className="form-stack">
      <p className="eyebrow">YOUR COMMUNITY · 2 OF 2</p><h3 className="h1">A little closer to home.</h3>
      <button type="button" className="btn btn--secondary" disabled={searching} onClick={() => void search(true)}>{searching ? "Finding buildings…" : "Use my current location"}</button>
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); void search(false); }}><input value={query} onChange={(e) => setQuery(e.target.value)} minLength={3} required placeholder="Building name or address" /><button className="btn btn--primary" disabled={searching}>Search</button></form>
      {message && <p className="small" role="status">{message}</p>}
      <div className="result-list">{results.map((result) => <button type="button" key={result.id} onClick={() => choose(result)}><strong>{result.name}</strong><small>{result.address}</small></button>)}</div>
      {saved.length > 0 && <><h4 className="h3">Saved residences</h4><div className="result-list">{saved.map((result: any) => <button type="button" key={result.id} onClick={() => choose(result)}><strong>{result.name}</strong><small>{result.address}</small></button>)}</div></>}
      <button type="button" className="btn btn--ghost" onClick={() => { setCandidate({ name: "", address: query, kind: "apartment", center: null }); setStep("confirm"); }}>Can’t find it? Enter manually</button>
      <button type="button" className="btn btn--ghost" onClick={() => setStep("student")}>Back to student status</button>
    </div>}
    {step === "confirm" && <form className="form-stack" onSubmit={confirm}>
      <p className="eyebrow">YOUR HOME COMMUNITY</p><h3 className="h1">Is this your residence?</h3>
      <label className="form-field">Building name<input name="name" defaultValue={candidate.name} maxLength={120} required /></label>
      <label className="form-field">Building address<input name="address" defaultValue={candidate.address} maxLength={240} required /></label>
      <label className="form-field">Residence type<select name="kind" defaultValue={candidate.kind || "apartment"}><option value="apartment">Apartment building</option><option value="dorm">College dorm</option><option value="other">Other residence</option></select></label>
      <label className="choice-row"><input type="checkbox" required />I live in this building. I did not enter a room or unit number.</label>
      {message && <p className="form-error" role="alert">{message}</p>}
      <button className="btn btn--primary" disabled={busy}>Join my building</button><button type="button" className="btn btn--ghost" onClick={() => setStep("search")}>Back to search</button>
    </form>}
  </Shell>;
}

function VerifyDialog() {
  const { community, runCommunity, setDialog, busy } = useAppState();
  const [stage, setStage] = useState<"card" | "review" | "done">("card");
  const school = community.student?.school || "your school";
  const complete = async () => { await runCommunity("checkStudent"); setStage("done"); };
  return <Shell title="Sample student ID check"><div className="form-stack verification-flow">
    {stage === "card" && <><p className="eyebrow">DEMO ONLY</p><h3 className="h1">Try the student ID step.</h3><p className="small">Use this fake sample card. No real student documents or ID numbers are collected.</p><div className="sample-student-card"><span>FAKE SAMPLE · NOT VALID</span><strong>Sample University</strong><b>Alex Sample</b><small>Demo student · {school}</small></div><button type="button" className="btn btn--primary" onClick={() => setStage("review")}>Use sample ID &amp; submit</button></>}
    {stage === "review" && <><h3 className="h1">Sample review pending</h3><p className="small">This simulates the trusted review process the production feature would require.</p><button type="button" className="btn btn--primary" disabled={busy} onClick={() => void complete()}>Simulate successful review</button></>}
    {stage === "done" && <><h3 className="h1">Demo check completed</h3><p className="small">You can now post, request, message, and join meal swaps.</p><button type="button" className="btn btn--primary" onClick={() => setDialog(null)}>Continue</button></>}
  </div></Shell>;
}

export function CommunityDialogs() {
  const { dialog } = useAppState();
  return useMemo(() => dialog === "setup" ? <SetupDialog /> : dialog === "verify" ? <VerifyDialog /> : null, [dialog]);
}
