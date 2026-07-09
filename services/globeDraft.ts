import type { GlobeDomain } from "../types";

// Held across the username gate; carries the pending intent (no body — the
// compose gate fires before typing).
export type GlobeDraft =
  | { kind: "zone"; domain: GlobeDomain; title: string }
  | { kind: "compose"; zoneId: string; postId?: string; parentReplyId?: string }
  | null;

let draft: GlobeDraft = null;

export function setGlobeDraft(d: GlobeDraft): void {
  draft = d;
}
export function getGlobeDraft(): GlobeDraft {
  return draft;
}
export function clearGlobeDraft(): void {
  draft = null;
}

// Cached GET /globe/me result. undefined = not loaded, null = no username,
// string = the handle. Lets a composer tap decide instantly.
let cachedUsername: string | null | undefined = undefined;

export function setGlobeUsername(username: string | null): void {
  cachedUsername = username;
}
export function getGlobeUsername(): string | null | undefined {
  return cachedUsername;
}
export function clearGlobeUsername(): void {
  cachedUsername = undefined;
}
