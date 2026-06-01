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
const PUBLIC_ROUTES = ["/privacy", "/business", "/invite/accept"];

// Domain-specific routing — hostname maps to landing route
const BUSINESS_HOSTNAME = "business.vaineai.com";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Hostname-based routing: business.vaineai.com → /business landing
    // (web-only; native platforms have no hostname concept)
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (
        window.location.hostname === BUSINESS_HOSTNAME &&
        pathname !== "/business"
      ) {
        router.replace("/business");
        return;
      }
    }

    // Skip session gate on public routes (privacy policy, business landing, etc.)
    if (PUBLIC_ROUTES.includes(pathname)) {
      return;
    }
    const initializeSession = async () => {
      try {
        const token = await getToken();
        const onboarding = await getOnboardingComplete();

        // State 1: Token absent + onboarding absent/false -> Home (web) / Login (iOS)
        if (!token && (onboarding === null || onboarding === false)) {
          router.replace(Platform.OS === "web" ? "/home" : "/(auth)/login");
          return;
        }

        // State 2: Token absent + onboarding true -> Home (web) / Login (iOS)
        if (!token && onboarding === true) {
          router.replace(Platform.OS === "web" ? "/home" : "/(auth)/login");
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

            // State 4: Token valid + onboarding true -> Main
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
      <Stack.Screen name="invite/accept" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
