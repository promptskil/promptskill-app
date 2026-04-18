// ThumbsFeedback (3.4) — Phase 12, Step 12.4
// Thumbs up/down toggle. Deselect (same tap) = client-only, no API call.
// DB retains prior vote on deselect.

import { View, Pressable, Text, StyleSheet } from "react-native";

interface ThumbsFeedbackProps {
  vote: "up" | "down" | null;
  onVote: (vote: "up" | "down") => void;
  onDeselect: () => void;
}

export default function ThumbsFeedback({
  vote,
  onVote,
  onDeselect,
}: ThumbsFeedbackProps) {
  function handlePress(direction: "up" | "down") {
    if (vote === direction) {
      onDeselect();
    } else {
      onVote(direction);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.thumb, vote === "up" && styles.thumbActive]}
        onPress={() => handlePress("up")}
      >
        <Text style={styles.thumbText}>👍</Text>
      </Pressable>
      <Pressable
        style={[styles.thumb, vote === "down" && styles.thumbActive]}
        onPress={() => handlePress("down")}
      >
        <Text style={styles.thumbText}>👎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  thumb: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  thumbActive: {
    backgroundColor: "#e8f0fe",
    borderColor: "#007AFF",
  },
  thumbText: {
    fontSize: 24,
  },
});
