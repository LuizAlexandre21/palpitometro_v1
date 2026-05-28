# Sistema de Regras Personalizáveis — Palpitômetro Copa 2026

**Data:** 2026-05-27
**Projeto:** Palpitômetro v1
**Status:** Aprovado

---

## Objetivo

Permitir que o admin configure quais regras de pontuação estão ativas no campeonato e seus valores em pontos. Participantes fazem previsões adicionais por jogo (cartões, expulsões, perguntas customizadas) que integram ao ranking existente.

---

## Abordagem

Regras armazenadas em `/campeonatos/{id}/rules` no Firebase. A função `calcPoints` passa a receber as regras como parâmetro e soma pontos de todas as regras ativas. Todo cálculo ocorre no cliente em tempo real. Sem Cloud Functions nem infraestrutura adicional.

---

## Estrutura do Firebase

```
/campeonatos/{id}/
  rules/
    exactScore:    { active: true,  points: 3 }
    result:        { active: true,  points: 1 }
    yellowCards:   { active: false, points: 1, predType: "exact" }
    expulsions:    { active: false, points: 2, predType: "boolean" }
    custom/
      {ruleId}:    { active: true, points: 1, label: "Haverá gol no 1º tempo?", predType: "boolean" }

  predictions/{uid}/{matchId}/
    home: "2"
    away: "1"
    extras/
      yellowCards: "3"
      expulsions:  "true"
      {ruleId}:    "true"

  results/{matchId}/
    home: "2"
    away: "1"
    extras/
      yellowCards: 4        // populado por sync-results.js via API-Football
      expulsions:  1        // populado por sync-results.js via API-Football
      {ruleId}:    "true"   // preenchido manualmente pelo admin (regras custom)
```

### Tipos de regra (`predType`)
- `"exact"` — input numérico; acerta se pred === actual (ambos inteiros)
- `"boolean"` — toggle Sim/Não; acerta se pred === String(actual === true || actual > 0)

### Regras base vs automáticas vs customizadas
- **Base** (`exactScore`, `result`): podem ser desativadas ou ter pontos alterados; não podem ser removidas
- **Automáticas** (`yellowCards`, `expulsions`): mesmas restrições; dados vêm da API-Football
- **Customizadas** (`custom/{ruleId}`): criadas e removidas pelo admin livremente

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `src/hooks/useRules.js` | Criar | Escuta `/rules` via `onValue`, retorna `{ rules, loading }` com fallback |
| `src/App.js` | Modificar | Usar `useRules`, passar `rules` para `calcPoints` em todos os call sites |
| `src/App.js` — `calcPoints` | Modificar | Receber `rules` como 3º parâmetro; somar pontos de todas as regras ativas |
| `src/App.js` — `PredictionsView` | Modificar | Mostrar campos extras por jogo quando há regras extras ativas |
| `src/App.js` — `ResultsView` | Modificar | Campos auto read-only + campos custom editáveis pelo admin |
| `src/App.js` — `ConfigView` | Modificar | Nova aba "Regras" com lista de regras, toggles, pontos, + criar/remover custom |
| `api/sync-results.js` | Modificar | Também gravar `extras/yellowCards` e `extras/expulsions` quando regras ativas |

---

## Hook `useRules`

```js
// src/hooks/useRules.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, off } from "firebase/database";

const DEFAULT_RULES = {
  exactScore: { active: true,  points: 3 },
  result:     { active: true,  points: 1 },
};

export function useRules(campeonatoId) {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campeonatoId) return;
    const r = ref(db, `campeonatos/${campeonatoId}/rules`);
    const unsub = onValue(r, snap => {
      setRules(snap.exists() ? { ...DEFAULT_RULES, ...snap.val() } : DEFAULT_RULES);
      setLoading(false);
    });
    return () => off(r, "value", unsub);
  }, [campeonatoId]);

  return { rules, loading };
}
```

---

## calcPoints atualizada

