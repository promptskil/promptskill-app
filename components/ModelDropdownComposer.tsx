// ModelDropdownComposer — PLACEHOLDER (not wired to anything).
// Text field mirrors TopicInput (auto-grow, no internal scroll, tight).
// Model dropdown lives INSIDE the box. Local state only; send is inert.

import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MODELS = ["ChatGPT", "Claude Sonnet", "Claude Opus", "Gemini", "Grok"];
const MIN_HEIGHT = 24; // one line, tight

export default function ModelDropdownComposer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [height, setHeight] = useState(MIN_HEIGHT);

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

          {text.length > 0 && (
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
          <Pressable style={styles.sendBtn} onPress={() => {}}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </Pressable>
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
  },
  input: { fontSize: 16, padding: 0, color: "#000" },
  webNoScroll: { overflow: "hidden" },
  controlRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  dropdownWrap: { position: "relative" },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#ddd",
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
  sendBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
});
