// Screen 0D — Reset password (placeholder — Phase 11)
// Receives token from deep link: promptskill://reset-password?token={token}
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token: string }>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Reset Password</Text>
      <Text>Token: {token ?? "none"}</Text>
    </View>
  );
}
