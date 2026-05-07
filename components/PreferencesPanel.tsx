// PreferencesPanel (5.2) — Phase 13, Step 13.3
// Model preference: AsyncStorage ONLY, no API call.
// Renders model selector chips from MODELS array.

import { View, Text, StyleSheet } from "react-native";
import ModelSelector from "./ModelSelector";
import type { Model } from "../types";

interface PreferencesPanelProps {
  defaultModel: Model;
  onModelChange: (model: Model) => void;
}

export default function PreferencesPanel({
  defaultModel,
  onModelChange,
}: PreferencesPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Default model</Text>
      <ModelSelector selectedModel={defaultModel} onSelect={onModelChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
