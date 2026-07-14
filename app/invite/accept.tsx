// Screen — Invite Accept (web, public route)
// User clicks the invite email link → lands here with ?token=...
// Unauthenticated: the invited email has no account yet. Setting a
// password creates the employee account.
// POST /invite/accept {token, password} → session issued → Main.

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
import { useRouter, useLocalSearchParams } from "expo-router";
import PasswordInput from "../../components/PasswordInput";
import { apiCall, ApiError } from "../../services/api";
import { setToken, setBusinessContext } from "../../storage/storage";

function humanError(status: number): string {
  switch (status) {
    case 404:
      return "Invite not found. The link may be invalid or already used.";
    case 410:
      return "Invite has expired. Ask your inviter to send a new one " +
        "(invites expire after 72 hours).";
    case 409:
      return "This email already has an account. Sign in instead.";
    case 400:
      return "Could not join — the seat limit may be reached, or the " +
        "password is too short (min 8 characters).";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function InviteAccept() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : null;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = password.length >= 8 && !loading;

  async function handleAccept() {
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      const result = await apiCall<{
        token: string;
        account_type: string;
        business_id: string;
      }>("POST", "/invite/accept", { token, password });
      await setToken(result.token);
      await setBusinessContext(result.business_id, result.account_type);
      // Employees use the normal Main screen.
      router.replace("/(app)");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(humanError(err.status));
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
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Image
            source={require("../../assets/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={[styles.body, isWide && styles.bodyWide]}>
        {!token ? (
          <View>
            <Text style={styles.h1}>Invite link is invalid</Text>
            <Text style={styles.p}>
              This link is missing required information. Check the email and
              click the link again, or ask your inviter for a new one.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.h1}>Join your team</Text>
            <Text style={styles.p}>
              Set a password to finish creating your account.
            </Text>
            <View style={styles.form}>
              <PasswordInput
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                placeholder="Create a password (min 8 characters)"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                style={[styles.cta, !canSubmit && styles.ctaDisabled]}
                onPress={handleAccept}
                disabled={!canSubmit}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.ctaText}>Join</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </View>

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
    paddingTop: 80,
    paddingBottom: 80,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  bodyWide: { paddingHorizontal: 0 },
  h1: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 16,
    lineHeight: 40,
  },
  p: { fontSize: 16, lineHeight: 26, color: "#444", marginBottom: 24 },
  form: { gap: 16 },
  error: { color: "#d00", fontSize: 14 },
  cta: {
    backgroundColor: "#0a0a0a",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  ctaDisabled: { backgroundColor: "#ccc" },
  ctaText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontWeight: "300", color: "#666" },
});
