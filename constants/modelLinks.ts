// Model web links — maps each model to its chat interface URL.
// Feeds from: constants/models.ts (Model type)
// Feeds into: components/ModelLaunchChips.tsx

import type { Model } from "../types";

export const MODEL_LINKS: Record<Model, string> = {
  claude: "https://claude.ai/new",
  chatgpt: "https://chatgpt.com/",
  gemini: "https://gemini.google.com/app",
  grok: "https://grok.com/",
};