```js
function calcPoints(pred, actual, rules = DEFAULT_RULES) {
  if (!pred || actual?.home === undefined || actual?.away === undefined) return null;
  const ph = parseInt(pred.home), pa = parseInt(pred.away);
  const ah = parseInt(actual.home), aa = parseInt(actual.away);
  if (isNaN(ph) || isNaN(pa) || isNaN(ah) || isNaN(aa)) return null;

  let pts = 0;

  // Regra: placar exato
  if (rules.exactScore?.active) {
    if (ph === ah && pa === aa) pts += (rules.exactScore.points ?? 3);
  }

  // Regra: resultado correto
  if (rules.result?.active) {
    const outcome = (h, a) => h > a ? "H" : h < a ? "A" : "D";
    if (outcome(ph, pa) === outcome(ah, aa) && !(ph === ah && pa === aa)) {
      pts += (rules.result.points ?? 1);
    }
  }

  // Regras extras (yellowCards, expulsions, custom)
  const extras = pred.extras || {};
  const actualExtras = actual.extras || {};

  for (const [ruleId, rule] of Object.entries(rules)) {
    if (ruleId === "exactScore" || ruleId === "result") continue;
    if (ruleId === "custom") {
      // iterar sobre sub-regras custom
      for (const [cid, crule] of Object.entries(rule || {})) {
        if (!crule.active) continue;
        const score = scoreExtra(extras[cid], actualExtras[cid], crule.predType);
        if (score) pts += (crule.points ?? 1);
      }
      continue;
    }
    if (!rule.active) continue;
    const score = scoreExtra(extras[ruleId], actualExtras[ruleId], rule.predType);
    if (score) pts += (rule.points ?? 1);
  }

  return pts;
}

function scoreExtra(pred, actual, predType) {
  if (pred === undefined || pred === "" || actual === undefined) return false;
  if (predType === "exact") return parseInt(pred) === parseInt(actual);
  if (predType === "boolean") {
    const actualBool = actual === true || parseInt(actual) > 0;
    return pred === "true" ? actualBool : !actualBool;
  }
  return false;
}
```

> **Nota:** `exactScore` e `result` não acumulam — se o placar é exato, apenas `exactScore` pontua; `result` só pontua quando o resultado está correto mas o placar não é exato.

---

## ConfigView — nova aba "Regras"

### Lista de regras exibida

| Tipo | Label | Toggle | Pontos | Remover |
|------|-------|--------|--------|---------|
| base | Placar Exato | ✓ | [3] | — |
| base | Resultado Correto | ✓ | [1] | — |
| auto | Cartões Amarelos | ☐ | [1] | — |
| auto | Expulsões | ☐ | [2] | — |
| custom | (label do admin) | ✓ | [1] | ✕ |

### Tipo predType para regras automáticas
Ao ativar Cartões ou Expulsões, o admin escolhe o tipo de previsão:
- **Exato** — participante digita o número
- **Sim/Não** — participante responde "Haverá cartão/expulsão?"

### Criar regra customizada
- Campos: label (texto), pontos (número), tipo (exato ou sim/não)
- ID gerado automaticamente: `Date.now().toString(36)`
- Gravado em `/campeonatos/{id}/rules/custom/{ruleId}`

### Remover regra customizada
- Botão ✕ visível apenas para regras custom
- Grava `null` em `/campeonatos/{id}/rules/custom/{ruleId}` (Firebase remove o nó)

---

## PredictionsView — campos extras por jogo

Quando `Object.values(rules).some(r => r.active && !["exactScore","result"].includes(ruleId))`:
- Abaixo do placar home/away no MatchCard, aparece seção colapsável "Palpites extras"
- Renderiza um campo por regra extra ativa:
  - `predType === "exact"` → `<input type="number">` com label da regra
  - `predType === "boolean"` → dois botões "Sim" / "Não" (pill buttons)
- Salvo em `predictions/{uid}/{matchId}/extras/{ruleId}` via `updatePrediction`

---

## ResultsView — campos extras

- Regras automáticas (`yellowCards`, `expulsions`): campo read-only com valor da API ou "Aguardando API"
- Regras customizadas: editáveis pelo admin (input ou sim/não conforme predType)
- Salvo em `results/{matchId}/extras/{ruleId}` via `write()`

---

## sync-results.js — dados extras

Quando `yellowCards.active || expulsions.active` em qualquer campeonato ativo:

```js
// Adicionar ao fetchLiveFixtures / fetchFinishedToday
// Endpoint de estatísticas: GET /fixtures/statistics?fixture={id}
// statistics[0].statistics → array com tipo e valor

async function fetchStatistics(fixtureId) {
  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );
  const data = await res.json();
  let yellowCards = 0, expulsions = 0;
  for (const team of (data.response || [])) {
    for (const stat of (team.statistics || [])) {
      if (stat.type === "Yellow Cards") yellowCards += (stat.value || 0);
      if (stat.type === "Red Cards") expulsions += (stat.value || 0);
    }
  }
  return { yellowCards, expulsions };
}
```

Grava em `results/{matchId}/extras/yellowCards` e `results/{matchId}/extras/expulsions` para todos os campeonatos.

---

## Fora de Escopo

- Artilheiro do jogo ou previsões de jogadores específicos
- Previsões em nível de torneio (ex: "quem é o campeão?") — já existe separado em KnockoutView
- Retroatividade de pontos ao mudar regras (mudar regras só afeta jogos futuros)
- Notificações quando resultado + extras são lançados
