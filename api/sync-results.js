const admin = require("firebase-admin");
const { FIXTURE_TO_MATCH } = require("./match-map");

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

async function fetchStatistics(fixtureId) {
  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );
  const data = await res.json();
  let yellowCards = 0, expulsions = 0;
  for (const team of (data.response || [])) {
    for (const stat of (team.statistics || [])) {
      if (stat.type === "Yellow Cards") yellowCards += (parseInt(stat.value) || 0);
      if (stat.type === "Red Cards") expulsions += (parseInt(stat.value) || 0);
    }
  }
  return { yellowCards, expulsions };
}

async function getRulesForCampeonatos(campeonatoIds) {
  const results = {};
  await Promise.all(campeonatoIds.map(async id => {
    const snap = await db.ref(`campeonatos/${id}/rules`).once("value");
    results[id] = snap.val() || {};
  }));
  return results;
}

async function getAllCampeonatoIds() {
  const snap = await db.ref("campeonatos").once("value");
  if (!snap.exists()) return [];
  return Object.keys(snap.val());
}

async function writeResults(matchId, home, away, campeonatoIds, extras = {}) {
  const updates = {};
  campeonatoIds.forEach(id => {
    updates[`campeonatos/${id}/results/${matchId}/home`] = String(home);
    updates[`campeonatos/${id}/results/${matchId}/away`] = String(away);
    if (extras.yellowCards !== undefined) {
      updates[`campeonatos/${id}/results/${matchId}/extras/yellowCards`] = extras.yellowCards;
    }
    if (extras.expulsions !== undefined) {
      updates[`campeonatos/${id}/results/${matchId}/extras/expulsions`] = extras.expulsions;
    }
  });
  await db.ref().update(updates);
}

module.exports = async function handler(req, res) {
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

    const allRules = await getRulesForCampeonatos(campeonatoIds);
    const needStats = campeonatoIds.some(id =>
      allRules[id]?.yellowCards?.active || allRules[id]?.expulsions?.active
    );

    let synced = 0;
    for (const fixture of fixtures) {
      const fixtureId = fixture.fixture.id;
      const matchId = FIXTURE_TO_MATCH[fixtureId];
      if (!matchId) continue;

      const home = fixture.goals.home ?? "";
      const away = fixture.goals.away ?? "";
      if (home === "" || away === "") continue;

      let extras = {};
      if (needStats) {
        try { extras = await fetchStatistics(fixtureId); } catch (_) {}
      }

      await writeResults(matchId, home, away, campeonatoIds, extras);
      synced++;
    }

    return res.status(200).json({ message: "Sync complete", synced, total: fixtures.length });
  } catch (err) {
    console.error("sync-results error:", err);
    return res.status(500).json({ error: err.message });
  }
};
