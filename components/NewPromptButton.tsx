// NewPromptButton (3.6) — Phase 12, Step 12.4
// Clears ResultModule state, navigates to Main.
// View wraps chip styles (reliable cross-platform shrink). Pressable handles tap only.

import { View, Pressable, Text, StyleSheet } from "react-native";

interface NewPromptButtonProps {
  onPress: () => void;
}

export default function NewPromptButton({ onPress }: NewPromptButtonProps) {
  return (
    <View style={styles.chip}>
      <Pressable onPress={onPress}>
        <Text style={styles.text}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#000",
    alignSelf: "center",
  },
  text: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
});
