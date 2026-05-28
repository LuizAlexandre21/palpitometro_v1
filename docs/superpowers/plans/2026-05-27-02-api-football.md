# API-Football Auto-Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Pré-requisito:** Plano `2026-05-27-01-firebase-db-auth.md` deve estar completo (Firebase configurado).

**Goal:** Sincronizar automaticamente os resultados dos jogos da Copa 2026 via API-Football, usando um Vercel Cron Job que só consome quota quando há jogos em andamento.

**Architecture:** Uma Vercel Serverless Function (`api/sync-results.js`) é chamada a cada 3 minutos pelo Vercel Cron. Ela busca jogos em andamento na API-Football e grava os resultados em todos os campeonatos ativos no Firebase. Os IDs dos jogos da API-Football são mapeados para os IDs internos do app via arquivo de mapeamento estático.

**Tech Stack:** Vercel Cron Jobs, Vercel Serverless Functions (Node.js), API-Football v3, Firebase Admin SDK

---

## Estrutura de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `api/sync-results.js` | Criar | Serverless function: busca API-Football → grava no Firebase |
| `api/match-map.js` | Criar | Mapeamento estático: matchId interno → fixture ID da API-Football |
| `vercel.json` | Modificar | Adicionar cron job |
| `.env` | Modificar | Adicionar `API_FOOTBALL_KEY`, `CRON_SECRET`, `FIREBASE_SERVICE_ACCOUNT` |

---

## Task 1: Obter credenciais

**Files:** Configuração externa — sem arquivos de código.

- [ ] **Criar conta na API-Football**

Acessar https://www.api-sports.io → Sign Up Free.
Copiar a API Key gerada no dashboard.

- [ ] **Obter FIFA World Cup 2026 league ID**

A Copa 2026 usa `league=1` na API-Football v3. Confirmar com:
```bash
curl -H "x-apisports-key: SUA_CHAVE" \
  "https://v3.football.api-sports.io/leagues?id=1&season=2026"
```
Esperado: objeto com `league.name: "FIFA World Cup"`.

- [ ] **Gerar Firebase Service Account**

Firebase Console → Project Settings → Service Accounts → Generate new private key.
Salvar o JSON. Não commitar.

- [ ] **Gerar CRON_SECRET**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Guardar o valor.

---

## Task 2: Variáveis de ambiente

**Files:**
- Modify: `.env`
- Modify: `.env.example`

- [ ] **Adicionar ao `.env` local**

```
API_FOOTBALL_KEY=sua_chave_aqui
CRON_SECRET=sua_string_aleatoria
FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

> `FIREBASE_SERVICE_ACCOUNT` é o conteúdo JSON em uma linha (minificar antes de colar).

- [ ] **Adicionar ao `.env.example`**

```
API_FOOTBALL_KEY=
CRON_SECRET=
FIREBASE_DATABASE_URL=
FIREBASE_SERVICE_ACCOUNT=
```

- [ ] **Commit**

```bash
git add .env.example
git commit -m "chore: add API-Football env vars to .env.example"
```

---

## Task 3: Instalar firebase-admin

**Files:** `package.json`

- [ ] **Instalar**

```bash
cd /home/alexandre/palpitometro_v1 && npm install firebase-admin
```

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add firebase-admin dependency"
```

---

## Task 4: Criar mapeamento de partidas

**Files:**
- Create: `api/match-map.js`

O mapeamento conecta os IDs internos do app (ex: `A1`) com os fixture IDs da API-Football. Este arquivo é preenchido quando os fixtures da Copa 2026 estiverem disponíveis na API.

- [ ] **Criar `api/match-map.js` com estrutura inicial**

```js
/**
 * Mapeamento: matchId interno → fixture ID da API-Football v3
 * Preencher quando os fixtures da Copa 2026 estiverem disponíveis.
 * 
 * Para buscar os fixture IDs:
 * curl -H "x-apisports-key: KEY" \
 *   "https://v3.football.api-sports.io/fixtures?league=1&season=2026"
 */
const MATCH_MAP = {
  // Fase de grupos — Grupo A
  // "A1": 12345,  // México vs África do Sul
  // "A2": 12346,  // Coreia do Sul vs Tchéquia
  // ... (preencher com IDs reais)
};

/**
 * Mapeamento inverso: fixture ID → matchId interno
 */
const FIXTURE_TO_MATCH = Object.fromEntries(
  Object.entries(MATCH_MAP).map(([matchId, fixtureId]) => [fixtureId, matchId])
);

module.exports = { MATCH_MAP, FIXTURE_TO_MATCH };
```

- [ ] **Buscar e preencher os fixture IDs (quando disponíveis)**

