// In-memory Globe thread cache — avoids refetching a whole thread every time the
// same zone is reopened. The server stays the source of truth: every mutation
// (post / reply / edit / delete) still refetches via load(), which rewrites this
// cache.
//
// IN-MEMORY ONLY (never AsyncStorage/localStorage) — thread content is
// user-scoped. Cleared at BOTH account boundaries via storage.ts setToken() +
// clearToken(). Bounded to THREAD_CACHE_MAX entries so a long-lived web session
// cannot grow it without limit.

import type { GlobePost, GlobeZone } from "../types";

interface ThreadCacheEntry {
  zone: GlobeZone;
  posts: GlobePost[];
  fetchedAt: number;
}

const THREAD_TTL_MS = 60_000;
const THREAD_CACHE_MAX = 20;

const threads = new Map<string, ThreadCacheEntry>();

export function getCachedThread(
  zoneId: string,
): { zone: GlobeZone; posts: GlobePost[] } | null {
  const entry = threads.get(zoneId);
  return entry ? { zone: entry.zone, posts: entry.posts } : null;
}

export function isThreadCacheStale(zoneId: string): boolean {
  const entry = threads.get(zoneId);
  return !entry || Date.now() - entry.fetchedAt > THREAD_TTL_MS;
}

export function setCachedThread(
  zoneId: string,
  zone: GlobeZone,
  posts: GlobePost[],
) {
  // FIFO evict — Map preserves insertion order.
  if (!threads.has(zoneId) && threads.size >= THREAD_CACHE_MAX) {
    const oldest = threads.keys().next().value;
    if (oldest !== undefined) threads.delete(oldest);
  }
  threads.set(zoneId, { zone, posts, fetchedAt: Date.now() });
}

export function removeCachedThread(zoneId: string) {
  threads.delete(zoneId);
}

export function clearThreadCache() {
  threads.clear();
}
