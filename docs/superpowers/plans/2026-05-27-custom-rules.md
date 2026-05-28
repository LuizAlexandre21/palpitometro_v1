# Custom Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the admin to configure active scoring rules (base, automatic, and custom) per campeonato, with participants predicting extras per game and points calculated accordingly.

**Architecture:** Rules are stored in `/campeonatos/{id}/rules` in Firebase Realtime Database and read by a `useRules` hook. The existing `calcPoints` function receives rules as a 3rd parameter; a new `scoreExtra` helper handles extra rule types. The app component passes rules down to all views. No backend changes beyond updating `sync-results.js` to write card/expulsion statistics from API-Football.

**Tech Stack:** React 19, Firebase Realtime Database (onValue), Create React App (no test runner configured — verify with `CI=false npm run build`)

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/hooks/useRules.js` | **Create** | New hook: listens to `/campeonatos/{id}/rules` |
| `src/App.js` lines 101-108 | **Modify** | `calcPoints` + new `scoreExtra` helper |
| `src/App.js` leaderboard memo (~807) | **Modify** | Pass `rules` to `calcPoints` |
| `src/App.js` `PredictionsView` (~289) | **Modify** | Accept `rules` prop, show extras fields per match |
| `src/App.js` `ResultsView` (~386) | **Modify** | Accept `rules` prop, show read-only auto fields + editable custom fields |
| `src/App.js` `ConfigView` (~650) | **Modify** | Add "Regras" tab with toggles, points, custom rule CRUD |
| `src/App.js` `App()` (~732) | **Modify** | Wire `useRules`, propagate `rules` to all consumers |
| `api/sync-results.js` | **Modify** | Fetch `/fixtures/statistics` for yellowCards/expulsions |

---

### Task 1: `useRules` hook

**Files:**
- Create: `src/hooks/useRules.js`

- [ ] **Step 1: Create the file**

```js
// src/hooks/useRules.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, off } from "firebase/database";

export const DEFAULT_RULES = {
  exactScore: { active: true,  points: 3 },
  result:     { active: true,  points: 1 },
};

export function useRules(campeonatoId) {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campeonatoId) { setLoading(false); return; }
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

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alexandre/palpitometro_v1 && CI=false npm run build 2>&1 | tail -5
```
Expected: `Compiled successfully.`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useRules.js
git commit -m "feat: add useRules hook"
```

---

### Task 2: Update `calcPoints` and add `scoreExtra`

**Files:**
- Modify: `src/App.js:101-108`

The current `calcPoints` at line 101 hardcodes 3 and 1 points and ignores extras. Replace lines 101-108 with:

- [ ] **Step 1: Replace `calcPoints` block**

Replace this exact block in `src/App.js` (lines 101-108):
```js
function calcPoints(pred,actual){
  if(!pred||actual?.home===undefined||actual?.away===undefined) return null;
  const ph=parseInt(pred.home),pa=parseInt(pred.away),ah=parseInt(actual.home),aa=parseInt(actual.away);
  if(isNaN(ph)||isNaN(pa)||isNaN(ah)||isNaN(aa)) return null;
  if(ph===ah&&pa===aa) return 3;
  if(outcome(ph,pa)===outcome(ah,aa)) return 1;
  return 0;
}
```

With:
```js
function scoreExtra(pred, actual, predType) {
  if (pred === undefined || pred === "" || actual === undefined) return false;
  if (predType === "exact") return parseInt(pred) === parseInt(actual);
  if (predType === "boolean") {
    const actualBool = actual === true || parseInt(actual) > 0;
    return pred === "true" ? actualBool : !actualBool;
  }
  return false;
}
function calcPoints(pred, actual, rules = DEFAULT_RULES) {
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
```

- [ ] **Step 2: Add import for `DEFAULT_RULES` at top of App.js**

Find the existing imports block near the top of `src/App.js` (around line 1-10) and add:
```js
import { useRules, DEFAULT_RULES } from "./hooks/useRules";
```

- [ ] **Step 3: Verify build passes**

```bash
CI=false npm run build 2>&1 | tail -5
```
Expected: `Compiled successfully.`

- [ ] **Step 4: Commit**

```bash
git add src/App.js
git commit -m "feat: calcPoints accepts rules param with scoreExtra helper"
```

---

### Task 3: Wire `useRules` in `App()` and propagate to consumers

