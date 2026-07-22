// FrontierResult — Engine 2 (Frontier Executor) output, rendered in the main
// scroll body as a borderless, centered, free-flowing column (ChatGPT/Claude
// style). No card, no border, no height cap. Provider output is shown verbatim
// as plain selectable text — no Markdown, so no app-side formatting re-enters.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import Spinner from "./Spinner";

interface Props {
  model: string | null;
  loading: boolean;
  error: string | null;
  answer: string | null;
  onClear: () => void;
}

export default function FrontierResult({
  model,
  loading,
  error,
  answer,
  onClear,
}: Props) {
  return (
    <View style={styles.wrap}>
      {loading ? (
        <View style={styles.center}>
          <Spinner />
          <Text style={styles.hint}>Running {model}…</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.model}>{model}</Text>
            <Pressable onPress={onClear} hitSlop={8}>
              <Ionicons name="close" size={18} color="#888" />
            </Pressable>
          </View>
          <Markdown style={mdStyles}>{answer ?? ""}</Markdown>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 680, alignSelf: "center" },
  center: { flexDirection: "row", alignItems: "center", gap: 8 },
  hint: { fontSize: 13, color: "#888" },
  error: { color: "#d00", fontSize: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  model: { fontSize: 12, color: "#888", fontWeight: "600" },
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
