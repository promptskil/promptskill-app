// Screen — Home (web only)
// Public landing page — shown to unauthenticated web users.
// Structure: nav -> hero (2 clickable 3D mock-screen stacks) -> image+title
//            -> download (1 mobile badge) -> notice band -> footer -> chat widget.
// Contact modal: opened from "Contact sales" (nav) and the hero CTA.

import { useState, type ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TextInput,
  Modal,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ACCENT = "#1acb97";

// ── 3D stack position per slot (0 = back, 1 = mid, 2 = front) ───────────────
// 3D straight stack: cards centered + aligned, tilted back, one behind another
function posStyle(pos: number, count: number) {
  const depth = count - 1 - pos; // 0 = front-most
  return {
    transform: [
      { perspective: 1400 },
      { rotateX: "8deg" },
      { translateY: -depth * 22 },
      { scale: 1 - depth * 0.06 },
    ],
    zIndex: pos + 1,
  };
}

// web-only smooth fade/move for dissolve
const fadeStyle = {
  transitionProperty: "opacity, transform",
  transitionDuration: "360ms",
  transitionTimingFunction: "ease",
} as any;

// ── A clickable, static 3D stack of 3 screens (cycles front->back on press) ──
function Stack3D({ screens, wide }: { screens: ReactNode[]; wide: boolean }) {
  const [visible, setVisible] = useState<number[]>(() => screens.map((_, i) => i));
  const [fading, setFading] = useState<number | null>(null);

  const dissolve = () => {
    if (fading !== null || visible.length === 0) return;
    const front = visible[visible.length - 1];
    setFading(front);
    setTimeout(() => {
      setVisible((v) => {
        const next = v.filter((i) => i !== front);
        return next.length === 0 ? screens.map((_, i) => i) : next;
      });
      setFading(null);
    }, 360);
  };

  return (
    <Pressable style={[s.stack, !wide && s.stackNarrow]} onPress={dissolve} accessibilityRole="button">
      {visible.map((idx, pos) => (
        <View
          key={idx}
          style={[
            s.mock,
            wide ? null : s.mockNarrow,
            posStyle(pos, visible.length),
            fadeStyle,
            { opacity: idx === fading ? 0 : 1 },
          ]}
        >
          {screens[idx]}
        </View>
      ))}
    </Pressable>
  );
}

const Bar = () => (
  <View style={s.bar}>
    <View style={[s.dot, { backgroundColor: "#f87171" }]} />
    <View style={[s.dot, { backgroundColor: "#fbbf24" }]} />
    <View style={[s.dot, { backgroundColor: "#34d399" }]} />
  </View>
);

const ScreenForm = ({ cta }: { cta: string }) => (
  <View>
    <Bar />
    <View style={s.screen}>
      <Text style={s.mLogo}>[ logo ]</Text>
      <View style={s.mInput} />
      <View style={[s.mInput, { width: "70%" }]} />
      <View style={s.mBtn}>
        <Text style={s.mBtnT}>{cta}</Text>
      </View>
    </View>
  </View>
);

const ScreenOutput = ({ chip }: { chip: string }) => (
  <View>
    <Bar />
    <View style={s.screen}>
      {["90%", "70%", "95%", "60%", "80%"].map((w, i) => (
        <View key={i} style={[s.mLine, { width: w as any }]} />
      ))}
      <View style={s.mChip}>
        <Text style={s.mChipT}>{chip}</Text>
      </View>
    </View>
  </View>
);

const ScreenList = ({ items, sel }: { items: string[]; sel: number }) => (
  <View>
    <Bar />
    <View style={s.screen}>
      {items.map((it, i) => (
        <View key={i} style={[s.mRow, i === sel ? s.mRowSel : null]}>
          <View style={[s.mRowDot, i === sel ? s.mRowDotSel : null]} />
          <Text style={[s.mRowT, i === sel ? s.mRowTSel : null]}>{it}</Text>
        </View>
      ))}
    </View>
  </View>
);

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const showSignIn = true;

  // Contact modal
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

  const set1: ReactNode[] = [
    <ScreenForm cta="[ Generate ]" />,
    <ScreenOutput chip="[ Result ]" />,
    <ScreenList items={["[ Option A ]", "[ Option B ]", "[ Option C ]", "[ Option D ]"]} sel={1} />,
  ];
  const set2: ReactNode[] = [
    <ScreenOutput chip="[ Detail ]" />,
    <ScreenList items={["[ Item 1 ]", "[ Item 2 ]", "[ Item 3 ]", "[ Item 4 ]"]} sel={0} />,
    <ScreenForm cta="[ Action ]" />,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Nav */}
        <View style={s.navWrap}>
          <View style={[s.wrap, s.nav]}>
            <Image source={require("../assets/logo1.png")} style={s.navLogo} resizeMode="contain" />
            <View style={s.navRight}>
              <Pressable onPress={openContact}>
                <Text style={s.navContact}>Contact sales</Text>
              </Pressable>
              {showSignIn && (
                <Pressable style={s.signIn} onPress={() => router.push("/(auth)/login")}>
                  <Text style={s.signInT}>Sign in</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Hero */}
        <View style={[s.wrap, s.hero]}>
          <Text style={s.eyebrow}>[ ANNOUNCEMENT HEADING ]</Text>
          <Text style={s.h1}>[ Main headline goes here ]</Text>
          <Pressable style={s.cta} onPress={openContact}>
            <Text style={s.ctaT}>[ Primary CTA ]</Text>
          </Pressable>

          <Text style={s.stackTitle}>[ SCREENSHOT / IMAGE — SET 1 ]</Text>
          <Stack3D screens={set1} wide={isWide} />

          <Text style={s.stackTitle}>[ SCREENSHOT / IMAGE — SET 2 ]</Text>
          <Stack3D screens={set2} wide={isWide} />
        </View>

        {/* Image + title */}
        <View style={[s.wrap, s.imgSec]}>
          <Text style={s.imgTitle}>[ Section title ]</Text>
          <View style={s.imgBlock}>
            <Text style={s.phT}>[ Image ]</Text>
          </View>
        </View>

        {/* Download */}
        <View style={s.download}>
          <View style={s.wrap}>
            <Text style={s.dlH}>[ Download heading ]</Text>
            <Text style={s.dlSub}>[ Short download subtext ]</Text>
            <View style={s.badges}>
              <Pressable style={s.badge} onPress={() => {}}>
                <View style={s.badgeGlyph}>
                  <Text style={s.badgeGlyphT}>[ic]</Text>
                </View>
                <View>
                  <Text style={s.badgeSmall}>[ DOWNLOAD FOR ]</Text>
                  <Text style={s.badgeBig}>[ iPhone / iOS ]</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Notice band */}
        <View style={s.band}>
          <View style={s.wrap}>
            <Text style={s.bandH}>[ Notice / heading ]</Text>
            <Text style={s.bandP}>[ Supporting paragraph — details, instructions ]</Text>
            <Pressable onPress={openContact}>
              <Text style={s.bandLink}>[ Secondary link / CTA ]</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={[s.wrap, s.footLinks]}>
            <Pressable onPress={() => {}}>
              <Text style={s.footLink}>Privacy</Text>
            </Pressable>
            <Pressable onPress={() => {}}>
              <Text style={s.footLink}>Support</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Floating chat widget */}
      <Pressable style={s.chat} onPress={openContact}>
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
      </Pressable>

      {/* Contact modal */}
      <Modal visible={contactVisible} transparent animationType="fade" onRequestClose={closeContact}>
        <Pressable style={s.modalOverlay} onPress={closeContact}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            <Pressable style={s.modalClose} onPress={closeContact}>
              <Ionicons name="close" size={20} color="#999" />
            </Pressable>
            {contactStep === "form" ? (
              <>
                <Text style={s.modalTitle}>Contact our sales team</Text>
                <Text style={s.modalLabel}>Work email *</Text>
                <TextInput
                  style={s.modalInput}
                  value={workEmail}
                  onChangeText={setWorkEmail}
                  placeholder="you@company.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={s.modalLabel}>What can we help you with? *</Text>
                <View style={s.modalSelector}>
                  <Pressable
                    style={[s.modalOption, helpTopic === "support" && s.modalOptionSel]}
                    onPress={() => setHelpTopic("support")}
                  >
                    <Text style={[s.modalOptionT, helpTopic === "support" && s.modalOptionTSel]}>Support</Text>
                  </Pressable>
                  <Pressable
                    style={[s.modalOption, s.modalOptionBorder, helpTopic === "partnership" && s.modalOptionSel]}
                    onPress={() => setHelpTopic("partnership")}
                  >
                    <Text style={[s.modalOptionT, helpTopic === "partnership" && s.modalOptionTSel]}>Partnership</Text>
                  </Pressable>
                </View>
                <Pressable
                  style={[s.modalContinue, (!workEmail || !helpTopic) && s.modalContinueOff]}
                  onPress={handleContactContinue}
                  disabled={!workEmail || !helpTopic}
                >
                  <Text style={s.modalContinueT}>Continue</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={s.modalTitle}>Contact our sales team</Text>
                <Text style={s.modalResultLabel}>Reach us at</Text>
                <Text style={s.modalResultEmail}>{contactEmail}</Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff" },
  wrap: { width: "100%", maxWidth: 1040, marginHorizontal: "auto", paddingHorizontal: 24 },

  navWrap: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 64 },
  navLogo: { width: 90, height: 28 },
  navRight: { flexDirection: "row", alignItems: "center", gap: 18 },
  navContact: { color: "#6b7280", fontSize: 14, fontWeight: "600" },
  signIn: { backgroundColor: "#0f172a", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  signInT: { color: "#fff", fontSize: 14, fontWeight: "700" },

  hero: { alignItems: "center", paddingTop: 64, paddingBottom: 56 },
  eyebrow: { color: ACCENT, fontSize: 13, fontWeight: "700", letterSpacing: 1, marginBottom: 14 },
  h1: { fontSize: 42, lineHeight: 48, fontWeight: "800", textAlign: "center", color: "#1f2937", maxWidth: 760, marginBottom: 26 },
  cta: { backgroundColor: ACCENT, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 26 },
  ctaT: { color: "#fff", fontSize: 16, fontWeight: "700" },
  stackTitle: { color: "#9aa3af", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 48 },

  stack: { position: "relative", height: 520, width: "100%", maxWidth: 720, marginTop: 28, alignItems: "center", justifyContent: "center" },
  stackNarrow: { height: 340 },
  mock: { position: "absolute", width: 640, height: 400, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, overflow: "hidden", backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 30, shadowOffset: { width: 0, height: 18 } },
  mockNarrow: { width: 340, height: 213 },
  bar: { flexDirection: "row", gap: 6, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: "#f3f4f6", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  dot: { width: 9, height: 9, borderRadius: 5 },
  screen: { flex: 1, padding: 18 },
  mLogo: { fontWeight: "800", color: "#1f2a44", marginBottom: 14 },
  mInput: { height: 30, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, marginBottom: 10, backgroundColor: "#fafafa" },
  mBtn: { marginTop: 8, backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 9, alignItems: "center" },
  mBtnT: { color: "#fff", fontWeight: "700", fontSize: 13 },
  mLine: { height: 10, borderRadius: 5, backgroundColor: "#e8ebef", marginBottom: 10 },
  mChip: { marginTop: 8, alignSelf: "flex-start", borderWidth: 1, borderColor: ACCENT, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
  mChipT: { color: ACCENT, fontSize: 12, fontWeight: "700" },
  mRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, marginBottom: 8 },
  mRowSel: { borderColor: ACCENT, backgroundColor: "rgba(26,203,151,0.07)" },
  mRowDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#cbd5e1" },
  mRowDotSel: { backgroundColor: ACCENT },
  mRowT: { fontSize: 13, color: "#475569" },
  mRowTSel: { color: "#0f172a", fontWeight: "600" },

  imgSec: { alignItems: "center", paddingVertical: 64 },
  imgTitle: { fontSize: 28, fontWeight: "800", color: "#1f2937", marginBottom: 24, textAlign: "center" },
  imgBlock: { width: "100%", maxWidth: 880, height: 380, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" },
  phT: { color: "#9aa3af", fontSize: 14 },

  download: { backgroundColor: "#0f172a", paddingVertical: 64, alignItems: "center" },
  dlH: { color: "#fff", fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  dlSub: { color: "#cbd5e1", textAlign: "center", maxWidth: 520, marginBottom: 26, alignSelf: "center" },
  badges: { flexDirection: "row", justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#000", borderWidth: 1, borderColor: "#2a3344", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  badgeGlyph: { width: 28, height: 28, borderRadius: 7, backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center" },
  badgeGlyphT: { color: "#9aa3af", fontSize: 11 },
  badgeSmall: { color: "#9aa3af", fontSize: 10, letterSpacing: 0.5 },
  badgeBig: { color: "#fff", fontSize: 15, fontWeight: "700" },

  band: { backgroundColor: "#f4f6f8", paddingVertical: 56, alignItems: "center" },
  bandH: { fontSize: 26, fontWeight: "800", color: "#1f2937", textAlign: "center", marginBottom: 12, maxWidth: 680 },
  bandP: { color: "#6b7280", textAlign: "center", maxWidth: 620, marginBottom: 22, alignSelf: "center" },
  bandLink: { fontWeight: "700", color: "#1f2937", textDecorationLine: "underline" },

  footer: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingVertical: 28, alignItems: "center" },
  footLinks: { flexDirection: "row", justifyContent: "center", gap: 24 },
  footLink: { color: "#6b7280", fontSize: 14, fontWeight: "600" },

  chat: { position: "absolute", right: 22, bottom: 22, width: 60, height: 60, borderRadius: 30, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 16, padding: 28 },
  modalClose: { position: "absolute", top: 14, right: 14, padding: 4 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1f2937", marginBottom: 18 },
  modalLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 6 },
  modalInput: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingVertical: 11, paddingHorizontal: 12, fontSize: 14, marginBottom: 8 },
  modalSelector: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 16 },
  modalOption: { paddingVertical: 12, paddingHorizontal: 14 },
  modalOptionBorder: { borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  modalOptionSel: { backgroundColor: "rgba(26,203,151,0.08)" },
  modalOptionT: { fontSize: 14, color: "#374151" },
  modalOptionTSel: { color: "#0f172a", fontWeight: "700" },
  modalContinue: { backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  modalContinueOff: { backgroundColor: "#cbd5e1" },
  modalContinueT: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modalResultLabel: { color: "#6b7280", fontSize: 13, marginBottom: 4 },
  modalResultEmail: { fontSize: 18, fontWeight: "700", color: ACCENT },
});