**Files:**
- Modify: `src/App.js` — `App()` component (~line 732), `leaderboard` useMemo (~line 807)

The `App()` component currently calls `useCampeonato` and derives data. We need to:
1. Call `useRules(campeonatoId)` alongside the other hooks
2. Pass `rules` down to `PredictionsView`, `ResultsView`, `ConfigView`
3. Update `leaderboard` useMemo to pass `rules` to `calcPoints`

- [ ] **Step 1: Add `useRules` call inside `App()`**

Find the line (around 741):
```js
  const { data, loading, notFound, write, createCampeonato, findByCode, joinCampeonato } = useCampeonato(campeonatoId, firebaseUser);
```

Add immediately after it:
```js
  const { rules } = useRules(campeonatoId);
```

- [ ] **Step 2: Update `leaderboard` useMemo**

Find (around line 807-816):
```js
  const leaderboard = useMemo(() =>
    participants.map(p => {
      let pts = 0, exact = 0, correct = 0;
      ALL_MATCHES.forEach(m => {
        const mp = calcPoints(predictions[p.uid]?.[m.id], results[m.id]);
        if (mp === 3) { pts += 3; exact++; }
        else if (mp === 1) { pts += 1; correct++; }
      });
      return { ...p, id: p.uid, pts, exact, correct };
    }).sort((a, b) => b.pts - a.pts),
  [participants, predictions, results]);
```

Replace with:
```js
  const leaderboard = useMemo(() =>
    participants.map(p => {
      let pts = 0, exact = 0, correct = 0;
      ALL_MATCHES.forEach(m => {
        const mp = calcPoints(predictions[p.uid]?.[m.id], results[m.id], rules);
        if (mp > 0) {
          pts += mp;
          const ph = parseInt(predictions[p.uid]?.[m.id]?.home);
          const pa = parseInt(predictions[p.uid]?.[m.id]?.away);
          const ah = parseInt(results[m.id]?.home);
          const aa = parseInt(results[m.id]?.away);
          if (ph === ah && pa === aa) exact++;
          else correct++;
        }
      });
      return { ...p, id: p.uid, pts, exact, correct };
    }).sort((a, b) => b.pts - a.pts),
  [participants, predictions, results, rules]);
```

- [ ] **Step 3: Pass `rules` to views in the render section**

Find the JSX render section of `App()` where views are rendered (around line 900+). For `PredictionsView`, add `rules={rules}`:
```jsx
<PredictionsView participants={participants} activePart={activePart} setActivePart={setActivePart}
  predictions={predictions} updatePrediction={updatePrediction} results={results}
  currentUser={currentUser} rules={rules}/>
```

For `ResultsView`, add `rules={rules}` and `write={write}`:
```jsx
<ResultsView results={results} updateResult={updateResult} currentUser={currentUser} rules={rules} write={write} campeonatoId={campeonatoId}/>
```

For `ConfigView`, add `rules={rules}` and `write={write}`:
```jsx
<ConfigView poolConfig={data?.pool} updatePoolConfig={updatePoolConfig} participants={participants}
  currentUser={currentUser} campeonatoId={campeonatoId} inviteCode={data?.code}
  rules={rules} write={write}/>
```

- [ ] **Step 4: Verify build passes**

```bash
CI=false npm run build 2>&1 | tail -5
```
Expected: `Compiled successfully.`

- [ ] **Step 5: Commit**

```bash
git add src/App.js
git commit -m "feat: wire useRules into App, propagate rules to views"
```

---

### Task 4: `PredictionsView` extras fields

**Files:**
- Modify: `src/App.js` — `PredictionsView` function (~line 289)

Add `rules` prop and render extra fields per match when extra rules are active.

- [ ] **Step 1: Update `PredictionsView` signature and add extras rendering**

Find the function signature:
```js
function PredictionsView({participants,activePart,setActivePart,predictions,updatePrediction,results,currentUser}){
```

Replace with:
```js
function PredictionsView({participants,activePart,setActivePart,predictions,updatePrediction,results,currentUser,rules=DEFAULT_RULES}){
```

- [ ] **Step 2: Add helper to compute extra rules list**

Inside `PredictionsView`, before the `return`, add:
```js
  const extraRules = [];
  for (const [ruleId, rule] of Object.entries(rules)) {
    if (ruleId === "exactScore" || ruleId === "result") continue;
    if (ruleId === "custom") {
      for (const [cid, crule] of Object.entries(rule || {})) {
        if (crule.active) extraRules.push({ id: cid, ...crule });
      }
      continue;
    }
    if (rule.active) extraRules.push({ id: ruleId, ...rule });
  }
```

