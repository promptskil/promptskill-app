// In-memory feed cache — powers stale-while-revalidate on the Globe feed and
// optimistic prepend after a post. The server stays the source of truth; this
// only removes perceived latency within a session (feed still re-fetches on
// focus, and on a cold open with no cache it fetches fresh).

export interface FeedItem {
  post_id: string;
  zone_id: string;
  zone_title: string;
  zone_domain: string;
  author_username: string;
  body: string;
  created_at: string;
}

let items: FeedItem[] = [];
let cursor: string | null = null;

export function getCachedFeed(): { items: FeedItem[]; cursor: string | null } {
  return { items, cursor };
}

export function setCachedFeed(next: FeedItem[], nextCursor: string | null) {
  items = next;
  cursor = nextCursor;
}

export function appendCachedFeed(more: FeedItem[], nextCursor: string | null) {
  items = [...items, ...more];
  cursor = nextCursor;
}

export function prependCachedPost(item: FeedItem) {
  items = [item, ...items.filter((p) => p.post_id !== item.post_id)];
}

export function removeCachedZone(zoneId: string) {
  items = items.filter((p) => p.zone_id !== zoneId);
}
