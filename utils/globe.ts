import type { GlobeReply, GlobeReplyNode } from "../types";

/** Muted relative timestamp: now / {m}m / {h}h / {d}d. */
export function relativeTime(iso: string): string {
  const secs = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/** Avatar initials from a username: first letters of up to two _-parts,
 *  else the first two chars. */
export function initials(username: string): string {
  const parts = username.split("_").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const single = (parts[0] ?? username).replace(/[^A-Za-z0-9]/g, "");
  return (single.slice(0, 2) || "?").toUpperCase();
}

/** Nest a flat, chronological reply list into a tree by parent_reply_id.
 *  Orphans (missing parent) fall back to roots. Indentation is capped at
 *  render time (min(depth, 4)), not here. */
export function buildReplyTree(replies: GlobeReply[]): GlobeReplyNode[] {
  const byId = new Map<string, GlobeReplyNode>();
  const roots: GlobeReplyNode[] = [];
  for (const r of replies) byId.set(r.id, { ...r, children: [] });
  for (const r of replies) {
    const node = byId.get(r.id)!;
    const parent = r.parent_reply_id ? byId.get(r.parent_reply_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}
