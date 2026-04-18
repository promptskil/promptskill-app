// NavigationStateModule — Phase 10, Step 10.4
// Feeds from: /module-design NavigationModule,
//   /data-flow Flow 9 entryPoint + resultSnapshot,
//   /full-stack-engineer navigation.ts
//
// In-memory state — not persisted across app restarts.
// Captures Result screen state when navigating to History,
// restores on back gesture without regeneration.

import { ResultSnapshot } from "../types";

interface NavigationState {
  entryPoint: "main" | "result" | null;
  resultSnapshot: ResultSnapshot | null;
}

let navigationState: NavigationState = {
  entryPoint: null,
  resultSnapshot: null,
};

export const NavigationStateModule = {
  // Called when HistoryNavButton tapped from Main screen
  setEntryFromMain(): void {
    navigationState = {
      entryPoint: "main",
      resultSnapshot: null,
    };
  },

  // Called when HistoryNavButton tapped from Result screen
  captureResultSnapshot(snapshot: ResultSnapshot): void {
    navigationState = {
      entryPoint: "result",
      resultSnapshot: snapshot,
    };
  },

  getEntryPoint(): "main" | "result" | null {
    return navigationState.entryPoint;
  },

  getSnapshot(): ResultSnapshot | null {
    return navigationState.resultSnapshot;
  },

  // Called on NewPromptButton tap — clears all navigation state
  clear(): void {
    navigationState = {
      entryPoint: null,
      resultSnapshot: null,
    };
  },
};
