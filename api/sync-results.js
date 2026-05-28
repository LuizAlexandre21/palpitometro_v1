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
      if (!matchId) continue;

      const home = fixture.goals.home ?? "";
      const away = fixture.goals.away ?? "";
      if (home === "" || away === "") continue;

      await writeResults(matchId, home, away, campeonatoIds);
      synced++;
    }

    return res.status(200).json({ message: "Sync complete", synced, total: fixtures.length });
  } catch (err) {
    console.error("sync-results error:", err);
    return res.status(500).json({ error: err.message });
  }
};
