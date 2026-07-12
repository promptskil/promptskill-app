// Screen 4 — History. Header scrolls with the list (no freeze pane).
// Entry from Main → back to Main. Back gesture: ENABLED

import { View, Text, Pressable, StyleSheet } from "react-native";
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
});
