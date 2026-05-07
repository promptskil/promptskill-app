<<<<<<< HEAD
// NAV.1 — HistoryNavButton — Screen 2 (Main) only
=======
// NAV.1 — HistoryNavButton — Phase 12, Step 12.2
// Shared component. Calls NavigationStateModule before navigating.
>>>>>>> main

import { Pressable, Text, StyleSheet } from "react-native";

interface HistoryNavButtonProps {
  onPress: () => void;
}

export default function HistoryNavButton({ onPress }: HistoryNavButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>History</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
  },
  text: {
    fontSize: 14,
    color: "#4F46E5",
  },
});
