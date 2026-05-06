// NewPromptButton (3.5) — Phase 12, Step 12.4
// Clears ResultModule state, navigates to Main.

import { Pressable, Text, StyleSheet } from "react-native";

interface NewPromptButtonProps {
  onPress: () => void;
}

export default function NewPromptButton({ onPress }: NewPromptButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>New Prompt</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
});
