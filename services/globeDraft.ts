import type { GlobeDomain } from "../types";

// Held across the username gate; carries the pending intent. The "zone" draft
// (compose-first flow) also carries the typed post body so it survives the
// gate — otherwise a first-time poster's post is created only as a zone.
export type GlobeDraft =
  | { kind: "zone"; domain: GlobeDomain; title: string; body?: string }
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
