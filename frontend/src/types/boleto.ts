// Tipos para o módulo de boletos baseados no backend

export interface Boleto {
  id: number;
  contratoId: number;
  nsuCode: string;
  nsuDate: string;
  covenantCode: string;
  bankNumber: string;
  clientNumber?: string;
  dueDate: string;
  issueDate: string;
  nominalValue: number;
  documentKind: string;
  status: BoletoStatus;
  statusDescription?: string;

  // Campos de pagamento (novos)
  foiPago?: boolean;
  paidValue?: number;
  settlementDate?: string;

  // Dados do Pagador
  payerName: string;
  payerDocumentType: string;
  payerDocumentNumber: string;
  payerAddress: string;
  payerNeighborhood: string;
  payerCity: string;
  payerState: string;
  payerZipCode: string;

  // Dados de resposta da API Santander
  barCode?: string;
  digitableLine?: string;
  entryDate?: string;
  qrCodePix?: string;
  qrCodeUrl?: string;

  // Informações do Contrato
  contrato?: ContratoInfo;

  // Campos de controle
  dataCadastro: string;
  dataAtualizacao?: string;

  // Campos de erro
  errorCode?: string;
  errorMessage?: string;
  traceId?: string;
}

export interface ContratoInfo {
  id: number;
  numeroContrato: string;
  clienteNome?: string;
  clienteDocumento?: string;
  valorContrato?: number;
  filialNome?: string;
}

export interface CreateBoletoDTO {
  contratoId: number;
  dueDate: string;
  nominalValue: number;
  clientNumber?: string;

  // Campos opcionais para desconto, multa e juros
  finePercentage?: number;
  fineQuantityDays?: number;
  interestPercentage?: number;
  deductionValue?: number;
  writeOffQuantityDays?: number;

  // Mensagens personalizadas
  messages?: string[];

  // Dados PIX (opcionais)
  pixKeyType?: PixKeyType;
  pixKey?: string;
  txId?: string;

  // Dados de desconto (opcionais)
  discount?: DescontoDTO;
}

export interface DescontoDTO {
  type: "VALOR_DATA_FIXA" | "PERCENTUAL_DATA_FIXA";
  discountOne?: DescontoValorDTO;
  discountTwo?: DescontoValorDTO;
  discountThree?: DescontoValorDTO;
}

export interface DescontoValorDTO {
  value: number;
  limitDate: string;
}

export type BoletoStatus =
  | "PENDENTE"
  | "REGISTRADO"
  | "ATIVO"
  | "LIQUIDADO"
  | "BAIXADO"
  | "VENCIDO"
  | "CANCELADO"
  | "ERRO";

export type PixKeyType =
  | "EMAIL"
  | "CPF"
  | "CNPJ"
  | "TELEFONE"
  | "CHAVE_ALEATORIA";

export interface DashboardFinanceiro {
  totalBoletos: number;
  boletosPendentes: number;
  boletosRegistrados: number;
  boletosLiquidados: number;
  boletosVencidos: number;
  boletosCancelados: number;
  valorTotalRegistrado: number;
  valorTotalLiquidado: number;
  boletosHoje: number;
  boletosEsteMes: number;
}

export interface BoletoFilters {
  status?: BoletoStatus;
  contratoId?: number;
  clienteNome?: string;
  dataInicio?: string;
  dataFim?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

// Opções para status com cores e labels
export const BoletoStatusOptions = [
  {
    value: "PENDENTE" as BoletoStatus,
    label: "Pendente",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    value: "REGISTRADO" as BoletoStatus,
    label: "Registrado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "ATIVO" as BoletoStatus,
    label: "Ativo",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "LIQUIDADO" as BoletoStatus,
    label: "Pago (Boleto)",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "BAIXADO" as BoletoStatus,
    label: "Baixado", // Pode ser pago via PIX ou expirado - depende de foiPago
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    value: "VENCIDO" as BoletoStatus,
    label: "Vencido",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "CANCELADO" as BoletoStatus,
    label: "Cancelado",
    color: "bg-gray-300 text-gray-800 border-gray-400",
  },
  {
    value: "ERRO" as BoletoStatus,
    label: "Erro",
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
] as const;

// Função auxiliar para verificar se o boleto foi pago
export function verificarSeFoiPago(boleto: Boleto): boolean {
  // Se tem foiPago, usar ele
  if (boleto.foiPago !== undefined) {
    return boleto.foiPago;
  }

  // Fallback: verificar paidValue
  if (boleto.status === "LIQUIDADO") {
    return true;
  }

  if (boleto.status === "BAIXADO" && boleto.paidValue && boleto.paidValue > 0) {
    return true;
  }

  return false;
}

// Função para obter a configuração de exibição do status
export function getStatusDisplayConfig(boleto: Boleto): {
  text: string;
  color: string;
  bgColor: string;
  isPago: boolean;
} {
  const isPago = verificarSeFoiPago(boleto);

  // Se foi pago
  if (isPago) {
    if (boleto.status === "BAIXADO") {
      return {
        text: "Pago (PIX)",
        color: "text-green-400",
        bgColor: "bg-green-500/20 border-green-500/30",
        isPago: true,
      };
    }
    return {
      text: "Pago (Boleto)",
      color: "text-green-400",
      bgColor: "bg-green-500/20 border-green-500/30",
      isPago: true,
    };
  }

  // Se não foi pago, verificar o status
  switch (boleto.status) {
    case "BAIXADO":
      return {
        text: "Expirado",
        color: "text-red-400",
        bgColor: "bg-red-500/20 border-red-500/30",
        isPago: false,
      };
    case "ATIVO":
    case "REGISTRADO":
      return {
        text: "Aguardando",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20 border-blue-500/30",
        isPago: false,
      };
    case "VENCIDO":
      return {
        text: "Vencido",
        color: "text-amber-400",
        bgColor: "bg-amber-500/20 border-amber-500/30",
        isPago: false,
      };
    case "CANCELADO":
      return {
        text: "Cancelado",
        color: "text-neutral-400",
        bgColor: "bg-neutral-700 border-neutral-600",
        isPago: false,
      };
    case "PENDENTE":
      return {
        text: "Pendente",
        color: "text-neutral-400",
        bgColor: "bg-neutral-700 border-neutral-600",
        isPago: false,
      };
    case "ERRO":
      return {
        text: "Erro",
        color: "text-pink-400",
        bgColor: "bg-pink-500/20 border-pink-500/30",
        isPago: false,
      };
    default:
      return {
        text: boleto.status,
        color: "text-neutral-400",
        bgColor: "bg-neutral-700 border-neutral-600",
        isPago: false,
      };
  }
}

export const PixKeyTypeOptions = [
  { value: "EMAIL" as PixKeyType, label: "E-mail" },
  { value: "CPF" as PixKeyType, label: "CPF" },
  { value: "CNPJ" as PixKeyType, label: "CNPJ" },
  { value: "TELEFONE" as PixKeyType, label: "Telefone" },
  { value: "CHAVE_ALEATORIA" as PixKeyType, label: "Chave Aleatória" },
] as const;