```bash
curl -H "x-apisports-key: $API_FOOTBALL_KEY" \
  "https://v3.football.api-sports.io/fixtures?league=1&season=2026" \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
for f in data.get('response', []):
    print(f['fixture']['id'], f['teams']['home']['name'], 'vs', f['teams']['away']['name'], f['fixture']['date'])
"
```

Usar a saída para preencher `MATCH_MAP` com os IDs corretos.

- [ ] **Commit**

```bash
git add api/match-map.js
git commit -m "feat: add API-Football match ID mapping"
```

---

## Task 5: Criar a Serverless Function `api/sync-results.js`

**Files:**
- Create: `api/sync-results.js`

- [ ] **Criar `api/sync-results.js`**

```js
const admin = require("firebase-admin");
const { FIXTURE_TO_MATCH } = require("./match-map");

// Inicializa Firebase Admin (singleton)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

async function fetchLiveFixtures() {
  const res = await fetch(
    "https://v3.football.api-sports.io/fixtures?league=1&season=2026&live=all",
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );
  const data = await res.json();
  return data.response || [];
}

async function fetchFinishedToday() {
  const today = new Date().toISOString().slice(0, 10);
  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${today}&status=FT`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );
  const data = await res.json();
  return data.response || [];
}

async function getAllCampeonatoIds() {
  const snap = await db.ref("campeonatos").once("value");
  if (!snap.exists()) return [];
  return Object.keys(snap.val());
}

async function writeResults(matchId, home, away, campeonatoIds) {
  const updates = {};
  campeonatoIds.forEach(id => {
    updates[`campeonatos/${id}/results/${matchId}`] = { home: String(home), away: String(away) };
  });
  await db.ref().update(updates);
}

module.exports = async function handler(req, res) {
  // Validar CRON_SECRET para evitar chamadas não autorizadas
  const secret = req.headers["x-cron-secret"] || req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [live, finished] = await Promise.all([fetchLiveFixtures(), fetchFinishedToday()]);
    const fixtures = [...live, ...finished];

    if (fixtures.length === 0) {
      return res.status(200).json({ message: "No fixtures to sync", synced: 0 });
    }

    const campeonatoIds = await getAllCampeonatoIds();
    if (campeonatoIds.length === 0) {
      return res.status(200).json({ message: "No campeonatos found", synced: 0 });
    }

    let synced = 0;
    for (const fixture of fixtures) {
      const fixtureId = fixture.fixture.id;
      const matchId = FIXTURE_TO_MATCH[fixtureId];
      if (!matchId) continue; // fixture não mapeado

      const home = fixture.goals.home ?? "";
      const away = fixture.goals.away ?? "";
      if (home === "" || away === "") continue; // sem placar ainda

      await writeResults(matchId, home, away, campeonatoIds);
      synced++;
    }

    return res.status(200).json({ message: "Sync complete", synced, total: fixtures.length });
  } catch (err) {
    console.error("sync-results error:", err);
    return res.status(500).json({ error: err.message });
  }
};
```

- [ ] **Commit**

```bash
git add api/sync-results.js
git commit -m "feat: sync-results serverless function for API-Football"
```

---

## Task 6: Configurar Vercel Cron

**Files:**
- Modify: `vercel.json`

- [ ] **Atualizar `vercel.json`**

```json
{
  "buildCommand": "CI=false npm run build",
  "outputDirectory": "build",
  "crons": [
    {
      "path": "/api/sync-results",
      "schedule": "*/3 * * * *"
    }
  ]
}
```

> O Vercel Cron chama o endpoint via GET. A autenticação é feita pelo `CRON_SECRET` que o Vercel injeta automaticamente como header `x-cron-secret` quando configurado nas env vars.

- [ ] **Commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel cron job for API-Football sync every 3 minutes"
```

---

## Task 7: Configurar variáveis no Vercel e fazer deploy

**Files:** Configuração no painel do Vercel.

- [ ] **Adicionar variáveis no Vercel**

Vercel → Settings → Environment Variables:
- `API_FOOTBALL_KEY` → sua chave
- `CRON_SECRET` → string gerada na Task 1
- `FIREBASE_DATABASE_URL` → URL do banco
- `FIREBASE_SERVICE_ACCOUNT` → JSON minificado (em uma linha)

- [ ] **Push e verificar deploy**

```bash
git push
```

Aguardar deploy. Verificar no Vercel Dashboard → Functions que `api/sync-results` aparece.

- [ ] **Testar manualmente o endpoint**

```bash
curl -H "x-cron-secret: SEU_CRON_SECRET" \
  "https://seu-app.vercel.app/api/sync-results"
```

Esperado: `{"message":"No fixtures to sync","synced":0}` (fora de dia de jogo) ou resultados sincronizados durante a Copa.

- [ ] **Verificar logs do cron no Vercel**

Vercel Dashboard → Logs → filtrar por `/api/sync-results`.
Confirmar que está sendo chamado a cada 3 minutos sem erros.
