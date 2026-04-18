// GenerateButton (2.3) — Phase 12, Step 12.2
// Three disabled states: no model, no topic, loading/retry.

import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";

interface GenerateButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}

export default function GenerateButton({
  onPress,
  disabled,
  loading = false,
}: GenerateButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, disabled && styles.disabledText]}>
          Generate
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  disabled: {
    backgroundColor: "#ccc",
  },
  text: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  disabledText: {
    color: "#eee",
  },
});
