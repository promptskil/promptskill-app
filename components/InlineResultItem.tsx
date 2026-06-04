// InlineResultItem — static result with on-top working layers (Main + History).
// The generated prompt (initialPrompt) is WRITE-ONCE and never overwritten.
// Edit  → a transient working copy (copy/send; revertible). Original preserved.
// Regen → a separate "Regenerated" panel beside the static original.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PromptDisplay from "./PromptDisplay";
import CopyPromptButton from "./CopyPromptButton";
import ThumbsFeedback from "./ThumbsFeedback";
import ModelLaunchChips from "./ModelLaunchChips";
import {
  apiCall,
  ApiError,
  SessionExpiredError,
  businessContextHeader,
} from "../services/api";
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

  // Edit → transient working copy (never overwrites initialPrompt)
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [workingCopy, setWorkingCopy] = useState<string | null>(null);

  // Regenerate → separate panel (never overwrites initialPrompt)
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [regenerated, setRegenerated] = useState<string | null>(null);

  const [feedbackVote, setFeedbackVote] = useState<"up" | "down" | null>(null);

  function handleEditRequest() {
    setEditedText(workingCopy ?? initialPrompt);
    setEditing(true);
  }
  function handleCancel() {
    setEditing(false);
    setEditedText("");
  }
  function handleSave() {
    // Working copy only — the original initialPrompt is never overwritten.
    setWorkingCopy(editedText);
    setEditing(false);
    setEditedText("");
  }
  function handleRevert() {
    // Back to the static original.
    setWorkingCopy(null);
  }

  async function handleRegenerate() {
    setRegenError("");
    setRegenerating(true);
    try {
      const ctx = await businessContextHeader();
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model, topic },
        undefined,
        ctx
      );
      // Separate panel — the original initialPrompt is never overwritten.
      setRegenerated(data.prompt);
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
      {/* STATIC ORIGINAL (write-once) — or editor when editing */}
      <PromptDisplay
        prompt={initialPrompt}
        loading={false}
        error={null}
        editing={editing}
        editedText={editedText}
        model={model}
        onEditChange={setEditedText}
      />

      {editing ? (
        <View style={styles.editActions}>
          <Pressable style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
      ) : (
        initialPrompt.length > 0 && (
          <>
            <View style={styles.feedbackRow}>
              <CopyPromptButton promptText={initialPrompt} />
              <Pressable style={styles.iconBtn} onPress={handleEditRequest}>
                <Ionicons name="create-outline" size={16} color="#999" />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={handleRegenerate}
                disabled={regenerating}
              >
                <Ionicons name="refresh" size={16} color="#999" />
              </Pressable>
              <ThumbsFeedback
                vote={feedbackVote}
                onVote={handleVote}
                onDeselect={handleDeselect}
              />
            </View>
            <ModelLaunchChips generatedBy={model} />
          </>
        )
      )}

      {/* WORKING COPY — transient, original preserved + revertible */}
      {!editing && workingCopy !== null && (
        <View style={styles.derivedPanel}>
          <View style={styles.derivedHeader}>
            <Text style={styles.derivedLabel}>Your edit</Text>
            <Pressable onPress={handleRevert}>
              <Text style={styles.revertText}>Revert</Text>
            </Pressable>
          </View>
          <PromptDisplay
            prompt={workingCopy}
            loading={false}
            error={null}
            editing={false}
            editedText=""
            model={model}
            onEditChange={() => {}}
          />
          <View style={styles.feedbackRow}>
            <CopyPromptButton promptText={workingCopy} />
          </View>
        </View>
      )}

      {/* REGENERATED — separate panel beside the static original */}
      {!editing && (regenerating || regenError !== "" || regenerated !== null) && (
        <View style={styles.derivedPanel}>
          <Text style={styles.derivedLabel}>Regenerated</Text>
          <PromptDisplay
            prompt={regenerated ?? ""}
            loading={regenerating}
            error={regenError || null}
            editing={false}
            editedText=""
            model={model}
            onEditChange={() => {}}
          />
          {regenerated !== null && (
            <View style={styles.feedbackRow}>
              <CopyPromptButton promptText={regenerated} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexShrink: 0 },
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
  cancelText: { fontSize: 14, color: "#666", fontWeight: "500" },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  saveText: { fontSize: 14, color: "#fff", fontWeight: "500" },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  iconBtn: { padding: 6, borderRadius: 6 },
  derivedPanel: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 8,
  },
  derivedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  derivedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  revertText: { fontSize: 13, color: "#4F46E5", fontWeight: "500" },
});
