// PromptDisplay (4.1) — Phase 12, Step 12.4 + Launchpad edit mode
// Shows generating spinner, typewriter effect at 10ms/char, or error.
// During typewriter animation: plain Text. On completion: Markdown renderer.
// Tap prompt text → calls onEditRequest so parent can enter edit mode.
// When editing=true, renders TextInput with editedText.
// Parent owns edit state and cancel/regenerate actions.
// Optional model prop → renders model chip in top-right of card.

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { MODEL_LABELS } from "../constants/models";
import type { Model } from "../types";

interface PromptDisplayProps {
  prompt: string;
  loading: boolean;
  error: string | null;
  editing?: boolean;
  editedText?: string;
  model?: Model;
  onEditRequest?: () => void;
  onEditChange?: (text: string) => void;
}

export default function PromptDisplay({
  prompt,
  loading,
  error,
  editing = false,
  editedText = "",
  model,
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
      <View style={styles.container}>
        {model && (
          <View style={styles.modelRow}>
            <View style={styles.modelChip}>
              <Text style={styles.modelChipText}>
                {MODEL_LABELS[model] ?? model}
              </Text>
            </View>
          </View>
        )}
        <TextInput
          ref={inputRef}
          style={[styles.plainText, styles.editInput]}
          value={editedText}
          onChangeText={onEditChange}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {model && (
        <View style={styles.modelRow}>
          <View style={styles.modelChip}>
            <Text style={styles.modelChipText}>
              {MODEL_LABELS[model] ?? model}
            </Text>
          </View>
        </View>
      )}
      <Pressable onPress={onEditRequest}>
        {displayedText === prompt && !animating ? (
          <Markdown style={markdownStyles}>{prompt}</Markdown>
        ) : (
          <Text style={styles.plainText} selectable>
            {displayedText}
            {animating ? "▌" : ""}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
  },
  modelRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  modelChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  modelChipText: {
    fontSize: 12,
    color: "#333",
  },
  plainText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#111",
  },
  editInput: {
    minHeight: 120,
    padding: 0,
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

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#111",
  },
  heading1: {
    fontWeight: "500" as const,
    marginBottom: 8,
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  heading2: {
    fontWeight: "500" as const,
    marginBottom: 8,
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginBottom: 16,
  },
  code_inline: {
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  bullet_list: {
    paddingLeft: 20,
    marginBottom: 16,
  },
  list_item: {
    fontSize: 16,
    lineHeight: 26,
    color: "#111",
  },
};
