# CRM Judiciário Arrighi

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MUI](https://img.shields.io/badge/MUI-7.3-007FFF?style=for-the-badge&logo=mui)

**Sistema de Gestão de Relacionamento com Clientes para o setor Jurídico**

[English](./README.en.md) | [Français](./README.fr.md) | Português

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Deploy](#-deploy)

---

## 🎯 Sobre o Projeto

O **CRM Judiciário Arrighi** é uma solução completa de gestão de relacionamento com clientes desenvolvida especificamente para escritórios de advocacia e departamentos jurídicos. O sistema oferece uma interface moderna e intuitiva para gerenciar clientes, contratos, boletos, consultores e muito mais.

### Principais Diferenciais

- 🤖 **Análise de Contratos com IA** - Integração com GPT-4 via LangChain para análise inteligente de contratos
- 🌙 **Design Premium Dark** - Interface elegante com tema escuro e detalhes em dourado
- 📊 **Dashboard Analítico** - Visualização de dados em tempo real
- 🔐 **Portal do Cliente** - Área exclusiva para clientes acessarem seus dados
- 📱 **Responsivo** - Funciona perfeitamente em desktop, tablet e mobile

---

## ✨ Funcionalidades

### Gestão de Clientes
- Cadastro de Pessoa Física e Jurídica
- Histórico completo de interações
- Busca automática de CEP com preenchimento de endereço

### Gestão de Contratos
- Criação e acompanhamento de contratos
- Status: Ativo, Inativo, Pendente, Cancelado, Quitado
- Filtros por filial, consultor e situação
- Análise de contratos com Inteligência Artificial

### Gestão Financeira
- Controle de boletos
- Mapas de faturamento
- Análise de risco de inadimplência
- Previsão financeira (Forecast)

### Portal do Cliente
- Login seguro com CPF/CNPJ e senha
- Visualização de contratos
- Acompanhamento de pagamentos
- Acesso a documentos

### Administração
- Gestão de usuários e permissões
- Controle de sessões ativas
- Grupos de acesso por filial

---

## 🛠 Tecnologias

### Frontend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Next.js | 16.0.7 | Framework React com SSR |
| React | 19.2.1 | Biblioteca de UI |
| TypeScript | 5.9 | Tipagem estática |
| Tailwind CSS | 3.4 | Framework CSS utilitário |
| MUI | 7.3 | Componentes Material Design |
| Framer Motion | 12.23 | Animações |
| TanStack Query | 5.62 | Gerenciamento de estado servidor |

### Backend
| Tecnologia | Descrição |
|------------|-----------|
| .NET Core | Framework para APIs |
| C# | Linguagem de programação |
| Entity Framework | ORM para banco de dados |
| SQL Server | Banco de dados |

### Inteligência Artificial
| Tecnologia | Descrição |
|------------|-----------|
| LangChain | Framework para aplicações com LLM |
| OpenAI GPT-4 | Modelo de linguagem para análise |

### Ferramentas
| Tecnologia | Descrição |
|------------|-----------|
| pnpm | Gerenciador de pacotes |
| ESLint | Linting de código |
| Sentry | Monitoramento de erros |
| Vercel Analytics | Análise de performance |

---

## 📦 Pré-requisitos

- **Node.js** 18.17 ou superior
- **pnpm** 10.x (recomendado) ou npm/yarn
- **.NET 8** ou superior (para o backend)
- **SQL Server** (para o banco de dados)

---

## 🚀 Instalação

### Frontend

#### 1. Navegue até o diretório frontend

```bash
cd frontend
```

#### 2. Instale as dependências

```bash
pnpm install
```

#### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NEXT_PUBLIC_API_URL=http://localhost:5101/api
OPENAI_API_KEY=sua-chave-openai
```

#### 4. Execute o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Backend

#### 1. Navegue até o diretório backend

```bash
cd backend
```

#### 2. Restaure os pacotes

```bash
dotnet restore
```

#### 3. Execute as migrações

```bash
dotnet ef database update
```

#### 4. Execute o servidor

```bash
dotnet run
```

A API estará disponível em `http://localhost:5101`.

---

## 📁 Estrutura do Projeto

```
arrighiMonoRepoOfficial/
├── frontend/                   # Aplicação Next.js
│   ├── src/
│   │   ├── app/                # Rotas do Next.js (App Router)
│   │   │   ├── api/            # API Routes
│   │   │   ├── boletos/        # Página de boletos
│   │   │   ├── cadastros/      # Cadastros (PF/PJ)
│   │   │   ├── clientes/       # Gestão de clientes
│   │   │   ├── contratos/      # Gestão de contratos
│   │   │   ├── dashboard/      # Dashboard e financeiro
│   │   │   ├── portal-cliente/ # Portal do Cliente
│   │   │   └── usuarios/       # Gestão de usuários
│   │   │
│   │   ├── components/         # Componentes React
│   │   ├── contexts/           # Contextos React
│   │   ├── hooks/              # Custom Hooks
│   │   ├── lib/                # Utilitários
│   │   ├── services/           # Serviços de API
│   │   ├── types/              # Definições TypeScript
│   │   └── theme/              # Configuração de tema
│   │
│   ├── public/                 # Arquivos estáticos
│   └── package.json
│
├── backend/                    # API .NET Core
│   ├── Controllers/            # Controllers da API
│   ├── Data/                   # Contexto do banco de dados
│   ├── Migrations/             # Migrações do EF
│   ├── Models/                 # Modelos de dados
│   ├── Services/               # Serviços de negócio
│   └── Program.cs              # Ponto de entrada
│
├── README.md                   # Documentação (PT-BR)
├── README.en.md                # Documentação (English)
└── README.fr.md                # Documentação (Français)
```

---

## 📜 Scripts Disponíveis

### Frontend

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Compila para produção |
| `pnpm start` | Inicia servidor de produção |
| `pnpm lint` | Executa linting do código |
| `pnpm type-check` | Verifica tipos TypeScript |

### Backend

| Comando | Descrição |
|---------|-----------|
| `dotnet run` | Inicia o servidor |
| `dotnet build` | Compila o projeto |
| `dotnet ef database update` | Aplica migrações |
| `dotnet test` | Executa testes |

---

## 🔐 Variáveis de Ambiente

### Frontend

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL da API backend | ✅ |
| `OPENAI_API_KEY` | Chave da API OpenAI | Para IA |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do Sentry | Para monitoramento |

### Backend

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `ConnectionStrings__DefaultConnection` | String de conexão SQL Server | ✅ |
| `JWT__Secret` | Chave secreta para JWT | ✅ |

---

## 🌐 Deploy

### Frontend - Vercel (Recomendado)

```bash
cd frontend
pnpm build
vercel deploy --prod
```

### Frontend - Docker

```bash
cd frontend
docker build -t crm-juridico-frontend .
docker run -p 3000:3000 crm-juridico-frontend
```

### Backend - Docker

```bash
cd backend
docker build -t crm-juridico-backend .
docker run -p 5101:5101 crm-juridico-backend
```

---

## 📄 Licença

Este projeto é proprietário e de uso exclusivo da Arrighi Advogados.

---

<div align="center">

**Desenvolvido com ❤️ para Arrighi Advogados**

</div>

