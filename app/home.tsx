// Screen — Home (web only)
// Public landing page — shown to unauthenticated web users.
// Inline login form. On success: token + business context stored → Main.
// "Create account" → signup. "Forgot password?" → forgot-password.
// Back gesture: N/A (web only, root route)

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import EmailInput from "../components/EmailInput";
import PasswordInput from "../components/PasswordInput";
import { apiCall, ApiError } from "../services/api";
import { setToken, setBusinessContext } from "../storage/storage";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email.length > 0 && password.length > 0 && !loading;

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const data = await apiCall<{
        token: string;
        business_id: string | null;
        role: string | null;
      }>("POST", "/auth/login", { email, password });
      await setToken(data.token);
      await setBusinessContext(data.business_id, data.role);
      router.replace("/(app)/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.wordmark}>Vaine</Text>
        <Text style={styles.tagline}>Type what you mean.</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <Text style={styles.featureItem}>✓ Generate prompts in seconds</Text>
        <Text style={styles.featureItem}>✓ Works with Claude, ChatGPT, Gemini, and Grok</Text>
        <Text style={styles.featureItem}>✓ Individual and business accounts</Text>
      </View>

      {/* Login form */}
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
          onPress={handleLogin}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </Pressable>
      </View>

      {/* Footer links */}
      <View style={styles.links}>
        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        <Text style={styles.divider}>·</Text>
        <Pressable onPress={() => router.push("/(auth)/")}>
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  hero: {
    alignItems: "center",
    marginBottom: 32,
  },
  wordmark: {
    fontSize: 48,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: "#666",
    fontWeight: "400",
  },
  features: {
    alignSelf: "stretch",
    maxWidth: 400,
    alignSelf: "center",
    marginBottom: 40,
    gap: 8,
  },
  featureItem: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
    marginBottom: 24,
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#000",
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
  links: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  link: {
    fontSize: 14,
    color: "#333",
  },
  divider: {
    fontSize: 14,
    color: "#ccc",
  },
});
