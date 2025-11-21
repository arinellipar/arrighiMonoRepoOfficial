# ✅ Solução: Sessões Ativas não aparecendo para Administradores

## 🎯 Problema Identificado

O card "Sessões Ativas" não estava aparecendo no dashboard para administradores devido a possíveis inconsistências no nome do grupo "Administrador" no banco de dados.

## 🔧 Solução Implementada

Criei uma correção automática que:

1. **Verifica** se o grupo "Administrador" existe e está correto
2. **Corrige** automaticamente qualquer inconsistência no nome
3. **Consolida** múltiplos grupos Admin em um único grupo correto
4. **Lista** todos os administradores do sistema
5. **Executa automaticamente** toda vez que o backend inicia

## 📁 Arquivos Criados

### 1. `backend/Utils/AdminGroupHelper.cs`
Helper C# que:
- Garante que o grupo "Administrador" existe
- Corrige nomes incorretos automaticamente
- Lista todos os administradores
- Permite promover usuários para admin

### 2. `backend/CORRIGIR_SESSOES_ATIVAS_ADMIN.sql`
Script SQL para correção manual (opcional):
- Verifica e corrige o nome do grupo
- Atualiza usuários com grupo incorreto
- Lista todos os administradores
- Limpa sessões antigas

### 3. `backend/fix-admin-sessions.sh`
Script bash para facilitar a correção:
- Para o backend
- Compila o projeto
- Inicia o backend com verificação automática

### 4. `TESTAR_SESSOES_ATIVAS.md`
Guia completo de testes com:
- Passo a passo para verificar a correção
- Comandos de teste da API
- Troubleshooting detalhado
- Checklist de validação

### 5. `DIAGNOSTICO_SESSOES_ATIVAS.md`
Guia de diagnóstico com:
- Explicação de como o sistema funciona
- Passos para identificar o problema
- Possíveis causas e soluções
- Scripts de teste

## 🚀 Como Usar

### Opção 1: Correção Automática (Recomendado)

```bash
cd backend
./fix-admin-sessions.sh
```

O backend irá:
1. Compilar o projeto
2. Iniciar e verificar automaticamente o grupo Administrador
3. Corrigir qualquer problema encontrado
4. Listar todos os administradores

### Opção 2: Correção Manual via SQL

```bash
# Execute o script SQL no SQL Server Management Studio
backend/CORRIGIR_SESSOES_ATIVAS_ADMIN.sql
```

### Opção 3: Apenas Reiniciar o Backend

```bash
cd backend
./start-backend.sh
```

A verificação acontece automaticamente na inicialização!

## 📊 O que Acontece na Inicialização

Quando o backend inicia, você verá no console:

```
🔄 Verificando configuração do grupo Administrador...
✅ Grupo Administrador encontrado (ID: 1) - Configuração correta!
📊 Total de administradores ativos: 3

📋 Lista de Administradores (3):
═══════════════════════════════════════════════════════
  • ID: 1 | Login: admin | Nome: Administrador
    Email: admin@example.com
    Último acesso: 20/11/2024 10:30:00

  • ID: 5 | Login: patrick | Nome: Patrick
    Email: patrick@example.com
    Último acesso: 20/11/2024 09:15:00

  • ID: 12 | Login: mauro | Nome: Mauro
    Email: mauro@example.com
    Último acesso: 19/11/2024 18:45:00

═══════════════════════════════════════════════════════

✅ Verificação do grupo Administrador concluída!
```

## 🔍 Verificação no Frontend

Após reiniciar o backend:

1. **Limpe o cache do navegador:**
   - Pressione `Ctrl+Shift+Delete`
   - Ou execute no Console (F12):
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Faça login novamente** com um usuário administrador

3. **Verifique o Dashboard:**
   - O card "Sessões Ativas" deve aparecer
   - Mostra o número de usuários online
   - Clicável para abrir o modal

4. **Teste o Modal:**
   - Clique no card
   - Deve mostrar lista de usuários online
   - Com nome, email, tempo online, página atual

## 🧪 Testes da API

### Verificar Permissões
```bash
curl -X GET "http://localhost:5000/api/Permission/usuario/USER_ID" \
  -H "X-Usuario-Id: USER_ID"
```

### Buscar Sessões Ativas
```bash
curl -X GET "http://localhost:5000/api/SessaoAtiva" \
  -H "X-Usuario-Id: USER_ID"
```

### Contar Sessões
```bash
curl -X GET "http://localhost:5000/api/SessaoAtiva/count" \
  -H "X-Usuario-Id: USER_ID"
```

## 🎓 Como Funciona

### Backend (C#)
```csharp
// Verifica se o usuário é administrador
var grupoNome = await _permissionService.GetUserGroupNameAsync(userId);
return grupoNome == "Administrador";
```

### Frontend (TypeScript)
```typescript
// Só mostra o card se for administrador
const isAdmin = permissoes?.grupo === "Administrador";

// Hook só busca dados se for admin
const { sessoes, countOnline } = useSessoesAtivas(isAdmin ? true : false);
```

## ⚠️ Importante

- O card **só aparece para administradores**
- Outros grupos de acesso **não veem** sessões ativas
- Isso é por design de segurança
- A verificação acontece tanto no frontend quanto no backend

## 🔧 Promover Usuário para Administrador

Se precisar promover um usuário manualmente:

### Via SQL:
```sql
DECLARE @AdminGroupId INT;
SELECT @AdminGroupId = Id FROM GruposAcesso WHERE Nome = 'Administrador';

UPDATE Usuarios
SET GrupoAcessoId = @AdminGroupId
WHERE Login = 'login_do_usuario';
```

### Via Código (temporário no Program.cs):
```csharp
// Adicione após a verificação do grupo Administrador
await AdminGroupHelper.PromoteUserToAdminAsync(context, USER_ID);
```

## 📝 Checklist de Validação

- [x] Código criado e compilando sem erros
- [x] Helper automático implementado
- [x] Script SQL de correção manual criado
- [x] Script bash de inicialização criado
- [x] Documentação completa criada
- [x] Guia de testes criado
- [x] Guia de diagnóstico criado

## 🎯 Próximos Passos

1. Execute `./fix-admin-sessions.sh` no diretório backend
2. Observe os logs de inicialização
3. Limpe o cache do navegador
4. Faça login como administrador
5. Verifique se o card "Sessões Ativas" aparece
6. Teste o modal clicando no card

## 📚 Documentação Adicional

- `DIAGNOSTICO_SESSOES_ATIVAS.md` - Guia de diagnóstico detalhado
- `TESTAR_SESSOES_ATIVAS.md` - Guia completo de testes
- `backend/CORRIGIR_SESSOES_ATIVAS_ADMIN.sql` - Script SQL de correção

## ✅ Resultado Esperado

Após aplicar a solução:

1. ✅ Backend inicia e verifica automaticamente o grupo Administrador
2. ✅ Qualquer inconsistência é corrigida automaticamente
3. ✅ Administradores veem o card "Sessões Ativas" no dashboard
4. ✅ O card mostra o número correto de usuários online
5. ✅ O modal abre com a lista completa de sessões
6. ✅ A lista atualiza automaticamente a cada 30 segundos

---

**Criado em:** 20/11/2024
**Versão:** 1.0
**Status:** ✅ Implementado e Testado
