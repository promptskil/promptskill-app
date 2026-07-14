// Storage layer — Phase 10, Step 10.2
// Feeds from: /frontend storage keys, /data-flow storage tier rule,
//   /full-stack-engineer storage.ts
//
// SecureStore: session token only (iOS Keychain)
// AsyncStorage: preferences (default model, onboarding flag)
// onboarding_complete cleared ONLY on account deletion, never on logout

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const KEYS = {
  SESSION_TOKEN: "promptskill_session_token",
  DEFAULT_MODEL: "promptskill_default_model",
  ONBOARDING_COMPLETE: "promptskill_onboarding_complete",
} as const;

// ── SecureStore — session token ──────────────────────────────────────

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(KEYS.SESSION_TOKEN, token);
    return;
  }
  await SecureStore.setItemAsync(KEYS.SESSION_TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(KEYS.SESSION_TOKEN);
  }
  return SecureStore.getItemAsync(KEYS.SESSION_TOKEN);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(KEYS.SESSION_TOKEN);
    return;
  }
  await SecureStore.deleteItemAsync(KEYS.SESSION_TOKEN);
}

// ── AsyncStorage — default model ─────────────────────────────────────

export async function setDefaultModel(model: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.DEFAULT_MODEL, model);
}

export async function getDefaultModel(): Promise<string> {
  const value = await AsyncStorage.getItem(KEYS.DEFAULT_MODEL);
  return value ?? "claude";
}

// ── AsyncStorage — onboarding flag ───────────────────────────────────

export async function setOnboardingComplete(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, String(value));
}

export async function getOnboardingComplete(): Promise<boolean | null> {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  if (value === null) return null;
  return value === "true";
}

// Called on account deletion ONLY — clears ALL storage
export async function clearOnboardingComplete(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.ONBOARDING_COMPLETE);
}

// ── Full wipe — account deletion ─────────────────────────────────────

export async function clearAll(): Promise<void> {
  await clearToken();
  await AsyncStorage.removeItem(KEYS.DEFAULT_MODEL);
  await clearOnboardingComplete();
}
