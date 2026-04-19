// ModelLaunchChips — Model website link chips.
// Tap a chip → opens model's web chat. No clipboard — that's CopyPromptButton's job.
// The chip matching the generating model gets primary (black) style; others are outline.
// Feeds from: constants/modelLinks.ts, constants/models.ts
// Feeds into: result.tsx

import { View, Text, Pressable, StyleSheet, Linking, Platform } from "react-native";
import { MODELS, MODEL_LABELS } from "../constants/models";
import { MODEL_LINKS } from "../constants/modelLinks";
import type { Model } from "../types";

interface ModelLaunchChipsProps {
  generatedBy: Model;
}

export default function ModelLaunchChips({
  generatedBy,
}: ModelLaunchChipsProps) {
  function handleChipPress(model: Model) {
    const url = MODEL_LINKS[model];
    // iOS: force Safari via x-safari-https:// to bypass universal link
    // interception — without this, installed apps (ChatGPT, Gemini, Grok)
    // claim the domain and open their app instead of the web chat.
    if (Platform.OS === "ios") {
      Linking.openURL(url.replace("https://", "x-safari-https://"));
    } else {
      Linking.openURL(url);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.hint}>Open in</Text>
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
    backgroundColor: "#000",
    borderColor: "#000",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  chipTextPrimary: {
    color: "#fff",
    fontWeight: "600",
  },
});
