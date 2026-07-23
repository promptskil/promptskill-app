// Screen 2 — Main — unified Engine 1 + Engine 2 flow.
// Pick a model + enter a topic → auto-generate the prompt (/generate), then
// stream the live-search answer (/run/stream) against the SAME model. Results
// accumulate as prompt+answer cards. Back gesture: DISABLED.

import { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ModelSelector from "../../components/ModelSelector";
import TopicInput from "../../components/TopicInput";
import ConversationCard from "../../components/ConversationCard";
import GlobeFeedPanel from "../../components/GlobeFeedPanel";
import {
  apiCall,
  apiStream,
  ApiError,
  SessionExpiredError,
} from "../../services/api";
import { startCheckout } from "../../services/billing";
import type { Model } from "../../types";

// Vaine model (Engine 1 selector) → Engine 2 /run key. Only claude differs.
const VAINE_TO_RUN: Record<Model, string> = {
  claude: "claude-sonnet",
  chatgpt: "chatgpt",
  gemini: "gemini",
  grok: "grok",
};

type Status = "generating" | "searching" | "streaming" | "done" | "error";

interface ConversationItem {
  id: string;
  model: Model;
  topic: string;
  prompt: string | null;
  answer: string;
  status: Status;
  error: string | null;
}

export default function Main() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [globeOpen, setGlobeOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollPending = useRef(false);

  function scheduleScroll() {
    if (scrollPending.current) return;
    scrollPending.current = true;
    requestAnimationFrame(() => {
      scrollPending.current = false;
      scrollRef.current?.scrollToEnd({ animated: false });
    });
  }

  const { compose } = useLocalSearchParams<{ compose?: string }>();
  useEffect(() => {
    if (compose) setSelectedModel(compose as Model);
  }, [compose]);

  function handleMenuNav() {
    router.push("/(app)/menu");
  }
  function handleGlobeNav() {
    setGlobeOpen((v) => !v);
  }
  function handleModelSelect(model: Model) {
    setSelectedModel((prev) => (prev === model ? null : model));
  }
  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  const canSubmit = selectedModel !== null && topic.length > 0 && !loading;

  async function handleSubmit() {
    if (selectedModel === null || topic.length === 0 || loading) return;
    const id = Date.now().toString();
    const model = selectedModel;
    const submittedTopic = topic;

    setItems((prev) => [
      ...prev,
      { id, model, topic: submittedTopic, prompt: null, answer: "", status: "generating", error: null },
    ]);
    setTopic("");
    setLoading(true); // keep selectedModel mounted so the stop button stays visible
    const controller = new AbortController();
    abortRef.current = controller;
    scheduleScroll();

    const patch = (p: Partial<ConversationItem>) =>
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

    try {
      const gen = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model, topic: submittedTopic },
        controller.signal
      );
      patch({ prompt: gen.prompt, status: "searching" });
      scheduleScroll();

      await apiStream(
        "/run/stream",
        { model: VAINE_TO_RUN[model], text: gen.prompt },
        (delta) => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id
                ? { ...it, answer: it.answer + delta, status: "streaming" }
                : it
            )
          );
          scheduleScroll();
        },
        controller.signal
      );
      patch({ status: "done" });
      scheduleScroll();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // Keep a card with partial content; drop an empty one (cancelled
        // before /generate returned).
        setItems((prev) =>
          prev
            .map((it) =>
              it.id === id && (it.prompt !== null || it.answer.length > 0)
                ? { ...it, status: "done" as const }
                : it
            )
            .filter(
              (it) => it.id !== id || it.prompt !== null || it.answer.length > 0
            )
        );
        return;
      }
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      let message = "Something went wrong. Please try again.";
      if (err instanceof ApiError) {
        if (err.status === 402) {
          if (Platform.OS === "web") {
            startCheckout().catch(() => {});
            patch({ status: "error", error: "Checkout required to continue." });
            return;
          }
          message = "A subscription is required to continue.";
        } else if (err.status === 429) {
          message = "Too many requests. Try again later.";
        } else if (err.status === 504) {
          message = "Timed out. Please try again.";
        } else if (err.status === 502) {
          message = "The model couldn't complete the request.";
        } else if (err.status === 400) {
          message = "Invalid request. Please check your input.";
        }
      }
      patch({ status: "error", error: message });
    } finally {
      abortRef.current = null;
      setLoading(false);
      setSelectedModel(null); // clear AFTER the run so the composer/stop stayed up
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={handleMenuNav} style={styles.menuBtn} hitSlop={8}>
            <View style={[styles.menuBar, { width: 22 }]} />
            <View style={[styles.menuBar, { width: 16 }]} />
            <View style={[styles.menuBar, { width: 10 }]} />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable onPress={() => {}}>
              <Ionicons name="document-text-outline" size={26} color="#333" />
            </Pressable>
            <Pressable onPress={handleGlobeNav}>
              <Image
                source={require("../../assets/globe.png")}
                style={styles.globeIcon}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>

        <ModelSelector selectedModel={selectedModel} onSelect={handleModelSelect} />

        {selectedModel !== null && (
          <View style={styles.composer}>
            <View style={styles.inputWrapper}>
              <TopicInput
                topic={topic}
                onChangeText={setTopic}
                editable={!loading}
                onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
                onBlur={() => {}}
                onSubmit={() => {
                  if (canSubmit) handleSubmit();
                }}
              />
              {topic.length > 0 && !loading && (
                <Pressable style={styles.clearBtn} onPress={() => setTopic("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color="#bbb" />
                </Pressable>
              )}
              {loading ? (
                <Pressable style={styles.sendBtn} onPress={handleCancel}>
                  <Ionicons name="stop" size={14} color="#fff" />
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.sendBtn, !canSubmit && styles.sendBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  <Ionicons name="arrow-up" size={18} color="#fff" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {items.map((item) => (
          <ConversationCard
            key={item.id}
            model={item.model}
            topic={item.topic}
            prompt={item.prompt}
            answer={item.answer}
            status={item.status}
            error={item.error}
          />
        ))}
      </ScrollView>

      {globeOpen && (
        <View style={styles.globeOverlay}>
          <GlobeFeedPanel onClose={() => setGlobeOpen(false)} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  globeOverlay: {
    position: "absolute",
    top: 96,
    right: 0,
    bottom: 0,
    width: "62%",
    maxWidth: 360,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuBtn: { gap: 4 },
  menuBar: { height: 2, borderRadius: 1, backgroundColor: "#333" },
  globeIcon: { width: 26, height: 26 },
  composer: { gap: 8, marginTop: 8 },
  inputWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  sendBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#ccc" },
  clearBtn: { position: "absolute", right: 46, bottom: 13 },
});
