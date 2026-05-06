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

export interface ModelInfo {
  tagline: string;
  bestFor: string;
  strengths: string[];
}

export const MODEL_INFO: Record<Model, ModelInfo> = {
  claude: {
    tagline: "Think deeper, write sharper",
    bestFor: "When you need to organize your thinking — essays, reports, or breaking down a topic you haven't mastered yet.",
    strengths: [
      "Helps you build a clear structure before you start writing",
      "Stays focused even when you're working through long material",
      "Walks you through complex ideas one step at a time",
    ],
  },
  chatgpt: {
    tagline: "Start anywhere, figure it out",
    bestFor: "When you're stuck, curious, or just need a thought partner — brainstorm, draft, explore, and learn by doing.",
    strengths: [
      "Flexible enough for any subject you're working on",
      "Feels natural — like thinking out loud with someone who keeps up",
      "Connects with tools and apps that fit your workflow",
    ],
  },
  gemini: {
    tagline: "Research smarter, not longer",
    bestFor: "When your assignment needs real sources — pull live info, analyze what you find, and build something you can cite.",
    strengths: [
      "Finds up-to-date information so your work stays relevant",
      "Reads across many sources and helps you connect the dots",
      "Works inside Google Docs and Sheets where your projects already live",
    ],
  },
  grok: {
    tagline: "Cut through it, move forward",
    bestFor: "When you need a clear answer now — solve the problem, understand the trend, or get unstuck without the noise.",
    strengths: [
      "Tracks what's happening in real time so you stay current",
      "Strong at math and logic when the problem won't click yet",
      "Gives you the answer, not a paragraph around it",
    ],
  },
};
