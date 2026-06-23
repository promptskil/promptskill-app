// Screen — Privacy Policy (public route, no auth gate)
// Source content: vaine-extension/privacy-policy.md (Effective 2026-05-19)
// Referenced from: Chrome Web Store submission privacy URL,
//                  store-listing.md privacy field.

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

export default function Privacy() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header — logo only, click to home */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/home")}>
          <Image
            source={require("../assets/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Body */}
      <View style={[styles.body, isWide && styles.bodyWide]}>
        <Text style={styles.h1}>Privacy Policy</Text>
        <Text style={styles.meta}>Effective date: May 19, 2026</Text>
        <Text style={styles.meta}>Last updated: May 19, 2026</Text>

        <Text style={styles.h2}>What Vaine Collects</Text>
        <Text style={styles.p}>
          Vaine collects only what is necessary to provide the service.
        </Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Account data:</Text>{" "}
          When you log in, Vaine stores your session token and business context
          (if applicable) locally on your device or in your browser. This data
          is used only to authenticate your requests to the Vaine API.
        </Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Prompt data:</Text>{" "}
          When you generate a prompt, the topic you enter and the prompt result
          are sent to the Vaine API and stored in your account history. This
          data is associated with your account and visible only to you (or your
          organization admin, if you are a business account member).
        </Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Usage data:</Text>{" "}
          Vaine does not collect analytics, tracking data, or any data beyond
          what is required to generate and store prompts.
        </Text>

        <Text style={styles.h2}>What Vaine Does Not Collect</Text>
        <Text style={styles.bullet}>
          • Vaine does not read the content of any web page you visit
        </Text>
        <Text style={styles.bullet}>
          • Vaine does not track your browsing history
        </Text>
        <Text style={styles.bullet}>
          • Vaine does not sell or share your data with third parties
        </Text>
        <Text style={styles.bullet}>
          • Vaine does not use advertising or analytics SDKs
        </Text>

        <Text style={styles.h2}>Data Storage</Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Local storage:</Text>{" "}
          Session token and preferences are stored on your device (iOS
          SecureStore) or in your browser (chrome.storage.local for the Chrome
          extension; localStorage for web).
        </Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Remote storage:</Text>{" "}
          Prompts and account data are stored on Vaine servers hosted on
          Railway (railway.app).
        </Text>
        <Text style={styles.p}>
          <Text style={styles.bold}>Email:</Text>{" "}
          Your email address is stored as your account identifier and used only
          for authentication and transactional emails (password reset,
          organization invite).
        </Text>

        <Text style={styles.h2}>Network Requests</Text>
        <Text style={styles.p}>
          Vaine makes network requests to the Vaine API hosted on Railway. No
          other external domains are contacted.
        </Text>

        <Text style={styles.h2}>Data Deletion</Text>
        <Text style={styles.p}>
          You can delete your prompt history at any time from within the app or
          extension. To delete your account and all associated data, contact{" "}
          <Text style={styles.link}>support@vaineai.com</Text>.
        </Text>

        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>
          Questions about this policy:{" "}
          <Text style={styles.link}>support@vaineai.com</Text>
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
  },
  logo: { width: 90, height: 28 },
  body: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 80,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  bodyWide: { paddingHorizontal: 0 },
  h1: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 12,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0a0a0a",
    marginTop: 40,
    marginBottom: 16,
  },
  p: {
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 26,
    color: "#333",
    marginBottom: 16,
  },
  meta: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 26,
    color: "#333",
    marginBottom: 8,
    paddingLeft: 8,
  },
  bold: { fontWeight: "600" },
  link: { color: "#0066cc", textDecorationLine: "underline" },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
  },
});
