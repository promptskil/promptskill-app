// Screen — Home (web only)
// Public landing page — shown to unauthenticated web users.
// Cursor-inspired, light theme. Announcement bar + nav + two-column hero +
// AI strip + alternating features + login form + footer.
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
          Available on iOS and Web for individuals and teams.
        </Text>
        <Ionicons name="globe-outline" size={13} color="#d1d5db" />
      </View>

      {/* ── Nav ── */}
      <View style={styles.navOuter}>
        <View style={[styles.nav, isWide && styles.navConstrained]}>
          <Text style={styles.navWordmark}>Vaine</Text>
          {isWide && (
            <View style={styles.navLinks}>
              <Text style={styles.navLink}>Features</Text>
              <Text style={styles.navLink}>Download</Text>
              <Text style={styles.navLink}>Teams</Text>
            </View>
          )}
          <Pressable
            style={styles.navSignIn}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.navSignInText}>Sign in</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Hero ── */}
      <View style={styles.sectionOuter}>
        <View style={[styles.inner, isWide && styles.heroRow]}>
          {/* Left */}
          <View style={[styles.heroLeft, isWide && styles.heroLeftWide]}>
            <Text
              style={[styles.heroHeadline, isWide && styles.heroHeadlineWide]}
            >
              Stay in flow{"\n"}with AI.
            </Text>
            <Text style={styles.heroSub}>
              Less back and forth. Less rewriting. More getting work done. Use
              ChatGPT, Claude, Gemini, and Grok together in one place — so AI
              feels faster, clearer, and easier to work with.
            </Text>
            <View style={styles.heroCtas}>
              <Pressable
                style={styles.ctaPrimary}
                onPress={() => router.push("/(auth)/")}
              >
                <Text style={styles.ctaPrimaryText}>Get Started →</Text>
              </Pressable>
              <Pressable style={styles.ctaSecondary}>
                <Text style={styles.ctaSecondaryText}>Download Extension →</Text>
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
                  <View style={styles.previewModels}>
                    {["Claude", "ChatGPT", "Gemini", "Grok"].map((m) => (
                      <View key={m} style={styles.modelPill}>
                        <Text style={styles.modelPillText}>{m}</Text>
                      </View>
                    ))}
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
              Generate requests in seconds
            </Text>
            <Text style={styles.featureBody}>
              Describe what you need in plain language. Vaine structures it into
              a clear, high-quality prompt — ready for any AI. No rewriting. No
              second-guessing.
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
              Works inside your favorite AI tools
            </Text>
            <Text style={styles.featureBody}>
              The Vaine Chrome extension lives inside ChatGPT, Claude, Gemini,
              and Grok. Generate the right request directly where you work — no
              tab switching, no interruption.
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
          <Text style={[styles.featureHeadline, styles.textCenter]}>
            Built for individuals and teams
          </Text>
          <Text style={[styles.featureBody, styles.featureBodyCentered]}>
            Personal accounts for solo users. Business accounts with org
            management, member invites, and shared request history.
          </Text>
        </View>
        <View style={[styles.userCards, isWide && styles.userCardsRow]}>
          {[
            {
              type: "Founder",
              desc: "Move faster without losing quality. Generate the right request for every task — writing, research, strategy.",
              icon: "rocket-outline" as const,
            },
            {
              type: "Researcher",
              desc: "Structure complex questions into precise requests. Get better outputs from every model, every time.",
              icon: "search-outline" as const,
            },
            {
              type: "Operator",
              desc: "Standardize requests across your team. Consistent inputs produce consistent results at scale.",
              icon: "people-outline" as const,
            },
          ].map((card) => (
            <View key={card.type} style={styles.userCard}>
              <Ionicons name={card.icon} size={22} color="#555" />
              <Text style={styles.userCardType}>{card.type}</Text>
              <Text style={styles.userCardDesc}>{card.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Login Section ── */}
      <View style={[styles.sectionOuter, styles.loginSection]}>
        <Text style={[styles.featureHeadline, styles.textCenter, styles.loginHeadline]}>
          Start generating better requests.
        </Text>
        <View style={styles.form}>
          <EmailInput
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
        <View style={styles.authLinks}>
          <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
            <Text style={styles.authLink}>Forgot password?</Text>
          </Pressable>
          <Text style={styles.authDivider}>·</Text>
          <Pressable onPress={() => router.push("/(auth)/")}>
            <Text style={styles.authLink}>Create an account</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={styles.footerCopy}>© 2026 Vaine</Text>
        <Text style={styles.footerDot}>·</Text>
        <Text style={styles.footerLink}>Privacy Policy</Text>
        <Text style={styles.footerDot}>·</Text>
        <Text style={styles.footerLink}>Terms</Text>
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
  navWordmark: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
  },
  navLinks: {
    flexDirection: "row",
    gap: 32,
  },
  navLink: {
    fontSize: 15,
    color: "#555",
    fontWeight: "400",
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
    fontWeight: "500",
  },

  // ── Section wrappers ──
  sectionOuter: {
    paddingHorizontal: 32,
    paddingVertical: 96,
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
    marginBottom: 24,
  },
  heroHeadlineWide: {
    fontSize: 64,
    lineHeight: 74,
  },
  heroSub: {
    fontSize: 17,
    color: "#555",
    lineHeight: 30,
    marginBottom: 36,
    fontWeight: "400",
  },
  heroCtas: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  ctaPrimary: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  ctaPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  ctaSecondary: {
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  ctaSecondaryText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
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
    fontSize: 11,
    color: "#aaa",
    fontWeight: "600",
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
    color: "#555",
    fontWeight: "500",
  },

  // ── AI Strip ──
  aiStrip: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 40,
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
    fontWeight: "500",
  },
  aiCaption: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "400",
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
    lineHeight: 30,
    fontWeight: "400",
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
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    gap: 10,
  },
  featureCardLabel: {
    fontSize: 11,
    color: "#aaa",
    fontWeight: "600",
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
    gap: 20,
  },
  userCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 24,
    gap: 10,
    backgroundColor: "#fff",
  },
  userCardType: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  userCardDesc: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
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

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 10,
  },
  footerCopy: {
    fontSize: 13,
    color: "#aaa",
  },
  footerDot: {
    fontSize: 13,
    color: "#ddd",
  },
  footerLink: {
    fontSize: 13,
    color: "#aaa",
  },
});
