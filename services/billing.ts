import { Platform } from "react-native";

import { apiCall } from "./api";

/**
 * Start Stripe Checkout (web only).
 *
 * Fetches the Checkout Session URL from the backend and redirects the browser
 * to Stripe's hosted page. On completion Stripe returns the user to
 * success_url (/onboarding). No-op outside web — mobile uses Apple IAP.
 */
export async function startCheckout(): Promise<void> {
  const { url } = await apiCall<{ url: string }>("POST", "/billing/checkout");
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.location.href = url;
  }
}
