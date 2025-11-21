# ✅ Verificação: Sessões Ativas no Dashboard

## 🎯 Requisitos Implementados

### 1. Visibilidade (✅ IMPLEMENTADO)
- **Apenas para Administradores**: O card "Sessões Ativas" só aparece para usuários com `grupo === "Administrador"`
- **Verificação no Frontend**: `const isAdmin = permissoes?.grupo === "Administrador"`
- **Verificação no Backend**: `IsAdminAsync()` verifica o grupo do usuário

### 2. Informações Exibidas (✅ IMPLEMENTADO)

#### No Card do Dashboard:
- ✅ **Número de usuários online** em tempo real
- ✅ **Texto "Em tempo real"** indicando atualização automática
- ✅ **Clicável** para abrir o modal com detalhes

#### No Modal (ao clicar no card):
Para cada usuário **ONLINE**:
- ✅ **Nome do usuário** (`nomeUsuario`)
- ✅ **Email** (`email`)
- ✅ **Perfil/Grupo** (`perfil`) com badge colorido
- ✅ **Status Online** com indicador verde pulsante
- ✅ **Página Atual** (`paginaAtual`) - destaque em azul
- ✅ **Tempo Online** (`tempoOnline`) - "há Xh Ym"
- ✅ **Última Atividade** (`ultimaAtividade`) - "Xm atrás"
- ✅ **Endereço IP** (`enderecoIP`)

Para cada usuário **OFFLINE**:
- ✅ **Nome do usuário**
- ✅ **Email**
- ✅ **Perfil/Grupo**
- ✅ **Último acesso** com data/hora formatada
- ✅ **Tempo que ficou online** na última sessão

### 3. Atualização em Tempo Real (✅ IMPLEMENTADO)
- ✅ **Atualização automática a cada 30 segundos**
- ✅ **Indicador visual** no footer do modal
- ✅ **Limpeza automática** de sessões inativas (> 15 min sem atividade)

### 4. Filtros e Busca (✅ IMPLEMENTADO)
- ✅ **Filtro por status**: Todos / Online / Offline
- ✅ **Busca por texto**: Nome, email ou perfil
- ✅ **Contadores**: Total, Online, Offline

## 📊 Estrutura de Dados

### Backend - Endpoint GET /api/SessaoAtiva
```json
[
  {
    "id": 1,
    "usuarioId": 1,
    "nomeUsuario": "Patrick Arinelli",
    "email": "ti4@fradema.com.br",
    "ultimoAcesso": "2024-11-20T10:30:00",
    "perfil": "Administrador",
    "inicioSessao": "2024-11-20T10:00:00",
    "ultimaAtividade": "2024-11-20T10:30:00",
    "enderecoIP": "192.168.1.1",
    "paginaAtual": "Dashboard",
    "tempoOnline": "00:30:00",
    "estaOnline": true
  }
]
```

### Frontend - Interface SessaoAtiva
```typescript
export interface SessaoAtiva {
  id: number;
  usuarioId: number;
  nomeUsuario: string;
  email: string;
  ultimoAcesso: string | null;
  perfil: string;
  inicioSessao: string | null;
  ultimaAtividade: string;
  tempoOnline: string;
  enderecoIP: string | null;
  paginaAtual?: string | null;
  estaOnline?: boolean;
  sessaoId?: number;
}
```

## 🔄 Fluxo de Funcionamento

### 1. Login do Usuário
```
1. Usuário faz login
2. AuthController registra sessão via POST /api/SessaoAtiva/registrar
3. Sessão criada com:
   - UsuarioId, NomeUsuario, Email, Perfil
   - InicioSessao = DateTime.UtcNow
   - UltimaAtividade = DateTime.UtcNow
   - EnderecoIP (capturado do request)
   - Ativa = true
```

### 2. Heartbeat (Atualização de Atividade)
```
1. Frontend envia PUT /api/SessaoAtiva/atualizar/{usuarioId} a cada 5 minutos
2. Body: { "paginaAtual": "Nome da Página Atual" }
3. Backend atualiza:
   - UltimaAtividade = DateTime.UtcNow
   - PaginaAtual = valor recebido
```

### 3. Visualização no Dashboard (Admin)
```
1. Dashboard verifica: isAdmin = permissoes?.grupo === "Administrador"
2. Se admin: useSessoesAtivas(false) busca GET /api/SessaoAtiva
3. Backend:
   - Verifica se usuário é admin (IsAdminAsync)
   - Limpa sessões inativas (> 15 min sem atividade)
   - Retorna apenas sessões ativas (Ativa = true)
4. Frontend:
   - Mostra card com contador
   - Atualiza a cada 30 segundos
```

### 4. Modal de Detalhes
```
1. Admin clica no card "Sessões Ativas"
2. Modal abre com lista de sessões
3. Para cada sessão online:
   - Badge verde "Online" pulsante
   - Página atual em destaque
   - Tempo online calculado
   - Última atividade relativa
4. Filtros e busca disponíveis
```

### 5. Logout do Usuário
```
1. Usuário faz logout
2. Frontend envia DELETE /api/SessaoAtiva/remover/{usuarioId}
3. Backend:
   - Marca sessão como inativa (Ativa = false)
   - Registra DataHoraOffline = DateTime.UtcNow
```

