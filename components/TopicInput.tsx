// TopicInput (2.2) — Phase 12, Step 12.2
// Max 500 characters, unstructured free text.

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
      placeholder="What would you like to create?"
      maxLength={500}
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
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 80,
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
});
