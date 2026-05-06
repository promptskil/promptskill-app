// CopyPromptButton — Icon-only copy button, small.
// Tap → copies prompt to clipboard → icon changes to thumbs-up for 2s → reverts.
// Guarded clipboard import: graceful fallback if native module unavailable.

import { useState, useCallback } from "react";
import { Pressable, StyleSheet, Clipboard as RNClipboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";

let ExpoClipboard: { setStringAsync: (text: string) => Promise<boolean> } | null = null;
try {
  ExpoClipboard = require("expo-clipboard");
} catch {
  // Native module not available — will fall back to RN Clipboard
}

interface CopyPromptButtonProps {
  promptText: string;
}

export default function CopyPromptButton({ promptText }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (ExpoClipboard) {
        await ExpoClipboard.setStringAsync(promptText);
      } else {
        RNClipboard.setString(promptText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed — don't show success
    }
  }, [promptText]);

  return (
    <Pressable style={styles.button} onPress={handleCopy}>
      {copied ? (
        <Ionicons name="copy" size={16} color="#000" />
      ) : (
        <Ionicons name="copy-outline" size={16} color="#999" />
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
