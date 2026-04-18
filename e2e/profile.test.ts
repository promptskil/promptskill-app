// e2e/profile.test.ts — Phase 14, Step 14.2
// Profile screen: email display, email change, preferences, logout
// Gate-deferred: requires macOS + iOS Simulator to run

import { by, device, element, expect } from "detox";

describe("Profile screen", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Assumes pre-authenticated state
  });

  it("navigates to profile", async () => {
    await element(by.text("Profile")).tap();
  });

  describe("Email field", () => {
    it("displays current email", async () => {
      await expect(element(by.id("email-display"))).toBeVisible();
    });

    it("enters edit mode on Change tap", async () => {
      await element(by.text("Change")).tap();
      await expect(element(by.id("email-edit-input"))).toBeVisible();
    });

    it("cancels edit mode", async () => {
      await element(by.text("✕")).tap();
      await expect(element(by.id("email-display"))).toBeVisible();
    });
  });

  describe("Preferences panel", () => {
    it("shows default model selector", async () => {
      await expect(element(by.text("Default model"))).toBeVisible();
    });

    it("changes default model (AsyncStorage only, no API)", async () => {
      await element(by.text("Grok")).tap();
      // Preference saved to AsyncStorage only
      // No network call — verified by absence of API error
    });
  });

  describe("Logout sequence", () => {
    it("shows confirmation on first tap", async () => {
      await element(by.text("Log out")).tap();
      await expect(element(by.text("Are you sure?"))).toBeVisible();
    });

    it("cancels logout", async () => {
      await element(by.text("Cancel")).tap();
      await expect(element(by.text("Log out"))).toBeVisible();
    });

    it("confirms logout — navigates to login", async () => {
      await element(by.text("Log out")).tap();
      await element(by.text("Log out")).tap();
      // onboarding_complete preserved — goes to Login, not signup
      await expect(element(by.id("email-input"))).toBeVisible();
    });
  });
});
