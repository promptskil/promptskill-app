// ModelDropdownComposer — Engine 2 (Frontier Executor) input.
// Paste a prompt, pick a model, run it. The answer is rendered by the parent
// (index.tsx) in the main scroll body via FrontierResult — this component only
// owns the input + model dropdown and reports run state up.

import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiStream, ApiError, SessionExpiredError } from "../services/api";

const MODELS = ["ChatGPT 5.5", "Claude Sonnet", "Gemini", "Grok"];
const MODEL_KEYS: Record<string, string> = {
  "ChatGPT 5.5": "chatgpt",
  "Claude Sonnet": "claude-sonnet",
  "Gemini": "gemini",
  "Grok": "grok",
};
const MIN_HEIGHT = 24;

interface Props {
  onStart: (model: string) => void;
  onChunk: (delta: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
  onCancelled: () => void;
}

export default function ModelDropdownComposer({
  onStart,
  onChunk,
  onDone,
  onError,
  onCancelled,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const canSend = selected !== null && text.length > 0 && !loading;

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    onCancelled();
  }

  async function handleRun() {
    if (selected === null || text.length === 0 || loading) return;
    onStart(selected);
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await apiStream(
        "/run/stream",
        { model: MODEL_KEYS[selected], text },
        onChunk,
        controller.signal
      );
      onDone();
      setText("");
      setHeight(MIN_HEIGHT);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        onCancelled();
        return;
      }
      if (err instanceof SessionExpiredError) {
        onCancelled();
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 429) {
          onError("Limit reached for this model. Try again later.");
        } else if (err.status === 502) {
          onError("The model couldn't complete the request.");
        } else {
          onError("Something went wrong. Please try again.");
        }
      } else {
        onError("Something went wrong. Please try again.");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  return (
    <View style={styles.bar}>
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
          onKeyPress={(e: any) => {
            if (
              Platform.OS === "web" &&
              e?.nativeEvent?.key === "Enter" &&
              !e?.nativeEvent?.shiftKey
            ) {
              e.preventDefault?.();
              if (canSend) handleRun();
            }
          }}
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
  box: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: { fontSize: 16, padding: 0, color: "#1A1A1A", letterSpacing: 0 },
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
