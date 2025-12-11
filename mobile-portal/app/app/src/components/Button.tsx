import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 16;
      default:
        return 15;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#d4af37' : '#0a0a0a'}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { fontSize: getTextSize() },
              variant === 'outline' && styles.outlineText,
              variant === 'ghost' && styles.ghostText,
              variant === 'primary' && styles.primaryText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  // Primary variant with gold gradient
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#3a3a3a', '#262626'] : ['#ffd75b', '#d4af37', '#b8941f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            getSizeStyles(),
            !isDisabled && shadows.amber,
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Danger variant
  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#3a3a3a', '#262626'] : [colors.error.main, colors.error.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            getSizeStyles(),
            isDisabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Other variants
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        getSizeStyles(),
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: '#0a0a0a',
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#d4af37',
  },
  outlineText: {
    color: '#d4af37',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#d4af37',
  },
  disabled: {
    opacity: 0.5,
  },
});
