// Menu screen — opened from the Main hamburger. Branding + nav icons.

import { View, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Menu() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="arrow-back" size={26} color="#333" />
      </Pressable>

      <Image
        source={require("../../assets/logo1.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.items}>
        <Pressable onPress={() => router.push("/(app)/history")} hitSlop={8}>
          <Ionicons name="time-outline" size={30} color="#333" />
        </Pressable>
      </View>

      <View style={styles.spacer} />

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
  root: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  back: { alignSelf: "flex-start", marginBottom: 24 },
  logo: { height: 32, width: 110, marginBottom: 40 },
  items: { gap: 28 },
  spacer: { flex: 1 },
  settings: { alignSelf: "flex-start" },
});
