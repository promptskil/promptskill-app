import { useEffect, useMemo, useState } from "react";
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
import type { GlobeZone } from "../../../types";

export default function NewZone() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [title, setTitle] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiCall<{ domains: string[] }>("GET", "/globe/domains")
      .then((r) => setDomains(r.domains))
      .catch(() => {});
  }, []);

  // Autocomplete: presets when empty, filtered while typing, hidden on exact match.
  const suggestions = useMemo(() => {
    const q = domain.trim().toLowerCase();
    if (!q) return domains.slice(0, 8);
    const matches = domains.filter((d) => d.toLowerCase().includes(q));
    if (matches.length === 1 && matches[0].toLowerCase() === q) return [];
    return matches.slice(0, 8);
  }, [domain, domains]);

  async function handleCreate() {
    const cleanTitle = title.trim();
    const cleanDomain = domain.trim();
    if (!cleanDomain || !cleanTitle || submitting) return;
    setError("");
    setSubmitting(true);
    setGlobeDraft({ kind: "zone", domain: cleanDomain, title: cleanTitle });
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
        domain: cleanDomain,
        title: cleanTitle,
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

  const canCreate = !!domain.trim() && !!title.trim() && !submitting;

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
          <Text style={styles.label}>ZONE</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose or add a ZONE"
            placeholderTextColor="#8A8A8A"
            value={domain}
            onChangeText={setDomain}
            autoCapitalize="none"
            maxLength={50}
          />
          {suggestions.length > 0 ? (
            <View style={styles.suggestions}>
              {suggestions.map((d) => (
                <Pressable
                  key={d}
                  style={styles.suggestion}
                  onPress={() => setDomain(d)}
                >
                  <Text style={styles.suggestionText}>{d}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#8A8A8A"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            onPress={handleCreate}
            disabled={!canCreate}
            style={[styles.button, !canCreate && styles.buttonDisabled]}
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
    marginBottom: 12,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  suggestion: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#3A3A3A",
  },
  suggestionText: { fontSize: 12, color: "#EDEDED" },
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
