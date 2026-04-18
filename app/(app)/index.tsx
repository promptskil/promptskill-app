// Screen 2 — Main — Phase 12, Step 12.3
// ModelSelector + TopicInput + GenerateButton -> POST /generate -> Result
// defaultModel read from AsyncStorage on mount (default 'claude')
// Back gesture: DISABLED

import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ModelSelector from "../../components/ModelSelector";
import ModelInfoCard from "../../components/ModelInfoCard";
import TopicInput from "../../components/TopicInput";
import GenerateButton from "../../components/GenerateButton";
import { apiCall, ApiError, SessionExpiredError } from "../../services/api";
import { getDefaultModel, setDefaultModel } from "../../storage/storage";
import type { Model } from "../../types";

export default function Main() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model>("claude");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topicFocused, setTopicFocused] = useState(false);

  useEffect(() => {
    getDefaultModel().then((model) => {
      setSelectedModel(model as Model);
    });
  }, []);

  const canGenerate =
    selectedModel.length > 0 && topic.length > 0 && !loading;

  function handleModelSelect(model: Model) {
    setSelectedModel(model);
    setDefaultModel(model);
  }

  async function handleGenerate() {
    setError("");
    setLoading(true);
    try {
      const data = await apiCall<{ prompt_id: string; prompt: string }>(
        "POST",
        "/generate",
        { model: selectedModel, topic }
      );
      router.push({
        pathname: "/(app)/result",
        params: {
          promptId: data.prompt_id,
          generatedPrompt: data.prompt,
          selectedModel,
          topic,
        },
      });
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError("Too many requests. Try again later.");
        } else if (err.status === 504) {
          setError("Generation timed out. Please try again.");
        } else if (err.status === 400) {
          setError("Invalid request. Please check your input.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>PromptSkill AI</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Select a model</Text>
        <ModelSelector
          selectedModel={selectedModel}
          onSelect={handleModelSelect}
        />

        {!topicFocused && <ModelInfoCard model={selectedModel} />}

        <Text style={styles.label}>Enter a topic</Text>
        <TopicInput
          topic={topic}
          onChangeText={setTopic}
          editable={!loading}
          onFocus={() => setTopicFocused(true)}
          onBlur={() => setTopicFocused(false)}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <GenerateButton
          onPress={handleGenerate}
          disabled={!canGenerate}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
  },
});
