import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";
import {
  clearGlobeDraft,
  getGlobeUsername,
  setGlobeDraft,
  setGlobeUsername,
} from "../../../services/globeDraft";
import type { GlobeDomain, GlobeZone } from "../../../types";

const DOMAINS: { value: GlobeDomain; label: string }[] = [
  { value: "startup", label: "Startup" },
  { value: "ai", label: "AI" },
  { value: "finance", label: "Finance" },
  { value: "career", label: "Career" },
  { value: "programming", label: "Programming" },
  { value: "health", label: "Health" },
];

export default function NewZone() {
  const router = useRouter();
  const [domain, setDomain] = useState<GlobeDomain>("startup");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    const clean = title.trim();
    if (!clean || submitting) return;
    setError("");
    setSubmitting(true);
    setGlobeDraft({ kind: "zone", domain, title: clean });
    try {
      let username = getGlobeUsername();
      if (username === undefined) {
        const me = await apiCall<{ username: string | null }>(
          "GET",
          "/globe/me",
        );
        username = me.username;
        setGlobeUsername(me.username);
      }
      if (username === null) {
        router.push("/(app)/globe/username");
        return;
      }
      const zone = await apiCall<GlobeZone>("POST", "/globe/zones", {
        domain,
        title: clean,
      });
      clearGlobeDraft();
      router.replace({
        pathname: "/(app)/globe/[zoneId]",
        params: { zoneId: zone.id },
      });
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        router.push("/(app)/globe/username");
        return;
      }
      setError("Could not create. Try again.");
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
        <Text style={styles.headerTitle}>New zone</Text>
      </View>
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.stepLabel}>Step 1 · choose a domain</Text>
        <View style={styles.chips}>
          {DOMAINS.map((d) => {
            const active = d.value === domain;
            return (
              <Pressable
                key={d.value}
                onPress={() => setDomain(d.value)}
                style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
              >
                <Text
                  style={active ? styles.chipTextActive : styles.chipTextIdle}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.stepLabel}>Step 2 · create the title</Text>
        <TextInput
          style={styles.input}
          placeholder="Finding my first SaaS customers"
          placeholderTextColor="#8A8A8A"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          onPress={handleCreate}
          disabled={!title.trim() || submitting}
          style={[
            styles.button,
            (!title.trim() || submitting) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>Create zone</Text>
        </Pressable>
        </ScrollView>
      </View>
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
  content: { flex: 1, width: "100%", maxWidth: 680, alignSelf: "center" },
  body: { padding: 14 },
  stepLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "#8A8A8A",
    marginBottom: 8,
    marginTop: 6,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  chipActive: { backgroundColor: "#FFFFFF" },
  chipIdle: { borderWidth: 0.5, borderColor: "#3A3A3A" },
  chipTextActive: { fontSize: 12, color: "#0A0A0A" },
  chipTextIdle: { fontSize: 12, color: "#8A8A8A" },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: "#3A3A3A",
    borderRadius: 8,
    backgroundColor: "#161616",
    color: "#EDEDED",
    fontSize: 13,
    marginBottom: 16,
  },
  error: { color: "#FF6B6B", fontSize: 12, marginBottom: 10 },
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
