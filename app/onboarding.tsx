// Screen 1 — Onboarding — Phase 11, Step 11.6
// GetStarted or Skip → onboarding_complete='true' → Main
// onboarding_complete NOT cleared on logout

import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { setOnboardingComplete, getToken } from "../storage/storage";
import { apiCall } from "../services/api";

export default function Onboarding() {
  const router = useRouter();

  async function handleComplete() {
    await setOnboardingComplete(true);
    // Web: checkout is the hard gate — fail CLOSED. Never leak into Main
    // when a card is required or when access can't be confirmed.
    if (Platform.OS === "web") {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/(auth)/login");
          return;
        }
        const { checkout_required } = await apiCall<{
          checkout_required?: boolean;
        }>("POST", "/auth/validate", { token });
        if (checkout_required) {
          const { startCheckout } = await import("../services/billing");
          await startCheckout();
          return;
        }
      } catch {
        router.replace("/(auth)/login");
        return;
      }
    }
    router.replace("/(app)");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Vaine</Text>
      <Text style={styles.subtitle}>
        Turn your thoughts, questions, and ideas into clear AI instructions that ChatGPT, Claude, Gemini, and Grok can execute. No back and forth.
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleComplete}>
          <Text style={styles.primaryButtonText}>Get started</Text>
        </Pressable>

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
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },

});
