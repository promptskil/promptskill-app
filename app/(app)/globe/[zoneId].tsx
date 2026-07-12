import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";
import {
  clearGlobeDraft,
  getGlobeDraft,
  getGlobeUsername,
  setGlobeDraft,
  setGlobeUsername,
} from "../../../services/globeDraft";
import { buildReplyTree, initials, relativeTime } from "../../../utils/globe";
import type { GlobePost, GlobeReplyNode, GlobeZone } from "../../../types";

type Composer =
  | { kind: "post" }
  | { kind: "reply"; postId: string; parentReplyId?: string }
  | null;

function flatten(
  nodes: GlobeReplyNode[],
  depth = 0,
  out: { node: GlobeReplyNode; depth: number }[] = [],
) {
  for (const n of nodes) {
    out.push({ node: n, depth });
    if (n.children.length) flatten(n.children, depth + 1, out);
  }
  return out;
}

export default function GlobeThread() {
  const router = useRouter();
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();
  const [zoneTitle, setZoneTitle] = useState("");
  const [posts, setPosts] = useState<GlobePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composer, setComposer] = useState<Composer>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [me, setMe] = useState<string | null | undefined>(getGlobeUsername());
  const [editing, setEditing] = useState<
    { kind: "post" | "reply"; id: string } | null
  >(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<
    { kind: "post" | "reply"; id: string } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiCall<{ zone: GlobeZone; posts: GlobePost[] }>(
        "GET",
        `/globe/zones/${zoneId}/posts?limit=50&offset=0`,
      );
      setZoneTitle(data.zone.title);
      setPosts(data.posts);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError && err.status === 404) setZoneTitle("Not found");
    } finally {
      setLoading(false);
    }
  }, [zoneId, router]);

  useEffect(() => {
    load();
  }, [load]);

  // Resume a compose intent after a username claim.
  useEffect(() => {
    const d = getGlobeDraft();
    if (d?.kind === "compose" && d.zoneId === zoneId) {
      setComposer(
        d.postId
          ? { kind: "reply", postId: d.postId, parentReplyId: d.parentReplyId }
          : { kind: "post" },
      );
      clearGlobeDraft();
    }
  }, [zoneId]);

  // Deep-link safety: ensure "me" is known so Edit can appear.
  useEffect(() => {
    if (getGlobeUsername() === undefined) {
      apiCall<{ username: string | null }>("GET", "/globe/me")
        .then((r) => {
          setGlobeUsername(r.username);
          setMe(r.username);
        })
        .catch(() => {});
    }
  }, []);

  function startPost() {
    if (getGlobeUsername() === null) {
      setGlobeDraft({ kind: "compose", zoneId });
      router.push("/(app)/globe/username");
      return;
    }
    setText("");
    setComposer({ kind: "post" });
  }

  function startReply(postId: string, parentReplyId?: string) {
    if (getGlobeUsername() === null) {
      setGlobeDraft({ kind: "compose", zoneId, postId, parentReplyId });
      router.push("/(app)/globe/username");
      return;
    }
    setText("");
    setComposer({ kind: "reply", postId, parentReplyId });
  }

  async function submit() {
    const body = text.trim();
    if (!body || submitting || !composer) return;
    setSubmitting(true);
    try {
      if (composer.kind === "post") {
        await apiCall("POST", `/globe/zones/${zoneId}/posts`, { body });
      } else {
        await apiCall("POST", `/globe/posts/${composer.postId}/replies`, {
          body,
          parent_reply_id: composer.parentReplyId ?? null,
        });
      }
      setComposer(null);
      setText("");
      await load();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      // Defensive: gated already, but honor a 403 by routing to the gate.
      if (err instanceof ApiError && err.status === 403) {
        setGlobeDraft({
          kind: "compose",
          zoneId,
          postId: composer.kind === "reply" ? composer.postId : undefined,
          parentReplyId:
            composer.kind === "reply" ? composer.parentReplyId : undefined,
        });
        router.push("/(app)/globe/username");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(kind: "post" | "reply", id: string, body: string) {
    setEditing({ kind, id });
    setEditText(body);
  }

  function cancelEdit() {
    setEditing(null);
    setEditText("");
  }

  async function saveEdit() {
    const body = editText.trim();
    if (!body || savingEdit || !editing) return;
    setSavingEdit(true);
    try {
      const path =
        editing.kind === "post"
          ? `/globe/posts/${editing.id}`
          : `/globe/replies/${editing.id}`;
      await apiCall("PATCH", path, { body });
      setEditing(null);
      setEditText("");
      await load();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      // 404 (not yours / gone) or other — drop the editor; refresh shows truth.
      setEditing(null);
      await load();
    } finally {
      setSavingEdit(false);
    }
  }

  async function hideZone() {
    setMenuOpen(false);
    try {
      await apiCall("POST", `/globe/zones/${zoneId}/hide`);
      router.back();
    } catch (err) {
      if (err instanceof SessionExpiredError) router.replace("/(auth)/login");
    }
  }

  function startDelete(kind: "post" | "reply", id: string) {
    setConfirmDelete({ kind, id });
  }

  function cancelDelete() {
    setConfirmDelete(null);
  }

  async function doDelete() {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      const path =
        confirmDelete.kind === "post"
          ? `/globe/posts/${confirmDelete.id}`
          : `/globe/replies/${confirmDelete.id}`;
      await apiCall("DELETE", path);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      setConfirmDelete(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }

  const isTarget = (postId: string, parentReplyId?: string) =>
    composer?.kind === "reply" &&
    composer.postId === postId &&
    composer.parentReplyId === parentReplyId;

  const composerBar = (placeholder: string) => (
    <View style={styles.composerActive}>
      <TextInput
        style={styles.composerInput}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        autoFocus
        multiline
      />
      <Pressable
        onPress={submit}
        disabled={!text.trim() || submitting}
        style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendDisabled]}
      >
        <Ionicons name="arrow-up" size={15} color="#FFFFFF" />
      </Pressable>
      <Pressable
        onPress={() => {
          setComposer(null);
          setText("");
        }}
        hitSlop={8}
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={16} color="#666666" />
      </Pressable>
    </View>
  );

  const avatar = (username: string, size: number) => (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.avatarText}>{initials(username)}</Text>
    </View>
  );

  const editAffordance = (kind: "post" | "reply", id: string, body: string) => (
    <Pressable
      style={styles.replyAffordance}
      onPress={() => startEdit(kind, id, body)}
    >
      <Ionicons name="pencil-outline" size={12} color="#666666" />
      <Text style={styles.replyText}>Edit</Text>
    </Pressable>
  );

  const editBar = () => (
    <View style={styles.composerActive}>
      <TextInput
        style={styles.composerInput}
        value={editText}
        onChangeText={setEditText}
        autoFocus
        multiline
      />
      <Pressable
        onPress={saveEdit}
        disabled={!editText.trim() || savingEdit}
        style={[
          styles.editOk,
          (!editText.trim() || savingEdit) && styles.sendDisabled,
        ]}
      >
        <Text style={styles.editOkText}>OK</Text>
      </Pressable>
      <Pressable onPress={cancelEdit} hitSlop={6} style={styles.closeBtn}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );

  const deleteAffordance = (kind: "post" | "reply", id: string) => (
    <Pressable
      style={styles.replyAffordance}
      onPress={() => startDelete(kind, id)}
    >
      <Ionicons name="trash-outline" size={12} color="#666666" />
      <Text style={styles.replyText}>Delete</Text>
    </Pressable>
  );

  const confirmBar = () => (
    <View style={styles.confirmRow}>
      <Text style={styles.confirmText}>Delete this?</Text>
      <Pressable
        onPress={doDelete}
        disabled={deleting}
        style={[styles.confirmDelete, deleting && styles.sendDisabled]}
      >
        <Text style={styles.confirmDeleteText}>Delete</Text>
      </Pressable>
      <Pressable onPress={cancelDelete} hitSlop={6}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#444444" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {zoneTitle}
        </Text>
        <Pressable onPress={() => setMenuOpen((v) => !v)} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color="#444444" />
        </Pressable>
      </View>
      {menuOpen ? (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={hideZone}>
            <Ionicons name="eye-off-outline" size={15} color="#1A1A1A" />
            <Text style={styles.menuItemText}>Hide</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.content}>
      {composer?.kind === "post" ? (
        composerBar("Write a post")
      ) : (
        <Pressable style={styles.composerIdle} onPress={startPost}>
          <Ionicons name="pencil" size={15} color="#666666" />
          <Text style={styles.composerIdleText}>Write a post</Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator color="#666666" style={{ marginTop: 32 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {posts.map((post) => (
            <View key={post.id} style={styles.post}>
              <View style={styles.row}>
                {avatar(post.author_username, 26)}
                <View style={styles.rowBody}>
                  <View style={styles.metaRow}>
                    <Text style={styles.name}>{post.author_username}</Text>
                    <Text style={styles.time}>{relativeTime(post.created_at)}</Text>
                  </View>
                  <Text style={styles.body}>{post.body}</Text>
                  <View style={styles.affordanceRow}>
                    <Pressable
                      style={styles.replyAffordance}
                      onPress={() => startReply(post.id)}
                    >
                      <Ionicons name="chatbubble-outline" size={13} color="#666666" />
                      <Text style={styles.replyText}>Reply</Text>
                    </Pressable>
                    {post.author_username === me
                      ? editAffordance("post", post.id, post.body)
                      : null}
                    {post.author_username === me
                      ? deleteAffordance("post", post.id)
                      : null}
                  </View>
                  {editing?.kind === "post" && editing.id === post.id
                    ? editBar()
                    : null}
                  {confirmDelete?.kind === "post" && confirmDelete.id === post.id
                    ? confirmBar()
                    : null}
                </View>
              </View>
              {isTarget(post.id, undefined) ? composerBar("Write a reply") : null}

              {flatten(buildReplyTree(post.replies)).map(({ node, depth }) => (
                <View
                  key={node.id}
                  style={{ paddingLeft: Math.min(depth, 4) * 14 }}
                >
                  <View style={styles.reply}>
                    <View style={styles.row}>
                      {avatar(node.author_username, 20)}
                      <View style={styles.rowBody}>
                        <View style={styles.metaRow}>
                          <Text style={styles.nameSm}>{node.author_username}</Text>
                          <Text style={styles.time}>
                            {relativeTime(node.created_at)}
                          </Text>
                        </View>
                        <Text style={styles.bodySm}>{node.body}</Text>
                        <View style={styles.affordanceRow}>
                          <Pressable
                            style={styles.replyAffordance}
                            onPress={() => startReply(post.id, node.id)}
                          >
                            <Ionicons
                              name="chatbubble-outline"
                              size={12}
                              color="#666666"
                            />
                            <Text style={styles.replyText}>Reply</Text>
                          </Pressable>
                          {node.author_username === me
                            ? editAffordance("reply", node.id, node.body)
                            : null}
                          {node.author_username === me
                            ? deleteAffordance("reply", node.id)
                            : null}
                        </View>
                        {editing?.kind === "reply" && editing.id === node.id
                          ? editBar()
                          : null}
                        {confirmDelete?.kind === "reply" &&
                        confirmDelete.id === node.id
                          ? confirmBar()
                          : null}
                      </View>
                    </View>
                    {isTarget(post.id, node.id) ? composerBar("Write a reply") : null}
                  </View>
                </View>
              ))}
            </View>
          ))}
          {posts.length === 0 ? (
            <Text style={styles.empty}>No posts yet.</Text>
          ) : null}
        </ScrollView>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  headerTitle: { flex: 1, fontSize: 14, fontWeight: "500", color: "#1A1A1A" },
  menu: {
    position: "absolute",
    top: 88,
    right: 14,
    backgroundColor: "#F5F5F5",
    borderWidth: 0.5,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 20,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItemText: { fontSize: 13, color: "#1A1A1A" },
  content: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center" },
  composerIdle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 34,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#EEEEEE",
    borderRadius: 8,
  },
  composerIdleText: { color: "#666666", fontSize: 13 },
  composerActive: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  composerInput: {
    flex: 1,
    color: "#1A1A1A",
    fontSize: 13,
    maxHeight: 120,
    padding: 0,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.4 },
  closeBtn: { padding: 2 },
  scroll: { paddingBottom: 40 },
  post: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEEEEE",
  },
  reply: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: "#EEEEEE",
  },
  row: { flexDirection: "row", gap: 8 },
  rowBody: { flex: 1, minWidth: 0 },
  metaRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  name: { fontSize: 12.5, fontWeight: "500", color: "#1A1A1A" },
  nameSm: { fontSize: 12, fontWeight: "500", color: "#1A1A1A" },
  time: { fontSize: 11, color: "#666666" },
  body: { fontSize: 12.5, lineHeight: 18, color: "#1A1A1A", marginTop: 3 },
  bodySm: { fontSize: 12, lineHeight: 17, color: "#1A1A1A", marginTop: 2 },
  replyAffordance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  replyText: { fontSize: 11, color: "#666666" },
  affordanceRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  confirmRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  confirmText: { fontSize: 12, color: "#444444" },
  confirmDelete: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteText: { fontSize: 12, fontWeight: "500", color: "#FFFFFF" },
  editOk: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  editOkText: { fontSize: 12, fontWeight: "500", color: "#FFFFFF" },
  cancelText: { fontSize: 12, color: "#666666" },
  avatar: {
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 9.5, fontWeight: "600", color: "#1A1A1A" },
  empty: { color: "#666666", textAlign: "center", marginTop: 32, fontSize: 13 },
});
