// Screen — Business landing (web only, public route)
// Shown when visiting business.vaineai.com. Hostname-routed by _layout.tsx.
// Placeholder per Q5 (defer content draft); Phase 2 later steps will refine
// copy, layout, and pricing per D5 marketing decisions.
// Content marker: "Coming Soon" — used by scripts/verify-deploy.js.

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

export default function Business() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header — logo + Sign in */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Image
            source={require("../assets/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
        <Pressable
          style={styles.signIn}
          onPress={() => router.push("/business/login")}
        >
          <Text style={styles.signInText}>Sign in</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.heroTitle}>Vaine for Business — Coming Soon</Text>
        <Text style={styles.heroSubtitle}>
          Calibrated AI prompts for your team. Invite members, manage seats,
          and centralize prompt history across your organization.
        </Text>
        <Text style={styles.heroBody}>
          We're preparing a dedicated business experience. In the meantime,
          existing business accounts can sign in above.
        </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { width: 140, height: 34 },
  signIn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#0a0a0a",
    borderRadius: 6,
  },
  signInText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 80,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  heroWide: { paddingHorizontal: 0 },
  heroTitle: {
    fontSize: 40,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 20,
    lineHeight: 50,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 28,
    color: "#444",
    marginBottom: 16,
  },
  heroBody: {
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 26,
    color: "#666",
  },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontWeight: "300", color: "#666" },
});
