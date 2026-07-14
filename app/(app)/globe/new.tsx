// Choose-a-zone — bottom sheet (same size/footprint as the write-a-post sheet),
// confined to the globe drawer column. Zone picker + title; on Post it creates
// the zone (+ post from the compose draft) and returns to the feed.

import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";
import {
  clearGlobeDraft,
  getGlobeUsername,
  setGlobeDraft,
  setGlobeUsername,
} from "../../../services/globeDraft";
import { prependCachedPost } from "../../../services/globeFeedStore";
import type { GlobeZone } from "../../../types";

export default function NewZone() {
  const router = useRouter();
  const { body: draftBody } = useLocalSearchParams<{ body?: string }>();
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
    setGlobeDraft({
      kind: "zone",
      domain: cleanDomain,
      title: cleanTitle,
      body: draftBody?.trim() || undefined,
    });
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
      if (draftBody && draftBody.trim()) {
        const post = await apiCall<{
          id: string;
          author_username: string;
          body: string;
          created_at: string;
        }>("POST", `/globe/zones/${zone.id}/posts`, {
          body: draftBody.trim(),
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
      router.dismissTo("/(app)/globe");
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
      <Pressable style={styles.scrim} onPress={() => router.back()} />
      <View style={styles.column}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>
            {draftBody ? "Choose a zone" : "New zone"}
          </Text>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>ZONE</Text>
            <TextInput
              style={[
                styles.input,
                Platform.OS === "web" && ({ outlineStyle: "none" } as any),
              ]}
              placeholder="Choose or add a ZONE"
              placeholderTextColor="#666666"
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
              style={[
                styles.input,
                Platform.OS === "web" && ({ outlineStyle: "none" } as any),
              ]}
              placeholder="Title"
              placeholderTextColor="#666666"
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
              <Text style={styles.buttonText}>
                {draftBody ? "Post" : "Create zone"}
              </Text>
            </Pressable>
          </ScrollView>
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
  title: { fontSize: 15, fontWeight: "600", color: "#1A1A1A", marginBottom: 12 },
  body: { paddingBottom: 8 },
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
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    color: "#1A1A1A",
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
    backgroundColor: "#F5F5F5",
  },
  suggestionText: { fontSize: 12, color: "#1A1A1A" },
  error: { color: "#FF6B6B", fontSize: 12, marginBottom: 10 },
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
