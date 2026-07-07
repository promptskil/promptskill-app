// session.ts — shared login+route so signup-verify and login agree.
// Throws (ApiError / SessionExpiredError) on failure; caller handles it.

import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { apiCall, loginPath, onBusinessHost } from "./api";
import {
  setToken,
  setBusinessContext,
  getOnboardingComplete,
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

  // Law 1: onboarding is mandatory before payment/Main.
  const onboarded = await getOnboardingComplete();
  if (
    !onBusinessHost() &&
    (justVerified || onboarded === false || onboarded === null)
  ) {
    router.replace("/onboarding");
    return;
  }

  // Law 2: card before Main.
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
