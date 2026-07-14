// Screen 2 — Main — Phase 12, Step 12.3
// ModelSelector top, TopicInput pinned to bottom (Claude-style).
// Input floats up with keyboard via KeyboardAvoidingView.
// Result renders inline — PromptDisplay only, no interactions. Copy/edit/thumbs in History only.
// Back gesture: DISABLED

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
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
import ModelInfoCard from "../../components/ModelInfoCard";
import TopicInput from "../../components/TopicInput";
import InlineResultItem from "../../components/InlineResultItem";
import PromptDisplay from "../../components/PromptDisplay";
import ModelDropdownComposer from "../../components/ModelDropdownComposer";
import GlobeFeedPanel from "../../components/GlobeFeedPanel";
import {
  apiCall,
  ApiError,
  SessionExpiredError,
  businessContextHeader,
} from "../../services/api";
import { startCheckout } from "../../services/billing";
import { getRole } from "../../storage/storage";
import type { Model } from "../../types";

interface ResultItem {
  id: string;
  promptId: string | null;
  model: Model;
  topic: string;
  prompt: string;
}

export default function Main() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topicFocused, setTopicFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Accumulated results — prompt display only
  const [results, setResults] = useState<ResultItem[]>([]);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [globeOpen, setGlobeOpen] = useState(false);

  const { compose } = useLocalSearchParams<{ compose?: string }>();

  useEffect(() => {
    getRole().then(setAccountType);
  }, []);

  useEffect(() => {
    if (compose) {
      setSelectedModel(compose as Model);
    }
  }, [compose]);

  function handleMenuNav() {
    router.push("/(app)/menu");
  }

  function handleGlobeNav() {
    setGlobeOpen((v) => !v);
  }

  const canGenerate =
    selectedModel !== null && topic.length > 0 && !loading;

  function handleModelSelect(model: Model) {
    setSelectedModel((prev) => (prev === model ? null : model));
  }

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  async function handleGenerate() {
    if (selectedModel === null) return;
    setError("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const ctx = await businessContextHeader();
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model: selectedModel, topic },
        controller.signal,
        ctx
      );
      setResults(prev => [...prev, {
        id: Date.now().toString(),
        promptId: data.prompt_id,
        model: selectedModel,
        topic: topic,
        prompt: data.prompt,
      }]);
      setTopic("");
      setSelectedModel(null);   // Rule: composer disappears after submit
    } catch (err) {
      // User cancelled — swallow silently
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 402) {
          if (Platform.OS === "web") {
            startCheckout().catch(() => setError("Could not start checkout."));
          } else {
            setError("A subscription is required to continue.");
          }
          return;
        }
        if (err.status === 429) {
          setError("Too many requests. Try again later.");
        } else if (err.status === 504) {
          setError("Generation timed out. Please try again.");
        } else if (err.status === 400) {
          setError("Invalid request. Please check your input.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Top — scrollable model selection + accumulated results */}
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
            {Platform.OS === "web" && accountType === "admin" && (
              <Pressable onPress={() => router.push("/(app)/business")}>
                <Ionicons name="business-outline" size={26} color="#333" />
              </Pressable>
            )}
          </View>
        </View>

        <ModelSelector
          selectedModel={selectedModel}
          onSelect={handleModelSelect}
        />

        {/* Composer — pops in only after a model is chosen (X-compose style) */}
        {selectedModel !== null && (
          <View style={styles.composer}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.inputWrapper}>
              <TopicInput
                topic={topic}
                onChangeText={setTopic}
                editable={!loading}
                onFocus={() => {
                  setTopicFocused(true);
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
                onBlur={() => setTopicFocused(false)}
                onSubmit={() => {
                  if (canGenerate) handleGenerate();
                }}
              />
              {topic.length > 0 && !loading && (
                <Pressable
                  style={styles.clearBtn}
                  onPress={() => setTopic("")}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={22} color="#bbb" />
                </Pressable>
              )}
              {loading ? (
                <Pressable style={styles.sendBtn} onPress={handleCancel}>
                  <Ionicons name="stop" size={14} color="#fff" />
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.sendBtn, !canGenerate && styles.sendBtnDisabled]}
                  onPress={handleGenerate}
                  disabled={!canGenerate}
                >
                  <Ionicons name="arrow-up" size={18} color="#fff" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Accumulated results — topic bubble + prompt + edit actions */}
        {results.map(item => (
          <InlineResultItem
            key={item.id}
            topic={item.topic}
            model={item.model}
            promptId={item.promptId}
            initialPrompt={item.prompt}
            animate={false}
          />
        ))}

        {loading && (
          <PromptDisplay prompt="" loading error={null} model={selectedModel ?? "claude"} />
        )}

      </ScrollView>
      <ModelDropdownComposer />
      {globeOpen && (
        <View style={styles.globeOverlay}>
          <GlobeFeedPanel onClose={() => setGlobeOpen(false)} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  globeOverlay: {
    position: "absolute",
    top: 96,
    right: 0,
    bottom: 0,
    width: "62%",
    maxWidth: 360,
  },
  scroll: {
    flex: 1,
  },
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
  topLogo: {
    height: 22,
    width: 76,
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  menuBtn: {
    gap: 4,
  },
  menuBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: "#333",
  },
  globeIcon: {
    width: 26,
    height: 26,
  },
  composer: {
    gap: 8,
    marginTop: 8,
  },
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
  sendBtnDisabled: {
    backgroundColor: "#ccc",
  },
  clearBtn: {
    position: "absolute",
    right: 46,
    bottom: 13,
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
  },
});
