import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  icon?: string;
  style?: ViewStyle;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  icon,
  style,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.togglePassword}>
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: colors.accent[500],
  },
  inputError: {
    borderColor: colors.error.main,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: colors.text.primary,
  },
  togglePassword: {
    fontSize: 18,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error.main,
    marginTop: 4,
    marginLeft: 4,
  },
});
