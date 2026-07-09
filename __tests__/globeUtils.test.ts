import { buildReplyTree, initials, relativeTime } from "../utils/globe";
import type { GlobeReply } from "../types";

describe("relativeTime", () => {
  const iso = (secsAgo: number) =>
    new Date(Date.now() - secsAgo * 1000).toISOString();
  it("buckets now/m/h/d", () => {
    expect(relativeTime(iso(10))).toBe("now");
    expect(relativeTime(iso(3 * 60))).toBe("3m");
    expect(relativeTime(iso(2 * 3600))).toBe("2h");
    expect(relativeTime(iso(3 * 86400))).toBe("3d");
  });
});

describe("initials", () => {
  it("uses two underscore parts", () => {
    expect(initials("jordan_dev")).toBe("JD");
  });
  it("falls back to first two chars", () => {
    expect(initials("poster1")).toBe("PO");
  });
});

describe("buildReplyTree", () => {
  const r = (id: string, parent: string | null): GlobeReply => ({
    id,
    parent_reply_id: parent,
    author_username: "u",
    body: "b",
    created_at: "2026-07-09T00:00:00Z",
  });

  it("nests replies under their parent", () => {
    const tree = buildReplyTree([r("1", null), r("2", "1"), r("3", null)]);
    expect(tree.map((n) => n.id)).toEqual(["1", "3"]);
    expect(tree[0].children.map((n) => n.id)).toEqual(["2"]);
  });

  it("treats an orphan (missing parent) as a root", () => {
    const tree = buildReplyTree([r("2", "missing")]);
    expect(tree.map((n) => n.id)).toEqual(["2"]);
  });
});
