import { useState } from "react";
import { T, card } from "../theme";
import { TeamCrest } from "../components/TeamCrest";
import { MatchCard } from "../components/MatchCard";
import { SectionHeader } from "../components/SectionHeader";
import { AdSlot } from "../components/AdSlot";
import { GROUPS, ALL_MATCHES } from "../data/matchData";
import { DEFAULT_RULES } from "../hooks/useRules";

export function ResultsView({ results, updateResult, currentUser, rules = DEFAULT_RULES, write, campeonatoId }) {
  const [collapsed,setCollapsed]=useState(new Set());
  const toggle=g=>setCollapsed(prev=>{const n=new Set(prev);n.has(g)?n.delete(g):n.add(g);return n;});
  const done=ALL_MATCHES.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
  const isAdmin=currentUser?.isAdmin;
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
  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"0 20px"}}>
      <SectionHeader title="Resultados Reais" subtitle={isAdmin?"Insira os placares":"Somente o admin insere"} />
      {!isAdmin&&(
        <div style={{padding:"9px 14px",borderRadius:9,marginBottom:14,marginTop:10,background:"rgba(59,130,246,.07)",border:`1px solid rgba(59,130,246,.2)`,fontSize:12,color:T.primaryLight}}>
          👀 Modo visualização — somente o admin insere os resultados.
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"12px 16px",background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.2)",borderRadius:10,marginTop:10}}>
        <div style={{fontSize:22}}>⚽</div>
        <div>
          <div style={{color:T.text,fontWeight:600,fontSize:13}}>{done} de {ALL_MATCHES.length} jogos com resultado</div>
          <div style={{width:160,height:4,background:"rgba(255,255,255,.08)",borderRadius:3,marginTop:5}}>
            <div style={{width:`${(done/ALL_MATCHES.length)*100}%`,height:"100%",background:T.green,borderRadius:3}}/>
          </div>
        </div>
      </div>
      {Object.entries(GROUPS).map(([gKey,gData],gIdx)=>{
        const open=!collapsed.has(gKey);
        const gDone=gData.matches.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
        return(
          <div key={gKey}>
          <div style={{...card,marginBottom:10}}>
            <div onClick={()=>toggle(gKey)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:open?14:0}}>
              <div style={{width:28,height:28,borderRadius:7,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#fff",flexShrink:0}}>{gKey}</div>
              <span style={{color:T.text,fontWeight:700,fontSize:13}}>Grupo {gKey}</span>
              <div style={{display:"flex",gap:4}}>
                {gData.teams.map(t=><TeamCrest key={t} team={t} size={20}/>)}
              </div>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:gDone===6?`${T.green}18`:`${T.primary}18`,color:gDone===6?T.green:T.primaryLight}}>{gDone}/6</span>
                <span style={{color:T.muted,fontSize:13}}>{open?"▲":"▼"}</span>
              </div>
            </div>
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
          </div>
          {(gIdx===2||gIdx===5||gIdx===8)&&(
            <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_INLINE} format="auto" style={{margin:"8px 0 4px"}}/>
          )}
          </div>
        );
      })}
    </div>
  );
}
