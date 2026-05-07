import { NavigationStateModule } from "../services/navigation";

beforeEach(() => {
  NavigationStateModule.clear();
});

describe("NavigationStateModule", () => {
  it("setEntryFromMain → getEntryPoint = 'main'", () => {
    NavigationStateModule.setEntryFromMain();
    expect(NavigationStateModule.getEntryPoint()).toBe("main");
  });

  it("setEntryFromMain → getSnapshot returns null", () => {
    NavigationStateModule.setEntryFromMain();
    expect(NavigationStateModule.getSnapshot()).toBeNull();
  });

  it("captureResultSnapshot → getEntryPoint = 'result'", () => {
    NavigationStateModule.captureResultSnapshot({
      generatedPrompt: "test prompt",
      promptId: "id-1",
      feedbackVote: null,
      selectedModel: "claude",
      topic: "test",
    });
    expect(NavigationStateModule.getEntryPoint()).toBe("result");
  });

  it("captureResultSnapshot → getSnapshot returns snapshot", () => {
    const snapshot = {
      generatedPrompt: "test prompt",
      promptId: "id-1",
      feedbackVote: "up" as const,
      selectedModel: "claude",
      topic: "test",
    };
    NavigationStateModule.captureResultSnapshot(snapshot);
    expect(NavigationStateModule.getSnapshot()).toEqual(snapshot);
  });

  it("clear → getEntryPoint returns null", () => {
    NavigationStateModule.setEntryFromMain();
    NavigationStateModule.clear();
    expect(NavigationStateModule.getEntryPoint()).toBeNull();
  });

  it("clear → getSnapshot returns null", () => {
    NavigationStateModule.captureResultSnapshot({
      generatedPrompt: "test",
      promptId: "id-1",
      feedbackVote: null,
      selectedModel: "claude",
      topic: "test",
    });
    NavigationStateModule.clear();
    expect(NavigationStateModule.getSnapshot()).toBeNull();
  });
});
