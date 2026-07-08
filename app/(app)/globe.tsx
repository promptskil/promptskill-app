// Globe — blank placeholder screen, opened from the Main header globe icon.
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Globe() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <Pressable
        style={styles.back}
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/(app)")
        }
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  back: { position: "absolute", top: 60, left: 24, padding: 4 },
});
