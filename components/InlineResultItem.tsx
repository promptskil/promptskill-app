// InlineResultItem — inline result card on Screen 2 (Main)
// Mirrors result.tsx: topicBubble + PromptDisplay + editActions.
// Self-contained edit state — no impact on Main screen logic.
// Regen calls /generate for this item's model + topic only.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PromptDisplay from "./PromptDisplay";
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
  promptId,
  initialPrompt,
}: InlineResultItemProps) {
  const router = useRouter();
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");

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

    try {
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model, topic }
      );
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

  return (
    <View>
      {topic.length > 0 && (
        <View style={styles.topicBubble}>
          <Text style={styles.topicBubbleText} selectable>{topic}</Text>
        </View>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  topicBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
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
});
