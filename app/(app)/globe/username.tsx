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
import type { GlobeZone } from "../../../types";

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export default function CreateUsername() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const draft = getGlobeDraft();

  useEffect(() => {
    if (!draft) router.replace("/(app)/globe"); // only reachable mid-flow
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
        clearGlobeDraft();
        router.replace({
          pathname: "/(app)/globe/[zoneId]",
          params: { zoneId: zone.id },
        });
      } else if (d?.kind === "compose") {
        // Return to the thread; the thread opens the composer (draft kept).
        router.replace({
          pathname: "/(app)/globe/[zoneId]",
          params: { zoneId: d.zoneId },
        });
      } else {
        router.replace("/(app)/globe");
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
          <Ionicons name="arrow-back" size={22} color="#B5B5B5" />
        </Pressable>
        <Text style={styles.headerTitle}>Create username</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.draftLine}>{draftLine}</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="jordan_dev"
          placeholderTextColor="#8A8A8A"
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
      <Pressable
        style={styles.homeBar}
        onPress={() => router.replace("/(app)")}
        hitSlop={8}
      >
        <Ionicons name="home-outline" size={22} color="#EDEDED" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A0A", paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 14, fontWeight: "500", color: "#EDEDED" },
  body: { flex: 1, padding: 14, width: "100%", maxWidth: 680, alignSelf: "center" },
  homeBar: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#242424",
  },
  draftLine: { fontSize: 12.5, lineHeight: 18, color: "#B5B5B5", marginBottom: 16 },
  label: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "#8A8A8A",
    marginBottom: 8,
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#3A3A3A",
    borderRadius: 8,
    backgroundColor: "#161616",
    color: "#EDEDED",
    fontSize: 13,
    marginBottom: 8,
  },
  hint: { fontSize: 11.5, color: "#8A8A8A", marginBottom: 18 },
  errorHint: { fontSize: 11.5, color: "#FF6B6B", marginBottom: 18 },
  button: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 13, fontWeight: "500", color: "#0A0A0A" },
});
