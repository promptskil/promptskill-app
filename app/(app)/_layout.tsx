// App route group — back gesture rules per /auth-flow addendum
// Disabled: Main
// Enabled: Result, History, Profile

import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="result"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="history"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="profile"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="business/index"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="business/create"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="business/invite"
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="business/history"
        options={{ gestureEnabled: true }}
      />
    </Stack>
  );
}
