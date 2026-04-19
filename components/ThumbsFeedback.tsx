// ThumbsFeedback (3.4) — Phase 12, Step 12.4
// Thumbs up/down toggle, small inline style.
// Deselect (same tap) = client-only, no API call.
// DB retains prior vote on deselect.

import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        testID="thumb-up"
        style={[styles.thumb, vote === "up" && styles.thumbActive]}
        onPress={() => handlePress("up")}
      >
        <Ionicons
          name={vote === "up" ? "thumbs-up" : "thumbs-up-outline"}
          size={16}
          color={vote === "up" ? "#4F46E5" : "#999"}
        />
      </Pressable>
      <Pressable
        testID="thumb-down"
        style={[styles.thumb, vote === "down" && styles.thumbActive]}
        onPress={() => handlePress("down")}
      >
        <Ionicons
          name={vote === "down" ? "thumbs-down" : "thumbs-down-outline"}
          size={16}
          color={vote === "down" ? "#4F46E5" : "#999"}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  thumb: {
    padding: 6,
    borderRadius: 6,
  },
  thumbActive: {
    backgroundColor: "#EEF2FF",
  },
});
