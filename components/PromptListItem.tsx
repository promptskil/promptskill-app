// PromptListItem (4.2) — Phase 13, Step 13.1
// Dual interaction: body tap → load to Result, ✕ tap → soft delete.
// No regeneration on tap — loads existing record.

import { View, Text, Pressable, StyleSheet } from "react-native";

interface PromptListItemProps {
  id: string;
  model: string;
  topic: string;
  prompt_text: string;
  feedback_vote: "up" | "down" | null;
  created_at: string;
  onSelect: (record: {
    id: string;
    model: string;
    topic: string;
    prompt_text: string;
    feedback_vote: "up" | "down" | null;
  }) => void;
  onDelete: (id: string) => void;
}

export default function PromptListItem({
  id,
  model,
  topic,
  prompt_text,
  feedback_vote,
  created_at,
  onSelect,
  onDelete,
}: PromptListItemProps) {
  const date = new Date(created_at);
  const dateStr = date.toLocaleDateString();

  const feedbackIcon =
    feedback_vote === "up" ? "👍" : feedback_vote === "down" ? "👎" : "";

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.body}
        onPress={() =>
          onSelect({ id, model, topic, prompt_text, feedback_vote })
        }
      >
        <Text style={styles.topic} numberOfLines={1}>
          {topic}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.model}>{model}</Text>
          <Text style={styles.date}>{dateStr}</Text>
          {feedbackIcon ? (
            <Text style={styles.feedback}>{feedbackIcon}</Text>
          ) : null}
        </View>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={() => onDelete(id)}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    flex: 1,
    padding: 14,
  },
  topic: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  model: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  feedback: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 14,
  },
  deleteText: {
    fontSize: 18,
    color: "#999",
  },
});
