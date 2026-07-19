// AUTH.2 — PasswordInput — Phase 11, Step 11.1
// Renders in: Screen 0 (Account Creation), Screen 0B (Login), Screen 0D (Reset Password)

import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  placeholder?: string;
  textContentType?: "password" | "newPassword";
}

export default function PasswordInput({
  value,
  onChangeText,
  editable = true,
  placeholder = "Password",
  textContentType = "password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrap}>
      <TextInput
        style={[styles.input, !editable && styles.disabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        textContentType={textContentType}
        autoComplete={
          textContentType === "newPassword" ? "new-password" : "current-password"
        }
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        hitSlop={8}
        style={styles.eye}
        accessibilityLabel={visible ? "Hide password" : "Show password"}
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#666"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    paddingRight: 44,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  eye: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
