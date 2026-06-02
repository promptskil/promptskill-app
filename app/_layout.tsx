// Root layout — Phase 10, Step 10.5
// Feeds from: /auth-flow addendum back gesture rules,
//   /data-flow session gate 6-state tree,
//   /input-layer INPUT D.1 App Launch Signal,
//   /full-stack-engineer _layout.tsx
//
// Session gate: reads token + onboarding flag, routes to
// correct screen on app launch. 6 states mapped below.

import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { getToken, getOnboardingComplete, clearToken } from "../storage/storage";
import { apiCall, SessionExpiredError } from "../services/api";

// Public routes — session gate is bypassed for these
const PUBLIC_ROUTES = ["/privacy", "/business", "/business/login", "/invite/accept", "/reset-password"];

// Domain-specific routing — hostname maps to landing route
const BUSINESS_HOSTNAME = "business.vaineai.com";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip session gate on public routes (privacy, business landing,
    // business login, invite accept, reset password).
    if (PUBLIC_ROUTES.includes(pathname)) {
      return;
    }
    const initializeSession = async () => {
      try {
        const token = await getToken();
        const onboarding = await getOnboardingComplete();

        const onBusinessHost =
          Platform.OS === "web" &&
          typeof window !== "undefined" &&
          window.location.hostname === BUSINESS_HOSTNAME;

        // No token: business host → business landing; otherwise
        // Home (web) / Login (iOS). Authenticated users are NOT bounced
        // to the landing (so a reload on the business host stays put).
        if (!token) {
          if (onBusinessHost) {
            router.replace("/business");
          } else {
            router.replace(Platform.OS === "web" ? "/home" : "/(auth)/login");
          }
          return;
        }

        // Token present -- validate with server
        if (token) {
          try {
            await apiCall<{ valid: boolean }>("POST", "/auth/validate");

            // State 3: Token valid + onboarding false/absent -> Onboarding
            if (onboarding === null || onboarding === false) {
              router.replace("/onboarding");
              return;
            }

            // State 4: Token valid + onboarded -> Main (everyone).
            // Admins reach the org panel via the "Manage org" entry on
            // Main (gated on account_type).
            router.replace("/(app)/");
            return;
          } catch (error) {
            // State 5/6: Token invalid or expired
            if (error instanceof SessionExpiredError) {
              // clearToken already called by apiCall on 401
            } else {
              await clearToken();
            }
            router.replace("/(auth)/login");
            return;
          }
        }
      } catch {
        // Fallback -- storage read failure
        router.replace("/(auth)/");
      }
    };

    initializeSession();
  }, []);

  // Stack must always render so the navigator tree exists
  // before router.replace() fires. index.tsx shows a loading
  // spinner as the initial route while session gate resolves.
  return (
    <Stack screenOptions={{ headerShown: false, title: "Vaine" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="business" />
      <Stack.Screen name="business/login" />
      <Stack.Screen name="invite/accept" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
