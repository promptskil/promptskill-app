// InlineResultItem — single latest result (Main + History).
// Shows only the LATEST prompt. Edit → add a refinement (the prompt stays
// visible); Save sends the ORIGINAL topic + the refinement to /generate, the
// backend connects both, and the new prompt replaces the view.
// Actions: Edit · Copy · Thumbs · launch chips. No standalone Regenerate.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
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
  animate?: boolean;
}

export default function InlineResultItem({
  topic,
  model,
  promptId,
  initialPrompt,
  animate = true,
}: InlineResultItemProps) {
  const router = useRouter();

  // Single, latest visible result.
  const [latest, setLatest] = useState(initialPrompt);
  const [latestPromptId, setLatestPromptId] = useState(promptId);

  const [editing, setEditing] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  function handleEditRequest() {
    setRefineText("");
    setEditing(true);
  }
  function handleCancel() {
    setEditing(false);
    setRefineText("");
  }

  async function handleSave() {
    setEditing(false);
    setError("");
    setRegenerating(true);
    try {
      const ctx = await businessContextHeader();
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        // Original topic + the refinement — backend connects both.
        { model, topic, refinement: refineText },
        undefined,
        ctx
      );
      setLatest(data.prompt);
      setLatestPromptId(data.prompt_id);
      setVote(null);
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
      setRefineText("");
    }
  }

  function handleVote(v: "up" | "down") {
    setVote(v);
    if (latestPromptId) {
      apiCall("PATCH", "/user/feedback", {
        prompt_id: latestPromptId,
        vote: v,
      }).catch(() => {});
    }
  }

  return (
    <View style={styles.container}>
      {regenerating ? (
        <PromptDisplay prompt="" loading error={null} model={model} />
      ) : editing ? (
        <>
          <PromptDisplay
            prompt={latest}
            loading={false}
            error={null}
            model={model}
            animate={false}
          />
          <TextInput
            style={styles.refineInput}
            value={refineText}
            onChangeText={setRefineText}
            placeholder="Add a refinement (e.g. make it more concise)…"
            placeholderTextColor="#bbb"
            multiline
            textAlignVertical="top"
          />
          <View style={styles.editActions}>
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <PromptDisplay
            prompt={latest}
            loading={false}
            error={null}
            model={model}
            animate={animate}
          />
          {error !== "" && <Text style={styles.errorText}>{error}</Text>}
          {latest.length > 0 && (
            <>
              <View style={styles.actionRow}>
                <Pressable style={styles.iconBtn} onPress={handleEditRequest}>
                  <Ionicons name="create-outline" size={16} color="#999" />
                </Pressable>
                <CopyPromptButton promptText={latest} />
                <ThumbsFeedback
                  vote={vote}
                  onVote={handleVote}
                  onDeselect={() => setVote(null)}
                />
              </View>
              <ModelLaunchChips generatedBy={model} />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexShrink: 0 },
  refineInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    fontSize: 15,
    color: "#111",
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
  cancelText: { fontSize: 14, color: "#666", fontWeight: "500" },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  saveText: { fontSize: 14, color: "#fff", fontWeight: "500" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  iconBtn: { padding: 6, borderRadius: 6 },
  errorText: { color: "#d00", fontSize: 14, textAlign: "center", marginTop: 8 },
});
