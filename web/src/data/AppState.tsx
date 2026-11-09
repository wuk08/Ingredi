import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, getSession, scanReceipt, signIn, signOut, signUp } from "../../../public/lib/api.mjs";
import { DemoRepository, communityView, seedCommunity } from "../../../public/lib/community.mjs";
import * as kitchen from "../../../public/lib/kitchen.mjs";
import { activeResidence, needsStudentCheck, setupComplete } from "../../../public/lib/residence.mjs";
import { SAMPLE_SCAN, validateItems } from "../../../public/lib/domain.mjs";

export type PantryItem = { id: string; name: string; quantity: number; unit: string; expires_on?: string | null; source?: string; receipt_scan_id?: string };
export type Profile = { display_name: string; city: string };
export type CommunityData = Record<string, any>;
export type ScanCandidate = { id: string; status: string; extracted_items: any[]; metadata?: Record<string, any>; local?: boolean };

type Dialog = "setup" | "verify" | null;
type MockProvider = "Apple" | "Google" | "";
type AppStateValue = {
  loading: boolean;
  busy: boolean;
  signed: boolean;
  mockProvider: MockProvider;
  error: string;
  notice: string;
  pantry: PantryItem[];
  recipes: any[];
  scans: any[];
  profile: Profile;
  community: CommunityData;
  home: any;
  setupReady: boolean;
  verificationNeeded: boolean;
  dialog: Dialog;
  setDialog: (value: Dialog) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
  enterDemo: () => Promise<void>;
  mockAuthenticate: (provider: Exclude<MockProvider, "">, mode: "signin" | "signup") => Promise<void>;
  authenticate: (mode: "signin" | "signup", email: string, password: string) => Promise<"connected" | "confirm">;
  logout: () => Promise<void>;
  addPantry: (items: any[]) => Promise<void>;
  removePantry: (id: string) => Promise<void>;
  setPantryDate: (id: string, date: string | null) => Promise<void>;
  updateProfile: (value: Profile) => Promise<void>;
  runCommunity: (action: string, value?: any) => Promise<any>;
  ensureCommunity: (exchange?: boolean) => boolean;
  resetCommunity: () => Promise<void>;
  startReceiptScan: (file: File | null, mode: "sample" | "live") => Promise<ScanCandidate>;
  confirmReceipt: (scan: ScanCandidate, items: any[]) => Promise<number>;
};

const fallback = seedCommunity();
const AppState = createContext<AppStateValue | null>(null);

