// Screen 5 — Profile — Phase 13, Step 13.4
// GET /user on mount. Email update via PATCH /user/email.
// Logout: 8-step sequence — token cleared, onboarding preserved, navigate Login.
// Back gesture: ENABLED

import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EmailField from "../../components/EmailField";
import LogoutButton from "../../components/LogoutButton";
import { apiCall, ApiError, SessionExpiredError } from "../../services/api";
import { clearToken } from "../../storage/storage";

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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

  async function handleLogout() {
    try {
      await apiCall("POST", "/auth/logout");
    } catch {
      // Proceed with local cleanup even if server call fails
    }
    await clearToken();
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
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.header}>Profile</Text>
      </View>

      <View style={styles.section}>
        <EmailField email={email} onSave={handleEmailSave} />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
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
