// CopyPromptButton — Icon-only copy button, small.
// Tap → copies prompt to clipboard → icon changes to thumbs-up for 2s → reverts.
// Guarded clipboard import: graceful fallback if native module unavailable.

import { useState, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

let Clipboard: { setStringAsync: (text: string) => Promise<boolean> } | null = null;
try {
  Clipboard = require("expo-clipboard");
} catch {
  // Native module not available
}

interface CopyPromptButtonProps {
  promptText: string;
}

export default function CopyPromptButton({ promptText }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!Clipboard) return;
    try {
      await Clipboard.setStringAsync(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Native module failed — don't show success
    }
  }, [promptText]);

  return (
    <Pressable style={styles.button} onPress={handleCopy}>
      {copied ? (
        <Ionicons name="thumbs-up" size={16} color="#34C759" />
      ) : (
        <Ionicons name="copy-outline" size={16} color="#333" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    borderRadius: 6,
  },
});
