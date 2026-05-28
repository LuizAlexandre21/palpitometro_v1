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
  // ... (preencher com IDs reais quando disponíveis)
};

const FIXTURE_TO_MATCH = Object.fromEntries(
  Object.entries(MATCH_MAP).map(([matchId, fixtureId]) => [fixtureId, matchId])
);

module.exports = { MATCH_MAP, FIXTURE_TO_MATCH };
