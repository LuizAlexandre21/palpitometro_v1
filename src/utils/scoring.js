import { DEFAULT_RULES } from "../hooks/useRules";
import { GROUPS } from "../data/matchData";

export const outcome = (h, a) => h > a ? "H" : h < a ? "A" : "D";

export function scoreExtra(pred, actual, predType) {
  if (pred === undefined || pred === "" || actual === undefined) return false;
  if (predType === "exact") return parseInt(pred) === parseInt(actual);
  if (predType === "boolean") {
    const actualBool = actual === true || parseInt(actual) > 0;
    return pred === "true" ? actualBool : !actualBool;
  }
  return false;
}

export function calcPoints(pred, actual, rules = DEFAULT_RULES) {
  if (!pred || actual?.home === undefined || actual?.away === undefined) return null;
  const ph = parseInt(pred.home), pa = parseInt(pred.away);
  const ah = parseInt(actual.home), aa = parseInt(actual.away);
  if (isNaN(ph) || isNaN(pa) || isNaN(ah) || isNaN(aa)) return null;
  let pts = 0;
  if (rules.exactScore?.active) {
    if (ph === ah && pa === aa) pts += (rules.exactScore.points ?? 3);
  }
  if (rules.result?.active) {
    if (outcome(ph, pa) === outcome(ah, aa) && !(ph === ah && pa === aa)) {
      pts += (rules.result.points ?? 1);
    }
  }
  const extras = pred.extras || {};
  const actualExtras = actual.extras || {};
  for (const [ruleId, rule] of Object.entries(rules)) {
    if (ruleId === "exactScore" || ruleId === "result") continue;
    if (ruleId === "custom") {
      for (const [cid, crule] of Object.entries(rule || {})) {
        if (!crule.active) continue;
        if (scoreExtra(extras[cid], actualExtras[cid], crule.predType)) pts += (crule.points ?? 1);
      }
      continue;
    }
    if (!rule.active) continue;
    if (scoreExtra(extras[ruleId], actualExtras[ruleId], rule.predType)) pts += (rule.points ?? 1);
  }
  return pts;
}

export function groupStandings(key, results) {
  const st = {};
  GROUPS[key].teams.forEach(t => { st[t] = { team:t, pts:0, gf:0, ga:0, gd:0, w:0, d:0, l:0, p:0 }; });
  GROUPS[key].matches.forEach(m => {
    const r = results[m.id];
    if (!r || r.home==="" || r.home===undefined || r.away==="" || r.away===undefined) return;
    const h = parseInt(r.home), a = parseInt(r.away);
    if (isNaN(h) || isNaN(a)) return;
    st[m.home].gf+=h; st[m.home].ga+=a; st[m.home].gd+=h-a; st[m.home].p++;
    st[m.away].gf+=a; st[m.away].ga+=h; st[m.away].gd+=a-h; st[m.away].p++;
    if (h>a) { st[m.home].pts+=3; st[m.home].w++; st[m.away].l++; }
    else if (h<a) { st[m.away].pts+=3; st[m.away].w++; st[m.home].l++; }
    else { st[m.home].pts+=1; st[m.home].d++; st[m.away].pts+=1; st[m.away].d++; }
  });
  return Object.values(st).sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
}
