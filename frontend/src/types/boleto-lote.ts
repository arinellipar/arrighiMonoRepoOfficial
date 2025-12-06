// Tipos para geração de boletos em lote

export interface ContratoPreview {
  contratoId: number;
  clienteId: number;
  clienteNome: string;
  clienteDocumento: string;
  numeroPasta: string;
  numeroParcela: number;
  totalParcelas: number;
  parcelaDescricao: string;
  dataVencimento: string;
  valor: number;
  diasAteVencimento: number;
  filialNome: string;
}

export interface PreviewGeracaoLote {
  totalContratosAtivos: number;
  contratosParaGerar: number;
  valorTotal: number;
  contratos: ContratoPreview[];
}

export interface BoletoGerado {
  boletoId: number;
  contratoId: number;
  clienteNome: string;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: string;
  valor: number;
  nsuCode: string;
  status: string;
}

export interface ErroGeracao {
  contratoId: number;
  clienteNome: string;
  erro: string;
  dataHora: string;
}

export interface ResultadoGeracaoLote {
  iniciado: string;
  finalizado: string;
  duracaoSegundos: number;
  totalProcessados: number;
  totalSucesso: number;
  totalErros: number;
  valorTotalGerado: number;
  status: 'SUCESSO' | 'PARCIAL' | 'ERRO' | 'NENHUM';
  logId: number;
  boletosGerados: BoletoGerado[];
  erros: ErroGeracao[];
}

export interface LogGeracao {
  id: number;
  dataExecucao: string;
  usuarioNome: string;
  totalContratosProcessados: number;
  totalBoletosGerados: number;
  totalErros: number;
  valorTotalGerado: number;
  duracaoSegundos: number;
  status: string;
}

export interface LogsGeracaoPaginado {
  dados: LogGeracao[];
  pagina: number;
  tamanhoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
}

export interface LogGeracaoDetalhado extends LogGeracao {
  dataFinalizacao: string;
  detalhes: {
    boletosGerados: BoletoGerado[];
    erros: ErroGeracao[];
  };
}

