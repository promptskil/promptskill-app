// CopyPromptButton — Claude-style copy button with icon.
// Tap → copies prompt to clipboard → icon changes to thumbs-up for 2s → reverts.
// Guarded clipboard import: graceful fallback if native module unavailable.
// Feeds from: result.tsx (promptText prop)

import { useState, useCallback } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Guarded import — prevents crash if native module missing
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
    if (Clipboard) {
      await Clipboard.setStringAsync(promptText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [promptText]);

  return (
    <Pressable
      style={[styles.button, copied && styles.buttonCopied]}
      onPress={handleCopy}
    >
      <View style={styles.inner}>
        {copied ? (
          <>
            <Ionicons name="thumbs-up" size={18} color="#34C759" />
            <Text style={styles.copiedText}>Copied!</Text>
          </>
        ) : (
          <>
            <Ionicons name="copy-outline" size={18} color="#007AFF" />
            <Text style={styles.copyText}>Copy prompt</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    marginTop: 12,
  },
  buttonCopied: {
    borderColor: "#34C759",
    backgroundColor: "#f0faf3",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  copiedText: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
  },
});
