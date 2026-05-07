// Auth route group — back gesture rules per /auth-flow addendum
// Disabled: Account creation, Login, Reset password
// Enabled: Forgot password

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="login"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}
