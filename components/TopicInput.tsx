// TopicInput (2.2) — Phase 12, Step 12.2
// Unstructured free text. No character limit.

import { TextInput, StyleSheet } from "react-native";

interface TopicInputProps {
  topic: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function TopicInput({
  topic,
  onChangeText,
  editable = true,
  onFocus,
  onBlur,
}: TopicInputProps) {
  return (
    <TextInput
      style={[styles.input, !editable && styles.disabled]}
      value={topic}
      onChangeText={onChangeText}
      placeholder="If you define the problem correctly, you have the solution."
      multiline
      editable={editable}
      textAlignVertical="top"
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 80,
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
});
