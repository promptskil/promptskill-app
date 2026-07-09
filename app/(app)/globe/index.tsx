import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import type { GlobeZone } from "../../../types";

export default function GlobeFeed() {
  const router = useRouter();
  const [zones, setZones] = useState<GlobeZone[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchZones = useCallback(
    async (q: string) => {
      try {
        const qs = q.trim() ? `&q=${encodeURIComponent(q.trim())}` : "";
        const data = await apiCall<{ zones: GlobeZone[] }>(
          "GET",
          `/globe/zones?limit=20&offset=0${qs}`,
        );
        setZones(data.zones);
      } catch (err) {
        if (err instanceof SessionExpiredError) router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  // Cache "me" once on entry — drives the tap-to-type gate downstream.
  useEffect(() => {
    apiCall<{ username: string | null }>("GET", "/globe/me")
      .then((r) => setGlobeUsername(r.username))
      .catch(() => {});
  }, []);

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => fetchZones(query), 250);
    return () => clearTimeout(t);
  }, [query, fetchZones]);

  // Refresh when the feed regains focus (reflects hides/unhides immediately).
  useFocusEffect(
    useCallback(() => {
      fetchZones(query);
    }, [fetchZones, query]),
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.brandPill}>
            <Image
              source={require("../../../assets/logo1.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>ZONE</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push("/(app)/globe/hidden")}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#B5B5B5" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(app)/globe/new")}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color="#B5B5B5" />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={15} color="#8A8A8A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search information"
            placeholderTextColor="#8A8A8A"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#8A8A8A" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={zones}
            keyExtractor={(z) => z.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/globe/[zoneId]",
                    params: { zoneId: item.id },
                  })
                }
              >
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowTime}>
                  {relativeTime(item.created_at)}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No problems yet.</Text>
            }
          />
        )}
      </View>
      <Pressable
        style={styles.homeBar}
        onPress={() => router.replace("/(app)")}
        hitSlop={8}
      >
        <Ionicons name="home-outline" size={22} color="#EDEDED" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A0A", paddingTop: 60 },
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
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerLogo: { width: 54, height: 16 },
  title: { fontSize: 15, fontWeight: "500", letterSpacing: 0.5, color: "#EDEDED" },
  content: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center" },
  homeBar: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#242424",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 34,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#242424",
    borderRadius: 8,
  },
  searchInput: { flex: 1, color: "#EDEDED", fontSize: 13, padding: 0 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#242424",
  },
  rowTitle: { flex: 1, fontSize: 13.5, color: "#EDEDED", marginRight: 8 },
  rowTime: { fontSize: 11, color: "#8A8A8A" },
  empty: { color: "#8A8A8A", textAlign: "center", marginTop: 32, fontSize: 13 },
});
