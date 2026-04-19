// ModelInfoCard — displays model description when a chip is selected
// Animates in below the ModelSelector chips on the Main screen.

import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { MODEL_INFO, MODEL_LABELS } from "../constants/models";
import type { Model } from "../types";

interface ModelInfoCardProps {
  model: Model;
}

export default function ModelInfoCard({ model }: ModelInfoCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const info = MODEL_INFO[model];

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [model]);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <Text style={styles.name}>{MODEL_LABELS[model]}</Text>
      <Text style={styles.tagline}>{info.tagline}</Text>

      <Text style={styles.sectionLabel}>Best for</Text>
      <Text style={styles.bestFor}>{info.bestFor}</Text>

      <Text style={styles.sectionLabel}>Strengths</Text>
      {info.strengths.map((s, i) => (
        <View key={i} style={styles.strengthRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.strengthText}>{s}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  tagline: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  bestFor: {
    fontSize: 15,
    color: "#333",
    lineHeight: 21,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  bullet: {
    fontSize: 15,
    color: "#4F46E5",
    marginRight: 8,
    lineHeight: 21,
  },
  strengthText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 21,
    flex: 1,
  },
});
