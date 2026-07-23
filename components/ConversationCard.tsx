// ConversationCard — one unified result: the user's topic, the crafted prompt
// (Engine 1), and the live-search answer (Engine 2) streaming below. Display-only.

import { View, Text, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { MODEL_LABELS } from "../constants/models";
import Spinner from "./Spinner";
import type { Model } from "../types";

type Status = "generating" | "searching" | "streaming" | "done" | "error";

interface Props {
  model: Model;
  topic: string;
  prompt: string | null;
  answer: string;
  status: Status;
  error: string | null;
}

export default function ConversationCard({
  model,
  topic,
  prompt,
  answer,
  status,
  error,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topicBubble}>
        <Text style={styles.topicText}>{topic}</Text>
      </View>
      <Text style={styles.model}>{MODEL_LABELS[model]}</Text>

      {status === "generating" && (
        <View style={styles.row}>
          <Spinner />
          <Text style={styles.hint}>Preparing prompt…</Text>
        </View>
      )}

      {prompt !== null && (
        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>PROMPT</Text>
          <Text style={styles.promptText} selectable>
            {prompt}
          </Text>
        </View>
      )}

      {status === "searching" && (
        <View style={styles.row}>
          <Spinner />
          <Text style={styles.hint}>Searching with {MODEL_LABELS[model]}…</Text>
        </View>
      )}

      {answer.length > 0 && <Markdown style={mdStyles}>{answer}</Markdown>}

      {status === "error" && error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 680, alignSelf: "center", gap: 8 },
  topicBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#f0f0f0",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: "85%",
  },
  topicText: { fontSize: 15, color: "#111" },
  model: { fontSize: 12, color: "#888", fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  hint: { fontSize: 13, color: "#888" },
  promptBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#ddd",
    paddingLeft: 10,
    paddingVertical: 2,
  },
  promptLabel: {
    fontSize: 10,
    color: "#aaa",
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  promptText: { fontSize: 13, color: "#555", lineHeight: 19 },
  error: { color: "#d00", fontSize: 14 },
});

const mdStyles = {
  body: { fontSize: 15, lineHeight: 22, color: "#111" },
  heading1: { fontSize: 18, fontWeight: "700" as const, marginTop: 12, marginBottom: 6 },
  heading2: { fontSize: 16, fontWeight: "700" as const, marginTop: 12, marginBottom: 6 },
  heading3: { fontSize: 15, fontWeight: "700" as const, marginTop: 10, marginBottom: 4 },
  strong: { fontWeight: "700" as const },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  list_item: { fontSize: 15, lineHeight: 22, color: "#111" },
  paragraph: { marginTop: 0, marginBottom: 10 },
  link: { color: "#2563eb" },
};
