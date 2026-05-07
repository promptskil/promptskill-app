// NewPromptButton (3.5) — Phase 12, Step 12.4
<<<<<<< HEAD
// Clears ResultModule state, navigates to Main.
=======
// Clears ResultModule state, calls NavigationStateModule.clear(), navigates to Main.
>>>>>>> main

import { Pressable, Text, StyleSheet } from "react-native";

interface NewPromptButtonProps {
  onPress: () => void;
}

export default function NewPromptButton({ onPress }: NewPromptButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
<<<<<<< HEAD
      <Text style={styles.text}>New</Text>
=======
      <Text style={styles.text}>New Prompt</Text>
>>>>>>> main
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
