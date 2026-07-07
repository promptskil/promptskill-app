// session.ts — shared login+route so signup-verify and login agree.
// Throws (ApiError / SessionExpiredError) on failure; caller handles it.

import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { apiCall, loginPath, onBusinessHost } from "./api";
import {
  setToken,
  setBusinessContext,
} from "../storage/storage";
import { startCheckout } from "./billing";

type AppRouter = ReturnType<typeof useRouter>;

interface LoginResponse {
  token: string;
  business_id: string | null;
  account_type: string;
  checkout_required: boolean;
}

export async function loginAndRoute(
  email: string,
  password: string,
  router: AppRouter,
  justVerified = false,
): Promise<void> {
  const data = await apiCall<LoginResponse>("POST", loginPath(), {
    email,
    password,
  });
  await setToken(data.token);
  await setBusinessContext(data.business_id, data.account_type);

  // Onboarding is a one-time post-verify step only. On re-entry
  // (justVerified=false) it is skipped — checkout is the gate.
  if (justVerified && !onBusinessHost()) {
    router.replace("/onboarding");
    return;
  }

  // Checkout is the hard gate: an unpaid account goes to Stripe, not Main.
  if (data.checkout_required && !onBusinessHost()) {
    if (Platform.OS === "web") {
      await startCheckout();
      return;
    }
    router.replace("/onboarding");
    return;
  }

  router.replace("/(app)");
}
