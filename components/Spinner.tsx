// Shared loading spinner — a rotating spiral. Used by both engines' loaders.

import { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SpinnerProps {
  size?: number;
  color?: string;
}

export default function Spinner({ size = 18, color = "#555" }: SpinnerProps) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Ionicons name="sync" size={size} color={color} />
    </Animated.View>
  );
}
