// Globe feed as an in-place panel (not a route). Rendered as an overlay inside
// the Vaine main screen so main's header + input stay interactive behind it.
// onClose is called by the edit bubble (returns to main).

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { apiCall, SessionExpiredError } from "../services/api";
import { setGlobeUsername } from "../services/globeDraft";
import {
  appendCachedFeed,
  getCachedFeed,
  removeCachedZone,
  setCachedFeed,
  type FeedItem,
} from "../services/globeFeedStore";
import { relativeTime } from "../utils/globe";

interface FeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
}

const FEED_TIMEOUT_MS = 8000;

export default function GlobeFeedPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const cached = getCachedFeed();
  const [feed, setFeed] = useState<FeedItem[]>(cached.items);
  const [cursor, setCursor] = useState<string | null>(cached.cursor);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(cached.items.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = useCallback(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
    try {
      const data = await apiCall<FeedResponse>(
        "GET",
        "/globe/feed?limit=20",
        undefined,
        controller.signal,
      );
      setFeed(data.items);
      setCursor(data.next_cursor);
      setCachedFeed(data.items, data.next_cursor);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      // Timeout or network error — keep whatever is cached on screen.
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [router]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await apiCall<FeedResponse>(
        "GET",
        `/globe/feed?limit=20&cursor=${encodeURIComponent(cursor)}`,
      );
      setFeed((prev) => [...prev, ...data.items]);
      setCursor(data.next_cursor);
      appendCachedFeed(data.items, data.next_cursor);
    } catch (err) {
      if (err instanceof SessionExpiredError) router.replace("/(auth)/login");
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, router]);

  async function hideZone(zoneId: string) {
    try {
      await apiCall("POST", `/globe/zones/${zoneId}/hide`);
      setFeed((prev) => prev.filter((p) => p.zone_id !== zoneId));
      removeCachedZone(zoneId);
    } catch (err) {
      if (err instanceof SessionExpiredError) router.replace("/(auth)/login");
    }
  }

  useEffect(() => {
    apiCall<{ username: string | null }>("GET", "/globe/me")
      .then((r) => setGlobeUsername(r.username))
      .catch(() => {});
  }, []);

  // Fires on main's focus — refetches when returning from a sub-route (post).
  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [fetchFeed]),
  );

  const shown = query.trim()
    ? feed.filter((p) =>
        `${p.zone_title} ${p.zone_domain} ${p.body} ${p.author_username}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : feed;

  return (
    <View style={styles.panel}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.warmTint} />

      <Text style={styles.heading}>Share with others</Text>
      <Text style={styles.subheading}>Find solutions together</Text>

      <View style={styles.toolRow}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={15} color="#666666" />
          <TextInput
            style={[
              styles.searchInput,
              Platform.OS === "web" && ({ outlineStyle: "none" } as any),
            ]}
            placeholder="Search"
            placeholderTextColor="#666666"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
        <Pressable onPress={() => router.push("/(app)/globe/hidden")} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#444444" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#666666" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(p) => p.post_id}
          showsVerticalScrollIndicator={false}
          style={styles.feed}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color="#666666" style={{ marginVertical: 16 }} />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.post}
              onPress={() =>
                router.push({
                  pathname: "/(app)/globe/[zoneId]",
                  params: { zoneId: item.zone_id },
                })
              }
            >
              <View style={styles.postTop}>
                <Text style={styles.postTitle} numberOfLines={1}>
                  {item.zone_title}
                </Text>
                <Text style={styles.postUser}>@{item.author_username}</Text>
                <Text style={styles.postTime}>
                  · {relativeTime(item.created_at)}
                </Text>
              </View>
              <View style={styles.zoneBubble}>
                <Text style={styles.zoneBubbleText}>Zone: {item.zone_domain}</Text>
              </View>
              <Text style={styles.postBody} numberOfLines={4}>
                {item.body}
              </Text>
              <View style={styles.postActions}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/globe/[zoneId]",
                      params: { zoneId: item.zone_id },
                    })
                  }
                  hitSlop={8}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#666666" />
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/globe/[zoneId]",
                      params: { zoneId: item.zone_id },
                    })
                  }
                  hitSlop={8}
                >
                  <Ionicons name="create-outline" size={16} color="#666666" />
                </Pressable>
                <Pressable onPress={() => hideZone(item.zone_id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color="#666666" />
                </Pressable>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No posts yet.</Text>}
        />
      )}

      <Pressable style={styles.editBubble} onPress={onClose} hitSlop={8}>
        <Ionicons name="create-outline" size={18} color="#FFFFFF" />
      </Pressable>
      <Pressable
        style={styles.newFab}
        onPress={() => router.push("/(app)/globe/compose")}
      >
        <Ionicons name="add" size={28} color="#1A1A1A" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, paddingTop: 16, overflow: "hidden" },
  feed: { flex: 1 },
  warmTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 249, 240, 0.35)",
  },
  heading: {
    fontSize: 22,
    fontWeight: "400",
    color: "#1A1A1A",
    paddingHorizontal: 24,
    marginTop: 8,
  },
  subheading: {
    fontSize: 13,
    color: "#666666",
    paddingHorizontal: 24,
    marginTop: 2,
    marginBottom: 14,
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "50%",
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#ECECEC",
  },
  searchInput: { flex: 1, color: "#1A1A1A", fontSize: 13, padding: 0 },
  post: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  postTop: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  postTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  postUser: { fontSize: 11, color: "#666666" },
  postTime: { fontSize: 11, color: "#666666" },
  zoneBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F0FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  zoneBubbleText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
  postBody: { fontSize: 14, lineHeight: 20, color: "#1A1A1A", marginTop: 8 },
  postActions: { flexDirection: "row", gap: 20, marginTop: 10 },
  empty: { color: "#666666", textAlign: "center", marginTop: 32, fontSize: 13 },
  editBubble: {
    position: "absolute",
    left: 24,
    bottom: 32,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  newFab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
