// Screen 0 — Account Creation — Phase 11, Step 11.2
// POST /auth/signup -> email verification required -> Check email
// Back gesture: DISABLED

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import EmailInput from "../../components/EmailInput";
import PasswordInput from "../../components/PasswordInput";
import { apiCall, ApiError } from "../../services/api";

export default function AccountCreation() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const canSubmit = email.length > 0 && password.length > 0 && !loading;

  async function handleSignup() {
    setError("");
    setLoading(true);
    try {
      const data = await apiCall<{
        user_id: string;
        email_verification_required: boolean;
      }>("POST", "/auth/signup", {
        email,
        password,
      });
      if (data.email_verification_required) {
        setSubmittedEmail(email);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("An account with this email already exists.");
        } else if (err.status === 400) {
          if (err.message.includes("password")) {
            setError("Password must be at least 8 characters.");
          } else {
            setError("Please enter a valid email.");
          }
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

  if (submittedEmail) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Check your email</Text>
        <Text style={styles.message}>
          We sent a verification link to {submittedEmail}. Verify your email,
          then log in to continue.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>Go to login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create account</Text>

      <View style={styles.form}>
        <EmailInput value={email} onChangeText={setEmail} editable={!loading} />
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
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
    marginBottom: 24,
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
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
  link: {
    fontSize: 14,
    color: "#4F46E5",
    textAlign: "center",
  },
});
