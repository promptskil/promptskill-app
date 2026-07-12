// TopicInput (2.2) — Phase 12, Step 12.2
// Unstructured free text. No character limit.

import { useState } from "react";
import { TextInput, StyleSheet, Platform } from "react-native";

const MIN_HEIGHT = 48; // single-line start (tight, ChatGPT-style)

interface TopicInputProps {
  topic: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
}

export default function TopicInput({
  topic,
  onChangeText,
  editable = true,
  onFocus,
  onBlur,
  onSubmit,
}: TopicInputProps) {
  const [height, setHeight] = useState(MIN_HEIGHT);
  return (
    <TextInput
      style={[
        styles.input,
        { height: Math.max(MIN_HEIGHT, height) },
        Platform.OS === "web" && styles.webNoScroll,
        Platform.OS === "web" && ({ outlineStyle: "none" } as any),
        !editable && styles.disabled,
      ]}
      value={topic}
      onChangeText={onChangeText}
      onChange={
        Platform.OS === "web"
          ? (e: any) => {
              const el = e.target;
              el.style.height = "auto"; // reset so it can shrink too
              setHeight(Math.max(MIN_HEIGHT, el.scrollHeight));
            }
          : undefined
      }
      placeholder="Express your thoughts with Vaine"
      placeholderTextColor="#999"
      multiline
      scrollEnabled={false}
      editable={editable}
      textAlignVertical="top"
      onContentSizeChange={(e) => setHeight(e.nativeEvent.contentSize.height)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyPress={(e: any) => {
        // Web only: Enter submits, Shift+Enter inserts a newline.
        if (
          Platform.OS === "web" &&
          e?.nativeEvent?.key === "Enter" &&
          !e?.nativeEvent?.shiftKey
        ) {
          e.preventDefault?.();
          onSubmit?.();
        }
      }}
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  webNoScroll: {
    overflow: "hidden",
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
});
