// Globe compose — small bottom sheet confined to the globe drawer's column
// (right 80% / maxWidth 360), so it opens inside the globe screen, not edge to
// edge. Write a post, then "Post" carries the body to globe/new.

import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GlobeCompose() {
  const router = useRouter();
  const [body, setBody] = useState("");

  function next() {
    if (!body.trim()) return;
    router.push({
      pathname: "/(app)/globe/new",
      params: { body: body.trim() },
    });
  }

  return (
    <View style={styles.root}>
      <Pressable style={styles.scrim} onPress={() => router.back()} />
      <View style={styles.column}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Pressable
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color="#666666" />
          </Pressable>
          <View style={styles.postCard}>
            <TextInput
              style={[
                styles.input,
                Platform.OS === "web" && ({ outlineStyle: "none" } as any),
              ]}
              placeholder="Write a post"
              placeholderTextColor="#666666"
              value={body}
              onChangeText={setBody}
              multiline
              autoFocus
              textAlignVertical="top"
            />
          </View>
          <Pressable
            onPress={next}
            disabled={!body.trim()}
            style={[styles.postBtn, !body.trim() && styles.postBtnDisabled]}
          >
            <Text style={styles.postBtnText}>Post</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row-reverse",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  scrim: { ...StyleSheet.absoluteFillObject },
  column: { width: "80%", maxWidth: 360, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: "55%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDDDDD",
    marginBottom: 12,
  },
  closeBtn: { position: "absolute", top: 10, right: 12, padding: 4, zIndex: 2 },
  postCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 14,
  },
  input: {
    minHeight: 90,
    maxHeight: 200,
    fontSize: 14,
    lineHeight: 20,
    color: "#1A1A1A",
    padding: 0,
  },
  postBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
