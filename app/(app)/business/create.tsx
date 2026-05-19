// Screen — Business Create
// POST /business/create on submit.
// 200 → replace to dashboard.
// 409 → show brief message, then replace to dashboard (business exists — let
//        GET /business/mine verify state).
// Back gesture: ENABLED
// Back arrow: router.replace to dashboard

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";

export default function BusinessCreate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim().length > 0 && !loading;

  async function handleCreate() {
    setError("");
    setLoading(true);
    try {
      await apiCall<{ id: string; name: string }>(
        "POST",
        "/business/create",
        { name: name.trim() }
      );
      router.replace("/(app)/business/");
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("You already have a business.");
          setTimeout(() => {
            router.replace("/(app)/business/");
          }, 1500);
          return;
        } else if (err.status === 400) {
          setError("Invalid business name.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.replace("/(app)/business/")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.header}>Create Organization</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Organization name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Acme Inc."
          placeholderTextColor="#aaa"
          maxLength={128}
          editable={!loading}
          autoFocus
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.btn, !canSubmit && styles.btnDisabled]}
        onPress={handleCreate}
        disabled={!canSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>Create</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnDisabled: {
    backgroundColor: "#ccc",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
