// EmailField (5.1) — Phase 13, Step 13.3
// Inline edit mode: display → change tap → input + confirm/cancel.
// PATCH /user/email on save. Validation: EmailStr + uniqueness.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import EmailInput from "./EmailInput";

interface EmailFieldProps {
  email: string;
  onSave: (newEmail: string) => Promise<void>;
}

export default function EmailField({ email, onSave }: EmailFieldProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(email);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setError("");
    setLoading(true);
    try {
      await onSave(value);
      setEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setValue(email);
    setError("");
    setEditing(false);
  }

  if (!editing) {
    return (
      <View style={styles.displayRow}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{email}</Text>
        <Pressable onPress={() => setEditing(true)}>
          <Text style={styles.changeLink}>Change</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.editContainer}>
      <EmailInput value={value} onChangeText={setValue} editable={!loading} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.editActions}>
        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>✓</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  email: {
    flex: 1,
    fontSize: 16,
    color: "#666",
  },
  changeLink: {
    fontSize: 14,
    color: "#007AFF",
  },
  editContainer: {
    gap: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  confirmText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  cancelText: {
    fontSize: 16,
    color: "#333",
  },
  error: {
    color: "#d00",
    fontSize: 14,
  },
});
