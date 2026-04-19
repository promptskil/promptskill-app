// SendButton (3.2) — Phase 12, Step 12.4
// ATOMICITY: NOT RENDERED until promptId exists.
// Component absence is the gate — not a disabled state.
// Caller must conditionally render: {promptId && <SendButton />}

import { Pressable, Text, StyleSheet, Share } from "react-native";

interface SendButtonProps {
  generatedPrompt: string;
}

export default function SendButton({ generatedPrompt }: SendButtonProps) {
  async function handleSend() {
    await Share.share({ message: generatedPrompt });
  }

  return (
    <Pressable style={styles.button} onPress={handleSend}>
      <Text style={styles.text}>Send to AI</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
