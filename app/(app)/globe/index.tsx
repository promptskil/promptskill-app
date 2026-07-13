import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { apiCall, SessionExpiredError } from "../../../services/api";
import { setGlobeUsername } from "../../../services/globeDraft";
import { relativeTime } from "../../../utils/globe";

interface FeedItem {
  post_id: string;
  zone_id: string;
  zone_title: string;
  author_username: string;
  body: string;
  created_at: string;
}

export default function GlobeFeed() {
  const router = useRouter();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const data = await apiCall<{ items: FeedItem[] }>(
        "GET",
        "/globe/feed?limit=20&offset=0",
      );
      setFeed(data.items);
    } catch (err) {
      if (err instanceof SessionExpiredError) router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Cache "me" once on entry — drives the tap-to-type gate downstream.
  useEffect(() => {
    apiCall<{ username: string | null }>("GET", "/globe/me")
      .then((r) => setGlobeUsername(r.username))
      .catch(() => {});
  }, []);

  // Refresh when the feed regains focus.
  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [fetchFeed]),
  );

  const shown = query.trim()
    ? feed.filter((p) =>
        `${p.zone_title} ${p.body} ${p.author_username}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : feed;

  return (
    <View style={styles.root}>
      <Image
        source={require("../../../assets/zone.png")}
        style={styles.zoneLogo}
        resizeMode="contain"
      />
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push("/(app)/globe/hidden")}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#444444" />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
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

        {loading ? (
          <ActivityIndicator color="#666666" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={shown}
            keyExtractor={(p) => p.post_id}
            showsVerticalScrollIndicator={false}
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
                  <Text style={styles.postZone} numberOfLines={1}>
                    {item.zone_title}
                  </Text>
                  <Text style={styles.postUser}>@{item.author_username}</Text>
                  <Text style={styles.postTime}>
                    {relativeTime(item.created_at)}
                  </Text>
                </View>
                <Text style={styles.postBody} numberOfLines={4}>
                  {item.body}
                </Text>
                <View style={styles.postActions}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#666666"
                  />
                  <Ionicons name="create-outline" size={16} color="#666666" />
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No posts yet.</Text>
            }
          />
        )}
      </View>
      <Pressable
        style={styles.homeBar}
        onPress={() => router.replace("/(app)")}
        hitSlop={8}
      >
        <Ionicons name="home-outline" size={22} color="#1A1A1A" />
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
  root: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerLogo: { width: 54, height: 16 },
  zoneLogo: { width: 86, height: 40, marginLeft: 16, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: "700", letterSpacing: 0.5, color: "#1A1A1A" },
  content: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center" },
  homeBar: {
    position: "absolute",
    left: 24,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 34,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchInput: { flex: 1, color: "#1A1A1A", fontSize: 13, padding: 0 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowTitle: { flex: 1, fontSize: 13.5, color: "#1A1A1A", marginRight: 8 },
  rowTime: { fontSize: 11, color: "#666666" },
  post: { paddingHorizontal: 14, paddingVertical: 12 },
  postTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  postZone: { flex: 1, fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  postUser: { fontSize: 11, color: "#666666" },
  postTime: { fontSize: 11, color: "#666666" },
  postBody: { fontSize: 14, lineHeight: 20, color: "#1A1A1A", marginTop: 4 },
  postActions: { flexDirection: "row", gap: 20, marginTop: 8 },
  empty: { color: "#666666", textAlign: "center", marginTop: 32, fontSize: 13 },
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
