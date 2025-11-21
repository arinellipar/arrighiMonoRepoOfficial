# Diagnóstico: Sessões Ativas não aparecendo para Administradores

## Problema
O card "Sessões Ativas" não está aparecendo no dashboard para usuários administradores.

## Como o Sistema Funciona

### 1. Verificação de Administrador no Frontend
O card de Sessões Ativas **só aparece** se:
```typescript
const isAdmin = permissoes?.grupo === "Administrador";
```

### 2. Verificação no Backend
O controller `SessaoAtivaController.cs` verifica:
```csharp
private async Task<bool> IsAdminAsync()
{
    var grupoNome = await _permissionService.GetUserGroupNameAsync(userId);
    return grupoNome == "Administrador";
}
```

## Passos para Diagnosticar

### Passo 1: Verificar Permissões no Console do Navegador

1. Abra o dashboard como administrador
2. Abra o Console do Navegador (F12)
3. Digite e execute:
```javascript
// Verificar se o usuário está autenticado
console.log("User:", localStorage.getItem('user'));

// Verificar permissões
console.log("Permissões:", localStorage.getItem('permissoes'));
```

4. Verifique se o campo `grupo` está exatamente como **"Administrador"**

### Passo 2: Verificar no Banco de Dados

Execute esta query no SQL Server:

```sql
-- Verificar grupos de acesso
SELECT * FROM GruposAcesso;

-- Verificar usuário específico e seu grupo
SELECT
    u.Id,
    u.Login,
    u.Email,
    u.GrupoAcessoId,
    g.Nome as GrupoNome
FROM Usuarios u
LEFT JOIN GruposAcesso g ON u.GrupoAcessoId = g.Id
WHERE u.Login = 'SEU_LOGIN_AQUI';

-- Verificar se o nome do grupo está correto
SELECT DISTINCT Nome FROM GruposAcesso;
```

### Passo 3: Verificar Logs do Backend

Procure por logs relacionados a sessões ativas:

```bash
# No terminal onde o backend está rodando, procure por:
# - "Apenas administradores podem visualizar sessões ativas"
# - "Encontradas X sessões ativas"
```

### Passo 4: Testar API Diretamente

Use o Postman ou curl para testar:

```bash
# Obter token de autenticação primeiro
curl -X POST http://localhost:5000/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"seu_login","senha":"sua_senha"}'

# Testar endpoint de sessões ativas
curl -X GET http://localhost:5000/api/SessaoAtiva \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "X-Usuario-Id: SEU_USER_ID"

# Testar endpoint de permissões
curl -X GET http://localhost:5000/api/Permission/usuario/SEU_USER_ID \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Possíveis Causas e Soluções

### Causa 1: Nome do Grupo Incorreto no Banco
**Sintoma:** O grupo não está exatamente como "Administrador"

**Solução:**
```sql
-- Verificar nome exato
SELECT Id, Nome, DATALENGTH(Nome) as TamanhoBytes
FROM GruposAcesso
WHERE Nome LIKE '%Admin%';

-- Corrigir se necessário
UPDATE GruposAcesso
SET Nome = 'Administrador'
WHERE Id = ID_DO_GRUPO_ADMIN;
```

### Causa 2: Usuário não está no Grupo Administrador
**Sintoma:** O usuário tem GrupoAcessoId diferente do grupo Administrador

**Solução:**
```sql
-- Encontrar ID do grupo Administrador
SELECT Id FROM GruposAcesso WHERE Nome = 'Administrador';

-- Atualizar usuário
UPDATE Usuarios
SET GrupoAcessoId = ID_DO_GRUPO_ADMIN
WHERE Login = 'SEU_LOGIN';
```

### Causa 3: Cache de Permissões Desatualizado
**Sintoma:** As permissões no frontend estão desatualizadas

**Solução:**
1. Fazer logout
2. Limpar localStorage:
```javascript
localStorage.clear();
```
3. Fazer login novamente

### Causa 4: Hook useSessoesAtivas não está sendo chamado
**Sintoma:** O hook retorna dados vazios

**Solução:** Verificar no código do Dashboard se:
```typescript
const isAdmin = permissoes?.grupo === "Administrador";
const { sessoes, count: sessoesCount, countOnline: sessoesOnline } =
  useSessoesAtivas(isAdmin ? true : false);
```

## Teste Rápido

Execute este código no Console do Navegador (F12) no dashboard:

```javascript
// Verificar estado atual
const checkAdmin = () => {
  const permStr = localStorage.getItem('permissoes');
  if (!permStr) {
    console.error('❌ Permissões não encontradas no localStorage');
    return;
  }

  const perm = JSON.parse(permStr);
  console.log('📋 Permissões:', perm);
  console.log('👤 Grupo:', perm.grupo);
  console.log('✅ É Admin?', perm.grupo === 'Administrador');

  if (perm.grupo !== 'Administrador') {
    console.warn('⚠️ Usuário não é Administrador!');
    console.log('Grupo atual:', perm.grupo);
    console.log('Esperado: "Administrador"');
  } else {
    console.log('✅ Usuário é Administrador - Sessões Ativas devem aparecer');
  }
};

checkAdmin();
```

## Verificação Final

Depois de corrigir, verifique se:

1. ✅ O card "Sessões Ativas" aparece no dashboard
2. ✅ Ao clicar no card, abre o modal com a lista de sessões
3. ✅ O contador mostra o número correto de usuários online
4. ✅ A lista atualiza automaticamente a cada 30 segundos

## Logs Úteis

### Frontend (Console do Navegador)
```
🔒 useSessoesAtivas: Usuário não é administrador, bloqueando acesso
// OU
🔍 useSessoesAtivas: Buscando sessões ativas...
✅ useSessoesAtivas: Resposta recebida: X sessões
```

### Backend (Terminal)
```
Encontradas X sessões ativas
// OU
Apenas administradores podem visualizar sessões ativas
```

## Contato para Suporte

Se o problema persistir após seguir todos os passos:
1. Capture os logs do frontend (Console)
2. Capture os logs do backend (Terminal)
3. Execute as queries SQL de diagnóstico
4. Compartilhe os resultados para análise
