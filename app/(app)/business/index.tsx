// Screen — Business Dashboard
// GET /business/mine + GET /user on mount (parallel).
// 404 on /mine → replace to /business/create.
// Shows: org name, seats used/total, member list with role chips.
// Admin: Invite + History action buttons. Remove button per non-owner member.
// DELETE /business/{id}/members/{target} — optimistic local removal.
// Back gesture: ENABLED
// Back arrow: router.replace to Main

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiCall, ApiError, SessionExpiredError } from "../../../services/api";

interface Member {
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

interface Business {
  id: string;
  name: string;
  owner_id: string;
  seat_limit: number;
  members: Member[];
  created_at: string;
}

export default function BusinessDashboard() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [biz, user] = await Promise.all([
        apiCall<Business>("GET", "/business/mine"),
        apiCall<{ id: string; email: string }>("GET", "/user"),
      ]);
      setBusiness(biz);
      setCurrentUserId(user.id);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        router.replace("/(app)/");
        return;
      }
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
        return;
      }
      setError("Failed to load organization.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(targetUserId: string) {
    if (!business) return;
    setRemoveError("");
    setRemoving(targetUserId);
    try {
      await apiCall(
        "DELETE",
        `/business/${business.id}/members/${targetUserId}`
      );
      setBusiness(prev =>
        prev
          ? {
              ...prev,
              members: prev.members.filter(m => m.user_id !== targetUserId),
            }
          : prev
      );
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        router.replace("/(auth)/login");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setRemoveError("Cannot remove this member.");
        } else if (err.status === 403) {
          setRemoveError("Admin access required.");
        } else {
          setRemoveError("Something went wrong.");
        }
      } else {
        setRemoveError("Something went wrong.");
      }
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!business) return null;

  const currentMember = business.members.find(m => m.user_id === currentUserId);
  const isAdmin = currentMember?.role === "admin";
  const seatsUsed = business.members.length;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.replace("/(app)/")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.header}>{business.name}</Text>
      </View>

      {/* Seat count */}
      <Text style={styles.seatText}>
        {seatsUsed} / {business.seat_limit} seats
      </Text>

      {/* Actions — admin only */}
      {isAdmin && (
        <View style={styles.actions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: "/(app)/business/invite",
                params: { businessId: business.id },
              })
            }
          >
            <Ionicons name="person-add-outline" size={18} color="#4F46E5" />
            <Text style={styles.actionBtnText}>Invite Member</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: "/(app)/business/history",
                params: { businessId: business.id },
              })
            }
          >
            <Ionicons name="time-outline" size={18} color="#4F46E5" />
            <Text style={styles.actionBtnText}>Org History</Text>
          </Pressable>
        </View>
      )}

      {/* Members */}
      <Text style={styles.sectionTitle}>Members</Text>

      {removeError ? (
        <Text style={styles.error}>{removeError}</Text>
      ) : null}

      {business.members.map(member => {
        const isOwner = member.user_id === business.owner_id;
        const isSelf = member.user_id === currentUserId;
        const canRemove = isAdmin && !isOwner;

        return (
          <View key={member.user_id} style={styles.memberRow}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberEmail}>{member.email}</Text>
              <View style={styles.chips}>
                <Text style={styles.roleChip}>{member.role}</Text>
                {isOwner && (
                  <Text style={styles.ownerChip}>owner</Text>
                )}
                {isSelf && (
                  <Text style={styles.selfChip}>you</Text>
                )}
              </View>
            </View>
            {canRemove && (
              <Pressable
                style={styles.removeBtn}
                onPress={() => handleRemove(member.user_id)}
                disabled={removing === member.user_id}
              >
                {removing === member.user_id ? (
                  <ActivityIndicator size="small" color="#d00" />
                ) : (
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="#d00"
                  />
                )}
              </Pressable>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  seatText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  actionBtnText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberEmail: {
    fontSize: 15,
    color: "#333",
  },
  chips: {
    flexDirection: "row",
    gap: 6,
  },
  roleChip: {
    fontSize: 11,
    color: "#666",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  ownerChip: {
    fontSize: 11,
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  selfChip: {
    fontSize: 11,
    color: "#666",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  removeBtn: {
    padding: 4,
  },
  error: {
    color: "#d00",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
