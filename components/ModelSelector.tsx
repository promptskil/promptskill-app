// ModelSelector (2.1) — Phase 12, Step 12.2
// Renders chips from MODELS array. Only valid models rendered (not free text).
// Selected chip: black background.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { MODELS, MODEL_LABELS } from "../constants/models";
import type { Model } from "../types";

interface ModelSelectorProps {
  selectedModel: Model | null;
  onSelect: (model: Model) => void;
}

export default function ModelSelector({
  selectedModel,
  onSelect,
}: ModelSelectorProps) {
  return (
    <View style={styles.container}>
      {MODELS.map((model) => (
        <Pressable
          key={model}
          style={[
            styles.chip,
            selectedModel === model && styles.chipSelected,
          ]}
          onPress={() => onSelect(model)}
        >
          <Text
            style={[
              styles.chipText,
              selectedModel === model && styles.chipTextSelected,
            ]}
          >
            {MODEL_LABELS[model]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
