// InlineResultItem — inline result card on Screen 2 (Main)
// Mirrors result.tsx: PromptDisplay + editActions + feedbackRow (Copy + Thumbs).
// Self-contained edit and feedback state — no impact on Main screen logic.
// Regen calls /generate for this item's model + topic only.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PromptDisplay from "./PromptDisplay";
import CopyPromptButton from "./CopyPromptButton";
import ThumbsFeedback from "./ThumbsFeedback";
import { apiCall, ApiError, SessionExpiredError } from "../services/api";
import type { Model } from "../types";

interface InlineResultItemProps {
  topic: string;
  model: Model;
  promptId: string | null;
  initialPrompt: string;
}

export default function InlineResultItem({
  topic,
  model,
  promptId: initialPromptId,
  initialPrompt,
}: InlineResultItemProps) {
  const router = useRouter();
  const [promptId, setPromptId] = useState(initialPromptId);
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [feedbackVote, setFeedbackVote] = useState<"up" | "down" | null>(null);

  function handleEditRequest() {
    setEditedText(currentPrompt);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setEditedText("");
  }

  function handleSave() {
    setCurrentPrompt(editedText);
    setEditing(false);
    setEditedText("");
  }

  async function handleRegenerate() {
    setEditing(false);
    setEditedText("");
    setRegenError("");
    setRegenerating(true);
    setFeedbackVote(null);

    try {
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model, topic }
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
          setRegenError("Too many requests. Try again later.");
        } else if (err.status === 504) {
          setRegenError("Generation timed out. Please try again.");
        } else {
          setRegenError("Something went wrong. Please try again.");
        }
      } else {
        setRegenError("Something went wrong. Please try again.");
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

  function handleDeselect() {
    setFeedbackVote(null);
  }

  return (
    <View style={styles.container}>
      <PromptDisplay
        prompt={currentPrompt}
        loading={regenerating}
        error={regenError || null}
        editing={editing}
        editedText={editedText}
        onEditRequest={handleEditRequest}
        onEditChange={setEditedText}
      />

      {editing && (
        <View style={styles.editActions}>
          <Pressable style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
          <Pressable style={styles.regenBtn} onPress={handleRegenerate}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </Pressable>
        </View>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
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
});
