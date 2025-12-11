import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { colors, borderRadius } from '../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  secureTextEntry,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (error) return colors.error.main;
    if (isFocused) return '#d4af37'; // Dourado no focus
    return colors.border.default;
  };

  const getGlowStyle = () => {
    if (error) {
      return {
        shadowColor: colors.error.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
      };
    }
    if (isFocused) {
      return {
        shadowColor: '#d4af37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
      };
    }
    return {};
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: getBorderColor() },
          isFocused && { borderWidth: 2 },
          getGlowStyle(),
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}

        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={colors.text.muted}
          selectionColor="#d4af37"
          secureTextEntry={secureTextEntry && !showPassword}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="none"
          autoComplete="off"
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.eyeIconContainer}>
              {showPassword ? (
                <View style={styles.eyeIcon}>
                  <View style={styles.eyeOuter} />
                  <View style={styles.eyePupil} />
                </View>
              ) : (
                <View style={styles.eyeIcon}>
                  <View style={styles.eyeOuter} />
                  <View style={styles.eyePupil} />
                  <View style={styles.eyeSlash} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  labelFocused: {
    color: '#d4af37',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: 'transparent',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 50,
  },
  iconLeft: {
    paddingLeft: 16,
  },
  iconRight: {
    position: 'absolute',
    right: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 20,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOuter: {
    width: 20,
    height: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d4af37',
    position: 'absolute',
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d4af37',
  },
  eyeSlash: {
    position: 'absolute',
    width: 22,
    height: 2,
    backgroundColor: '#d4af37',
    transform: [{ rotate: '-45deg' }],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorIcon: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error.main,
    fontWeight: '500',
  },
});
