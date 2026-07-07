// session.ts — shared login+route so signup-verify and login agree.
// Throws (ApiError / SessionExpiredError) on failure; caller handles it.

import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { apiCall, loginPath, onBusinessHost } from "./api";
import {
  setToken,
  setBusinessContext,
  setOnboardingComplete,
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

  if (data.checkout_required && !onBusinessHost()) {
    await setOnboardingComplete(false);
    if (Platform.OS === "web") {
      await startCheckout();
      return;
    }
    router.replace("/onboarding");
    return;
  }

  if (justVerified && !onBusinessHost()) {
    await setOnboardingComplete(false);
    router.replace("/onboarding");
    return;
  }

  router.replace("/(app)");
}
