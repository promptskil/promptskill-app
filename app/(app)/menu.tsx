// Menu screen — left drawer. Glass footer (settings only); history scrolls
// the full height underneath, visible through the frosted panel.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import HistoryList from "../../components/HistoryList";

export default function Menu() {
  const router = useRouter();

  const header = <Text style={styles.heading}>History</Text>;

  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.warmTint} />

        <View style={styles.list}>
          <HistoryList
            listHeader={header}
            contentPaddingTop={110}
            contentPaddingBottom={100}
          />
        </View>

        <View style={styles.topLogoWrap} pointerEvents="box-none">
          <Text style={styles.brandText}>Vaine</Text>
        </View>

        <View style={styles.footer} pointerEvents="box-none">
          <Pressable onPress={() => router.back()} style={styles.editBubble}>
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(app)/settings")}
            style={[styles.fab, styles.fabSettings]}
          >
            <Ionicons name="settings-outline" size={26} color="#333" />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.scrim} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: "transparent" },
  panel: { width: "80%", maxWidth: 340 },
  scrim: { flex: 1 },
  warmTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 249, 240, 0.35)",
  },
  list: { flex: 1 },
  topLogoWrap: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  topLogo: { height: 22, width: 78 },
  heading: {
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: 0,
    color: "#1A1A1A",
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fabSettings: { backgroundColor: "#fff" },
  brandText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#1A1A1A",
  },
  editBubble: {
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
});
