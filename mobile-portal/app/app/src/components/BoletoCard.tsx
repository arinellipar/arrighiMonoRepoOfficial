import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius } from '../theme/colors';

interface Boleto {
  id: number;
  valor: number;
  dataVencimento: string;
  status: string;
  foiPago?: boolean;
  paidValue?: number;
  linhaDigitavel?: string;
}

interface BoletoCardProps {
  boleto: Boleto;
  onPress?: () => void;
}

export function BoletoCard({ boleto, onPress }: BoletoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const isVencido = () => {
    if (boleto.foiPago || boleto.status === 'LIQUIDADO') return false;
    const vencimento = new Date(boleto.dataVencimento);
    return vencimento < new Date();
  };

  const isPago = () => {
    return boleto.foiPago || boleto.status === 'LIQUIDADO';
  };

  const getStatusConfig = () => {
    if (isPago()) {
      return {
        label: boleto.status === 'BAIXADO' ? 'Pago (PIX)' : 'Pago',
        color: colors.success.main,
        bgColor: colors.success.glow,
        icon: '✓',
        gradient: [colors.success.main + '20', colors.success.main + '05'],
      };
    }
    if (isVencido()) {
      return {
        label: 'Vencido',
        color: colors.error.main,
        bgColor: colors.error.glow,
        icon: '!',
        gradient: [colors.error.main + '20', colors.error.main + '05'],
      };
    }
    // Próximo do vencimento (7 dias)
    const diasAteVencimento = Math.ceil(
      (new Date(boleto.dataVencimento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (diasAteVencimento <= 7) {
      return {
        label: `${diasAteVencimento}d`,
        color: colors.warning.main,
        bgColor: colors.warning.glow,
        icon: '⏰',
        gradient: [colors.warning.main + '20', colors.warning.main + '05'],
      };
    }
    return {
      label: 'Em aberto',
      color: colors.info.main,
      bgColor: colors.info.glow,
      icon: '○',
      gradient: [colors.info.main + '15', colors.info.main + '05'],
    };
  };

  const status = getStatusConfig();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          borderColor: status.color + '30',
          shadowColor: status.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}
    >
      <LinearGradient
        colors={status.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Vencimento</Text>
            <Text style={[styles.date, isVencido() && !isPago() && styles.dateVencido]}>
              {formatDate(boleto.dataVencimento)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.statusIcon, { color: status.color }]}>{status.icon}</Text>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Valor */}
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: isPago() ? colors.text.muted : colors.text.primary }]}>
            {formatCurrency(boleto.valor)}
          </Text>
          {isPago() && boleto.paidValue && boleto.paidValue !== boleto.valor && (
            <Text style={styles.paidValue}>
              Pago: {formatCurrency(boleto.paidValue)}
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.boletoId}>#{boleto.id}</Text>
          {!isPago() && (
            <View style={styles.actionHint}>
              <Text style={[styles.actionText, { color: status.color }]}>
                Ver detalhes →
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Accent line */}
      <View style={[styles.accentLine, { backgroundColor: status.color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    marginBottom: 12,
    position: 'relative',
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
  dateContainer: {},
  dateLabel: {
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  dateVencido: {
    color: colors.error.main,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  valueContainer: {
    marginBottom: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  paidValue: {
    fontSize: 13,
    color: colors.success.main,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boletoId: {
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  actionHint: {},
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});
