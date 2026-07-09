// PromptSkill shared types — Phase 10, Step 10.1
// Feeds from: /database entity shapes, /full-stack-engineer types/index.ts

export interface Prompt {
  id: string;
  user_id: string;
  model: string;
  topic: string;
  prompt_text: string;
  system_prompt_version: string;
  app_version: string;
  feedback_vote: "up" | "down" | null;
  deleted_at: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export type Model = "claude" | "chatgpt" | "gemini" | "grok";

export interface ResultSnapshot {
  generatedPrompt: string;
  promptId: string;
  feedbackVote: "up" | "down" | null;
  selectedModel: string;
  topic: string;
}

// ─────────────────────── Globe subsystem ─────────────────────────────────

export type GlobeDomain =
  | "startup"
  | "ai"
  | "finance"
  | "career"
  | "programming"
  | "health";

export interface GlobeZone {
  id: string;
  title: string;
  created_at: string;
}

export interface GlobeReply {
  id: string;
  parent_reply_id: string | null;
  author_username: string;
  body: string;
  created_at: string;
}

export interface GlobePost {
  id: string;
  author_username: string;
  body: string;
  created_at: string;
  replies: GlobeReply[]; // flat; nested client-side
}

export interface GlobeReplyNode extends GlobeReply {
  children: GlobeReplyNode[];
}
