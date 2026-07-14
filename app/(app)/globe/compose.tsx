// Globe compose — small bottom sheet over the feed (feed stays visible behind).
// Write a post, then "Post" carries the body to globe/new (choose/create zone).

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
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Write a post</Text>
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
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  scrim: { ...StyleSheet.absoluteFillObject },
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
  title: { fontSize: 15, fontWeight: "600", color: "#1A1A1A", marginBottom: 10 },
  input: {
    minHeight: 90,
    maxHeight: 200,
    fontSize: 16,
    color: "#1A1A1A",
    paddingTop: 4,
    marginBottom: 14,
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
