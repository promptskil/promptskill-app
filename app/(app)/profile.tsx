// Screen 5 — Profile — Phase 13, Step 13.4
// GET /user on mount. Email update via PATCH /user/email.
// Model preference: AsyncStorage only.
// Logout: 8-step sequence — token cleared, onboarding preserved, navigate Login.
// Back gesture: ENABLED

import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import EmailField from "../../components/EmailField";
import PreferencesPanel from "../../components/PreferencesPanel";
import LogoutButton from "../../components/LogoutButton";
import { apiCall, ApiError, SessionExpiredError } from "../../services/api";
import { getDefaultModel, setDefaultModel, clearToken } from "../../storage/storage";
import type { Model } from "../../types";

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [defaultModel, setDefaultModelState] = useState<Model>("claude");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await apiCall<{ id: string; email: string }>(
          "GET",
          "/user"
        );
        setEmail(user.email);
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          router.replace("/(auth)/login");
          return;
        }
      }

      const model = await getDefaultModel();
      setDefaultModelState(model as Model);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleEmailSave(newEmail: string) {
    try {
      const data = await apiCall<{ success: boolean; email: string }>(
        "PATCH",
        "/user/email",
        { email: newEmail }
      );
      setEmail(data.email);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 409) {
          throw new Error("This email is already in use.");
        } else if (err.status === 400) {
          throw new Error("Invalid email format.");
        }
      }
      throw new Error("Something went wrong.");
    }
  }

  function handleModelChange(model: Model) {
    setDefaultModelState(model);
    setDefaultModel(model);
  }

  async function handleLogout() {
    try {
      await apiCall("POST", "/auth/logout");
    } catch {
      // Proceed with local cleanup even if server call fails
    }
    await clearToken();
    // AsyncStorage preserved: onboarding_complete + defaultModel kept
    router.replace("/(auth)/login");
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.section}>
        <EmailField email={email} onSave={handleEmailSave} />
      </View>

      <View style={styles.section}>
        <PreferencesPanel
          defaultModel={defaultModel}
          onModelChange={handleModelChange}
        />
      </View>

      <View style={styles.section}>
        <LogoutButton onLogout={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  loading: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 32,
  },
});
