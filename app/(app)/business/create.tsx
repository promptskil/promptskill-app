// Self-serve org creation is retired — admins are owner-provisioned only.
// This route is disabled; anyone who lands here is redirected to Main.
import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

export default function BusinessCreateDisabled() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(app)/");
  }, []);
  return <View />;
}
