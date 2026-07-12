// PromptListItem (4.2) — history row. Shows only the topic; tap → load record.
// Date, model, feedback, and delete are intentionally hidden.

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
  onSelect,
}: PromptListItemProps) {
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
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 72,
  },
  topic: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
