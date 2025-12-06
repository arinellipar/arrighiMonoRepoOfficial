import { useState, useCallback } from "react";
import { Contrato } from "@/types/api";

interface AnalysisResult {
  success: boolean;
  analysis: string;
  timestamp: string;
}

interface UseContractAnalysisReturn {
  analyzing: boolean;
  analysis: string | null;
  error: string | null;
  analyzeContract: (contrato: Contrato, additionalText?: string) => Promise<void>;
  clearAnalysis: () => void;
}

export function useContractAnalysis(): UseContractAnalysisReturn {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeContract = useCallback(async (contrato: Contrato, additionalText?: string) => {
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      // Preparar informações do contrato
      const contractInfo = {
        clienteNome: contrato.cliente?.pessoaFisica?.nome ||
                     contrato.cliente?.pessoaJuridica?.razaoSocial ||
                     "Não identificado",
        tipoPessoa: contrato.cliente?.tipoPessoa === "Fisica" ? "Pessoa Física" : "Pessoa Jurídica",
        documento: contrato.cliente?.pessoaFisica?.cpf ||
                   contrato.cliente?.pessoaJuridica?.cnpj ||
                   "Não informado",
        situacao: contrato.situacao,
        valorDevido: contrato.valorDevido,
        valorNegociado: contrato.valorNegociado,
        tipoServico: contrato.tipoServico,
        objetoContrato: contrato.objetoContrato,
        dataUltimoContato: contrato.dataUltimoContato,
        dataProximoContato: contrato.dataProximoContato,
        numeroPasta: contrato.numeroPasta,
        consultorNome: contrato.consultor?.pessoaFisica?.nome || "Não informado",
        parceiroNome: contrato.parceiro?.pessoaFisica?.nome || "Não informado",
        valorEntrada: contrato.valorEntrada,
        numeroParcelas: contrato.numeroParcelas,
        valorParcela: contrato.valorParcela,
        comissao: contrato.comissao,
        pendencias: contrato.pendencias,
        observacoes: contrato.observacoes,
      };

      const response = await fetch("/api/ai/analyze-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractInfo,
          contractText: additionalText || "",
        }),
      });

      const data: AnalysisResult | { error: string } = await response.json();

      if (!response.ok) {
        throw new Error((data as { error: string }).error || "Erro ao analisar contrato");
      }

      if ("analysis" in data) {
        setAnalysis(data.analysis);
      }
    } catch (err: any) {
      console.error("Erro na análise:", err);
      setError(err.message || "Erro ao analisar contrato");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analyzing,
    analysis,
    error,
    analyzeContract,
    clearAnalysis,
  };
}


