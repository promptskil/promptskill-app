// AUTH.3 — LogoutButton — Phase 11, Step 11.1
// Renders in: Screen 5 (Profile)
// First tap: confirmation inline. Confirm: fires onLogout. Cancel: dismisses.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface LogoutButtonProps {
  onLogout: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <View style={styles.confirmRow}>
        <Text style={styles.confirmText}>Are you sure?</Text>
        <Pressable
          style={styles.confirmButton}
          onPress={() => {
            setConfirming(false);
            onLogout();
          }}
        >
          <Text style={styles.confirmButtonText}>Log out</Text>
        </Pressable>
        <Pressable
          style={styles.cancelButton}
          onPress={() => setConfirming(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.logoutButton} onPress={() => setConfirming(true)}>
      <Text style={styles.logoutButtonText}>Log out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#d00",
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confirmText: {
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#d00",
  },
  confirmButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#333",
  },
});
