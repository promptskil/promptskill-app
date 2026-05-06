// Screen 2 — Main — Phase 12, Step 12.3
// ModelSelector top, TopicInput pinned to bottom (Claude-style).
// Input floats up with keyboard via KeyboardAvoidingView.
// Result renders inline between ModelSelector and input — no navigation to Screen 3.
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ModelSelector from "../../components/ModelSelector";
import HistoryNavButton from "../../components/HistoryNavButton";
import ModelInfoCard from "../../components/ModelInfoCard";
import TopicInput from "../../components/TopicInput";
import PromptDisplay from "../../components/PromptDisplay";
import CopyPromptButton from "../../components/CopyPromptButton";
import ThumbsFeedback from "../../components/ThumbsFeedback";
import ModelLaunchChips from "../../components/ModelLaunchChips";
import { apiCall, ApiError, SessionExpiredError } from "../../services/api";
import { getDefaultModel, setDefaultModel } from "../../storage/storage";
import type { Model } from "../../types";

export default function Main() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model>("claude");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topicFocused, setTopicFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Inline result state
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptId, setPromptId] = useState<string | null>(null);
  const [feedbackVote, setFeedbackVote] = useState<"up" | "down" | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    getDefaultModel().then((model) => {
      setSelectedModel(model as Model);
    });
  }, []);

  function handleHistoryNav() {
    router.push("/(app)/history");
  }

  function handleProfileNav() {
    router.push("/(app)/profile");
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
    setGeneratedPrompt("");
    setPromptId(null);
    setFeedbackVote(null);
    setEditing(false);
    setEditedText("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model: selectedModel, topic },
        controller.signal
      );
      setPromptId(data.prompt_id);
      setGeneratedPrompt(data.prompt);
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

  async function handleRegenerate() {
    setEditing(false);
    setEditedText("");
    setError("");
    setRegenerating(true);
    setFeedbackVote(null);
    try {
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model: selectedModel, topic }
      );
      setPromptId(data.prompt_id);
      setGeneratedPrompt(data.prompt);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError("Too many requests. Try again later.");
        } else if (err.status === 504) {
          setError("Generation timed out. Please try again.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setRegenerating(false);
    }
  }

  function handleVote(vote: "up" | "down") {
    setFeedbackVote(vote);
    if (promptId) {
      apiCall("PATCH", "/user/feedback", {
        prompt_id: promptId,
        vote,
      }).catch(() => {});
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Top — scrollable model selection + inline result */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Vaine</Text>
          <View style={styles.headerRight}>
            <HistoryNavButton onPress={handleHistoryNav} />
            <Pressable onPress={handleProfileNav}>
              <Ionicons name="person-circle-outline" size={28} color="#333" />
            </Pressable>
          </View>
        </View>

        <ModelSelector
          selectedModel={selectedModel}
          onSelect={handleModelSelect}
        />

        {/* Inline result — Screen 3 content rendered here after generation */}
        {generatedPrompt.length > 0 && (
          <>
            {/* Thread — topic left */}
            {topic.length > 0 && (
              <View style={styles.topicBubble}>
                <Text style={styles.topicBubbleText}>{topic}</Text>
              </View>
            )}

            {/* Generated prompt */}
            <PromptDisplay
              prompt={generatedPrompt}
              loading={regenerating}
              error={error || null}
              editing={editing}
              editedText={editedText}
              onEditRequest={() => {
                setEditedText(generatedPrompt);
                setEditing(true);
              }}
              onEditChange={setEditedText}
            />

            {/* Edit mode buttons — Cancel + Save + Regenerate */}
            {editing && (
              <View style={styles.editActions}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => { setEditing(false); setEditedText(""); }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.saveBtn}
                  onPress={() => {
                    setGeneratedPrompt(editedText);
                    setEditing(false);
                    setEditedText("");
                  }}
                >
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
                <Pressable style={styles.regenBtn} onPress={handleRegenerate}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                </Pressable>
              </View>
            )}

            {/* Copy + Edit + Thumbs */}
            {!editing && !regenerating && (
              <View style={styles.feedbackRow}>
                <CopyPromptButton promptText={generatedPrompt} />
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => { setEditedText(generatedPrompt); setEditing(true); }}
                >
                  <Ionicons name="create-outline" size={16} color="#999" />
                </Pressable>
                <ThumbsFeedback
                  vote={feedbackVote}
                  onVote={handleVote}
                  onDeselect={() => setFeedbackVote(null)}
                />
              </View>
            )}

            {/* Model launch chips */}
            {!editing && !regenerating && (
              <ModelLaunchChips generatedBy={selectedModel} />
            )}
          </>
        )}

      </ScrollView>

      {/* Bottom — pinned input */}
      <View style={styles.bottom}>
        {error && !generatedPrompt ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.inputWrapper}>
          <TopicInput
            topic={topic}
            onChangeText={setTopic}
            editable={!loading}
            onFocus={() => setTopicFocused(true)}
            onBlur={() => setTopicFocused(false)}
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
  topicBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "75%",
  },
  topicBubbleText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  cancelText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  saveText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  regenBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
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
});