function copy<T>(value: T): T {
  return value == null ? value : structuredClone(value);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const repo = useRef<any>(null);
  const generation = useRef(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [signed, setSigned] = useState(Boolean(getSession()));
  const [mockProvider, setMockProvider] = useState<MockProvider>(() => (localStorage.getItem("ingredi.mock-provider") as MockProvider) || "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [profile, setProfile] = useState<Profile>({ display_name: "Jason Park", city: "Ann Arbor, MI" });
  const [community, setCommunity] = useState<CommunityData>(fallback);
  const [dialog, setDialog] = useState<Dialog>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const loadIdentity = useCallback(async () => {
    const ticket = ++generation.current;
    setLoading(true);
    setError("");
    const session = getSession();
    const nextSigned = Boolean(session);
    const nextRepo = new DemoRepository(session?.user?.id || "anonymous-demo");
    repo.current = nextRepo;
    try {
      const [communityData, kitchenData] = await Promise.all([nextRepo.load(), kitchen.load()]);
      if (ticket !== generation.current) return;
      let nextProfile = communityData.profile as Profile;
      if (nextSigned) nextProfile = (await kitchen.profile()) || nextProfile;
      if (ticket !== generation.current) return;
      setSigned(nextSigned);
      if (nextSigned) { localStorage.removeItem("ingredi.mock-provider"); setMockProvider(""); }
      setCommunity(copy(communityData));
      setPantry(kitchenData.pantry || []);
      setRecipes(kitchenData.recipes || []);
      setScans(kitchenData.scans || []);
      setProfile(nextProfile || { display_name: "My kitchen", city: "" });
    } catch (cause) {
      if (ticket === generation.current) setError(cause instanceof Error ? cause.message : "Ingredi could not open your kitchen.");
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void loadIdentity(); }, [loadIdentity]);

  const runCommunity = useCallback(async (action: string, value?: any) => {
    if (!repo.current) throw new Error("Community storage is still opening.");
    setBusy(true);
    setError("");
    try {
      const result = await repo.current.run(action, value);
      setCommunity(copy(repo.current.data));
      return result;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "That action could not be saved.";
      setError(message);
      throw cause;
    } finally {
      setBusy(false);
    }
  }, []);

  const enterDemo = useCallback(async () => {
    localStorage.setItem("ingredi.demo-entered", "1");
    localStorage.removeItem("ingredi.mock-provider");
    setMockProvider("");
    if (!kitchen.localPantry().length) setPantry(kitchen.seedLocalPantry());
    setNotice("Sample kitchen opened. Community activity stays on this device.");
  }, []);

  const mockAuthenticate = useCallback(async (provider: Exclude<MockProvider, "">, mode: "signin" | "signup") => {
    localStorage.setItem("ingredi.demo-entered", "1");
    localStorage.setItem("ingredi.mock-provider", provider);
    setMockProvider(provider);
    if (!kitchen.localPantry().length) setPantry(kitchen.seedLocalPantry());
    setNotice(`${provider} ${mode === "signup" ? "sign-up" : "sign-in"} opened in prototype mode. No provider data was sent.`);
  }, []);

  const authenticate = useCallback(async (mode: "signin" | "signup", email: string, password: string) => {
    setBusy(true);
    setError("");
    try {
      const result = await (mode === "signup" ? signUp(email, password) : signIn(email, password));
      if (mode === "signup" && !result.access_token) return "confirm" as const;
      localStorage.removeItem("ingredi.mock-provider");
      setMockProvider("");
      await loadIdentity();
      setNotice("Your private Supabase kitchen is connected.");
      return "connected" as const;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed.");
      throw cause;
    } finally {
      setBusy(false);
    }
  }, [loadIdentity]);

  const logout = useCallback(async () => {
    setBusy(true);
    try { await signOut(); } finally {
      setBusy(false);
      setDialog(null);
      await loadIdentity();
    }
  }, [loadIdentity]);

  const addPantry = useCallback(async (items: any[]) => {
    setBusy(true);
    try { setPantry(await kitchen.add(pantry, items)); setNotice("Ingredients added to your fridge."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Ingredients could not be saved."); throw cause; }
    finally { setBusy(false); }
  }, [pantry]);

  const removePantry = useCallback(async (id: string) => {
    setBusy(true);
    try { setPantry(await kitchen.remove(pantry, id)); setNotice("Ingredient removed."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The ingredient could not be removed."); throw cause; }
    finally { setBusy(false); }
  }, [pantry]);

  const setPantryDate = useCallback(async (id: string, date: string | null) => {
    setBusy(true);
    try { setPantry(await kitchen.setDate(pantry, id, date)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The date could not be saved."); throw cause; }
    finally { setBusy(false); }
  }, [pantry]);

  const saveProfile = useCallback(async (value: Profile) => {
    if (!value.display_name.trim()) throw new Error("Enter your name.");
    setBusy(true);
    try {
      await kitchen.updateProfile(value);
      await runCommunity("profile", value);
      setProfile({ display_name: value.display_name.trim(), city: value.city.trim() });
      setNotice("Profile saved.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The profile could not be saved."); throw cause; }
    finally { setBusy(false); }
  }, [runCommunity]);

  const visibleCommunity = useMemo(() => {
    try { return communityView(community); } catch { return community; }
  }, [community]);
  const home = activeResidence(community);
  const setupReady = setupComplete(community);
  const verificationNeeded = needsStudentCheck(community);

  const ensureCommunity = useCallback((exchange = false) => {
    if (!setupComplete(community)) { setDialog("setup"); return false; }
    if (exchange && needsStudentCheck(community)) { setDialog("verify"); return false; }
    return true;
  }, [community]);

  const resetCommunity = useCallback(async () => {
    if (!repo.current) return;
    setBusy(true);
    try { await repo.current.reset(); setCommunity(copy(repo.current.data)); setNotice("Community demo reset. Your fridge is unchanged."); }
    finally { setBusy(false); }
  }, []);

  const startReceiptScan = useCallback(async (file: File | null, mode: "sample" | "live") => {
    if (mode === "live" && !signed) throw new Error("Sign in to scan a personal receipt with the Supabase backend.");
    setBusy(true);
    try {
      if (mode === "sample" && !signed) return { id: crypto.randomUUID(), status: "processed", extracted_items: copy(SAMPLE_SCAN.items), metadata: { mode: "sample", merchant: SAMPLE_SCAN.merchant, skipped_non_food: SAMPLE_SCAN.skipped_non_food, warnings: SAMPLE_SCAN.warnings }, local: true };
      return await scanReceipt({ id: crypto.randomUUID(), file, mode });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The receipt could not be scanned."); throw cause; }
    finally { setBusy(false); }
  }, [signed]);

  const confirmReceipt = useCallback(async (scan: ScanCandidate, values: any[]) => {
    const items = validateItems(values);
    setBusy(true);
    try {
      if (scan.local) {
        const next = [...items.map((item: any, index: number) => ({ ...item, id: `${scan.id}-${index}`, source: "receipt", receipt_scan_id: scan.id })), ...pantry];
        kitchen.persistLocal(next);
        setPantry(next);
        return items.length;
      }
      const result = await api("/rest/v1/rpc/confirm_receipt", { method: "POST", body: { p_scan_id: scan.id, p_items: items } });
      await loadIdentity();
      return result.count;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The reviewed items could not be saved."); throw cause; }
    finally { setBusy(false); }
  }, [loadIdentity, pantry]);

  const value: AppStateValue = {
    loading, busy, signed, mockProvider, error, notice, pantry, recipes, scans, profile,
    community: visibleCommunity, home, setupReady, verificationNeeded, dialog, setDialog,
    clearError: () => setError(""), refresh: loadIdentity, enterDemo, mockAuthenticate, authenticate, logout,
    addPantry, removePantry, setPantryDate, updateProfile: saveProfile, runCommunity,
    ensureCommunity, resetCommunity, startReceiptScan, confirmReceipt,
  };
  return <AppState.Provider value={value}>{children}</AppState.Provider>;
}

export function useAppState() {
  const value = useContext(AppState);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}
