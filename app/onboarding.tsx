// Screen 1 — Onboarding — Phase 11, Step 11.6
// GetStarted or Skip → onboarding_complete='true' → Main
// onboarding_complete NOT cleared on logout

import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { setOnboardingComplete } from "../storage/storage";

export default function Onboarding() {
  const router = useRouter();

  async function handleComplete() {
    await setOnboardingComplete(true);
    router.replace("/(app)/");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Vaine</Text>
      <Text style={styles.hook}>
        AI misses what you mean. Until now.
      </Text>
      <Text style={styles.subtitle}>
        You already know what you want. But when you ask, it comes back
        close. Not right. So you try again. And again. And never quite
        get there.
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
  hook: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
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
