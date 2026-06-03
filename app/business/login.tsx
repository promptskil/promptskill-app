// Screen — Business Login (web, public route)
// Phase 2 — Step 2.4. B2B-styled login form at business.vaineai.com/login.
// POST /auth/login → token + business_id + role.
// Q4 routing: business_id present → /(app)/business, else → /(app)/.
// 401 → generic "Incorrect email or password." (never distinguishes B2C vs B2B).

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import EmailInput from "../../components/EmailInput";
import PasswordInput from "../../components/PasswordInput";
import { apiCall, ApiError } from "../../services/api";
import { setToken, setBusinessContext } from "../../storage/storage";

export default function BusinessLogin() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

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
        account_type: string;
      }>("POST", "/auth/login", {
        email,
        password,
      });

      // Business surface gate — individual accounts are not permitted here.
      // Org access itself is enforced server-side by require_member; this is
      // a front-door UX rule, not the security boundary.
      if (data.account_type !== "admin" && data.account_type !== "employee") {
        setError("This login is for business accounts. Use the email you were invited with.");
        return;
      }

      await setToken(data.token);
      await setBusinessContext(data.business_id, data.account_type);
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
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header — logo links back to /business */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/business")}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Body */}
      <View style={[styles.body, isWide && styles.bodyWide]}>
        <Text style={styles.h1}>Sign in to Vaine for Business</Text>
        <Text style={styles.subtitle}>
          Access your team's prompts, members, and seats.
        </Text>

        <View style={styles.form}>
          <EmailInput
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
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
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Vaine, INC.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  logo: { width: 140, height: 34 },
  body: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 80,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  bodyWide: { paddingHorizontal: 0 },
  h1: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    lineHeight: 24,
  },
  form: { gap: 16, marginBottom: 24 },
  error: { color: "#d00", fontSize: 14, textAlign: "center" },
  button: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  link: { fontSize: 14, color: "#333", textAlign: "center" },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontWeight: "300", color: "#666" },
});
