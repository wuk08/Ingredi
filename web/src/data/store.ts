import { useSyncExternalStore } from "react";

/** Tiny in-memory app store (tokens, points, unread notification ids). Swap for your real state/data layer later. */
type State = { tokens: number; points: number; unreadNotifs: number[] };
let state: State = { tokens: 12, points: 1240, unreadNotifs: [1, 2, 3] };
const subs = new Set<() => void>();

export function setStore(patch: Partial<State>) {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
}
export function useStore() {
  return useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state);
}
