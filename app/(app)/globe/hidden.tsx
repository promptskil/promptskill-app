import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { apiCall, SessionExpiredError } from "../../../services/api";
import type { GlobeZone } from "../../../types";

export default function GlobeHidden() {
  const router = useRouter();
  const [zones, setZones] = useState<GlobeZone[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiCall<{ zones: GlobeZone[] }>(
        "GET",
        "/globe/zones/hidden",
      );
      setZones(data.zones);
    } catch (err) {
      if (err instanceof SessionExpiredError) router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function unhide(id: string) {
    try {
      await apiCall("DELETE", `/globe/zones/${id}/hide`);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (err) {
      if (err instanceof SessionExpiredError) router.replace("/(auth)/login");
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#444444" />
        </Pressable>
        <Text style={styles.headerTitle}>Hidden</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color="#666666" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={zones}
            keyExtractor={(z) => z.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Pressable
                  style={styles.unhideBtn}
                  onPress={() => unhide(item.id)}
                >
                  <Text style={styles.unhideText}>Unhide</Text>
                </Pressable>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>Nothing hidden.</Text>
            }
          />
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
  headerTitle: { fontSize: 14, fontWeight: "400", color: "#1A1A1A" },
  content: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEEEEE",
  },
  rowTitle: { flex: 1, fontSize: 13.5, color: "#1A1A1A", marginRight: 12 },
  unhideBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#DDDDDD",
  },
  unhideText: { fontSize: 12, color: "#1A1A1A" },
  empty: { color: "#666666", textAlign: "center", marginTop: 32, fontSize: 13 },
});
