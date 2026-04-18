// Screen 4 — History — Phase 13, Step 13.2
// GET /history?page=N, pagination, soft delete, back nav with snapshot.
// Entry from Result → back restores snapshot. Entry from Main → back to Main.
// Back gesture: ENABLED

import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import PromptList from "../../components/PromptList";
import { apiCall, SessionExpiredError } from "../../services/api";
import { NavigationStateModule } from "../../services/navigation";

interface PromptRecord {
  id: string;
  model: string;
  topic: string;
  prompt_text: string;
  feedback_vote: "up" | "down" | null;
  created_at: string;
}

interface HistoryResponse {
  prompts: PromptRecord[];
  total: number;
  page: number;
}

export default function History() {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<PromptRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(
    async (pageNum: number) => {
      try {
        const data = await apiCall<HistoryResponse>(
          "GET",
          `/history?page=${pageNum}`
        );
        if (pageNum === 0) {
          setHistoryItems(data.prompts);
        } else {
          setHistoryItems((prev) => [...prev, ...data.prompts]);
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
    // Load existing record into Result — no regeneration
    router.push({
      pathname: "/(app)/result",
      params: {
        promptId: record.id,
        generatedPrompt: record.prompt_text,
        selectedModel: record.model,
        topic: record.topic,
      },
    });
  }

  async function handleItemDelete(id: string) {
    try {
      await apiCall("PATCH", `/prompts/${id}/delete`);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>History</Text>
      <PromptList
        historyItems={historyItems}
        total={total}
        onLoadMore={handleLoadMore}
        onItemSelect={handleItemSelect}
        onItemDelete={handleItemDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  loading: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 32,
  },
});
