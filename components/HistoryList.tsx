// HistoryList — fetches and renders the user's prompt history (scrollable list
// + in-place detail). Shared by the standalone History screen and the menu.

import { useState, useEffect, useCallback, ReactElement } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PromptList from "./PromptList";
import InlineResultItem from "./InlineResultItem";
import NewPromptButton from "./NewPromptButton";
import { apiCall, SessionExpiredError } from "../services/api";
import type { Model } from "../types";

interface PromptRecord {
  prompt_id: string;
  model: string;
  topic: string;
  prompt_text: string;
  feedback_vote: "up" | "down" | null;
  created_at: string;
}

interface HistoryResponse {
  items: PromptRecord[];
  total: number;
  offset: number;
}

interface HistoryListProps {
  listHeader?: ReactElement;
}

export default function HistoryList({ listHeader }: HistoryListProps) {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<PromptRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{
    id: string;
    model: string;
    topic: string;
    prompt_text: string;
    feedback_vote: "up" | "down" | null;
  } | null>(null);

  const fetchHistory = useCallback(
    async (pageNum: number) => {
      try {
        const data = await apiCall<HistoryResponse>(
          "GET",
          `/history?limit=20&offset=${pageNum * 20}`
        );
        if (pageNum === 0) {
          setHistoryItems(data.items);
        } else {
          setHistoryItems((prev) => [...prev, ...data.items]);
        }
        setTotal(data.total);
        setPage(pageNum);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          router.replace("/(auth)/login");
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  function handleLoadMore() {
    if (total > historyItems.length) {
      fetchHistory(page + 1);
    }
  }

  function handleItemSelect(record: {
    id: string;
    model: string;
    topic: string;
    prompt_text: string;
    feedback_vote: "up" | "down" | null;
  }) {
    setSelected(record);
  }

  async function handleItemDelete(id: string) {
    try {
      await apiCall("PATCH", `/prompts/${id}/delete`);
      setHistoryItems((prev) => prev.filter((item) => item.prompt_id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
      }
    }
  }

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  if (selected) {
    return (
      <ScrollView contentContainerStyle={styles.detailContent}>
        <Pressable
          onPress={() => setSelected(null)}
          style={styles.detailBack}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        {selected.topic.length > 0 && (
          <View style={styles.topicBubble}>
            <Text style={styles.topicBubbleText} selectable>
              {selected.topic}
            </Text>
          </View>
        )}
        <InlineResultItem
          topic={selected.topic}
          model={selected.model as Model}
          promptId={selected.id}
          initialPrompt={selected.prompt_text}
          animate={false}
          editable={false}
        />
        <View style={styles.detailActions}>
          <NewPromptButton onPress={() => router.replace("/(app)")} />
        </View>
      </ScrollView>
    );
  }

  return (
    <PromptList
      historyItems={historyItems}
      total={total}
      onLoadMore={handleLoadMore}
      onItemSelect={handleItemSelect}
      onItemDelete={handleItemDelete}
      listHeader={listHeader}
    />
  );
}

const styles = StyleSheet.create({
  loading: { fontSize: 16, color: "#999", textAlign: "center", marginTop: 32 },
  detailContent: { padding: 24 },
  detailBack: { alignSelf: "flex-start", marginBottom: 12 },
  topicBubble: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  topicBubbleText: { fontSize: 16, color: "#111", lineHeight: 26 },
  detailActions: { alignItems: "center", marginTop: 24 },
});
