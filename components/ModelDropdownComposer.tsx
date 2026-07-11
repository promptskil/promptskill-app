// ModelDropdownComposer — PLACEHOLDER (not wired to anything).
// Persistent bottom input bar with an upward-opening model dropdown.
// Local state only; the send button is inert.

import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MODELS = ["ChatGPT", "Claude Sonnet", "Claude Opus", "Gemini", "Grok"];

export default function ModelDropdownComposer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  return (
    <View style={styles.bar}>
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

      <View style={styles.row}>
        <Pressable style={styles.dropdown} onPress={() => setOpen((o) => !o)}>
          <Text style={styles.dropdownText} numberOfLines={1}>
            {selected ?? "Select model"}
          </Text>
          <Ionicons name={open ? "chevron-down" : "chevron-up"} size={16} color="#555" />
        </Pressable>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Express your thoughts with Vaine"
            placeholderTextColor="#999"
            multiline
          />
          <Pressable style={styles.sendBtn} onPress={() => {}}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "relative",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dropdownText: { fontSize: 13, color: "#333", maxWidth: 110 },
  menu: {
    position: "absolute",
    left: 16,
    bottom: 84,
    minWidth: 170,
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
  inputWrap: { flex: 1, position: "relative" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  sendBtn: {
    position: "absolute",
    right: 10,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
