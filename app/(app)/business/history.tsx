// Screen — Business Org History
// businessId passed as router param from dashboard — no duplicate API call.
// GET /business/{businessId}/history?limit=20&offset=0 on mount.
// Paginated — Load More appends, offset derived from items.length.
// Back gesture: ENABLED
// Back arrow: router.replace to dashboard

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";

const PAGE_LIMIT = 20;

interface HistoryItem {
  prompt_id: string;
  user_id: string;
  model: string;
  topic: string;
  prompt_text: string;
  feedback_vote: string | null;
  created_at: string;
}

interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export default function BusinessHistory() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!businessId || Array.isArray(businessId)) {
      router.replace("/(app)/business/");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiCall<HistoryResponse>(
        "GET",
        `/business/${businessId}/history?limit=${PAGE_LIMIT}&offset=0`
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        router.replace("/(app)/business/");
        return;
      }
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, [businessId, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLoadMore() {
    if (!businessId || Array.isArray(businessId)) return;
    const nextOffset = items.length;
    setLoadingMore(true);
    try {
      const data = await apiCall<HistoryResponse>(
        "GET",
        `/business/${businessId}/history?limit=${PAGE_LIMIT}&offset=${nextOffset}`
      );
      setItems(prev => [...prev, ...data.items]);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      // Non-fatal — user can retry via scroll
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.replace("/(app)/business/")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.header}>Org History</Text>
      </View>

      <Text style={styles.totalText}>{total} prompt{total !== 1 ? "s" : ""}</Text>

      {/* Empty state */}
      {items.length === 0 && !loading && (
        <Text style={styles.emptyText}>No prompts yet.</Text>
      )}

      {/* Items */}
      {items.map(item => (
        <View key={item.prompt_id} style={styles.itemCard}>
          <View style={styles.itemMeta}>
            <Text style={styles.userLabel}>
              {item.user_id.slice(0, 8)}…
            </Text>
            <Text style={styles.modelChip}>{item.model}</Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.topic}>{item.topic}</Text>
          <Text style={styles.promptText} numberOfLines={2}>
            {item.prompt_text}
          </Text>
        </View>
      ))}

      {/* Load More */}
      {items.length < total && !loadingMore && (
        <Pressable style={styles.loadMoreBtn} onPress={handleLoadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </Pressable>
      )}

      {loadingMore && (
        <ActivityIndicator
          size="small"
          color="#4F46E5"
          style={styles.loadMoreSpinner}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  totalText: {
    fontSize: 13,
    color: "#999",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginTop: 48,
  },
  itemCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 6,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userLabel: {
    fontSize: 11,
    color: "#999",
    fontFamily: "monospace",
  },
  modelChip: {
    fontSize: 11,
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  dateText: {
    fontSize: 11,
    color: "#999",
    marginLeft: "auto",
  },
  topic: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  promptText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  loadMoreBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4F46E5",
    alignItems: "center",
  },
  loadMoreText: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "600",
  },
  loadMoreSpinner: {
    marginTop: 24,
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
