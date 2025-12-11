import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'accent' | 'neon' | 'success' | 'error' | 'warning' | 'gold';
  noBorder?: boolean;
}

export function GlassCard({ children, style, variant = 'default', noBorder }: GlassCardProps) {
  const getBorderColor = () => {
    switch (variant) {
      case 'accent':
      case 'gold':
        return colors.border.accent;
      case 'neon':
        return colors.border.neon;
      case 'success':
        return colors.success.glow;
      case 'error':
        return colors.error.glow;
      case 'warning':
        return colors.warning.glow;
      default:
        return colors.border.default;
    }
  };

  const getShadow = () => {
    switch (variant) {
      case 'accent':
      case 'gold':
        return shadows.gold;
      case 'neon':
        return shadows.amber;
      default:
        return shadows.glass;
    }
  };

  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'accent':
      case 'gold':
        return ['rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.02)'];
      case 'neon':
        return ['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.03)'];
      case 'success':
        return ['rgba(34, 197, 94, 0.08)', 'rgba(34, 197, 94, 0.02)'];
      case 'error':
        return ['rgba(239, 68, 68, 0.08)', 'rgba(239, 68, 68, 0.02)'];
      case 'warning':
        return ['rgba(245, 158, 11, 0.08)', 'rgba(245, 158, 11, 0.02)'];
      default:
        return ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'];
    }
  };

  return (
    <View
      style={[
        styles.container,
        getShadow(),
        !noBorder && { borderColor: getBorderColor() },
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
  },
});
