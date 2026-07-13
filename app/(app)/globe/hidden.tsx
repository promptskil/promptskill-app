// Hidden zones — left drawer (same behavior as the main-screen menu).
// Frosted panel slides in over the globe feed; the feed stays visible behind.

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

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
      <View style={styles.panel}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.warmTint} />

        <Text style={styles.heading}>Hidden</Text>
        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator color="#666666" style={{ marginTop: 32 }} />
          ) : (
            <FlatList
              data={zones}
              keyExtractor={(z) => z.id}
              showsVerticalScrollIndicator={false}
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

      <Pressable style={styles.scrim} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: "transparent" },
  panel: { width: "80%", maxWidth: 340, paddingTop: 60 },
  scrim: { flex: 1 },
  warmTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 249, 240, 0.35)",
  },
  heading: {
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: 0,
    color: "#1A1A1A",
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 12,
  },
  list: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.08)",
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
