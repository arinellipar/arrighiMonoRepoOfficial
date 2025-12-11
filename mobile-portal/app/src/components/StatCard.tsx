import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.accent[500],
}) => {
  return (
    <View style={[styles.container, { borderTopColor: color }]}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    borderTopWidth: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
