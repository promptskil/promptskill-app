import {
  setToken,
  getToken,
  clearToken,
  setDefaultModel,
  getDefaultModel,
  setOnboardingComplete,
  getOnboardingComplete,
  clearOnboardingComplete,
  clearAll,
} from "../storage/storage";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

beforeEach(() => {
  (SecureStore as unknown as { _reset: () => void })._reset();
  (AsyncStorage as unknown as { _reset: () => void })._reset();
});

describe("storage — SecureStore token", () => {
  it("setToken → getToken returns same value", async () => {
    await setToken("abc123");
    expect(await getToken()).toBe("abc123");
  });

  it("clearToken → getToken returns null", async () => {
    await setToken("abc123");
    await clearToken();
    expect(await getToken()).toBeNull();
  });
});

describe("storage — AsyncStorage defaultModel", () => {
  it("getDefaultModel absent → returns 'claude'", async () => {
    expect(await getDefaultModel()).toBe("claude");
  });

  it("setDefaultModel → getDefaultModel returns value", async () => {
    await setDefaultModel("gemini");
    expect(await getDefaultModel()).toBe("gemini");
  });
});

describe("storage — AsyncStorage onboardingComplete", () => {
  it("getOnboardingComplete absent → returns null", async () => {
    expect(await getOnboardingComplete()).toBeNull();
  });

  it("setOnboardingComplete(true) → returns true", async () => {
    await setOnboardingComplete(true);
    expect(await getOnboardingComplete()).toBe(true);
  });

  it("setOnboardingComplete(false) → returns false", async () => {
    await setOnboardingComplete(false);
    expect(await getOnboardingComplete()).toBe(false);
  });

  it("clearOnboardingComplete → returns null", async () => {
    await setOnboardingComplete(true);
    await clearOnboardingComplete();
    expect(await getOnboardingComplete()).toBeNull();
  });
});

describe("storage — clearAll", () => {
  it("clears token, model, and onboarding", async () => {
    await setToken("tok");
    await setDefaultModel("grok");
    await setOnboardingComplete(true);
    await clearAll();
    expect(await getToken()).toBeNull();
    expect(await getDefaultModel()).toBe("claude");
    expect(await getOnboardingComplete()).toBeNull();
  });
});
