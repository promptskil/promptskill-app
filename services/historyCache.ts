// In-memory history cache — stale-while-revalidate for the prompt history list
// (shared by the History screen and the menu). The server stays the source of
// truth; this only removes repeated /history reads within a session.
//
// IN-MEMORY ONLY (never AsyncStorage/localStorage) — prompt history is
// sensitive user text. Cleared at BOTH account boundaries via storage.ts:
// setToken() (session start) and clearToken() (logout + 401 expiry).
// Never cache auth validity, checkout status, or permissions here.

export interface PromptRecord {
  prompt_id: string;
  model: string;
  topic: string;
  prompt_text: string;
  feedback_vote: "up" | "down" | null;
  created_at: string;
}

const HISTORY_TTL_MS = 60_000;

let items: PromptRecord[] = [];
let total = 0;
let fetchedAt = 0;

export function getCachedHistory(): { items: PromptRecord[]; total: number } {
  return { items, total };
}

export function isHistoryCacheStale(): boolean {
  return Date.now() - fetchedAt > HISTORY_TTL_MS;
}

export function setCachedHistory(next: PromptRecord[], nextTotal: number) {
  items = next;
  total = nextTotal;
  fetchedAt = Date.now();
}

export function appendCachedHistory(more: PromptRecord[], nextTotal: number) {
  items = [...items, ...more];
  total = nextTotal;
  fetchedAt = Date.now();
}

export function removeCachedPrompt(id: string) {
  items = items.filter((item) => item.prompt_id !== id);
  total = Math.max(0, total - 1);
}

export function clearHistoryCache() {
  items = [];
  total = 0;
  fetchedAt = 0;
}
