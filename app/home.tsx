// Screen — Home (web only)
// Public landing page — shown to unauthenticated web users.
// Cursor-inspired, light theme. Announcement bar + nav + two-column hero +
// AI strip + alternating features + login form + footer.
// Contact modal: "Contact sales" (nav) + "Request a demo" (CTA) → same modal.
// Back gesture: N/A (web only, root route)

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  TextInput,
  Modal,
  Image,
  Linking,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EmailInput from "../components/EmailInput";
import PasswordInput from "../components/PasswordInput";
import { apiCall, ApiError, loginPath } from "../services/api";
import { setToken, setBusinessContext } from "../storage/storage";

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const showSignIn = true;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email.length > 0 && password.length > 0 && !loading;

  // Contact modal state
  const [contactVisible, setContactVisible] = useState(false);
  const [workEmail, setWorkEmail] = useState("");
  const [helpTopic, setHelpTopic] = useState<"support" | "partnership" | "">("");
  const [contactStep, setContactStep] = useState<"form" | "result">("form");

  // Get Access section state
  const [getAccessVisible, setGetAccessVisible] = useState(false);

  // Animation — hero fade-up
  const heroAnim    = useRef(new Animated.Value(0)).current;
  const heroSubAnim = useRef(new Animated.Value(0)).current;
  const heroCTAAnim = useRef(new Animated.Value(0)).current;


  // Animation — feature tabs
  const [activeTab, setActiveTab] = useState(0);
  const tabAnim = useRef(new Animated.Value(1)).current;

  // Animation — cycling CTA text
  const cycleTexts = [
    "AI does the work for you.",
    "You already know what you want. Vaine helps AI understand you.",
    "Less switching. Less rewriting. Less stopping to explain yourself again.",
  ];
  const [cycleIndex, setCycleIndex] = useState(0);
  const cycleAnim = useRef(new Animated.Value(1)).current;

  // Hero fade-up on mount
  useEffect(() => {
    Animated.stagger(160, [
      Animated.timing(heroAnim,    { toValue: 1, duration: 640, useNativeDriver: true }),
      Animated.timing(heroSubAnim, { toValue: 1, duration: 640, useNativeDriver: true }),
      Animated.timing(heroCTAAnim, { toValue: 1, duration: 640, useNativeDriver: true }),
    ]).start();
  }, []);


  // Tab fade transition
  function switchTab(i: number) {
    Animated.timing(tabAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setActiveTab(i);
      Animated.timing(tabAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    });
  }

  // Cycling CTA text — every 3.5 s
  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(cycleAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setCycleIndex(prev => (prev + 1) % cycleTexts.length);
        Animated.timing(cycleAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  function openContact() {
    setWorkEmail("");
    setHelpTopic("");
    setContactStep("form");
    setContactVisible(true);
  }

  function openPartnership() {
    setHelpTopic("partnership");
    setContactStep("result");
    setContactVisible(true);
  }

  function handleContactContinue() {
    if (!workEmail || !helpTopic) return;
    setContactStep("result");
  }

  function closeContact() {
    setContactVisible(false);
    setContactStep("form");
  }

  const contactEmail =
    helpTopic === "support" ? "support@vaineai.com" : "partnership@vaineai.com";

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const data = await apiCall<{
        token: string;
        business_id: string | null;
        role: string | null;
      }>("POST", loginPath(), { email, password });
      await setToken(data.token);
      await setBusinessContext(data.business_id, data.role);
      router.replace("/(app)/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Nav ── */}
      <View style={styles.navOuter}>
        <View style={[styles.nav, isWide && styles.navConstrained]}>
          <Image
            source={require("../assets/logo1.png")}
            style={styles.navLogo}
            resizeMode="contain"
          />
          <View style={styles.navRight}>
            <Pressable onPress={openContact}>
              <Text style={styles.navContactSales}>Contact sales</Text>
            </Pressable>
            {showSignIn && (
              <Pressable
                style={styles.navSignIn}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.navSignInText}>Sign in</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* ── Platform Strip ── */}
      <View style={styles.marqueeOuter}>
        <View style={styles.marqueeStatic}>
          {["ChatGPT", "Claude", "Gemini", "Grok"].map((name, i) => (
            <View key={name} style={styles.marqueeItem}>
              {i > 0 && <View style={styles.marqueeDot} />}
              <Text style={styles.marqueeText}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Get Access Section ── */}
      <View style={styles.getAccessSection}>
        <Animated.View style={[styles.cycleTextWrap, { opacity: cycleAnim }]}>
          <Text style={styles.cycleText}>{cycleTexts[cycleIndex]}</Text>
        </Animated.View>
        <Pressable style={styles.getAccessBtn} onPress={() => setGetAccessVisible(v => !v)}>
          <Text style={styles.getAccessBtnText}>Get Access</Text>
        </Pressable>
        {getAccessVisible && (
          <View style={styles.getAccessEmails}>
            <Pressable style={styles.getAccessRow} onPress={() => Linking.openURL('mailto:support@vaineai.com')}>
              <Text style={styles.getAccessLabel}>Personal</Text>
              <Text style={styles.getAccessEmail}>support@vaineai.com</Text>
            </Pressable>
            <View style={styles.getAccessDivider} />
            <Pressable style={styles.getAccessRow} onPress={() => Linking.openURL('mailto:partnership@vaineai.com')}>
              <Text style={styles.getAccessLabel}>Business</Text>
              <Text style={styles.getAccessEmail}>partnership@vaineai.com</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Contact Modal ── */}
      <Modal
        visible={contactVisible}
        transparent
        animationType="fade"
        onRequestClose={closeContact}
      >
        <Pressable style={styles.modalOverlay} onPress={closeContact}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Close */}
            <Pressable style={styles.modalClose} onPress={closeContact}>
              <Ionicons name="close" size={20} color="#999" />
            </Pressable>

            {contactStep === "form" ? (
              <>
                <Text style={styles.modalTitle}>Contact our sales team</Text>

                <Text style={styles.modalLabel}>Work email *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={workEmail}
                  onChangeText={setWorkEmail}
                  placeholder="you@company.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.modalLabel}>What can we help you with? *</Text>
                <View style={styles.modalSelector}>
                  <Pressable
                    style={[
                      styles.modalOption,
                      helpTopic === "support" && styles.modalOptionSelected,
                    ]}
                    onPress={() => setHelpTopic("support")}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        helpTopic === "support" && styles.modalOptionTextSelected,
                      ]}
                    >
                      Support
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modalOption,
                      styles.modalOptionBorderTop,
                      helpTopic === "partnership" && styles.modalOptionSelected,
                    ]}
                    onPress={() => setHelpTopic("partnership")}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        helpTopic === "partnership" && styles.modalOptionTextSelected,
                      ]}
                    >
                      Partnership
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  style={[
                    styles.modalContinue,
                    (!workEmail || !helpTopic) && styles.modalContinueDisabled,
                  ]}
                  onPress={handleContactContinue}
                  disabled={!workEmail || !helpTopic}
                >
                  <Text style={styles.modalContinueText}>Continue</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Contact our sales team</Text>
                <Text style={styles.modalResultLabel}>Reach us at</Text>
                <Text style={styles.modalResultEmail}>{contactEmail}</Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
  },

  // ── Announcement Bar ──
  announcementBar: {
    backgroundColor: "#111",
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  announcementText: {
    color: "#d1d5db",
    fontSize: 13,
    fontWeight: "400",
  },

  // ── Nav ──
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  navContactSales: {
    fontSize: 14,
    color: "#555",
    fontWeight: "400",
  },
  navOuter: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 32,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  navConstrained: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  navLogo: {
    width: 90,
    height: 28,
  },
  navLinks: {
    flexDirection: "row",
    gap: 32,
  },
  navLink: {
    fontSize: 15,
    color: "#555",
    fontWeight: "300",
  },
  navSignIn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navSignInText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
  },

  // ── Section wrappers ──
  sectionOuter: {
    paddingHorizontal: 32,
    paddingVertical: 160,
  },
  heroSection: {
    paddingVertical: 200,
  },
  sectionAlt: {
    backgroundColor: "#fafafa",
  },
  inner: {
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },

  // ── Hero ──
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 64,
  },
  heroLeft: {
    flex: 1,
  },
  heroLeftWide: {
    maxWidth: 500,
  },
  heroHeadline: {
    fontSize: 48,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -1.5,
    lineHeight: 58,
    marginBottom: 64,
  },
  heroHeadlineWide: {
    fontSize: 64,
    lineHeight: 74,
  },
  heroSub: {
    fontSize: 17,
    color: "#555",
    lineHeight: 30,
    marginBottom: 72,
    fontWeight: "300",
    maxWidth: 560,
  },
  heroCtas: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
  },
  dlChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  dlChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  ctaPrimary: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  ctaPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ctaSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },
  ctaSecondaryText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "400",
  },

  // ── Home Image ──
  homeImageWrap: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  homeImageWrapWide: {
    paddingVertical: 80,
  },
  homeImage: {
    width: "100%",
    maxWidth: 300,
    aspectRatio: 556 / 633,
    alignSelf: "center",
  },
  homeImageWide: {
    maxWidth: 460,
  },

  // ── Feature sections ──
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 80,
  },
  featureRowReverse: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 80,
  },
  featureText: {
    flex: 1,
  },
  featureHalf: {
    flex: 1,
  },
  featureHeadline: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.8,
    lineHeight: 44,
    marginBottom: 16,
  },
  featureBody: {
    fontSize: 17,
    color: "#666",
    lineHeight: 32,
    fontWeight: "300",
    maxWidth: 560,
  },
  featureBodyCentered: {
    textAlign: "center",
    maxWidth: 560,
    alignSelf: "center",
  },
  featureCenteredWrap: {
    alignItems: "center",
    marginBottom: 56,
  },
  textCenter: {
    textAlign: "center",
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    gap: 14,
  },
  featureCardLabel: {
    fontSize: 10,
    color: "#bbb",
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featureCardText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  featureCardArrow: {
    alignItems: "center",
    paddingVertical: 2,
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  toolRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  toolDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  toolName: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },

  // ── User Cards ──
  userCards: {
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
    gap: 16,
  },
  userCardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  userCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 24,
    gap: 14,
    backgroundColor: "#fff",
  },
  userCardType: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  userCardDesc: {
    fontSize: 15,
    color: "#111",
    lineHeight: 24,
    fontWeight: "400",
  },
  userCardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  userCardTag: {
    backgroundColor: "#fef9f0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  userCardTagText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "400",
  },

  // ── Login Section ──
  loginSection: {
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  loginHeadline: {
    marginBottom: 40,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
    marginBottom: 24,
  },
  errorText: {
    color: "#d00",
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
  authLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authLink: {
    fontSize: 14,
    color: "#555",
  },
  authDivider: {
    fontSize: 14,
    color: "#ccc",
  },

  // ── Contact Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 440,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
  },
  modalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111",
    marginBottom: 20,
  },
  modalSelector: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 24,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  modalOptionBorderTop: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  modalOptionSelected: {
    backgroundColor: "#f3f4f6",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#444",
  },
  modalOptionTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  modalContinue: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalContinueDisabled: {
    backgroundColor: "#ccc",
  },
  modalContinueText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  modalResultLabel: {
    fontSize: 15,
    color: "#666",
    marginBottom: 8,
  },
  modalResultEmail: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    letterSpacing: -0.3,
  },

  // ── Footer ──
  footerOuter: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerTop: {
    paddingHorizontal: 32,
    paddingVertical: 64,
    alignItems: "center",
  },
  footerCols: {
    gap: 40,
    width: "100%",
    maxWidth: 1100,
  },
  footerColsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 64,
  },
  footerCol: {
    gap: 12,
  },
  footerColTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  footerColLink: {
    fontSize: 13,
    color: "#666",
    lineHeight: 22,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  footerBottomText: {
    fontSize: 13,
    color: "#aaa",
  },

  // ── Platform Marquee ──
  marqueeOuter: {
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 14,
  },
  marqueeStatic: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    gap: 8,
  },
  marqueeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  marqueeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#bbb",
    marginRight: 10,
  },
  marqueeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    letterSpacing: 0.3,
  },

  // ── Feature Tabs ──
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 32,
    paddingHorizontal: 24,
    gap: 4,
  },
  tabBarWide: {
    paddingHorizontal: 48,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: "#000",
  },
  tabBtnText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "400",
  },
  tabBtnTextActive: {
    color: "#000",
    fontWeight: "600",
  },

  // ── Cycling CTA text ──
  cycleTextWrap: {
    marginBottom: 24,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  cycleText: {
    fontSize: 17,
    color: "#555",
    textAlign: "center",
    fontWeight: "300",
    lineHeight: 26,
  },

  // ── Get Access ──
  getAccessSection: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  getAccessBtn: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 18,
  },
  getAccessBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  getAccessEmails: {
    marginTop: 32,
    width: "100%",
    maxWidth: 480,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  getAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  getAccessDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  getAccessLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  getAccessEmail: {
    fontSize: 15,
    color: "#4F46E5",
    fontWeight: "400",
  },
});
 