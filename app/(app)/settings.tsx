// Settings screen — opened from the menu's gear. Holds Profile.

import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="arrow-back" size={26} color="#333" />
      </Pressable>
      <View style={styles.items}>
        <Pressable onPress={() => router.push("/(app)/profile")} hitSlop={8}>
          <Ionicons name="person-circle-outline" size={32} color="#333" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 24 },
  back: { alignSelf: "flex-start", marginBottom: 24 },
  items: { gap: 28 },
});
