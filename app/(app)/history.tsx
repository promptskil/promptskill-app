// Screen 4 — History. Header scrolls with the list (no freeze pane).
// Entry from Main → back to Main. Back gesture: ENABLED

import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import HistoryList from "../../components/HistoryList";

export default function History() {
  const router = useRouter();

  const header = (
    <View style={styles.headerRow}>
      <Pressable
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/(app)")
        }
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
      <Text style={styles.header}>History</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HistoryList listHeader={header} />
      {Platform.OS !== "web" && (
        <Pressable
          onPress={() =>
            router.navigate({
              pathname: "/(app)",
              params: { compose: "claude" },
            })
          }
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