- [ ] **Step 3: Add extras section inside the MatchCard render block**

Find the inner match render block inside `PredictionsView` (around line 368-374):
```jsx
                  return <MatchCard key={match.id} match={match} hVal={pred?.home} aVal={pred?.away} onH={v=>updatePrediction(p.id,match.id,"home",v)} onA={v=>updatePrediction(p.id,match.id,"away",v)} disabled={hasActual} pts={hasActual?calcPoints(pred,actual):null}/>;
```

Replace with:
```jsx
                  return (
                    <div key={match.id}>
                      <MatchCard match={match} hVal={pred?.home} aVal={pred?.away}
                        onH={v=>updatePrediction(p.id,match.id,"home",v)}
                        onA={v=>updatePrediction(p.id,match.id,"away",v)}
                        disabled={hasActual} pts={hasActual?calcPoints(pred,actual,rules):null}/>
                      {extraRules.length>0&&(
                        <div style={{padding:"8px 14px 10px",marginTop:-4,background:"rgba(59,130,246,.04)",borderRadius:"0 0 12px 12px",border:`1px solid ${T.border}`,borderTop:"none",display:"flex",flexDirection:"column",gap:8}}>
                          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Palpites extras</div>
                          {extraRules.map(er=>(
                            <div key={er.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                              <span style={{fontSize:12,color:T.sub,flex:1}}>{er.label||er.id}</span>
                              {er.predType==="exact"
                                ? <input type="number" min="0" disabled={hasActual}
                                    value={pred?.extras?.[er.id]||""}
                                    onChange={e=>updatePrediction(p.id,match.id,`extras/${er.id}`,e.target.value)}
                                    style={{width:60,padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:"rgba(255,255,255,.05)",color:T.text,fontSize:13,textAlign:"center",fontFamily:"inherit",outline:"none"}}/>
                                : <div style={{display:"flex",gap:6}}>
                                    {["true","false"].map(v=>(
                                      <button key={v} disabled={hasActual}
                                        onClick={()=>updatePrediction(p.id,match.id,`extras/${er.id}`,v)}
                                        style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${pred?.extras?.[er.id]===v?T.primary:T.border}`,background:pred?.extras?.[er.id]===v?"rgba(59,130,246,.2)":"transparent",color:pred?.extras?.[er.id]===v?T.primaryLight:T.sub,cursor:hasActual?"not-allowed":"pointer",fontSize:12,fontFamily:"inherit"}}>
                                        {v==="true"?"Sim":"Não"}
                                      </button>
                                    ))}
                                  </div>
                              }
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
```

- [ ] **Step 4: Verify build passes**

```bash
CI=false npm run build 2>&1 | tail -5
```
Expected: `Compiled successfully.`

- [ ] **Step 5: Commit**

```bash
git add src/App.js
git commit -m "feat: PredictionsView shows extras fields per active rule"
```

---

### Task 5: `ResultsView` extras fields

**Files:**
- Modify: `src/App.js` — `ResultsView` function (~line 386)

Add `rules`, `write`, and `campeonatoId` props. Show read-only auto fields and editable custom fields.

- [ ] **Step 1: Update `ResultsView` signature**

Find:
```js
function ResultsView({results,updateResult,currentUser}){
```

Replace with:
```js
function ResultsView({results,updateResult,currentUser,rules=DEFAULT_RULES,write,campeonatoId}){
```

- [ ] **Step 2: Add `extraRules` helper inside `ResultsView`**

Inside `ResultsView`, before the `return`, add:
```js
  const autoRuleIds = ["yellowCards", "expulsions"];
  const extraRules = [];
  for (const [ruleId, rule] of Object.entries(rules)) {
    if (ruleId === "exactScore" || ruleId === "result") continue;
    if (ruleId === "custom") {
      for (const [cid, crule] of Object.entries(rule || {})) {
        if (crule.active) extraRules.push({ id: cid, isAuto: false, ...crule });
      }
      continue;
    }
    if (rule.active) extraRules.push({ id: ruleId, isAuto: autoRuleIds.includes(ruleId), ...rule });
  }
  const updateResultExtra = async (matchId, ruleId, val) => {
    if (write && campeonatoId) await write(`results/${matchId}/extras/${ruleId}`, val);
  };
```

- [ ] **Step 3: Add extras section inside the match render block in `ResultsView`**

Find inside `ResultsView` the match render:
```jsx
            {open&&gData.matches.map(match=>(
              <MatchCard key={match.id} match={match} hVal={results[match.id]?.home} aVal={results[match.id]?.away}
                onH={v=>isAdmin&&updateResult(match.id,"home",v)} onA={v=>isAdmin&&updateResult(match.id,"away",v)} disabled={!isAdmin} pts={null}/>
            ))}
```

Replace with:
```jsx
            {open&&gData.matches.map(match=>(
              <div key={match.id}>
                <MatchCard match={match} hVal={results[match.id]?.home} aVal={results[match.id]?.away}
                  onH={v=>isAdmin&&updateResult(match.id,"home",v)} onA={v=>isAdmin&&updateResult(match.id,"away",v)} disabled={!isAdmin} pts={null}/>
                {extraRules.length>0&&(
                  <div style={{padding:"8px 14px 10px",marginTop:-4,background:"rgba(59,130,246,.04)",borderRadius:"0 0 12px 12px",border:`1px solid ${T.border}`,borderTop:"none",display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Extras</div>
                    {extraRules.map(er=>(
                      <div key={er.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                        <span style={{fontSize:12,color:T.sub,flex:1}}>{er.label||er.id}</span>
                        {er.isAuto
                          ? <span style={{fontSize:12,color:T.muted,padding:"4px 10px",borderRadius:7,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`}}>
                              {results[match.id]?.extras?.[er.id]??<span style={{color:T.muted,fontStyle:"italic"}}>Aguardando API</span>}
                            </span>
                          : er.predType==="exact"
                            ? <input type="number" min="0" disabled={!isAdmin}
                                value={results[match.id]?.extras?.[er.id]||""}
                                onChange={e=>updateResultExtra(match.id,er.id,e.target.value)}
                                style={{width:60,padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:isAdmin?"rgba(255,255,255,.07)":"rgba(255,255,255,.03)",color:T.text,fontSize:13,textAlign:"center",fontFamily:"inherit",outline:"none",cursor:isAdmin?"text":"not-allowed"}}/>
                            : <div style={{display:"flex",gap:6}}>
                                {["true","false"].map(v=>(
                                  <button key={v} disabled={!isAdmin}
                                    onClick={()=>isAdmin&&updateResultExtra(match.id,er.id,v)}
                                    style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${results[match.id]?.extras?.[er.id]===v?T.primary:T.border}`,background:results[match.id]?.extras?.[er.id]===v?"rgba(59,130,246,.2)":"transparent",color:results[match.id]?.extras?.[er.id]===v?T.primaryLight:T.sub,cursor:isAdmin?"pointer":"not-allowed",fontSize:12,fontFamily:"inherit"}}>
                                    {v==="true"?"Sim":"Não"}
                                  </button>
                                ))}
                              </div>
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
```

- [ ] **Step 4: Verify build passes**

```bash
CI=false npm run build 2>&1 | tail -5
```
Expected: `Compiled successfully.`

- [ ] **Step 5: Commit**

```bash
git add src/App.js
git commit -m "feat: ResultsView shows auto read-only and custom editable extras"
```

---

### Task 6: `ConfigView` — "Regras" tab

**Files:**
- Modify: `src/App.js` — `ConfigView` function (~line 650)

Add a third tab "Regras" with: toggle + points editor for each rule, predType chooser for auto rules when activating, and custom rule creator/remover.

- [ ] **Step 1: Update `ConfigView` signature and add state**

Find:
```js
function ConfigView({poolConfig,updatePoolConfig,participants,currentUser,campeonatoId,inviteCode}){
  const [tab,setTab]=useState("pool");
  const isAdmin=currentUser?.isAdmin;
  const tabs=[{id:"pool",label:"⚙️ Configurações"},{id:"invite",label:"🔗 Convite"}];
```

Replace with:
```js
function ConfigView({poolConfig,updatePoolConfig,participants,currentUser,campeonatoId,inviteCode,rules=DEFAULT_RULES,write}){
  const [tab,setTab]=useState("pool");
  const [newRuleLabel,setNewRuleLabel]=useState("");
  const [newRulePoints,setNewRulePoints]=useState("1");
  const [newRulePredType,setNewRulePredType]=useState("boolean");
  const isAdmin=currentUser?.isAdmin;
  const tabs=[{id:"pool",label:"⚙️ Configurações"},{id:"invite",label:"🔗 Convite"},{id:"rules",label:"📋 Regras"}];

  const updateRule = async (ruleId, field, val) => {
    if (!write || !campeonatoId || !isAdmin) return;
    await write(`rules/${ruleId}/${field}`, val);
  };
  const updateCustomRule = async (cid, field, val) => {
    if (!write || !campeonatoId || !isAdmin) return;
    await write(`rules/custom/${cid}/${field}`, val);
  };
  const removeCustomRule = async (cid) => {
    if (!write || !campeonatoId || !isAdmin) return;
    await write(`rules/custom/${cid}`, null);
  };
  const addCustomRule = async () => {
    if (!newRuleLabel.trim() || !write || !campeonatoId || !isAdmin) return;
    const cid = Date.now().toString(36);
    await write(`rules/custom/${cid}`, { active: true, points: parseInt(newRulePoints)||1, label: newRuleLabel.trim(), predType: newRulePredType });
    setNewRuleLabel(""); setNewRulePoints("1"); setNewRulePredType("boolean");
  };
```

- [ ] **Step 2: Add "Regras" tab content**

Find the closing `}` of `ConfigView` that comes after the `{tab==="invite"&&...}` block. Just before that closing `}`, add:

```jsx
      {tab==="rules"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {id:"exactScore",label:"Placar Exato",type:"base"},
            {id:"result",label:"Resultado Correto",type:"base"},
            {id:"yellowCards",label:"Cartões Amarelos",type:"auto"},
            {id:"expulsions",label:"Expulsões",type:"auto"},
          ].map(({id,label,type})=>(
            <div key={id} style={{...card,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:120}}>
                <div style={{color:T.text,fontWeight:600,fontSize:13}}>{label}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.6}}>{type==="base"?"Base":"Automático (API)"}</div>
              </div>
              {type==="auto"&&rules[id]?.active===false&&(
                <select disabled={!isAdmin} value={rules[id]?.predType||"boolean"}
                  onChange={e=>updateRule(id,"predType",e.target.value)}
                  style={{padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:"rgba(255,255,255,.05)",color:T.sub,fontSize:12,fontFamily:"inherit",cursor:isAdmin?"pointer":"not-allowed"}}>
                  <option value="boolean">Sim/Não</option>
                  <option value="exact">Exato</option>
                </select>
              )}
              <input type="number" min="1" max="99" disabled={!isAdmin}
                value={rules[id]?.points??(id==="exactScore"?3:1)}
                onChange={e=>updateRule(id,"points",parseInt(e.target.value)||1)}
                style={{width:55,padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:isAdmin?"rgba(255,255,255,.07)":"rgba(255,255,255,.03)",color:T.text,fontSize:13,textAlign:"center",fontFamily:"inherit",outline:"none",cursor:isAdmin?"text":"not-allowed"}}/>
              <span style={{fontSize:10,color:T.muted}}>pts</span>
              <button disabled={!isAdmin} onClick={()=>updateRule(id,"active",!(rules[id]?.active??true))}
                style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${(rules[id]?.active??true)?T.primary:T.border}`,background:(rules[id]?.active??true)?"rgba(59,130,246,.15)":"transparent",color:(rules[id]?.active??true)?T.primaryLight:T.muted,cursor:isAdmin?"pointer":"not-allowed",fontSize:12,fontFamily:"inherit",fontWeight:700}}>
                {(rules[id]?.active??true)?"Ativa":"Inativa"}
              </button>
            </div>
          ))}
          {Object.entries(rules.custom||{}).map(([cid,crule])=>(
            <div key={cid} style={{...card,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:120}}>
                <div style={{color:T.text,fontWeight:600,fontSize:13}}>{crule.label}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.6}}>Custom · {crule.predType==="exact"?"Exato":"Sim/Não"}</div>
              </div>
              <input type="number" min="1" max="99" disabled={!isAdmin}
                value={crule.points??1}
                onChange={e=>updateCustomRule(cid,"points",parseInt(e.target.value)||1)}
                style={{width:55,padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:isAdmin?"rgba(255,255,255,.07)":"rgba(255,255,255,.03)",color:T.text,fontSize:13,textAlign:"center",fontFamily:"inherit",outline:"none",cursor:isAdmin?"text":"not-allowed"}}/>
              <span style={{fontSize:10,color:T.muted}}>pts</span>
              <button disabled={!isAdmin} onClick={()=>updateCustomRule(cid,"active",!crule.active)}
                style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${crule.active?T.primary:T.border}`,background:crule.active?"rgba(59,130,246,.15)":"transparent",color:crule.active?T.primaryLight:T.muted,cursor:isAdmin?"pointer":"not-allowed",fontSize:12,fontFamily:"inherit",fontWeight:700}}>
                {crule.active?"Ativa":"Inativa"}
              </button>
              {isAdmin&&<button onClick={()=>removeCustomRule(cid)}
                style={{padding:"5px 10px",borderRadius:20,border:`1px solid rgba(248,113,113,.3)`,background:"rgba(248,113,113,.08)",color:T.red,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700}}>✕</button>}
            </div>
          ))}
          {isAdmin&&(
            <div style={{...card,display:"flex",flexDirection:"column",gap:12}}>
              <div style={{color:T.text,fontWeight:600,fontSize:13}}>+ Nova regra personalizada</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input placeholder="Ex: Haverá gol no 1º tempo?" value={newRuleLabel}
                  onChange={e=>setNewRuleLabel(e.target.value)}
                  style={{flex:1,minWidth:180,...inp()}}/>
                <input type="number" min="1" max="99" placeholder="Pts" value={newRulePoints}
                  onChange={e=>setNewRulePoints(e.target.value)}
                  style={{width:65,...inp()}}/>
                <select value={newRulePredType} onChange={e=>setNewRulePredType(e.target.value)}
                  style={{padding:"11px 10px",borderRadius:10,border:`1px solid ${T.border}`,background:"rgba(255,255,255,.05)",color:T.text,fontSize:14,fontFamily:"inherit"}}>
                  <option value="boolean">Sim/Não</option>
                  <option value="exact">Exato</option>
                </select>
                <button onClick={addCustomRule}
                  style={{padding:"11px 18px",borderRadius:10,border:"none",background:T.primary,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>Adicionar</button>
              </div>
            </div>
          )}
        </div>
      )}
```

- [ ] **Step 3: Verify build passes**

```bash
CI=false npm run build 2>&1 | tail -5
```
Expected: `Compiled successfully.`

- [ ] **Step 4: Commit**

```bash
git add src/App.js
git commit -m "feat: ConfigView Regras tab with rule toggle, points, custom CRUD"
```

---

### Task 7: `sync-results.js` — fetch statistics for yellowCards/expulsions

**Files:**
- Modify: `api/sync-results.js`

Add `fetchStatistics(fixtureId)` function and call it when any campeonato has yellowCards or expulsions active. Write extras to all campeonato results.

- [ ] **Step 1: Add `fetchStatistics` function**

Find in `api/sync-results.js`:
```js
async function getAllCampeonatoIds() {
```

Insert before it:
```js
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

```

- [ ] **Step 2: Update `writeResults` to accept and write extras**

Find:
```js
async function writeResults(matchId, home, away, campeonatoIds) {
  const updates = {};
  campeonatoIds.forEach(id => {
    updates[`campeonatos/${id}/results/${matchId}`] = { home: String(home), away: String(away) };
  });
  await db.ref().update(updates);
}
```

Replace with:
```js
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
```

- [ ] **Step 3: Update handler to fetch stats when rules require it**

Find the main loop inside the handler:
```js
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
```

Replace with:
```js
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
```

- [ ] **Step 4: Verify syntax (Node)**

```bash
node -e "require('./api/sync-results.js')" 2>&1 | head -5
```
Expected: no output (no errors on require)

- [ ] **Step 5: Verify build passes**

```bash
CI=false npm run build 2>&1 | tail -5
```
Expected: `Compiled successfully.`

- [ ] **Step 6: Commit and push**

```bash
git add api/sync-results.js
git commit -m "feat: sync-results fetches yellowCards/expulsions statistics from API-Football"
git push
```

---

## Done

All tasks complete. The custom rules system is fully implemented:
- Admin configures rules in ConfigView → "Regras" tab
- Participants see and fill extras fields in PredictionsView
- Admin edits custom extras results in ResultsView (auto fields are read-only)
- `calcPoints` now accumulates points from all active rules
- Leaderboard and all call sites use updated `calcPoints(pred, actual, rules)`
- `sync-results.js` writes yellowCards/expulsions from API-Football when those rules are active
