// Menu screen — opened from the Main hamburger.
// No freeze pane: logo, +/settings, and "History" all scroll with the list.

import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import HistoryList from "../../components/HistoryList";

export default function Menu() {
  const router = useRouter();

  const header = (
    <View style={styles.header}>
      <Image
        source={require("../../assets/logo1.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.iconRow}>
        <Pressable
          onPress={() =>
            router.navigate({
              pathname: "/(app)",
              params: { compose: "claude" },
            })
          }
          hitSlop={8}
        >
          <Ionicons name="add" size={32} color="#333" />
        </Pressable>
        <Pressable onPress={() => router.push("/(app)/settings")} hitSlop={8}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </Pressable>
      </View>
      <Text style={styles.heading}>History</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <HistoryList listHeader={header} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", paddingTop: 60 },
  header: { paddingHorizontal: 24, marginBottom: 8 },
  logo: { height: 32, width: 110, marginBottom: 16 },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
  },
  heading: { fontSize: 22, fontWeight: "700" },
});
