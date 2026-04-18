// e2e/core-flow.test.ts — Phase 14, Step 14.2
// Core 4-tap flow: model → topic → generate → share
// Covers: Main → Result → feedback → history → profile
// Gate-deferred: requires macOS + iOS Simulator to run
//
// Share sheet limitation (per /full-stack-engineer):
//   iOS share sheet is a native overlay.
//   Detox cannot interact with it.
//   Verify Share.share was CALLED — not the overlay tap.
//   Jest unit tests cover Share.share mock (Step 14.1).

import { by, device, element, expect } from "detox";

describe("Core flow — 4 taps to share", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Assumes pre-authenticated state or completes auth first
    // In CI: seed a test user and inject token, or run auth.test.ts first
  });

  describe("Generate prompt (Taps 1-3)", () => {
    it("Tap 1 — selects a model", async () => {
      // Default model loaded from AsyncStorage (claude)
      await expect(element(by.text("Claude"))).toBeVisible();
      // Select a different model
      await element(by.text("Gemini")).tap();
    });

    it("Tap 2 — enters a topic", async () => {
      await element(by.id("topic-input")).typeText("machine learning basics");
      await element(by.id("topic-input")).tapReturnKey();
    });

    it("Tap 3 — generates prompt", async () => {
      await element(by.text("Generate")).tap();
      // Wait for prompt to appear (typewriter animation)
      await waitFor(element(by.id("prompt-display")))
        .toBeVisible()
        .withTimeout(35000); // 30s API ceiling + 5s buffer
    });
  });

  describe("Result screen interactions", () => {
    it("Tap 4 — Send to AI button visible after generation", async () => {
      // SendButton only rendered when promptId exists (atomicity)
      await expect(element(by.text("Send to AI"))).toBeVisible();
      // Tap opens native share sheet — Detox cannot interact with overlay
      // Share.share call verified in Jest unit tests (Step 14.1)
      await element(by.text("Send to AI")).tap();
      // Dismiss share sheet (swipe down or tap outside)
      await device.pressBack();
    });

    it("submits thumbs up feedback", async () => {
      await element(by.text("👍")).tap();
      // Thumb should show selected state
    });

    it("deselects feedback (client-only, no API call)", async () => {
      await element(by.text("👍")).tap();
      // Deselect — same thumb tapped, no API call
      // DB retains prior vote per spec
    });

    it("switches vote direction", async () => {
      await element(by.text("👎")).tap();
      // Vote changed — API call fires
    });
  });

  describe("History screen", () => {
    it("navigates to history from result", async () => {
      await element(by.text("History")).tap();
      // Should see the prompt we just generated
      await expect(
        element(by.text("machine learning basics"))
      ).toBeVisible();
    });

    it("shows feedback icon on history item", async () => {
      await expect(element(by.text("👎"))).toBeVisible();
    });

    it("taps history item to load in result (no regeneration)", async () => {
      await element(by.text("machine learning basics")).tap();
      // Should restore to result screen with existing prompt
      await expect(element(by.id("prompt-display"))).toBeVisible();
      await expect(element(by.text("Send to AI"))).toBeVisible();
    });

    it("soft deletes a prompt", async () => {
      await element(by.text("History")).tap();
      await element(by.text("✕")).atIndex(0).tap();
      // Item removed from list
    });
  });

  describe("New prompt", () => {
    it("taps New Prompt to clear state and return to Main", async () => {
      await element(by.text("New Prompt")).tap();
      await expect(element(by.text("Generate"))).toBeVisible();
      // Topic should be cleared
      await expect(element(by.id("topic-input"))).toHaveText("");
    });
  });
});
