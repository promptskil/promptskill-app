// ModelLaunchChips — Result screen launchpad chips.
// Tap a chip → copies prompt to clipboard → brief toast → opens model's web chat.
// The chip matching the generating model gets primary style; others are outline.
// Feeds from: constants/modelLinks.ts, constants/models.ts
// Feeds into: result.tsx

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { MODELS, MODEL_LABELS } from "../constants/models";
import { MODEL_LINKS } from "../constants/modelLinks";
import type { Model } from "../types";

interface ModelLaunchChipsProps {
  generatedBy: Model;
  promptText: string;
}

export default function ModelLaunchChips({
  generatedBy,
  promptText,
}: ModelLaunchChipsProps) {
  const [toast, setToast] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }
  }, [toast, fadeAnim]);

  async function handleChipPress(model: Model) {
    await Clipboard.setStringAsync(promptText);
    setToast(`Copied \u2014 opening ${MODEL_LABELS[model]}...`);

    // Slight delay so user sees the toast before context-switching
    setTimeout(() => {
      Linking.openURL(MODEL_LINKS[model]);
    }, 800);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.hint}>Tap to copy & open</Text>
      <View style={styles.chipRow}>
        {MODELS.map((model) => {
          const isPrimary = model === generatedBy;
          return (
            <Pressable
              key={model}
              style={[styles.chip, isPrimary && styles.chipPrimary]}
              onPress={() => handleChipPress(model)}
            >
              <Text
                style={[styles.chipText, isPrimary && styles.chipTextPrimary]}
              >
                {MODEL_LABELS[model]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {toast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    alignItems: "center",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  chipPrimary: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  chipTextPrimary: {
    color: "#fff",
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    bottom: -36,
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  toastText: {
    color: "#fff",
    fontSize: 13,
  },
});
