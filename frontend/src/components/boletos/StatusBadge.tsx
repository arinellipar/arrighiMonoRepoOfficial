interface StatusBadgeProps {
  status: string;
  statusDescription?: string;
  foiPago?: boolean;
  paidValue?: number;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  statusDescription,
  foiPago,
  paidValue,
  size = "md",
}: StatusBadgeProps) {
  const getStatusConfig = (status: string, foiPago?: boolean, paidValue?: number) => {
    // BAIXADO = Boleto baixado do sistema (pago via PIX ou expirado)
    // Como o Santander retorna BAIXADO para pagamentos PIX, tratamos como pago por padrão
    // A menos que explicitamente marcado como não pago (foiPago === false)
    const isBaixadoPago = status.toUpperCase() === "BAIXADO" && foiPago !== false;

    // Primeiro, verificar se foi pago usando foiPago, paidValue ou status BAIXADO
    const isPago = foiPago ?? (status === "LIQUIDADO" || isBaixadoPago || (paidValue ?? 0) > 0);

    // Se foi pago
    if (isPago) {
      if (status.toUpperCase() === "BAIXADO") {
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          text: "Pago (PIX)",
          icon: "💳",
        };
      }
      return {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        text: "Pago",
        icon: "✓",
      };
    }

    // Se não foi pago, verificar o status
    switch (status.toUpperCase()) {
      // BAIXADO com foiPago === false = Expirado (cancelado sem pagamento)
      case "BAIXADO":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          text: "Expirado",
          icon: "⚠️",
        };
      case "ATIVO":
      case "REGISTRADO":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          text: "Aguardando",
          icon: "⏳",
        };
      case "VENCIDO":
        return {
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          text: "Vencido",
          icon: "⚠️",
        };
      case "CANCELADO":
        return {
          color: "bg-neutral-700 text-neutral-300 border-neutral-600",
          text: "Cancelado",
          icon: "✕",
        };
      case "PENDENTE":
        return {
          color: "bg-neutral-700 text-neutral-300 border-neutral-600",
          text: "Pendente",
          icon: "⏸",
        };
      case "ERRO":
        return {
          color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
          text: "Erro",
          icon: "❌",
        };
      default:
        return {
          color: "bg-neutral-700 text-neutral-300 border-neutral-600",
          text: status,
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status, foiPago, paidValue);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
      title={statusDescription || config.text}
    >
      {config.text}
    </span>
  );
}
