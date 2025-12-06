import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Configuração do modelo
const getModel = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada");
  }

  return new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.3,
    openAIApiKey: apiKey,
  });
};

// Prompt do sistema para análise jurídica
const SYSTEM_PROMPT = `Você é um assistente jurídico especializado em análise de contratos.
Sua função é analisar contratos e fornecer insights valiosos para advogados e gestores.

Ao analisar um contrato, você deve:

1. **Resumo Executivo**: Forneça um resumo claro e conciso do contrato em 2-3 parágrafos.

2. **Informações Principais**:
   - Partes envolvidas
   - Objeto do contrato
   - Valor total e condições de pagamento
   - Prazo de vigência
   - Principais obrigações de cada parte

3. **Cláusulas Importantes**:
   - Identifique as cláusulas mais relevantes
   - Destaque cláusulas de rescisão
   - Multas e penalidades
   - Condições especiais

4. **Análise de Riscos**:
   - Liste potenciais riscos contratuais
   - Classifique cada risco (Alto, Médio, Baixo)
   - Sugira mitigações quando possível

5. **Pontos de Atenção**:
   - Cláusulas que podem ser desfavoráveis
   - Pontos ambíguos que precisam de esclarecimento
   - Sugestões de melhorias

6. **Recomendações**:
   - Ações recomendadas antes da assinatura
   - Pontos a negociar
   - Documentação adicional necessária

Formate sua resposta de forma clara e organizada, usando markdown.
Seja objetivo e profissional. Use linguagem jurídica quando apropriado, mas explique termos complexos.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractText, contractInfo } = body;

    if (!contractText && !contractInfo) {
      return NextResponse.json(
        { error: "Texto do contrato ou informações são obrigatórios" },
        { status: 400 }
      );
    }

    const model = getModel();

    // Construir o prompt com as informações do contrato
    let userPrompt = "";

    if (contractInfo) {
      userPrompt = `Analise o seguinte contrato com base nas informações fornecidas:

**Informações do Contrato:**
- Cliente: ${contractInfo.clienteNome || "Não informado"}
- Tipo de Pessoa: ${contractInfo.tipoPessoa || "Não informado"}
- CPF/CNPJ: ${contractInfo.documento || "Não informado"}
- Situação Atual: ${contractInfo.situacao || "Não informada"}
- Valor Devido: ${contractInfo.valorDevido ? `R$ ${contractInfo.valorDevido.toLocaleString("pt-BR")}` : "Não informado"}
- Valor Negociado: ${contractInfo.valorNegociado ? `R$ ${contractInfo.valorNegociado.toLocaleString("pt-BR")}` : "Não negociado"}
- Tipo de Serviço: ${contractInfo.tipoServico || "Não informado"}
- Objeto do Contrato: ${contractInfo.objetoContrato || "Não informado"}
- Data do Último Contato: ${contractInfo.dataUltimoContato || "Não informada"}
- Data do Próximo Contato: ${contractInfo.dataProximoContato || "Não informada"}
- Número da Pasta: ${contractInfo.numeroPasta || "Não informado"}
- Consultor Responsável: ${contractInfo.consultorNome || "Não informado"}
- Parceiro: ${contractInfo.parceiroNome || "Não informado"}
- Valor de Entrada: ${contractInfo.valorEntrada ? `R$ ${contractInfo.valorEntrada.toLocaleString("pt-BR")}` : "Não informado"}
- Número de Parcelas: ${contractInfo.numeroParcelas || "Não informado"}
- Valor da Parcela: ${contractInfo.valorParcela ? `R$ ${contractInfo.valorParcela.toLocaleString("pt-BR")}` : "Não informado"}
- Comissão: ${contractInfo.comissao ? `${contractInfo.comissao}%` : "Não informada"}
- Pendências: ${contractInfo.pendencias || "Nenhuma registrada"}
- Observações: ${contractInfo.observacoes || "Nenhuma"}

${contractText ? `\n**Texto/Conteúdo Adicional do Contrato:**\n${contractText}` : ""}

Por favor, forneça uma análise completa considerando:
1. A situação atual do contrato e recomendações de próximos passos
2. Análise de risco considerando os valores e situação
3. Sugestões para melhorar a taxa de conversão/fechamento
4. Pontos de atenção específicos para este tipo de serviço jurídico`;
    } else {
      userPrompt = `Analise o seguinte contrato:

${contractText}

Por favor, forneça uma análise completa conforme as diretrizes.`;
    }

    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ];

    const response = await model.invoke(messages);
    const analysisText = response.content as string;

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro na análise do contrato:", error);

    if (error.message?.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "Chave da API OpenAI não configurada. Configure OPENAI_API_KEY no arquivo .env" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erro ao analisar contrato" },
      { status: 500 }
    );
  }
}


