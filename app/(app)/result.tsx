// Screen 3 — Result — Phase 12, Step 12.5
// Displays generated prompt. SendButton only rendered when promptId exists (atomicity).
// ThumbsFeedback: deselect = client-only, no API call.
// HistoryNavButton: captureResultSnapshot() before navigate.
// Back gesture: ENABLED

import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PromptDisplay from "../../components/PromptDisplay";
import SendButton from "../../components/SendButton";
import ThumbsFeedback from "../../components/ThumbsFeedback";
import NewPromptButton from "../../components/NewPromptButton";
import HistoryNavButton from "../../components/HistoryNavButton";
import { apiCall } from "../../services/api";
import { NavigationStateModule } from "../../services/navigation";

export default function Result() {
  const params = useLocalSearchParams<{
    promptId: string;
    generatedPrompt: string;
    selectedModel: string;
    topic: string;
  }>();
  const router = useRouter();

  const promptId = params.promptId ?? null;
  const generatedPrompt = params.generatedPrompt ?? "";
  const selectedModel = params.selectedModel ?? "";
  const topic = params.topic ?? "";

  const [feedbackVote, setFeedbackVote] = useState<"up" | "down" | null>(null);

  function handleVote(vote: "up" | "down") {
    setFeedbackVote(vote);
    if (promptId) {
      apiCall("PATCH", "/user/feedback", {
        prompt_id: promptId,
        vote,
      }).catch(() => {
        // Non-blocking — feedback is optional
      });
    }
  }

  function handleDeselect() {
    // Client-only: no API call, DB retains prior vote
    setFeedbackVote(null);
  }

  function handleNewPrompt() {
    NavigationStateModule.clear();
    router.replace("/(app)/");
  }

  function handleHistoryNav() {
    NavigationStateModule.captureResultSnapshot({
      generatedPrompt,
      promptId: promptId ?? "",
      feedbackVote,
      selectedModel,
      topic,
    });
    router.push("/(app)/history");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HistoryNavButton onPress={handleHistoryNav} />
      </View>

      <PromptDisplay prompt={generatedPrompt} loading={false} error={null} />

      <View style={styles.actions}>
        {generatedPrompt && promptId && (
          <SendButton generatedPrompt={generatedPrompt} />
        )}

        <ThumbsFeedback
          vote={feedbackVote}
          onVote={handleVote}
          onDeselect={handleDeselect}
        />

        <NewPromptButton onPress={handleNewPrompt} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  actions: {
    gap: 16,
    marginTop: 24,
  },
});
