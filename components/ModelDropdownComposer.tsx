// ModelDropdownComposer — Engine 2 (Frontier Executor).
// Paste a prompt, pick a model, run it against the real frontier LLM.
// Independent of the Vaine (top) composer.

import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { apiCall, ApiError, SessionExpiredError } from "../services/api";

const MODELS = ["ChatGPT", "Claude Sonnet", "Claude Opus", "Gemini", "Grok"];
const MODEL_KEYS: Record<string, string> = {
  "ChatGPT": "chatgpt",
  "Claude Sonnet": "claude-sonnet",
  "Claude Opus": "claude-opus",
  "Gemini": "gemini",
  "Grok": "grok",
};
const MIN_HEIGHT = 24;
const EXPANDED_H = Math.round(Dimensions.get("window").height * 0.7);

export default function ModelDropdownComposer() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const canSend = selected !== null && text.length > 0 && !loading;

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  async function handleRun() {
    if (selected === null || text.length === 0 || loading) return;
    setError(null);
    setAnswer(null);
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const data = await apiCall<{ model: string; answer: string }>(
        "POST",
        "/run",
        { model: MODEL_KEYS[selected], text },
        controller.signal
      );
      setAnswer(data.answer);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError("Limit reached for this model. Try again later.");
        } else if (err.status === 502) {
          setError("The model couldn't complete the request.");
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

  return (
    <View style={styles.bar}>
      {(loading || error || answer !== null) && (
        <View style={[styles.panel, expanded && { maxHeight: EXPANDED_H }]}>
          {loading ? (
            <View style={styles.panelCenter}>
              <ActivityIndicator />
              <Text style={styles.panelHint}>Running {selected}…</Text>
            </View>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <>
              <View style={styles.panelHeader}>
                <Text style={styles.panelModel}>{selected}</Text>
                <View style={styles.panelActions}>
                  <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={8}>
                    <Ionicons name={expanded ? "contract" : "expand"} size={16} color="#888" />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setAnswer(null);
                      setExpanded(false);
                    }}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={18} color="#888" />
                  </Pressable>
                </View>
              </View>
              <ScrollView
                style={[styles.panelScroll, expanded && { maxHeight: EXPANDED_H - 50 }]}
                keyboardShouldPersistTaps="handled"
              >
                <Markdown style={mdStyles}>{answer}</Markdown>
              </ScrollView>
            </>
          )}
        </View>
      )}

      <View style={styles.box}>
        <TextInput
          style={[
            styles.input,
            { height: Math.max(MIN_HEIGHT, height) },
            Platform.OS === "web" && styles.webNoScroll,
            Platform.OS === "web" && ({ outlineStyle: "none" } as any),
          ]}
          value={text}
          onChangeText={setText}
          onChange={
            Platform.OS === "web"
              ? (e: any) => {
                  const el = e.target;
                  el.style.height = "auto";
                  setHeight(Math.max(MIN_HEIGHT, el.scrollHeight));
                }
              : undefined
          }
          placeholder="Search with"
          placeholderTextColor="#999"
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          onContentSizeChange={(e) => setHeight(e.nativeEvent.contentSize.height)}
        />

        <View style={styles.controlRow}>
          <View style={styles.dropdownWrap}>
            {open && (
              <View style={styles.menu}>
                {MODELS.map((m) => (
                  <Pressable
                    key={m}
                    style={styles.menuItem}
                    onPress={() => {
                      setSelected(m);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.menuText}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable style={styles.dropdown} onPress={() => setOpen((o) => !o)}>
              {selected && (
                <Text style={styles.dropdownText} numberOfLines={1}>
                  {selected}
                </Text>
              )}
              <Ionicons name={open ? "chevron-down" : "chevron-up"} size={16} color="#555" />
            </Pressable>
          </View>

          <View style={styles.spacer} />

          {text.length > 0 && !loading && (
            <Pressable
              style={styles.clearBtn}
              onPress={() => {
                setText("");
                setHeight(MIN_HEIGHT);
              }}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={22} color="#bbb" />
            </Pressable>
          )}
          {loading ? (
            <Pressable style={styles.sendBtn} onPress={handleCancel}>
              <Ionicons name="stop" size={14} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
              onPress={handleRun}
              disabled={!canSend}
            >
              <Ionicons name="arrow-up" size={18} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, backgroundColor: "#fff" },
  panel: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    padding: 12,
    maxHeight: 260,
  },
  panelCenter: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" },
  panelHint: { fontSize: 13, color: "#888" },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  panelActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  panelModel: { fontSize: 12, color: "#888", fontWeight: "600" },
  panelScroll: { maxHeight: 210 },
  error: { color: "#d00", fontSize: 14, textAlign: "center" },
  box: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  input: { fontSize: 16, padding: 0, color: "#000" },
  webNoScroll: { overflow: "hidden" },
  controlRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  dropdownWrap: { position: "relative" },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  dropdownText: { fontSize: 13, color: "#333", maxWidth: 120 },
  menu: {
    position: "absolute",
    bottom: 38,
    left: 0,
    minWidth: 160,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 10,
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 14 },
  menuText: { fontSize: 14, color: "#333" },
  spacer: { flex: 1 },
  clearBtn: { marginRight: 8 },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#ccc" },
});

const mdStyles = {
  body: { fontSize: 15, lineHeight: 21, color: "#111" },
  heading1: { fontWeight: "700" as const, fontSize: 15, marginTop: 10, marginBottom: 6 },
  heading2: { fontWeight: "700" as const, fontSize: 15, marginTop: 10, marginBottom: 6 },
  strong: { fontWeight: "700" as const },
  bullet_list: { paddingLeft: 18, marginBottom: 8 },
  ordered_list: { paddingLeft: 18, marginBottom: 8 },
  list_item: { fontSize: 15, lineHeight: 21, color: "#111" },
  paragraph: { marginTop: 0, marginBottom: 8 },
};
