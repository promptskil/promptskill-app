// Model constants — Phase 12, Step 12.1
// Array-driven: expand by adding to array only, no code changes needed.

import { Model } from "../types";

export const MODELS: Model[] = ["claude", "chatgpt", "gemini", "grok"];

export const MODEL_LABELS: Record<Model, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
};
