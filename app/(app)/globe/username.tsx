import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";
import {
  clearGlobeDraft,
  getGlobeDraft,
  setGlobeUsername,
} from "../../../services/globeDraft";
import { prependCachedPost } from "../../../services/globeFeedStore";
import type { GlobeZone } from "../../../types";

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export default function CreateUsername() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const draft = getGlobeDraft();

  useEffect(() => {
    if (!draft) router.replace("/(app)"); // only reachable mid-flow
  }, [draft, router]);

  const draftLine =
    draft?.kind === "zone"
      ? `One step left to post "${draft.title}".`
      : draft?.kind === "compose" && draft.postId
        ? "One step left to post your reply."
        : "One step left to post your message.";

  async function handleOk() {
    const clean = username.trim();
    if (!USERNAME_RE.test(clean)) {
      setError("3–20 characters · letters, numbers, underscore");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiCall<{ username: string }>("POST", "/globe/username", {
        username: clean,
      });
      setGlobeUsername(clean);
      const d = getGlobeDraft();
      if (d?.kind === "zone") {
        const zone = await apiCall<GlobeZone>("POST", "/globe/zones", {
          domain: d.domain,
          title: d.title,
        });
        if (d.body && d.body.trim()) {
          const post = await apiCall<{
            id: string;
            author_username: string;
            body: string;
            created_at: string;
          }>("POST", `/globe/zones/${zone.id}/posts`, {
            body: d.body.trim(),
          });
          prependCachedPost({
            post_id: post.id,
            zone_id: zone.id,
            zone_title: zone.title,
            zone_domain: zone.domain,
            author_username: post.author_username,
            body: post.body,
            created_at: post.created_at,
          });
        }
        clearGlobeDraft();
        router.dismissTo("/(app)");
      } else if (d?.kind === "compose") {
        // Return to the thread; the thread opens the composer (draft kept).
        router.replace({
          pathname: "/(app)/globe/[zoneId]",
          params: { zoneId: d.zoneId },
        });
      } else {
        router.replace("/(app)");
      }
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError && err.status === 409) {
        setError("That username is taken.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError("3–20 characters · letters, numbers, underscore");
      } else {
        setError("Could not save. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#444444" />
        </Pressable>
        <Text style={styles.headerTitle}>Create username</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.draftLine}>{draftLine}</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="jordan_dev"
          placeholderTextColor="#666666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
        />
        <Text style={error ? styles.errorHint : styles.hint}>
          {error || "3–20 characters · letters, numbers, underscore"}
        </Text>
        <Pressable
          onPress={handleOk}
          disabled={submitting}
          style={[styles.button, submitting && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>OK</Text>
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
  body: { padding: 14, width: "100%", maxWidth: 680, alignSelf: "center" },
  draftLine: { fontSize: 12.5, lineHeight: 18, color: "#444444", marginBottom: 16 },
  label: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "#666666",
    marginBottom: 8,
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    color: "#1A1A1A",
    fontSize: 13,
    marginBottom: 8,
  },
  hint: { fontSize: 11.5, color: "#666666", marginBottom: 18 },
  errorHint: { fontSize: 11.5, color: "#FF6B6B", marginBottom: 18 },
  button: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 13, fontWeight: "400", color: "#FFFFFF" },
});
