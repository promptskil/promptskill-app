// AUTH.1 — EmailInput — Phase 11, Step 11.1
// Renders in: Screen 0 (Account Creation), Screen 0B (Login), Screen 0C (Forgot Password)

import { TextInput, StyleSheet } from "react-native";

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export default function EmailInput({
  value,
  onChangeText,
  editable = true,
}: EmailInputProps) {
  return (
    <TextInput
      style={[styles.input, !editable && styles.disabled]}
      value={value}
      onChangeText={onChangeText}
      placeholder="Email address"
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      editable={editable}
      textContentType="emailAddress"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
});
