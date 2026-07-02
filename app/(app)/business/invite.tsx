// Screen — Business Invite Member
// businessId passed as router param from dashboard — no duplicate API call.
// POST /business/{businessId}/invite on submit.
// 200 → success message, replace to dashboard after 1.5s.
// 400 (seat limit) / 409 (already member or pending invite) → inline error.
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";

export default function BusinessInvite() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit = email.trim().length > 0 && !loading && !success;

  async function handleInvite() {
    setError("");
    setLoading(true);
    try {
      await apiCall(
        "POST",
        `/business/${businessId}/invite`,
        { email: email.trim(), role: "employee" }
      );
      setSuccess(true);
      setTimeout(() => {
        router.replace("/(app)/business");
      }, 1500);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setError("Seat limit reached. Remove a member before inviting.");
        } else if (err.status === 409) {
          setError("This person is already a member or has a pending invite.");
        } else if (err.status === 403) {
          setError("Admin access required.");
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
          onPress={() => router.replace("/(app)/business")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.header}>Invite Member</Text>
      </View>

      {/* Email */}
      <View style={styles.section}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="colleague@example.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={254}
          editable={!loading && !success}
          autoFocus
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? (
        <Text style={styles.successText}>Invite sent. Returning…</Text>
      ) : null}

      <Pressable
        style={[styles.btn, !canSubmit && styles.btnDisabled]}
        onPress={handleInvite}
        disabled={!canSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>Send Invite</Text>
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
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  roleBtnActive: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  roleBtnText: {
    fontSize: 15,
    color: "#666",
  },
  roleBtnTextActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  successText: {
    color: "#4F46E5",
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
