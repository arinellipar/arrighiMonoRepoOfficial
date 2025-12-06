import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "../../../../../env.config";

export async function GET(request: NextRequest) {
  try {
    const clienteId = request.nextUrl.searchParams.get("clienteId");

    if (!clienteId) {
      return NextResponse.json(
        { error: "clienteId é obrigatório." },
        { status: 400 }
      );
    }

    const apiUrl = getApiUrl();
    console.log(`🔍 Portal Cliente Dados: Buscando dados do cliente ${clienteId}`);

    // Buscar contratos do cliente
    const contratosResponse = await fetch(
      `${apiUrl}/Contrato/cliente/${clienteId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let contratos: any[] = [];
    if (contratosResponse.ok) {
      contratos = await contratosResponse.json();
      console.log(`✅ Portal Cliente Dados: ${contratos.length} contratos encontrados`);
    } else {
      console.log(`⚠️ Portal Cliente Dados: Nenhum contrato encontrado`);
    }

    // Buscar boletos de cada contrato
    const boletosPromises = contratos.map(async (contrato: any) => {
      try {
        const boletosResponse = await fetch(
          `${apiUrl}/Boleto/contrato/${contrato.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (boletosResponse.ok) {
          const boletos = await boletosResponse.json();
          return boletos.map((b: any) => ({
            ...b,
            contratoId: contrato.id,
            contratoNumero: contrato.numeroPasta || `#${contrato.id}`,
          }));
        }
        return [];
      } catch (err) {
        console.error(`Erro ao buscar boletos do contrato ${contrato.id}:`, err);
        return [];
      }
    });

    const boletosArrays = await Promise.all(boletosPromises);
    const todosboletos = boletosArrays.flat();
    console.log(`✅ Portal Cliente Dados: ${todosboletos.length} boletos encontrados`);

    // Formatar dados para o portal
    const contratosFormatados = contratos.map((c: any) => ({
      id: c.id,
      numeroPasta: c.numeroPasta || `#${c.id}`,
      tipoServico: c.tipoServico || "Não especificado",
      situacao: c.situacao || "Em andamento",
      valorTotal: c.valorContrato || c.valorParcela * (c.numeroParcelas || 1) || 0,
      valorPago: calcularValorPago(todosboletos.filter((b: any) => b.contratoId === c.id)),
      dataInicio: c.dataFechamentoContrato || c.dataCadastro,
      consultorNome: c.consultor?.pessoaFisica?.nome || "Não atribuído",
      consultorId: c.consultorId,
      proximoVencimento: getProximoVencimento(todosboletos.filter((b: any) => b.contratoId === c.id)),
      observacoes: c.observacoes,
      pendencias: c.pendencias,
    }));

    const pagamentosFormatados = todosboletos.map((b: any) => ({
      id: b.id,
      contratoId: b.contratoId,
      contratoNumero: b.contratoNumero,
      valor: b.amount || b.valor || 0,
      dataVencimento: b.dueDate || b.dataVencimento,
      dataPagamento: b.paidAt || b.dataPagamento,
      status: getStatusBoleto(b),
      tipo: "boleto",
      codigoBarras: b.barcode,
      linkBoleto: b.boletoUrl || b.billetUrl,
    }));

    // Calcular resumo
    const resumo = {
      totalContratos: contratosFormatados.length,
      contratosAtivos: contratosFormatados.filter((c: any) =>
        !["Quitado", "RESCINDIDO", "RESCINDIDO COM DEBITO"].includes(c.situacao)
      ).length,
      valorTotalContratos: contratosFormatados.reduce((acc: number, c: any) => acc + (c.valorTotal || 0), 0),
      valorTotalPago: contratosFormatados.reduce((acc: number, c: any) => acc + (c.valorPago || 0), 0),
      boletosPendentes: pagamentosFormatados.filter((p: any) => p.status === "pendente").length,
      boletosVencidos: pagamentosFormatados.filter((p: any) => p.status === "vencido").length,
      proximoPagamento: getProximoPagamentoPendente(pagamentosFormatados),
    };

    return NextResponse.json({
      contratos: contratosFormatados,
      pagamentos: pagamentosFormatados,
      resumo,
    });

  } catch (error) {
    console.error("❌ Portal Cliente Dados: Erro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

// Funções auxiliares
function calcularValorPago(boletos: any[]): number {
  return boletos
    .filter((b) => b.status === "PAID" || b.status === "paid" || b.paidAt)
    .reduce((acc, b) => acc + (b.amount || b.valor || 0), 0);
}

function getProximoVencimento(boletos: any[]): string | undefined {
  const pendentes = boletos
    .filter((b) => !b.paidAt && !b.dataPagamento)
    .sort((a, b) => {
      const dateA = new Date(a.dueDate || a.dataVencimento);
      const dateB = new Date(b.dueDate || b.dataVencimento);
      return dateA.getTime() - dateB.getTime();
    });

  if (pendentes.length > 0) {
    return pendentes[0].dueDate || pendentes[0].dataVencimento;
  }
  return undefined;
}

function getStatusBoleto(boleto: any): "pago" | "pendente" | "vencido" {
  if (boleto.status === "PAID" || boleto.status === "paid" || boleto.paidAt || boleto.dataPagamento) {
    return "pago";
  }

  const dataVencimento = new Date(boleto.dueDate || boleto.dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (dataVencimento < hoje) {
    return "vencido";
  }

  return "pendente";
}

function getProximoPagamentoPendente(pagamentos: any[]): any | null {
  const pendentes = pagamentos
    .filter((p) => p.status === "pendente")
    .sort((a, b) => {
      const dateA = new Date(a.dataVencimento);
      const dateB = new Date(b.dataVencimento);
      return dateA.getTime() - dateB.getTime();
    });

  return pendentes.length > 0 ? pendentes[0] : null;
}

