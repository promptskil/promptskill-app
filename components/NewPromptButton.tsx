// NewPromptButton (3.5) — Phase 12, Step 12.4
// Clears ResultModule state, navigates to Main.

import { Pressable, Text, StyleSheet } from "react-native";

interface NewPromptButtonProps {
  onPress: () => void;
}

export default function NewPromptButton({ onPress }: NewPromptButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>New</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
});
