// VerifyCodeForm — 6-digit email verification code entry.
// Wired to POST /auth/verify-email-code; Resend hits /auth/resend-verification.
// Renders inside a parent container (no logo/frame of its own).

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { apiCall, ApiError } from "../services/api";

interface VerifyCodeFormProps {
  email: string;
  onVerified: () => void;
}

export default function VerifyCodeForm({ email, onVerified }: VerifyCodeFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const canVerify = code.length === 6 && !loading;

  async function handleVerify() {
    setError("");
    setLoading(true);
    try {
      await apiCall("POST", "/auth/verify-email-code", { email, code });
      onVerified();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const m = err.message ?? "";
        if (m.includes("too_many_attempts")) {
          setError("Too many attempts. Request a new code.");
        } else if (m.includes("code_expired")) {
          setError("That code has expired. Request a new one.");
        } else {
          setError("That code is invalid.");
        }
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Please wait and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await apiCall("POST", "/auth/resend-verification", { email });
    } catch {
      // fire-and-forget
    }
    setResent(true);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>Check your email</Text>
      <Text style={styles.notice}>
        Enter the 6-digit code we emailed to {email}.
      </Text>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, "").slice(0, 6))}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {resent && !error ? (
        <Text style={styles.notice}>A new code is on its way.</Text>
      ) : null}

      <Pressable
        style={[styles.button, !canVerify && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={!canVerify}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </Pressable>

      <Pressable style={styles.resend} onPress={handleResend} disabled={loading}>
        <Text style={styles.link}>Resend code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  header: { fontSize: 28, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  notice: { fontSize: 14, color: "#333", textAlign: "center" },
  codeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: "center",
  },
  error: { color: "#d00", fontSize: 14, textAlign: "center" },
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#000",
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  resend: { marginTop: 4, alignItems: "center" },
  link: { fontSize: 14, color: "#4F46E5", textAlign: "center" },
});
