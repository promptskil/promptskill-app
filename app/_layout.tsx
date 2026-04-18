// Root layout — Phase 10, Step 10.5
// Feeds from: /auth-flow addendum back gesture rules,
//   /data-flow session gate 6-state tree,
//   /input-layer INPUT D.1 App Launch Signal,
//   /full-stack-engineer _layout.tsx
//
// Session gate: reads token + onboarding flag, routes to
// correct screen on app launch. 6 states mapped below.

import { useCallback, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getToken, getOnboardingComplete, clearToken } from "../storage/storage";
import { apiCall, SessionExpiredError } from "../services/api";

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const initializeSession = async () => {
        try {
          const token = await getToken();
          const onboarding = await getOnboardingComplete();

          // State 1: Token absent + onboarding absent/false → Account creation
          if (!token && (onboarding === null || onboarding === false)) {
            router.replace("/(auth)/");
            setReady(true);
            return;
          }

          // State 2: Token absent + onboarding true → Login
          if (!token && onboarding === true) {
            router.replace("/(auth)/login");
            setReady(true);
            return;
          }

          // Token present — validate with server
          if (token) {
            try {
              await apiCall<{ valid: boolean }>("POST", "/auth/validate");

              // State 3: Token valid + onboarding false/absent → Onboarding
              if (onboarding === null || onboarding === false) {
                router.replace("/onboarding");
                setReady(true);
                return;
              }

              // State 4: Token valid + onboarding true → Main
              router.replace("/(app)/");
              setReady(true);
              return;
            } catch (error) {
              // State 5/6: Token invalid or expired
              if (error instanceof SessionExpiredError) {
                // clearToken already called by apiCall on 401
              } else {
                await clearToken();
              }
              router.replace("/(auth)/login");
              setReady(true);
              return;
            }
          }
        } catch {
          // Fallback — storage read failure
          router.replace("/(auth)/");
          setReady(true);
        }
      };

      initializeSession();
    }, [])
  );

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
