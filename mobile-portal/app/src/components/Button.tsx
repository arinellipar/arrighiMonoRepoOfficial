import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "../theme/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    };

    // Size
    switch (size) {
      case "small":
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
        break;
      case "large":
        baseStyle.paddingVertical = 18;
        baseStyle.paddingHorizontal = 32;
        break;
      default:
        baseStyle.paddingVertical = 14;
        baseStyle.paddingHorizontal = 24;
    }

    // Variant
    switch (variant) {
      case "secondary":
        baseStyle.backgroundColor = colors.neutral[700];
        break;
      case "outline":
        baseStyle.backgroundColor = "transparent";
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = colors.accent[500];
        break;
      case "ghost":
        baseStyle.backgroundColor = "transparent";
        break;
      default:
        baseStyle.backgroundColor = colors.accent[500];
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: "600",
    };

    // Size
    switch (size) {
      case "small":
        baseStyle.fontSize = 14;
        break;
      case "large":
        baseStyle.fontSize = 18;
        break;
      default:
        baseStyle.fontSize = 16;
    }

    // Variant
    switch (variant) {
      case "outline":
      case "ghost":
        baseStyle.color = colors.accent[500];
        break;
      default:
        baseStyle.color = colors.primary[900];
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" ? colors.primary[900] : colors.accent[500]
          }
        />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 18,
  },
});
