// Screen 0C — Forgot Password — Phase 11, Step 11.4
// POST /auth/forgot-password → ConfirmationMessage replaces button
// 404 → "No account found with that email."
// Back gesture: ENABLED

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import EmailInput from "../../components/EmailInput";
import { apiCall, ApiError } from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = email.length > 0 && !loading;

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await apiCall("POST", "/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError("No account found with that email.");
        } else if (err.status === 400) {
          setError("Please enter a valid email address.");
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
      <Text style={styles.header}>Forgot password?</Text>

      <View style={styles.form}>
        <EmailInput
          value={email}
          onChangeText={setEmail}
          editable={!loading && !sent}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {sent ? (
          <Text style={styles.confirmation}>
            Check your inbox. A reset link has been sent.
          </Text>
        ) : (
          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send reset link</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
  },
  confirmation: {
    fontSize: 16,
    color: "#28a745",
    textAlign: "center",
    padding: 14,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
