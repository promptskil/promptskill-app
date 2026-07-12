// Menu screen — opened from the Main hamburger.
// Pinned: vaine logo (top) + settings gear (bottom). History scrolls between.

import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import HistoryList from "../../components/HistoryList";

export default function Menu() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </Pressable>
        <Image
          source={require("../../assets/logo1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heading}>History</Text>
      </View>

      <View style={styles.middle}>
        <HistoryList />
      </View>

      <Pressable
        onPress={() => router.push("/(app)/settings")}
        style={styles.settings}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={28} color="#333" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingBottom: 40 },
  top: { paddingHorizontal: 24 },
  back: { alignSelf: "flex-start", marginBottom: 16 },
  logo: { height: 32, width: 110, marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  middle: { flex: 1 },
  settings: { alignSelf: "flex-start", marginLeft: 24, marginTop: 16 },
});
