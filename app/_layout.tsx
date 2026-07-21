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
import { apiCall, SessionExpiredError } from "../services/api";

// Public routes — session gate is bypassed for these
const PUBLIC_ROUTES = [
  "/privacy",
  "/reset-password",
  "/login",
];

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
        // Stripe checkout return (web). Handle before the normal gate so a
        // cancel escapes to login and a success lands on Main.
        const checkoutParam =
          Platform.OS === "web" && typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("checkout")
            : null;

        if (checkoutParam === "cancel") {
          router.replace("/(auth)/login");
          return;
        }

        if (checkoutParam === "success") {
          // Just paid — poll /auth/me until the Stripe webhook activates the
          // subscription (checkout_required flips false), then Main.
          for (let i = 0; i < 15; i++) {
            try {
              const { checkout_required } = await apiCall<{
                checkout_required?: boolean;
              }>("GET", "/auth/me");
              if (!checkout_required) {
                router.replace("/(app)");
                return;
              }
            } catch (error) {
              // 401 = no valid session — go to login, don't keep polling.
              if (error instanceof SessionExpiredError) {
                router.replace("/(auth)/login");
                return;
              }
              // other transient — keep polling
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
          // Webhook didn't settle in time — Main anyway; the /generate
          // paywall backstops if the subscription isn't active yet.
          router.replace("/(app)");
          return;
        }

        // Normal gate — probe the authenticated session (cookie on web,
        // bearer on native) via /auth/me. 200 -> Main (or Stripe on web if
        // unpaid); 401 -> Login. The token is never read by JS on web.
        try {
          const { checkout_required } = await apiCall<{
            checkout_required?: boolean;
          }>("GET", "/auth/me");

          // Checkout gate is WEB only — an unpaid account goes to Stripe.
          // Mobile payment is Apple (backend 402 + IAP), so iOS never routes
          // on checkout_required.
          if (checkout_required && Platform.OS === "web") {
            const { startCheckout } = await import("../services/billing");
            await startCheckout();
            return;
          }

          router.replace("/(app)");
          return;
        } catch {
          // 401 (SessionExpiredError, already cleared by apiCall) or network
          // — not authenticated. Fail closed to login.
          router.replace("/(auth)/login");
          return;
        }
      } catch {
        // Fallback -- unexpected failure
        router.replace("/(auth)");
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
      <Stack.Screen name="privacy" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