## 🔒 Segurança

### Frontend
```typescript
// Verifica se é admin antes de buscar
const isAdmin = permissoes?.grupo === "Administrador";
if (!isAdmin) {
  // Não busca dados
  // Não mostra card
  return;
}
```

### Backend
```csharp
// Verifica em TODOS os endpoints de sessões
private async Task<bool> IsAdminAsync()
{
    var grupoNome = await _permissionService.GetUserGroupNameAsync(userId);
    return grupoNome == "Administrador";
}

// Uso:
if (!await IsAdminAsync())
{
    return Forbid("Apenas administradores podem visualizar sessões ativas");
}
```

## 📝 Checklist de Verificação

### Backend
- [x] Endpoint GET /api/SessaoAtiva retorna `estaOnline: true`
- [x] Endpoint GET /api/SessaoAtiva retorna `paginaAtual`
- [x] Endpoint verifica se usuário é administrador
- [x] Limpeza automática de sessões inativas (> 15 min)
- [x] Heartbeat atualiza `paginaAtual` e `ultimaAtividade`
- [x] Grupo "Administrador" existe e está correto no banco

### Frontend
- [x] Card "Sessões Ativas" só aparece para administradores
- [x] Hook `useSessoesAtivas` verifica `isAdmin`
- [x] Hook busca endpoint correto: `/SessaoAtiva` (não `/historico`)
- [x] Atualização automática a cada 30 segundos
- [x] Modal mostra todas as informações corretamente
- [x] Filtros funcionam (Todos/Online/Offline)
- [x] Busca funciona (nome, email, perfil)

### Dados Exibidos
- [x] Nome do usuário
- [x] Email
- [x] Perfil com badge colorido
- [x] Status online com indicador verde
- [x] Página atual em destaque
- [x] Tempo online formatado
- [x] Última atividade relativa
- [x] Endereço IP

## 🧪 Como Testar

### 1. Verificar se é Administrador
```javascript
// No Console do navegador (F12)
const perm = JSON.parse(localStorage.getItem('permissoes'));
console.log('Grupo:', perm?.grupo);
console.log('É Admin?', perm?.grupo === 'Administrador');
```

### 2. Verificar Card no Dashboard
- Fazer login como administrador
- Ir para /dashboard
- Verificar se o card "Sessões Ativas" aparece
- Verificar se mostra número de usuários online

### 3. Verificar Modal
- Clicar no card "Sessões Ativas"
- Verificar se modal abre
- Verificar se mostra lista de usuários
- Verificar informações de cada usuário online:
  - Badge verde "Online"
  - Página atual
  - Tempo online
  - Última atividade
  - IP

### 4. Verificar Atualização em Tempo Real
- Abrir modal
- Abrir outra aba/janela
- Fazer login com outro usuário
- Voltar para o modal
- Aguardar até 30 segundos
- Verificar se novo usuário aparece

### 5. Verificar Página Atual
- Estar logado e com modal aberto
- Navegar para outra página (ex: /contratos)
- Aguardar 5 minutos (heartbeat)
- Verificar se "Página Atual" atualiza no modal

### 6. Verificar Filtros
- No modal, clicar em "Online"
- Verificar se mostra apenas usuários online
- Clicar em "Offline"
- Verificar se mostra apenas usuários offline
- Usar busca para filtrar por nome

## 🐛 Troubleshooting

### Card não aparece
**Causa**: Usuário não é administrador
**Solução**: Verificar grupo no banco de dados e executar script de correção

### Modal vazio
**Causa**: Nenhum usuário online ou erro na API
**Solução**:
1. Verificar console do navegador
2. Verificar logs do backend
3. Testar endpoint diretamente

### Página atual não atualiza
**Causa**: Heartbeat não está funcionando
**Solução**: Verificar AuthContext e heartbeat interval

### Dados desatualizados
**Causa**: Atualização automática não está funcionando
**Solução**: Verificar useEffect no hook useSessoesAtivas

## 📚 Arquivos Relacionados

### Backend
- `Controllers/SessaoAtivaController.cs` - Endpoints de sessões
- `Models/SessaoAtiva.cs` - Modelo de dados
- `Services/PermissionService.cs` - Verificação de admin
- `Utils/AdminGroupHelper.cs` - Helper para grupo admin

### Frontend
- `components/Dashboard.tsx` - Card de sessões ativas
- `components/SessoesAtivasModal.tsx` - Modal com detalhes
- `hooks/useSessoesAtivas.ts` - Hook para buscar dados
- `contexts/AuthContext.tsx` - Heartbeat e autenticação

## ✅ Status Final

**IMPLEMENTADO E FUNCIONANDO**

Todas as funcionalidades foram implementadas:
- ✅ Card visível apenas para administradores
- ✅ Mostra quem está online
- ✅ Mostra há quanto tempo está online
- ✅ Mostra quando entrou pela última vez
- ✅ Mostra em que página está em tempo real
- ✅ Atualização automática a cada 30 segundos
- ✅ Filtros e busca funcionando
- ✅ Segurança implementada (backend e frontend)

---

**Data**: 20/11/2024
**Versão**: 1.0
**Status**: ✅ Completo
