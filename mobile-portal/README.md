# 📱 Portal do Cliente - Mobile

Portal do cliente mobile desenvolvido em **React Native (Expo)** com backend em **NestJS**, integrado ao banco de dados **Azure SQL Server** e **Azure Blob Storage** existentes.

## 🏗️ Arquitetura

```
mobile-portal/
├── app/                    # Frontend React Native (Expo)
│   ├── app/               # Rotas (Expo Router)
│   │   ├── (auth)/       # Telas de autenticação
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (app)/        # Telas autenticadas
│   │   │   ├── home.tsx
│   │   │   ├── boletos.tsx
│   │   │   ├── documents.tsx
│   │   │   └── profile.tsx
│   │   └── _layout.tsx
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       ├── services/      # API client
│       ├── stores/        # Zustand stores
│       └── theme/         # Cores e estilos
│
└── backend/               # Backend NestJS
    ├── src/
    │   ├── config/       # Configurações (DB, etc)
    │   ├── entities/     # Entidades TypeORM
    │   └── modules/      # Módulos da aplicação
    │       ├── auth/     # Autenticação JWT
    │       ├── clients/  # Perfil do cliente
    │       ├── boletos/  # Consulta de boletos
    │       ├── documents/# Download de documentos
    │       └── notifications/ # Notificações push
    └── migrations/       # Scripts SQL
```

## 🚀 Tecnologias

### Frontend (App Mobile)
- **React Native** com **Expo SDK 52**
- **Expo Router** para navegação
- **TanStack Query** para cache e fetching
- **Zustand** para estado global
- **Expo Secure Store** para armazenamento seguro

### Backend (API)
- **NestJS 10**
- **TypeORM** com **MSSQL**
- **Passport JWT** para autenticação
- **Azure Blob Storage SDK** para documentos
- **class-validator** para validação

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Acesso ao Azure SQL Server existente
- Acesso ao Azure Blob Storage existente

## 🔧 Configuração

### 1. Backend

```bash
cd mobile-portal/backend

# Copiar arquivo de ambiente
cp env.example .env

# Editar .env com suas credenciais
# DB_HOST, DB_USERNAME, DB_PASSWORD, etc.

# Instalar dependências
npm install

# Executar migration (criar tabela ClienteCredenciais)
# Execute o SQL em migrations/001_create_cliente_credenciais.sql no Azure SQL

# Iniciar servidor
npm run start:dev
```

### 2. Frontend (App)

```bash
cd mobile-portal/app

# Instalar dependências
npm install

# Criar arquivo de ambiente
echo "EXPO_PUBLIC_API_URL=http://localhost:3001/api" > .env

# Iniciar Expo
npx expo start
```

## 📱 Funcionalidades

### Para o Cliente

1. **Login/Cadastro**
   - Login com email e senha
   - Cadastro vinculado ao CPF/CNPJ existente no sistema

2. **Dashboard (Home)**
   - Resumo financeiro (em aberto, vencido, pago)
   - Próximo vencimento
   - Boletos em aberto

3. **Boletos**
   - Lista completa de boletos
   - Filtros (todos, abertos, pagos)
   - Copiar linha digitável
   - Copiar código de barras
   - Pagar com PIX (QR Code)

4. **Documentos**
   - Lista de contratos
   - Download de PDFs do Azure Blob

5. **Perfil**
   - Dados cadastrais
   - Contratos ativos
   - Configurações

## 🔐 Autenticação

O sistema usa JWT para autenticação:

1. Cliente faz cadastro usando CPF/CNPJ existente no banco
2. Sistema cria credencial na tabela `ClienteCredenciais`
3. Login retorna token JWT válido por 7 dias
4. Token é armazenado de forma segura no dispositivo

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Cadastro

### Cliente (autenticado)
- `GET /api/clients/profile` - Perfil completo
- `GET /api/clients/contracts` - Contratos

### Boletos (autenticado)
- `GET /api/boletos` - Todos os boletos
- `GET /api/boletos/resumo` - Resumo financeiro
- `GET /api/boletos/abertos` - Boletos em aberto
- `GET /api/boletos/pagos` - Boletos pagos
- `GET /api/boletos/:id` - Detalhes de um boleto

### Documentos (autenticado)
- `GET /api/documents` - Lista de documentos
- `GET /api/documents/contrato/:id/download` - Download de contrato

### Notificações (autenticado)
- `GET /api/notifications` - Lista de notificações
- `POST /api/notifications/register-token` - Registrar token push

## 🎨 Design

O app segue o padrão visual do sistema principal:
- Tema escuro premium
- Cores: azul escuro (#1a1a2e) + dourado (#d4af37)
- Cards com bordas arredondadas
- Ícones emoji para acessibilidade

## 📦 Build para Produção

### Android
```bash
cd mobile-portal/app
eas build --platform android
```

### iOS
```bash
cd mobile-portal/app
eas build --platform ios
```

## 🔄 Integração com Sistema Existente

O portal mobile usa o **mesmo banco de dados** do sistema principal:
- Lê dados de `Clientes`, `PessoasFisicas`, `PessoasJuridicas`
- Lê dados de `Contratos` e `Boletos`
- Acessa arquivos no Azure Blob Storage
- **Nova tabela**: `ClienteCredenciais` para autenticação

## 📝 Notas

- O backend NestJS roda em porta separada (3001) do backend principal (5101)
- Boletos são somente leitura - geração continua pelo sistema principal
- Status de boletos segue a mesma lógica do frontend web (LIQUIDADO, VENCIDO, etc.)

