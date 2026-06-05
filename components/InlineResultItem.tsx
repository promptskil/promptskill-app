// InlineResultItem — static result (Main + History) with regenerate.
// initialPrompt is WRITE-ONCE, never overwritten. No edit.
// Regenerate → a second result below with the SAME actions as the original
// (Copy · Regenerate · Thumbs · launch chips); spinner while generating; no label.

import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
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

  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [regenerated, setRegenerated] = useState<string | null>(null);
  const [regeneratedPromptId, setRegeneratedPromptId] = useState<string | null>(
    null
  );

  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [regenVote, setRegenVote] = useState<"up" | "down" | null>(null);

  async function handleRegenerate() {
    setRegenError("");
    setRegenVote(null);
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
      // Replaces the regenerated slot only — original initialPrompt untouched.
      setRegenerated(data.prompt);
      setRegeneratedPromptId(data.prompt_id);
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

  function sendVote(targetId: string | null, v: "up" | "down") {
    if (targetId) {
      apiCall("PATCH", "/user/feedback", {
        prompt_id: targetId,
        vote: v,
      }).catch(() => {});
    }
  }

  return (
    <View style={styles.container}>
      {/* ORIGINAL (static, write-once) */}
      <PromptDisplay
        prompt={initialPrompt}
        loading={false}
        error={null}
        model={model}
        animate={animate}
      />
      {initialPrompt.length > 0 && (
        <>
          <View style={styles.actionRow}>
            <CopyPromptButton promptText={initialPrompt} />
            <Pressable
              style={styles.iconBtn}
              onPress={handleRegenerate}
              disabled={regenerating}
            >
              <Ionicons name="refresh" size={16} color="#999" />
            </Pressable>
            <ThumbsFeedback
              vote={vote}
              onVote={(v) => {
                setVote(v);
                sendVote(promptId, v);
              }}
              onDeselect={() => setVote(null)}
            />
          </View>
          <ModelLaunchChips generatedBy={model} />
        </>
      )}

      {/* REGENERATED — same actions as original, no label, spinner while generating */}
      {(regenerating || regenError !== "" || regenerated !== null) && (
        <View style={styles.derivedPanel}>
          <PromptDisplay
            prompt={regenerated ?? ""}
            loading={regenerating}
            error={regenError || null}
            model={model}
            animate={false}
          />
          {regenerated !== null && (
            <>
              <View style={styles.actionRow}>
                <CopyPromptButton promptText={regenerated} />
                <Pressable
                  style={styles.iconBtn}
                  onPress={handleRegenerate}
                  disabled={regenerating}
                >
                  <Ionicons name="refresh" size={16} color="#999" />
                </Pressable>
                <ThumbsFeedback
                  vote={regenVote}
                  onVote={(v) => {
                    setRegenVote(v);
                    sendVote(regeneratedPromptId, v);
                  }}
                  onDeselect={() => setRegenVote(null)}
                />
              </View>
              <ModelLaunchChips generatedBy={model} />
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexShrink: 0 },
  actionRow: {
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
});
