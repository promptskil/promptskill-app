// Root index — loading screen while session gate decides
// _layout.tsx handles all routing logic via useFocusEffect
import { ActivityIndicator, View } from "react-native";

export default function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
