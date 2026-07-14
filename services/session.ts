// session.ts — shared login+route so signup-verify and login agree.
// Throws (ApiError / SessionExpiredError) on failure; caller handles it.

import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { apiCall } from "./api";
import { setToken } from "../storage/storage";
import { startCheckout } from "./billing";

type AppRouter = ReturnType<typeof useRouter>;

interface LoginResponse {
  token: string;
  checkout_required: boolean;
}

export async function loginAndRoute(
  email: string,
  password: string,
  router: AppRouter,
  justVerified = false,
): Promise<void> {
  const data = await apiCall<LoginResponse>("POST", "/auth/login", {
    email,
    password,
  });
  await setToken(data.token);

  // Onboarding is a one-time post-verify step only. On re-entry
  // (justVerified=false) it is skipped — checkout is the gate.
  if (justVerified) {
    router.replace("/onboarding");
    return;
  }

  // Checkout is the hard gate on WEB only. Mobile payment is handled by
  // Apple (backend 402 + IAP), so iOS never routes on checkout_required.
  if (data.checkout_required && Platform.OS === "web") {
    await startCheckout();
    return;
  }

  router.replace("/(app)");
}
