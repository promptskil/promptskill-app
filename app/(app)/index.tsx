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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ModelSelector from "../../components/ModelSelector";
import HistoryNavButton from "../../components/HistoryNavButton";
import ModelInfoCard from "../../components/ModelInfoCard";
import TopicInput from "../../components/TopicInput";
import InlineResultItem from "../../components/InlineResultItem";
import PromptDisplay from "../../components/PromptDisplay";
import {
  apiCall,
  ApiError,
  SessionExpiredError,
  businessContextHeader,
} from "../../services/api";
import { startCheckout } from "../../services/billing";
import { getDefaultModel, setDefaultModel, getRole } from "../../storage/storage";
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
  const [selectedModel, setSelectedModel] = useState<Model>("claude");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topicFocused, setTopicFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Accumulated results — prompt display only
  const [results, setResults] = useState<ResultItem[]>([]);
  const [accountType, setAccountType] = useState<string | null>(null);

  useEffect(() => {
    getDefaultModel().then((model) => {
      setSelectedModel(model as Model);
    });
    getRole().then(setAccountType);
  }, []);

  function handleHistoryNav() {
    router.push("/(app)/history");
  }

  function handleProfileNav() {
    router.push("/(app)/profile");
  }

  function handleGlobeNav() {
    router.push("/(app)/globe");
  }

  const canGenerate =
    selectedModel.length > 0 && topic.length > 0 && !loading;

  function handleModelSelect(model: Model) {
    setSelectedModel(model);
    setDefaultModel(model);
  }

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  async function handleGenerate() {
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
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo1.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerRight}>
            <Pressable onPress={handleGlobeNav}>
              <Image
              source={require("../../assets/globe.png")}
              style={styles.globeIcon}
              resizeMode="contain"
            />
            </Pressable>
            <HistoryNavButton onPress={handleHistoryNav} />
            {Platform.OS === "web" && accountType === "admin" && (
              <Pressable onPress={() => router.push("/(app)/business")}>
                <Ionicons name="business-outline" size={26} color="#333" />
              </Pressable>
            )}
            <Pressable onPress={handleProfileNav}>
              <Ionicons name="person-circle-outline" size={28} color="#333" />
            </Pressable>
          </View>
        </View>

        <ModelSelector
          selectedModel={selectedModel}
          onSelect={handleModelSelect}
        />

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
          <PromptDisplay prompt="" loading error={null} model={selectedModel} />
        )}

      </ScrollView>

      {/* Bottom — pinned input */}
      <View style={styles.bottom}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.inputWrapper}>
          <TopicInput
            topic={topic}
            onChangeText={setTopic}
            editable={!loading}
            onFocus={() => setTopicFocused(true)}
            onBlur={() => setTopicFocused(false)}
            onSubmit={() => {
              if (canGenerate) handleGenerate();
            }}
          />
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
        <Text style={styles.inputHint}>AI does the work for you.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerLogo: {
    height: 28,
    width: 90,
  },
  globeIcon: {
    width: 26,
    height: 26,
  },
  bottom: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
    backgroundColor: "#fff",
    gap: 8,
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
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
  },
  inputHint: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    fontWeight: "300",
  },
});
