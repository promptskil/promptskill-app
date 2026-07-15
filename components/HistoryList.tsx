// HistoryList — fetches and renders the user's prompt history (scrollable list
// + in-place detail). Shared by the standalone History screen and the menu.

import { useState, useEffect, useCallback, useRef, ReactElement } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PromptList from "./PromptList";
import InlineResultItem from "./InlineResultItem";
import { apiCall, SessionExpiredError } from "../services/api";
import {
  appendCachedHistory,
  getCachedHistory,
  isHistoryCacheStale,
  removeCachedPrompt,
  setCachedHistory,
} from "../services/historyCache";
import type { PromptRecord } from "../services/historyCache";
import type { Model } from "../types";

const PAGE_SIZE = 20;

interface HistoryResponse {
  items: PromptRecord[];
  total: number;
  offset: number;
}

interface HistoryListProps {
  listHeader?: ReactElement;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

export default function HistoryList({
  listHeader,
  contentPaddingTop,
  contentPaddingBottom,
}: HistoryListProps) {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<PromptRecord[]>(
    () => getCachedHistory().items
  );
  const [total, setTotal] = useState(() => getCachedHistory().total);
  const [loading, setLoading] = useState(
    () => getCachedHistory().items.length === 0
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const inFlight = useRef(false);
  const [selected, setSelected] = useState<{
    id: string;
    model: string;
    topic: string;
    prompt_text: string;
    feedback_vote: "up" | "down" | null;
  } | null>(null);

  const fetchHistory = useCallback(
    async (offset: number) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (offset > 0) setLoadingMore(true);
      try {
        const data = await apiCall<HistoryResponse>(
          "GET",
          `/history?limit=${PAGE_SIZE}&offset=${offset}`
        );
        if (offset === 0) {
          setHistoryItems(data.items);
          setCachedHistory(data.items, data.total);
        } else {
          setHistoryItems((prev) => [...prev, ...data.items]);
          appendCachedHistory(data.items, data.total);
        }
        setTotal(data.total);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          router.replace("/(auth)/login");
        }
      } finally {
        inFlight.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [router]
  );

  useEffect(() => {
    // Cache-first: render what we have; only hit the DB if empty or aged out.
    if (getCachedHistory().items.length === 0 || isHistoryCacheStale()) {
      fetchHistory(0);
    } else {
      setLoading(false);
    }
  }, [fetchHistory]);

  function handleLoadMore() {
    if (loadingMore || inFlight.current) return;
    if (total > historyItems.length) {
      fetchHistory(historyItems.length); // offset derives from current length
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
      setTotal((prev) => Math.max(0, prev - 1));
      removeCachedPrompt(id);
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
      <ScrollView
        contentContainerStyle={[
          styles.detailContent,
          { paddingTop: contentPaddingTop },
        ]}
      >
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
      contentPaddingTop={contentPaddingTop}
      contentPaddingBottom={contentPaddingBottom}
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
});
