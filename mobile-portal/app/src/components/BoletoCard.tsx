import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
} from "react-native";
import { colors } from "../theme/colors";

interface Boleto {
  id: number;
  valor: number;
  dataVencimento: string;
  status: string;
  statusDisplay: string;
  numeroParcela?: number;
  linhaDigitavel?: string;
  diasParaVencer: number;
  vencido: boolean;
}

interface BoletoCardProps {
  boleto: Boleto;
  onPress?: () => void;
}

export const BoletoCard: React.FC<BoletoCardProps> = ({ boleto, onPress }) => {
  const getStatusColor = () => {
    switch (boleto.statusDisplay) {
      case "PAGO":
        return colors.boleto.pago;
      case "VENCIDO":
        return colors.boleto.vencido;
      case "EXPIRADO":
        return colors.neutral[500];
      default:
        if (boleto.diasParaVencer <= 3 && boleto.diasParaVencer >= 0) {
          return colors.boleto.vencendo;
        }
        return colors.boleto.aberto;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const copyToClipboard = () => {
    if (boleto.linhaDigitavel) {
      Clipboard.setString(boleto.linhaDigitavel);
      Alert.alert(
        "Copiado!",
        "Linha digitável copiada para a área de transferência"
      );
    }
  };

  const statusColor = getStatusColor();

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: statusColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.parcelaContainer}>
          {boleto.numeroParcela && (
            <Text style={styles.parcela}>Parcela {boleto.numeroParcela}</Text>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {boleto.statusDisplay}
            </Text>
          </View>
        </View>
        <Text style={styles.valor}>{formatCurrency(boleto.valor)}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vencimento</Text>
          <Text style={styles.detailValue}>
            {formatDate(boleto.dataVencimento)}
          </Text>
        </View>

        {boleto.diasParaVencer !== undefined &&
          boleto.statusDisplay !== "PAGO" && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {boleto.vencido ? "Vencido há" : "Vence em"}
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: boleto.vencido
                      ? colors.error.main
                      : colors.text.secondary,
                  },
                ]}
              >
                {Math.abs(boleto.diasParaVencer)} dia(s)
              </Text>
            </View>
          )}
      </View>

      {boleto.linhaDigitavel && boleto.statusDisplay !== "PAGO" && (
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Text style={styles.copyButtonText}>📋 Copiar linha digitável</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  parcelaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  parcela: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  valor: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.muted,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  copyButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: colors.accent[500] + "20",
    borderRadius: 8,
    alignItems: "center",
  },
  copyButtonText: {
    color: colors.accent[500],
    fontWeight: "600",
  },
});
