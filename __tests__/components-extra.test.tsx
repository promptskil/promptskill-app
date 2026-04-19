import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import EmailInput from "../components/EmailInput";
import PasswordInput from "../components/PasswordInput";
import TopicInput from "../components/TopicInput";
import HistoryNavButton from "../components/HistoryNavButton";
import PromptDisplay from "../components/PromptDisplay";
import PromptListItem from "../components/PromptListItem";
import PromptList from "../components/PromptList";
import PreferencesPanel from "../components/PreferencesPanel";
import EmailField from "../components/EmailField";

describe("EmailInput", () => {
  it("renders with placeholder and fires onChangeText", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <EmailInput value="" onChangeText={onChangeText} />
    );
    const input = getByPlaceholderText("Email address");
    fireEvent.changeText(input, "test@example.com");
    expect(onChangeText).toHaveBeenCalledWith("test@example.com");
  });

  it("renders disabled state", () => {
    const { getByPlaceholderText } = render(
      <EmailInput value="a@b.com" onChangeText={jest.fn()} editable={false} />
    );
    const input = getByPlaceholderText("Email address");
    expect(input.props.editable).toBe(false);
  });
});

describe("PasswordInput", () => {
  it("renders with placeholder and masks text", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <PasswordInput value="" onChangeText={onChangeText} />
    );
    const input = getByPlaceholderText("Password");
    expect(input.props.secureTextEntry).toBe(true);
    fireEvent.changeText(input, "secret");
    expect(onChangeText).toHaveBeenCalledWith("secret");
  });

  it("renders custom placeholder", () => {
    const { getByPlaceholderText } = render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        placeholder="New password"
      />
    );
    expect(getByPlaceholderText("New password")).toBeTruthy();
  });
});

describe("TopicInput", () => {
  it("renders with placeholder and fires onChangeText", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <TopicInput topic="" onChangeText={onChangeText} />
    );
    const input = getByPlaceholderText("What would you like to create?");
    fireEvent.changeText(input, "AI trends");
    expect(onChangeText).toHaveBeenCalledWith("AI trends");
  });

  it("has maxLength of 500", () => {
    const { getByPlaceholderText } = render(
      <TopicInput topic="" onChangeText={jest.fn()} />
    );
    const input = getByPlaceholderText("What would you like to create?");
    expect(input.props.maxLength).toBe(500);
  });
});

describe("HistoryNavButton", () => {
  it("fires onPress", () => {
    const onPress = jest.fn();
    const { getByText } = render(<HistoryNavButton onPress={onPress} />);
    fireEvent.press(getByText("History"));
    expect(onPress).toHaveBeenCalled();
  });
});

describe("PromptDisplay", () => {
  it("shows loading state", () => {
    const { getByText } = render(
      <PromptDisplay prompt="" loading={true} error={null} />
    );
    expect(getByText("Generating...")).toBeTruthy();
  });

  it("shows error state", () => {
    const { getByText } = render(
      <PromptDisplay prompt="" loading={false} error="Generation timed out" />
    );
    expect(getByText("Generation timed out")).toBeTruthy();
  });

  it("returns null when no prompt and not loading", () => {
    const { toJSON } = render(
      <PromptDisplay prompt="" loading={false} error={null} />
    );
    expect(toJSON()).toBeNull();
  });

  it("renders prompt text when provided", () => {
    jest.useFakeTimers();
    const { getByText } = render(
      <PromptDisplay prompt="Hello" loading={false} error={null} />
    );
    // Advance timers inside act() -- typewriter setInterval triggers state updates
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(getByText(/Hello/)).toBeTruthy();
    jest.useRealTimers();
  });
});

describe("PromptListItem", () => {
  const baseProps = {
    id: "id-1",
    model: "claude",
    topic: "Test topic",
    prompt_text: "Generated prompt",
    feedback_vote: null as "up" | "down" | null,
    created_at: "2026-04-18T00:00:00Z",
    onSelect: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders topic and model", () => {
    const { getByText } = render(<PromptListItem {...baseProps} />);
    expect(getByText("Test topic")).toBeTruthy();
    expect(getByText("claude")).toBeTruthy();
  });

  it("calls onSelect with record on body tap", () => {
    const { getByText } = render(<PromptListItem {...baseProps} />);
    fireEvent.press(getByText("Test topic"));
    expect(baseProps.onSelect).toHaveBeenCalledWith({
      id: "id-1",
      model: "claude",
      topic: "Test topic",
      prompt_text: "Generated prompt",
      feedback_vote: null,
    });
  });

  it("calls onDelete with id on delete tap", () => {
    const { getByText } = render(<PromptListItem {...baseProps} />);
    fireEvent.press(getByText("\u2715"));
    expect(baseProps.onDelete).toHaveBeenCalledWith("id-1");
  });

  it("shows feedback icon when vote exists", () => {
    const { getByText } = render(
      <PromptListItem {...baseProps} feedback_vote="up" />
    );
    expect(getByText("\uD83D\uDC4D")).toBeTruthy();
  });
});

describe("PromptList", () => {
  it("shows empty state when no items", () => {
    const { getByText } = render(
      <PromptList
        historyItems={[]}
        total={0}
        onLoadMore={jest.fn()}
        onItemSelect={jest.fn()}
        onItemDelete={jest.fn()}
      />
    );
    expect(getByText("No prompts yet")).toBeTruthy();
  });

  it("renders items", () => {
    const items = [
      {
        prompt_id: "1",
        model: "claude",
        topic: "Topic 1",
        prompt_text: "Prompt 1",
        feedback_vote: null as "up" | "down" | null,
        created_at: "2026-04-18T00:00:00Z",
      },
    ];
    const { getByText } = render(
      <PromptList
        historyItems={items}
        total={1}
        onLoadMore={jest.fn()}
        onItemSelect={jest.fn()}
        onItemDelete={jest.fn()}
      />
    );
    expect(getByText("Topic 1")).toBeTruthy();
  });
});

describe("PreferencesPanel", () => {
  it("renders model selector with default", () => {
    const { getByText } = render(
      <PreferencesPanel defaultModel="claude" onModelChange={jest.fn()} />
    );
    expect(getByText("Default model")).toBeTruthy();
    expect(getByText("Claude")).toBeTruthy();
  });

  it("calls onModelChange when model selected", () => {
    const onModelChange = jest.fn();
    const { getByText } = render(
      <PreferencesPanel defaultModel="claude" onModelChange={onModelChange} />
    );
    fireEvent.press(getByText("Gemini"));
    expect(onModelChange).toHaveBeenCalledWith("gemini");
  });
});

describe("EmailField", () => {
  it("shows email in display mode", () => {
    const { getByText } = render(
      <EmailField email="test@example.com" onSave={jest.fn()} />
    );
    expect(getByText("test@example.com")).toBeTruthy();
    expect(getByText("Change")).toBeTruthy();
  });

  it("enters edit mode on Change tap", () => {
    const { getByText, getByPlaceholderText } = render(
      <EmailField email="test@example.com" onSave={jest.fn()} />
    );
    fireEvent.press(getByText("Change"));
    expect(getByPlaceholderText("Email address")).toBeTruthy();
  });

  it("cancels edit mode", () => {
    const { getByText, queryByPlaceholderText } = render(
      <EmailField email="test@example.com" onSave={jest.fn()} />
    );
    fireEvent.press(getByText("Change"));
    fireEvent.press(getByText("\u2715"));
    expect(queryByPlaceholderText("Email address")).toBeNull();
  });
});
