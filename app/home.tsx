// Screen — Home (web only)
// Public landing page — shown to unauthenticated web users.
// Cursor-inspired, light theme. Announcement bar + nav + two-column hero +
// AI strip + alternating features + login form + footer.
// Contact modal: "Contact sales" (nav) + "Request a demo" (CTA) → same modal.
// Back gesture: N/A (web only, root route)

import { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EmailInput from "../components/EmailInput";
import PasswordInput from "../components/PasswordInput";
import { apiCall, ApiError } from "../services/api";
import { setToken, setBusinessContext } from "../storage/storage";

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

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

  function openContact() {
    setWorkEmail("");
    setHelpTopic("");
    setContactStep("form");
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
      }>("POST", "/auth/login", { email, password });
      await setToken(data.token);
      await setBusinessContext(data.business_id, data.role);
      router.replace("/(app)/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
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
      {/* ── Announcement Bar ── */}
      <View style={styles.announcementBar}>
        <Ionicons name="logo-apple" size={13} color="#d1d5db" />
        <Text style={styles.announcementText}>
          Available on iOS and the web for personal and small businesses.
        </Text>
        <Ionicons name="globe-outline" size={13} color="#d1d5db" />
      </View>

      {/* ── Nav ── */}
      <View style={styles.navOuter}>
        <View style={[styles.nav, isWide && styles.navConstrained]}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.navLogo}
            resizeMode="contain"
          />
          <View style={styles.navRight}>
            <Pressable onPress={openContact}>
              <Text style={styles.navContactSales}>Contact sales</Text>
            </Pressable>
            <Pressable
              style={styles.navSignIn}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.navSignInText}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Hero ── */}
      <View style={[styles.sectionOuter, styles.heroSection]}>
        <View style={[styles.inner, isWide && styles.heroRow]}>
          {/* Left */}
          <View style={[styles.heroLeft, isWide && styles.heroLeftWide]}>
            <Text
              style={[styles.heroHeadline, isWide && styles.heroHeadlineWide]}
            >
              Stay in flow{"\n"}with AI.
            </Text>
            <Text style={styles.heroSub}>
              Less back and forth. Less rewriting. More getting work done.{"\n"}You already know what you want. Vaine helps AI understand you.
            </Text>
            <View style={styles.heroCtas}>
              <Pressable
                style={styles.ctaPrimary}
                onPress={() => router.push("/(auth)/")}
              >
                <Text style={styles.ctaPrimaryText}>Get Started →</Text>
              </Pressable>
              <Pressable style={styles.ctaSecondary} onPress={openContact}>
                <Text style={styles.ctaSecondaryText}>Request a demo →</Text>
              </Pressable>
            </View>
          </View>

          {/* Right — product preview */}
          {isWide && (
            <View style={styles.heroRight}>
              <View style={styles.productCard}>
                <View style={styles.productCardHeader}>
                  <View style={[styles.dot, { backgroundColor: "#f87171" }]} />
                  <View style={[styles.dot, { backgroundColor: "#fbbf24" }]} />
                  <View style={[styles.dot, { backgroundColor: "#34d399" }]} />
                  <Text style={styles.productCardTitle}>Vaine</Text>
                </View>
                <View style={styles.productCardBody}>
                  <Text style={styles.previewLabel}>Your idea</Text>
                  <View style={styles.previewInput}>
                    <Text style={styles.previewInputText}>
                      Write a cold email for a SaaS product targeting HR teams
                    </Text>
                  </View>
                  <View style={styles.previewArrow}>
                    <Ionicons name="arrow-down-outline" size={16} color="#bbb" />
                  </View>
                  <Text style={styles.previewLabel}>Generated request</Text>
                  <View style={styles.previewOutput}>
                    <Text style={styles.previewOutputText}>
                      You are an expert B2B copywriter. Write a cold outreach
                      email for HR directors at mid-sized companies. The product
                      automates employee onboarding workflows and reduces time to
                      productivity for new hires...
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── AI Strip ── */}
      <View style={styles.aiStrip}>
        <View style={styles.aiLogos}>
          {["Claude", "ChatGPT", "Gemini", "Grok"].map((name) => (
            <View key={name} style={styles.aiPill}>
              <Text style={styles.aiPillText}>{name}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.aiCaption}>All in one place</Text>
      </View>

      {/* ── Feature 1 — text left, visual right ── */}
      <View style={styles.sectionOuter}>
        <View style={[styles.inner, isWide && styles.featureRow]}>
          <View style={[styles.featureText, isWide && styles.featureHalf]}>
            <Text style={styles.featureHeadline}>
              If you define the problem correctly, you have the solution.
            </Text>
            <Text style={styles.featureBody}>
              AI does the work for you.
            </Text>
          </View>
          {isWide && (
            <View style={styles.featureHalf}>
              <View style={styles.featureCard}>
                <Text style={styles.featureCardLabel}>Input</Text>
                <Text style={styles.featureCardText}>
                  Summarize this research paper for a non-technical audience
                </Text>
                <View style={styles.featureCardArrow}>
                  <Ionicons name="arrow-down-outline" size={14} color="#bbb" />
                </View>
                <Text style={styles.featureCardLabel}>Request</Text>
                <Text style={styles.featureCardText}>
                  You are a science communicator. Summarize the following
                  research paper for a general audience with no technical
                  background. Use clear, everyday language...
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── Feature 2 — visual left, text right ── */}
      <View style={[styles.sectionOuter, styles.sectionAlt]}>
        <View style={[styles.inner, isWide && styles.featureRowReverse]}>
          <View style={[styles.featureText, isWide && styles.featureHalf]}>
            <Text style={styles.featureHeadline}>
              Stay in flow inside ChatGPT, Claude, Gemini, and Grok.
            </Text>
            <Text style={styles.featureBody}>
              Less switching. Less rewriting. Less stopping to explain yourself again.
            </Text>
          </View>
          {isWide && (
            <View style={styles.featureHalf}>
              <View style={styles.featureCard}>
                {["ChatGPT", "Claude", "Gemini", "Grok"].map((tool, i) => (
                  <View
                    key={tool}
                    style={[styles.toolRow, i < 3 && styles.toolRowBorder]}
                  >
                    <View style={styles.toolDot} />
                    <Text style={styles.toolName}>{tool}</Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#34d399"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── Feature 3 — centered, user cards ── */}
      <View style={styles.sectionOuter}>
        <View style={styles.featureCenteredWrap}>

        </View>
        <View style={[styles.userCards, isWide && styles.userCardsRow]}>
          {[
            {
              type: "Small Business",
              tags: ["communication fatigue", "alignment problems", "inconsistent quality", "re-explaining"],
              desc: "Everyone stays aligned. Less repeating. Less confusion. Your team gets on the same page faster.",
              icon: "business-outline" as const,
            },
            {
              type: "Researcher",
              tags: ["misunderstood thoughts", "nuanced ideas", "hates oversimplified outputs", "accuracy"],
              desc: "Feel understood. Say complex ideas clearly without explaining them five different ways.",
              icon: "search-outline" as const,
            },
            {
              type: "Freelancer",
              tags: ["context switching", "works fast", "hates restarting", "values continuity"],
              desc: "Pick up where you left off. Keep momentum without starting over.",
              icon: "laptop-outline" as const,
            },
            {
              type: "Marketer",
              tags: ["speed pressure", "deadline pressure", "volume pressure", "fixing outputs"],
              desc: "Launch faster with quality. Spend less time fixing and more time publishing.",
              icon: "megaphone-outline" as const,
            },
            {
              type: "Consultant",
              tags: ["translating thoughts", "client pressure", "decision fatigue", "wants clarity"],
              desc: "Stay focused. Turn scattered thoughts into clear direction faster.",
              icon: "briefcase-outline" as const,
            },
          ].map((card) => (
            <View key={card.type} style={styles.userCard}>
              <Ionicons name={card.icon} size={22} color="#555" />
              <Text style={styles.userCardType}>{card.type}</Text>
              <View style={styles.userCardTags}>
                {card.tags.map((tag) => (
                  <View key={tag} style={styles.userCardTag}>
                    <Text style={styles.userCardTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.userCardDesc}>{card.desc}</Text>
            </View>
          ))}
        </View>
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

      {/* ── Footer ── */}
      <View style={styles.footerOuter}>
        <View style={styles.footerTop}>
          {/* Columns */}
          <View style={[styles.footerCols, isWide && styles.footerColsRow]}>
            {/* Product */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Product</Text>
              <Text style={styles.footerColLink}>iOS App</Text>
              <Text style={styles.footerColLink}>Enterprise</Text>
              <Text style={styles.footerColLink}>Individual</Text>
            </View>
            {/* Company */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Company</Text>
              <Text style={styles.footerColLink}>About</Text>
              <Text style={styles.footerColLink}>Careers</Text>
              <Text style={styles.footerColLink}>Blog</Text>
            </View>
            {/* Legal */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Legal</Text>
              <Text style={styles.footerColLink}>Terms of Service</Text>
              <Text style={styles.footerColLink}>Privacy Policy</Text>
              <Text style={styles.footerColLink}>Data Use</Text>
              <Text style={styles.footerColLink}>Security</Text>
            </View>
            {/* Connect */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Connect</Text>
              <Text style={styles.footerColLink}>X ↗</Text>
              <Text style={styles.footerColLink}>LinkedIn ↗</Text>
            </View>
          </View>
        </View>
        {/* Bottom bar */}
        <View style={styles.footerBottom}>
          <Text style={styles.footerBottomText}>© 2026 Vaine, INC.</Text>
        </View>
      </View>
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
    width: 140,
    height: 34,
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
  heroRight: {
    flex: 1,
  },

  // ── Product Card ──
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    overflow: "hidden",
  },
  productCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  productCardTitle: {
    fontSize: 13,
    color: "#999",
    marginLeft: 6,
    fontWeight: "500",
  },
  productCardBody: {
    padding: 20,
    gap: 8,
  },
  previewLabel: {
    fontSize: 10,
    color: "#bbb",
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
  },
  previewInputText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  previewArrow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  previewOutput: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  previewOutputText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },
  previewModels: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  modelPill: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modelPillText: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "400",
  },

  // ── AI Strip ──
  aiStrip: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 80,
    alignItems: "center",
    gap: 14,
  },
  aiLogos: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  aiPill: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  aiPillText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "400",
  },
  aiCaption: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "300",
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
});
