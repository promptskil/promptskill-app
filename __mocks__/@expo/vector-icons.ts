import React from "react";
import { Text } from "react-native";

// Jest mock for @expo/vector-icons.
// Prevents native expo-font resolution in the test environment.
// Returns a simple Text node so icon renders don't crash tests.

const createIcon = () => {
  const Icon = ({
    name,
    testID,
  }: {
    name?: string;
    size?: number;
    color?: string;
    testID?: string;
  }) => React.createElement(Text, { testID: testID ?? name }, name);
  return Icon;
};

export const Ionicons = createIcon();
export const AntDesign = createIcon();
export const Entypo = createIcon();
export const EvilIcons = createIcon();
export const Feather = createIcon();
export const FontAwesome = createIcon();
export const FontAwesome5 = createIcon();
export const Foundation = createIcon();
export const MaterialCommunityIcons = createIcon();
export const MaterialIcons = createIcon();
export const Octicons = createIcon();
export const SimpleLineIcons = createIcon();
export const Zocial = createIcon();
