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
import { getToken, clearToken } from "../storage/storage";
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
        const token = await getToken();

        // Stripe checkout return (web). Handle before the normal gate so
        // a cancel escapes to login and a success lands on Main — never
        // onboarding, never a re-checkout loop.
        const checkoutParam =
          Platform.OS === "web" && typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("checkout")
            : null;

        if (checkoutParam === "cancel") {
          router.replace("/(auth)/login");
          return;
        }

        if (checkoutParam === "success" && token) {
          // Just paid — poll until the Stripe webhook activates the
          // subscription, then Main. Loading spinner shows meanwhile.
          for (let i = 0; i < 15; i++) {
            try {
              const res = await apiCall<{
                valid: boolean;
                checkout_required?: boolean;
              }>("POST", "/auth/validate", { token });
              if (!res.valid) break;
              if (!res.checkout_required) {
                router.replace("/(app)");
                return;
              }
            } catch {
              // transient — keep polling
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
          // Webhook didn't settle in time — Main anyway; the /generate
          // paywall backstops if the subscription isn't active yet.
          router.replace("/(app)");
          return;
        }

        // No token: business host → business landing; otherwise
        // Home (web) / Login (iOS). Authenticated users are NOT bounced
        // to the landing (so a reload on the business host stays put).
        if (!token) {
          router.replace("/(auth)/login");
          return;
        }

        // Token present -- validate with server.
        // /auth/validate reads the token from the request BODY (always 200,
        // body carries {valid}); the Bearer header alone yields a 422.
        if (token) {
          try {
            const { valid, checkout_required } = await apiCall<{
              valid: boolean;
              checkout_required?: boolean;
            }>(
              "POST",
              "/auth/validate",
              { token },
            );

            // Server rejected the token (expired/invalid) -> Login
            if (!valid) {
              await clearToken();
              router.replace("/(auth)/login");
              return;
            }

            // Checkout gate is WEB only — an unpaid account goes to Stripe.
            // Mobile payment is handled by Apple (backend 402 + IAP), so iOS
            // never routes on checkout_required.
            if (checkout_required && Platform.OS === "web") {
              const { startCheckout } = await import("../services/billing");
              await startCheckout();
              return;
            }

            // Token valid -> Main (everyone).
            router.replace("/(app)");
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
