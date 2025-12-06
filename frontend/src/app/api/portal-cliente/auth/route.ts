import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "../../../../../env.config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documento, tipoDocumento, senha } = body;

    if (!documento || !tipoDocumento) {
      return NextResponse.json(
        { error: "Documento e tipo são obrigatórios." },
        { status: 400 }
      );
    }

    if (!senha) {
      return NextResponse.json(
        { error: "Senha é obrigatória." },
        { status: 400 }
      );
    }

    // Validar formato do documento
    if (tipoDocumento === "CPF" && documento.length !== 11) {
      return NextResponse.json(
        { error: "CPF deve conter 11 dígitos." },
        { status: 400 }
      );
    }

    if (tipoDocumento === "CNPJ" && documento.length !== 14) {
      return NextResponse.json(
        { error: "CNPJ deve conter 14 dígitos." },
        { status: 400 }
      );
    }

    const apiUrl = getApiUrl();
    console.log(`🔍 Portal Cliente Auth: Buscando ${tipoDocumento}: ${documento}`);
    console.log(`🔍 Portal Cliente Auth: API URL: ${apiUrl}`);

    // Primeiro, verificar credenciais usando o endpoint de login do sistema
    // O cliente usa o CPF/CNPJ como login e sua senha cadastrada
    const authResponse = await fetch(`${apiUrl}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: documento,
        senha: senha,
      }),
    });

    console.log(`🔍 Portal Cliente Auth: Auth response status: ${authResponse.status}`);

    if (!authResponse.ok) {
      if (authResponse.status === 401) {
        return NextResponse.json(
          { error: "CPF/CNPJ ou senha incorretos. Verifique seus dados e tente novamente." },
          { status: 401 }
        );
      }
      if (authResponse.status === 404) {
        return NextResponse.json(
          { error: "Usuário não encontrado. Você precisa ter uma conta no sistema para acessar o portal." },
          { status: 404 }
        );
      }
      const errorText = await authResponse.text();
      console.error(`❌ Portal Cliente Auth: Erro na autenticação: ${errorText}`);
      return NextResponse.json(
        { error: "Erro ao verificar credenciais. Tente novamente." },
        { status: 500 }
      );
    }

    // Autenticação OK - agora buscar dados do cliente
    let clienteData = null;

    if (tipoDocumento === "CPF") {
      // Buscar cliente diretamente pelo CPF
      const clienteResponse = await fetch(
        `${apiUrl}/Cliente/buscar-por-cpf/${documento}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`🔍 Portal Cliente Auth: Cliente response status: ${clienteResponse.status}`);

      if (!clienteResponse.ok) {
        if (clienteResponse.status === 404) {
          return NextResponse.json(
            { error: "Você ainda não possui cadastro como cliente. Entre em contato conosco." },
            { status: 404 }
          );
        }
        const errorText = await clienteResponse.text();
        console.error(`❌ Portal Cliente Auth: Erro ao buscar cliente: ${errorText}`);
        throw new Error("Erro ao buscar cliente");
      }

      clienteData = await clienteResponse.json();
      console.log(`✅ Portal Cliente Auth: Cliente encontrado: ${clienteData.pessoaFisica?.nome}`);

      // Montar objeto do cliente autenticado
      const clienteAutenticado = {
        id: clienteData.id,
        tipoPessoa: "Fisica" as const,
        nome: clienteData.pessoaFisica?.nome || "Cliente",
        documento: documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
        email: clienteData.pessoaFisica?.emailEmpresarial || clienteData.pessoaFisica?.emailPessoal || "",
        telefone: clienteData.pessoaFisica?.telefone1,
        pessoaFisica: clienteData.pessoaFisica,
        filialId: clienteData.filialId,
        dataCadastro: clienteData.dataCadastro,
      };

      return NextResponse.json({ cliente: clienteAutenticado });

    } else if (tipoDocumento === "CNPJ") {
      // Buscar cliente diretamente pelo CNPJ
      const clienteResponse = await fetch(
        `${apiUrl}/Cliente/buscar-por-cnpj/${documento}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`🔍 Portal Cliente Auth: Cliente response status: ${clienteResponse.status}`);

      if (!clienteResponse.ok) {
        if (clienteResponse.status === 404) {
          return NextResponse.json(
            { error: "Sua empresa ainda não possui cadastro como cliente. Entre em contato conosco." },
            { status: 404 }
          );
        }
        const errorText = await clienteResponse.text();
        console.error(`❌ Portal Cliente Auth: Erro ao buscar cliente: ${errorText}`);
        throw new Error("Erro ao buscar cliente");
      }

      clienteData = await clienteResponse.json();
      console.log(`✅ Portal Cliente Auth: Cliente encontrado: ${clienteData.pessoaJuridica?.razaoSocial}`);

      // Montar objeto do cliente autenticado
      const clienteAutenticado = {
        id: clienteData.id,
        tipoPessoa: "Juridica" as const,
        nome: clienteData.pessoaJuridica?.razaoSocial || clienteData.pessoaJuridica?.nomeFantasia || "Empresa",
        documento: documento.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          "$1.$2.$3/$4-$5"
        ),
        email: clienteData.pessoaJuridica?.email || "",
        telefone: clienteData.pessoaJuridica?.telefone1,
        pessoaJuridica: clienteData.pessoaJuridica,
        filialId: clienteData.filialId,
        dataCadastro: clienteData.dataCadastro,
      };

      return NextResponse.json({ cliente: clienteAutenticado });
    }

    return NextResponse.json(
      { error: "Tipo de documento inválido." },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Portal Cliente Auth: Erro na autenticação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

