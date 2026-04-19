// Screen 3 — Result — Phase 12, Step 12.5 + Launchpad
// Displays generated prompt with inline edit, regenerate, cancel.
// CopyPromptButton + ThumbsFeedback: aligned linearly, small.
// ModelLaunchChips: opens model web chat (separate from copy).
// ThumbsFeedback: deselect = client-only, no API call.
// HistoryNavButton: captureResultSnapshot() before navigate.
// Back gesture: ENABLED

import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PromptDisplay from "../../components/PromptDisplay";
import CopyPromptButton from "../../components/CopyPromptButton";
import ModelLaunchChips from "../../components/ModelLaunchChips";
import ThumbsFeedback from "../../components/ThumbsFeedback";
import NewPromptButton from "../../components/NewPromptButton";
import HistoryNavButton from "../../components/HistoryNavButton";
import { apiCall, ApiError, SessionExpiredError } from "../../services/api";
import { NavigationStateModule } from "../../services/navigation";
import type { Model } from "../../types";

export default function Result() {
  const params = useLocalSearchParams<{
    promptId: string;
    generatedPrompt: string;
    selectedModel: string;
    topic: string;
  }>();
  const router = useRouter();

  const [promptId, setPromptId] = useState(params.promptId ?? null);
  const [currentPrompt, setCurrentPrompt] = useState(
    params.generatedPrompt ?? ""
  );
  const selectedModel = (params.selectedModel ?? "claude") as Model;
  const topic = params.topic ?? "";

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  // Regenerate state
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const [feedbackVote, setFeedbackVote] = useState<"up" | "down" | null>(null);

  // --- Edit handlers ---
  function handleEditRequest() {
    setEditedText(currentPrompt);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setEditedText("");
  }

  // --- Regenerate ---
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
      setCurrentPrompt(data.prompt);
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

  // --- Feedback ---
  function handleVote(vote: "up" | "down") {
    setFeedbackVote(vote);
    if (promptId) {
      apiCall("PATCH", "/user/feedback", {
        prompt_id: promptId,
        vote,
      }).catch(() => {});
    }
  }

  function handleDeselect() {
    setFeedbackVote(null);
  }

  // --- Navigation ---
  function handleNewPrompt() {
    NavigationStateModule.clear();
    router.replace("/(app)/");
  }

  function handleHistoryNav() {
    NavigationStateModule.captureResultSnapshot({
      generatedPrompt: currentPrompt,
      promptId: promptId ?? "",
      feedbackVote,
      selectedModel,
      topic,
    });
    router.push("/(app)/history");
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <HistoryNavButton onPress={handleHistoryNav} />
        <Pressable onPress={() => router.push("/(app)/profile")}>
          <Ionicons name="person-circle-outline" size={28} color="#333" />
        </Pressable>
      </View>

      {/* Prompt display / editor */}
      <PromptDisplay
        prompt={currentPrompt}
        loading={regenerating}
        error={error || null}
        editing={editing}
        editedText={editedText}
        onEditRequest={handleEditRequest}
        onEditChange={setEditedText}
      />

      {/* Edit mode buttons — Cancel + Regenerate arrow */}
      {editing && (
        <View style={styles.editActions}>
          <Pressable style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.regenBtn} onPress={handleRegenerate}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Copy + Thumbs — linear row, small */}
      {!editing && !regenerating && currentPrompt.length > 0 && (
        <View style={styles.feedbackRow}>
          <CopyPromptButton promptText={currentPrompt} />
          <ThumbsFeedback
            vote={feedbackVote}
            onVote={handleVote}
            onDeselect={handleDeselect}
          />
        </View>
      )}

      {/* Model launch chips */}
      {!editing && !regenerating && currentPrompt.length > 0 && (
        <ModelLaunchChips generatedBy={selectedModel} />
      )}

      {/* New prompt */}
      {!editing && (
        <View style={styles.actions}>
          <NewPromptButton onPress={handleNewPrompt} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
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
  actions: {
    gap: 16,
    marginTop: 24,
  },
});
