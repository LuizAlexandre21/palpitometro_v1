# Firebase Realtime Database — Design

**Data:** 2026-05-27  
**Projeto:** Palpitômetro v1  
**Status:** Aprovado

---

## Objetivo

Substituir o `window.storage` (armazenamento local por sessão) por Firebase Realtime Database, tornando os dados de cada campeonato compartilhados em tempo real entre todos os participantes.

---

## Abordagem

Substituição direta: `window.storage.get/set` → Firebase SDK (`ref`, `set`, `onValue`). Sem Firebase Auth — qualquer pessoa com o link pode ler e escrever.

---

## Estrutura do Banco

```
/campeonatos/{campeonatoId}/
  ├── pool          { name: string }
  ├── google        { clientId: string, adminEmail: string }
  ├── participants  [ { id, name, isAdmin, email?, picture?, googleId? } ]
  ├── results       { [matchId]: { home: string, away: string } }
  ├── predictions   { [participantId]: { [matchId]: { home: string, away: string } } }
  └── komatches     { [matchId]: { home?: string, away?: string, ... } }
```

`currentUser` permanece em `localStorage` — é dado local de sessão, não compartilhado.

---

## URL e Identificação do Campeonato

- O ID do campeonato fica na URL como query param: `?id=abc123`
- IDs gerados com 6 caracteres alfanuméricos aleatórios (ex: `x7k2pq`)
- Fluxo de entrada:
  1. App abre → lê `?id` da URL
  2. **Sem ID:** mostra tela de criar campeonato → gera ID → salva no Firebase → redireciona para `?id={novoId}`
  3. **Com ID:** conecta ao nó `/campeonatos/{id}` via `onValue` (escuta em tempo real)

---

## Arquivos a Criar/Modificar

### `src/firebase.js` (novo)
- Inicializa o app Firebase com config via variáveis de ambiente
- Exporta `db` (instância do Realtime Database)
- Exporta helpers: `readOnce(path)`, `write(path, value)`, `subscribe(path, cb)` / `unsubscribe`

### `src/App.js` (modificar)
- Remover toda a lógica de `window.storage`
- Adicionar leitura do `?id` da URL no mount
- Substituir `load()` por `subscribe` no nó do campeonato (`onValue`)
- Substituir cada `sv(key, val)` por `write(path, val)`
- `currentUser` continua em `localStorage`
- Adicionar geração de ID e redirecionamento na criação

---

## Variáveis de Ambiente

Arquivo `.env` (não commitado):

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_DATABASE_URL=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

Configurar as mesmas variáveis no painel do Vercel (Settings → Environment Variables).

---

## Regras de Segurança Firebase

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Abertas por enquanto — a segurança é feita no nível do app (admin = primeiro participante).

---

## Comportamento em Tempo Real

- Ao entrar em um campeonato existente, `onValue` sincroniza imediatamente e a cada mudança remota
- Escritas são otimistas: o estado React é atualizado antes da confirmação do Firebase
- Não há merge manual — o `onValue` sempre sobrescreve o estado local com o que está no banco

---

## Migração de Dados Existentes

Ignorada — dados em `localStorage` da versão anterior não são migrados. O app começa limpo no Firebase.

---

## Fora de Escopo

- Firebase Auth (autenticação de usuários via Firebase)
- Regras de segurança por usuário
- Múltiplos campeonatos por admin / listagem de campeonatos
- Offline persistence (Firebase offline cache)
