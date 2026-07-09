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
        placeholderTextColor="#8A8A8A"
        autoFocus
        multiline
      />
      <Pressable
        onPress={submit}
        disabled={!text.trim() || submitting}
        style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendDisabled]}
      >
        <Ionicons name="arrow-up" size={15} color="#0A0A0A" />
      </Pressable>
      <Pressable
        onPress={() => {
          setComposer(null);
          setText("");
        }}
        hitSlop={8}
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={16} color="#8A8A8A" />
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

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#B5B5B5" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {zoneTitle}
        </Text>
      </View>

      {composer?.kind === "post" ? (
        composerBar("Write a post")
      ) : (
        <Pressable style={styles.composerIdle} onPress={startPost}>
          <Ionicons name="pencil" size={15} color="#8A8A8A" />
          <Text style={styles.composerIdleText}>Write a post</Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator color="#8A8A8A" style={{ marginTop: 32 }} />
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
                  <Pressable
                    style={styles.replyAffordance}
                    onPress={() => startReply(post.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={13} color="#8A8A8A" />
                    <Text style={styles.replyText}>Reply</Text>
                  </Pressable>
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
                        <Pressable
                          style={styles.replyAffordance}
                          onPress={() => startReply(post.id, node.id)}
                        >
                          <Ionicons
                            name="chatbubble-outline"
                            size={12}
                            color="#8A8A8A"
                          />
                          <Text style={styles.replyText}>Reply</Text>
                        </Pressable>
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A0A", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  headerTitle: { flex: 1, fontSize: 14, fontWeight: "500", color: "#EDEDED" },
  composerIdle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 34,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#242424",
    borderRadius: 8,
  },
  composerIdleText: { color: "#8A8A8A", fontSize: 13 },
  composerActive: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: "#3A3A3A",
    borderRadius: 8,
    backgroundColor: "#161616",
  },
  composerInput: {
    flex: 1,
    color: "#EDEDED",
    fontSize: 13,
    maxHeight: 120,
    padding: 0,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
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
    borderBottomColor: "#242424",
  },
  reply: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: "#242424",
  },
  row: { flexDirection: "row", gap: 8 },
  rowBody: { flex: 1, minWidth: 0 },
  metaRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  name: { fontSize: 12.5, fontWeight: "500", color: "#EDEDED" },
  nameSm: { fontSize: 12, fontWeight: "500", color: "#EDEDED" },
  time: { fontSize: 11, color: "#8A8A8A" },
  body: { fontSize: 12.5, lineHeight: 18, color: "#EDEDED", marginTop: 3 },
  bodySm: { fontSize: 12, lineHeight: 17, color: "#EDEDED", marginTop: 2 },
  replyAffordance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  replyText: { fontSize: 11, color: "#8A8A8A" },
  avatar: {
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 9.5, fontWeight: "600", color: "#EDEDED" },
  empty: { color: "#8A8A8A", textAlign: "center", marginTop: 32, fontSize: 13 },
});
