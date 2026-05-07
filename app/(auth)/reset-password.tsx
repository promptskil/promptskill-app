// Screen 0D — Reset Password — Phase 11, Step 11.5
// Deep link: promptskill://reset-password?token={token}
// POST /auth/reset-password → success → Login
// Three error states: token_expired, token_used, token_invalid
// Back gesture: DISABLED

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PasswordInput from "../../components/PasswordInput";
import ResetButton from "../../components/ResetButton";
import { apiCall, ApiError } from "../../services/api";

function getTokenErrorMessage(message: string): string {
  if (message.includes("token_expired")) {
    return "This reset link has expired. Request a new one.";
  }
  if (message.includes("token_used")) {
    return "This reset link has already been used. Request a new one.";
  }
  if (message.includes("token_invalid")) {
    return "This reset link is invalid.";
  }
  if (message.includes("password")) {
    return "Password must be at least 8 characters.";
  }
  return "Something went wrong. Please try again.";
}

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = password.length > 0 && !loading;

  async function handleReset() {
    setError("");
    setLoading(true);
    try {
      await apiCall("POST", "/auth/reset-password", {
        token: token ?? "",
        password,
      });
      router.replace("/(auth)/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getTokenErrorMessage(err.message));
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reset password</Text>

      <View style={styles.form}>
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          placeholder="New password"
        />

        {error ? (
          <View>
            <Text style={styles.error}>{error}</Text>
            <Pressable
              onPress={() => router.push("/(auth)/forgot-password")}
              style={styles.retryLink}
            >
              <Text style={styles.link}>Request a new reset link</Text>
            </Pressable>
          </View>
        ) : null}

        <ResetButton
          onPress={handleReset}
          disabled={!canSubmit}
          loading={loading}
        />
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
  retryLink: {
    marginTop: 8,
  },
  link: {
    fontSize: 14,
    color: "#4F46E5",
    textAlign: "center",
  },
});
