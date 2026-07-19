// In-memory profile cache — avoids repeated GET /user reads within a session.
// IN-MEMORY ONLY (never AsyncStorage/localStorage): email is user PII.
// Cleared at BOTH account boundaries via storage.ts setToken() + clearToken().
// Never cache auth validity, checkout status, or permissions here — the
// backend stays the source of truth.

export interface ProfileRecord {
  id: string;
  email: string;
}

const PROFILE_TTL_MS = 5 * 60_000;

let profile: ProfileRecord | null = null;
let fetchedAt = 0;

export function getCachedProfile(): ProfileRecord | null {
  return profile;
}

export function isProfileCacheStale(): boolean {
  return !profile || Date.now() - fetchedAt > PROFILE_TTL_MS;
}

export function setCachedProfile(next: ProfileRecord) {
  profile = next;
  fetchedAt = Date.now();
}

export function updateCachedProfileEmail(email: string) {
  if (profile) {
    profile = { ...profile, email };
    fetchedAt = Date.now();
  }
}

export function clearProfileCache() {
  profile = null;
  fetchedAt = 0;
}
