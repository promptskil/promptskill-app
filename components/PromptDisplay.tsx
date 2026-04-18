// PromptDisplay (3.1) — Phase 12, Step 12.4
// Shows generating spinner, typewriter effect at 10ms/char, or error.
// Text selectable.

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";

interface PromptDisplayProps {
  prompt: string;
  loading: boolean;
  error: string | null;
}

export default function PromptDisplay({
  prompt,
  loading,
  error,
}: PromptDisplayProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [animating, setAnimating] = useState(false);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.prompt} selectable>
        {displayedText}
        {animating ? "▌" : ""}
      </Text>
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
