const fs = require("fs");
const path = require("path");

const PT_TO_EN = {
  "México": "Mexico", "África do Sul": "South Africa", "Coreia do Sul": "South Korea",
  "Tchéquia": "Czech Republic", "Canadá": "Canada", "Bósnia": "Bosnia",
  "Catar": "Qatar", "Suíça": "Switzerland", "Brasil": "Brazil",
  "Marrocos": "Morocco", "Haiti": "Haiti", "Escócia": "Scotland",
  "EUA": "United States", "Paraguai": "Paraguay", "Austrália": "Australia",
  "Turquia": "Turkey", "Alemanha": "Germany", "Curaçao": "Curacao",
  "C. Marfim": "Ivory Coast", "Equador": "Ecuador", "Holanda": "Netherlands",
  "Japão": "Japan", "Suécia": "Sweden", "Tunísia": "Tunisia",
  "Bélgica": "Belgium", "Egito": "Egypt", "Irã": "Iran",
  "N. Zelândia": "New Zealand", "Espanha": "Spain", "Cabo Verde": "Cape Verde",
  "A. Saudita": "Saudi Arabia", "Uruguai": "Uruguay", "França": "France",
  "Senegal": "Senegal", "Iraque": "Iraq", "Noruega": "Norway",
  "Argentina": "Argentina", "Argélia": "Algeria", "Áustria": "Austria",
  "Jordânia": "Jordan", "Portugal": "Portugal", "RD Congo": "DR Congo",
  "Uzbequistão": "Uzbekistan", "Colômbia": "Colombia", "Inglaterra": "England",
  "Croácia": "Croatia", "Gana": "Ghana", "Panamá": "Panama",
};

async function fetchBadge(ptName) {
  const enName = PT_TO_EN[ptName];
  if (!enName) return null;
  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(enName)}`;
    const res = await fetch(url);
    const data = await res.json();
    const teams = data.teams || [];
    const match = teams.find(t =>
      t.strSport === "Soccer" &&
      (t.strTeam === enName || t.strTeam.includes(enName))
    ) || teams.find(t => t.strSport === "Soccer");
    return match?.strTeamBadge || null;
  } catch {
    return null;
  }
}

async function main() {
  const result = {};
  for (const ptName of Object.keys(PT_TO_EN)) {
    process.stdout.write(`Fetching: ${ptName}...`);
    const url = await fetchBadge(ptName);
    if (url) {
      result[ptName] = url + "/tiny";
      console.log(" ✓");
    } else {
      console.log(" ✗ (not found)");
    }
    await new Promise(r => setTimeout(r, 300));
  }

  const content = `// Gerado por scripts/fetch-crests.js — não editar manualmente\nexport const CREST_URLS = ${JSON.stringify(result, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, "../src/data/crestUrls.js"), content);
  console.log("\nSalvo em src/data/crestUrls.js");
}

main();
