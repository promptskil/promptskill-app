// Screen 0B — Login — Phase 11, Step 11.3
// POST /auth/login → token stored → Main
// 401 → generic "Incorrect email or password." (never distinguishes)
// Back gesture: DISABLED

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import EmailInput from "../../components/EmailInput";
import PasswordInput from "../../components/PasswordInput";
import { apiCall, ApiError, loginPath, onBusinessHost } from "../../services/api";
import {
  setToken,
  setBusinessContext,
  setOnboardingComplete,
} from "../../storage/storage";
import { startCheckout } from "../../services/billing";

export default function Login() {
  const router = useRouter();
  const { verified } = useLocalSearchParams<{ verified?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email.length > 0 && password.length > 0 && !loading;
  const emailVerified = verified === "1";

  const showSignupLink = !onBusinessHost();

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const data = await apiCall<{
        token: string;
        business_id: string | null;
        account_type: string;
        checkout_required: boolean;
      }>("POST", loginPath(), {
        email,
        password,
      });
      await setToken(data.token);
      await setBusinessContext(data.business_id, data.account_type);
      if (data.checkout_required && !onBusinessHost()) {
        await setOnboardingComplete(false);
        if (Platform.OS === "web") {
          await startCheckout();
          return;
        }
        router.replace("/onboarding");
        return;
      }

      if (emailVerified && !onBusinessHost()) {
        await setOnboardingComplete(false);
        router.replace("/onboarding");
        return;
      }

      router.replace("/(app)");
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 403 &&
        err.message.includes("email_not_verified")
      ) {
        setError("Please verify your email before logging in.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("This login is for business accounts. Use the email you were invited with.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo1.png")} style={styles.logo} resizeMode="contain" />

      <View style={styles.form}>
        <EmailInput value={email} onChangeText={setEmail} editable={!loading} />
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {emailVerified ? (
          <Text style={styles.notice}>Email verified. Log in to continue.</Text>
        ) : null}

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

      <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      {showSignupLink && (
        <Pressable
          style={styles.signupLink}
          onPress={() => router.push("/(auth)")}
        >
          <Text style={styles.link}>New here? Create an account</Text>
        </Pressable>
      )}
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
  logo: {
    width: 90,
    height: 28,
    alignSelf: "center",
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
  },
  notice: {
    color: "#166534",
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
  link: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  signupLink: {
    marginTop: 12,
  },
});
