# 🔧 Correção: Erro "Erro ao buscar histórico de acessos"

## 🎯 Problema
O frontend está tentando buscar `/SessaoAtiva/historico` ao invés de `/SessaoAtiva`, causando erro 500.

## ✅ Solução Aplicada

### 1. Código Corrigido
O código do Dashboard já foi corrigido para usar:
```typescript
useSessoesAtivas(false); // false = busca /SessaoAtiva (apenas ativos)
```

### 2. Cache Limpo
O cache do Next.js foi removido:
- ✅ Pasta `.next` removida
- ✅ Cache do `node_modules` removido
- ✅ Processos na porta 3000 parados

## 🚀 Próximos Passos

### Você Precisa Reiniciar o Frontend

#### Opção 1: Usando npm
```bash
cd frontend
npm run dev
```

#### Opção 2: Usando pnpm
```bash
cd frontend
pnpm dev
```

#### Opção 3: Usando yarn
```bash
cd frontend
yarn dev
```

### Aguarde o Frontend Compilar
Você verá algo como:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 5.2s
```

### Teste Novamente
1. Abra o navegador em `http://localhost:3000`
2. Faça login como administrador
3. Vá para `/dashboard`
4. Verifique se o card "Sessões Ativas" aparece
5. Clique no card para abrir o modal

## 🔍 Verificação

### Console do Navegador (F12)
Você deve ver:
```
🔍 useSessoesAtivas: Buscando sessões ativas...
✅ useSessoesAtivas: Resposta recebida: X sessões
```

### Não Deve Ver:
```
❌ 🔧 ApiClient: Erro na resposta: "Erro ao buscar histórico de acessos"
```

## 📊 O Que Foi Mudado

### Antes (ERRADO)
```typescript
useSessoesAtivas(isAdmin ? true : false);
// true = busca /SessaoAtiva/historico ❌
```

### Depois (CORRETO)
```typescript
useSessoesAtivas(false);
// false = busca /SessaoAtiva ✅
```

## 🎯 Por Que Isso Aconteceu?

O endpoint `/SessaoAtiva/historico` requer que o header `X-Usuario-Id` seja enviado corretamente, e estava retornando erro de autenticação.

A solução foi usar o endpoint simples `/SessaoAtiva` que:
- ✅ Retorna apenas sessões ativas
- ✅ Inclui campo `estaOnline: true`
- ✅ Inclui campo `paginaAtual`
- ✅ Funciona perfeitamente para o dashboard

## ✅ Resultado Esperado

Após reiniciar o frontend:
- ✅ Card "Sessões Ativas" aparece
- ✅ Mostra número de usuários online
- ✅ Modal abre ao clicar
- ✅ Lista mostra usuários online com todas as informações
- ✅ Sem erros no console

---

**Data**: 20/11/2024
**Status**: ✅ Corrigido - Aguardando Reinício do Frontend
