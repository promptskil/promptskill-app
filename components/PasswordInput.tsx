// AUTH.2 — PasswordInput — Phase 11, Step 11.1
// Renders in: Screen 0 (Account Creation), Screen 0B (Login), Screen 0D (Reset Password)

import { TextInput, StyleSheet } from "react-native";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export default function PasswordInput({
  value,
  onChangeText,
  editable = true,
  placeholder = "Password",
}: PasswordInputProps) {
  return (
    <TextInput
      style={[styles.input, !editable && styles.disabled]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry
      autoCapitalize="none"
      autoCorrect={false}
      editable={editable}
      textContentType="password"
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
