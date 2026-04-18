// PromptList (4.1) — Phase 13, Step 13.1
// FlatList with pagination. Scroll end + more → loadMore.

import { FlatList, Text, StyleSheet, View } from "react-native";
import PromptListItem from "./PromptListItem";

interface PromptRecord {
  id: string;
  model: string;
  topic: string;
  prompt_text: string;
  feedback_vote: "up" | "down" | null;
  created_at: string;
}

interface PromptListProps {
  historyItems: PromptRecord[];
  total: number;
  onLoadMore: () => void;
  onItemSelect: (record: {
    id: string;
    model: string;
    topic: string;
    prompt_text: string;
    feedback_vote: "up" | "down" | null;
  }) => void;
  onItemDelete: (id: string) => void;
}

export default function PromptList({
  historyItems,
  total,
  onLoadMore,
  onItemSelect,
  onItemDelete,
}: PromptListProps) {
  const hasMore = total > historyItems.length;

  return (
    <FlatList
      data={historyItems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PromptListItem
          id={item.id}
          model={item.model}
          topic={item.topic}
          prompt_text={item.prompt_text}
          feedback_vote={item.feedback_vote}
          created_at={item.created_at}
          onSelect={onItemSelect}
          onDelete={onItemDelete}
        />
      )}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No prompts yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
