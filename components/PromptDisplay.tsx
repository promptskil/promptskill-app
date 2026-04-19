// PromptDisplay (3.1) — Phase 12, Step 12.4 + Launchpad edit mode
// Shows generating spinner, typewriter effect at 10ms/char, or error.
// Tap prompt text → calls onEditRequest so parent can enter edit mode.
// When editing=true, renders TextInput with editedText.
// Parent owns edit state and cancel/regenerate actions.

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PromptDisplayProps {
  prompt: string;
  loading: boolean;
  error: string | null;
  editing?: boolean;
  editedText?: string;
  onEditRequest?: () => void;
  onEditChange?: (text: string) => void;
}

export default function PromptDisplay({
  prompt,
  loading,
  error,
  editing = false,
  editedText = "",
  onEditRequest,
  onEditChange,
}: PromptDisplayProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!prompt || loading || error) {
      setDisplayedText("");
      setAnimating(false);
      return;
    }

    setAnimating(true);
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < prompt.length) {
        setDisplayedText(prompt.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [prompt, loading, error]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Generating...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!prompt) return null;

  if (editing) {
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          ref={inputRef}
          style={[styles.prompt, styles.editInput]}
          value={editedText}
          onChangeText={onEditChange}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Pressable onPress={onEditRequest}>
        <Text style={styles.prompt} selectable>
          {displayedText}
          {animating ? "\u258C" : ""}
        </Text>
        {!animating && (
          <View style={styles.editHintRow}>
            <Ionicons name="create-outline" size={14} color="#bbb" />
          </View>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  prompt: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  editInput: {
    minHeight: 120,
    padding: 0,
  },
  editHintRow: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#fff0f0",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#d00",
    textAlign: "center",
  },
});
