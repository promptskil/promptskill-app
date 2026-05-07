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
      <Text style={styles.subtitle}>
<<<<<<< HEAD
        Type what you mean. Vaine structures it. ChatGPT, Claude, Gemini, and Grok execute it. Get what you meant.{"\n\n"}Stop retrying. Start getting what you meant.
=======
        Generate high-quality prompts for any AI model. Pick a model, enter a
        topic, and get a crafted prompt in seconds.
>>>>>>> main
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleComplete}>
          <Text style={styles.primaryButtonText}>Get started</Text>
        </Pressable>

<<<<<<< HEAD
=======
        <Pressable style={styles.skipButton} onPress={handleComplete}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
>>>>>>> main
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
<<<<<<< HEAD
    marginBottom: 40,
=======
    marginBottom: 48,
>>>>>>> main
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
<<<<<<< HEAD

=======
  skipButton: {
    padding: 14,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    color: "#4F46E5",
  },
>>>>>>> main
});
