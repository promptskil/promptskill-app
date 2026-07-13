// Globe compose — write a post first, then choose/create a zone to post into.
// "Post" carries the drafted body to globe/new, which creates the zone + post.

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#444444" />
        </Pressable>
        <Text style={styles.headerTitle}>Write a post</Text>
      </View>
      <View style={styles.content}>
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
        <Pressable
          onPress={next}
          disabled={!body.trim()}
          style={[styles.postBtn, !body.trim() && styles.postBtnDisabled]}
        >
          <Text style={styles.postBtnText}>Post</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 14, fontWeight: "400", color: "#1A1A1A" },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingTop: 8,
  },
  postBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
