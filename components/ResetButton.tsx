// AUTH.4 — ResetButton — Phase 11, Step 11.1
// Renders in: Screen 0D (Reset Password)
// Disabled when password absent.

import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";

interface ResetButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}

export default function ResetButton({
  onPress,
  disabled,
  loading = false,
}: ResetButtonProps) {
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
          Reset password
        </Text>
      )}
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
