import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius } from '../theme/colors';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
  color?: string;
  variant?: 'default' | 'gradient' | 'neon';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = colors.accent[500],
  variant = 'default',
  trend,
}: StatCardProps) {
  if (variant === 'gradient') {
    return (
      <View style={[styles.container, shadows.glass]}>
        <LinearGradient
          colors={[color + '30', color + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                {typeof icon === 'string' ? (
                  <Text style={styles.icon}>{icon}</Text>
                ) : (
                  icon
                )}
              </View>
            )}
            {trend && (
              <View
                style={[
                  styles.trendBadge,
                  { backgroundColor: trend.isPositive ? colors.success.glow : colors.error.glow },
                ]}
              >
                <Text
                  style={[
                    styles.trendText,
                    { color: trend.isPositive ? colors.success.main : colors.error.main },
                  ]}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {/* Accent line */}
        <View style={[styles.accentLine, { backgroundColor: color }]} />
      </View>
    );
  }

  if (variant === 'neon') {
    return (
      <View
        style={[
          styles.container,
          styles.neonContainer,
          {
            borderColor: color + '50',
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                {typeof icon === 'string' ? (
                  <Text style={styles.icon}>{icon}</Text>
                ) : (
                  icon
                )}
              </View>
            )}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, styles.neonValue, { color, textShadowColor: color }]}>
            {value}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  }

  // Default variant
  return (
    <View style={[styles.container, shadows.glass]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    position: 'relative',
  },
  neonContainer: {
    borderWidth: 1.5,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  neonValue: {
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
