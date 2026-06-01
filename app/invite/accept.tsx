// Screen — Invite Accept (web, public route)
// User clicks invite email link → lands here with ?token=...
// Auth-gated action: POST /invite/accept (Bearer required).
// If not logged in → prompt to sign in, then return via the email link.

import { useEffect, useState } from "react";
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
import { apiCall, ApiError } from "../../services/api";
import { getToken } from "../../storage/storage";

type State =
  | { kind: "loading" }
  | { kind: "no-token" }
  | { kind: "not-logged-in" }
  | { kind: "success"; businessId: string; role: string }
  | { kind: "error"; message: string };

export default function InviteAccept() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : null;

  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        if (!cancelled) setState({ kind: "no-token" });
        return;
      }

      const sessionToken = await getToken();
      if (!sessionToken) {
        if (!cancelled) setState({ kind: "not-logged-in" });
        return;
      }

      try {
        const result = await apiCall<{
          business_id: string;
          role: string;
        }>("POST", "/invite/accept", { token });
        if (!cancelled) {
          setState({
            kind: "success",
            businessId: result.business_id,
            role: result.role,
          });
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setState({ kind: "error", message: humanError(err.status, err.message) });
        } else {
          setState({
            kind: "error",
            message: "Something went wrong. Please try again.",
          });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/home")}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={[styles.body, isWide && styles.bodyWide]}>
        {state.kind === "loading" && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0a0a0a" />
            <Text style={styles.statusText}>Accepting invite…</Text>
          </View>
        )}

        {state.kind === "no-token" && (
          <View>
            <Text style={styles.h1}>Invite link is invalid</Text>
            <Text style={styles.p}>
              This invite link is missing required information. Check the email
              and click the link again, or contact your inviter for a new one.
            </Text>
          </View>
        )}

        {state.kind === "not-logged-in" && (
          <View>
            <Text style={styles.h1}>Sign in to accept this invite</Text>
            <Text style={styles.p}>
              You need to be signed in to accept a business invite. Sign in,
              then return to this page by clicking the link in your email again.
            </Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.ctaText}>Sign in</Text>
            </Pressable>
          </View>
        )}

        {state.kind === "success" && (
          <View>
            <Text style={styles.h1}>Welcome to the team!</Text>
            <Text style={styles.p}>
              You're now a {state.role} of this business.
            </Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.replace("/(app)/business")}
            >
              <Text style={styles.ctaText}>Go to dashboard</Text>
            </Pressable>
          </View>
        )}

        {state.kind === "error" && (
          <View>
            <Text style={styles.h1}>Could not accept invite</Text>
            <Text style={styles.p}>{state.message}</Text>
            <Pressable
              style={styles.ctaSecondary}
              onPress={() => router.push("/home")}
            >
              <Text style={styles.ctaSecondaryText}>Back to home</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Vaine, INC.</Text>
      </View>
    </ScrollView>
  );
}

function humanError(status: number, fallback: string): string {
  switch (status) {
    case 404:
      return "Invite not found. The link may be invalid or already used.";
    case 410:
      return "Invite has expired. Ask your inviter to send a new one (invites expire after 72 hours).";
    case 403:
      return "This invite was sent to a different email. Sign in with the email that received the invite.";
    case 409:
      return "You're already a member of this business.";
    case 400:
      return "Could not accept the invite — seat limit may be reached.";
    case 401:
      return "Please sign in to accept this invite.";
    default:
      return fallback || "An unexpected error occurred.";
  }
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
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  bodyWide: { paddingHorizontal: 0 },
  center: { alignItems: "center", justifyContent: "center" },
  statusText: { marginTop: 16, fontSize: 16, color: "#666" },
  h1: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 16,
    lineHeight: 40,
  },
  p: { fontSize: 16, lineHeight: 26, color: "#444", marginBottom: 24 },
  cta: {
    backgroundColor: "#0a0a0a",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  ctaText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  ctaSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0a0a0a",
    alignSelf: "flex-start",
  },
  ctaSecondaryText: { color: "#0a0a0a", fontSize: 16, fontWeight: "600" },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontWeight: "300", color: "#666" },
});
