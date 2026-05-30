import { useState } from "react";
import { T, card, inp } from "../theme";
import { TeamCrest } from "../components/TeamCrest";
import { MatchCard } from "../components/MatchCard";
import { SectionHeader } from "../components/SectionHeader";
import { Avatar } from "../components/ui";
import { AdSlot } from "../components/AdSlot";
import { GROUPS, ALL_MATCHES } from "../data/matchData";
import { calcPoints } from "../utils/scoring";
import { DEFAULT_RULES } from "../hooks/useRules";

export function PredictionsView({ participants, activePart, setActivePart, predictions, updatePrediction, results, currentUser, rules = DEFAULT_RULES }) {
  const [collapsed,setCollapsed]=useState(new Set());
  const toggle=g=>setCollapsed(prev=>{const n=new Set(prev);n.has(g)?n.delete(g):n.add(g);return n;});
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
  if(participants.length===0) return(
    <div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
      <div style={{fontSize:48,marginBottom:12}}>👥</div>
      <p>Adicione participantes na tela inicial.</p>
    </div>
  );
  if(!activePart) return(
    <div style={{maxWidth:720,margin:"0 auto",padding:"0 20px"}}>
      <SectionHeader title="Palpites" subtitle="Selecione um participante" />
      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
        {participants.map(p=>{
          const predCount=Object.values(predictions[p.id]||{}).filter(pr=>pr?.home!==undefined&&pr?.home!=="").length;
          const done=predCount===ALL_MATCHES.length;
          const isMe=p.id===currentUser?.id;
          return(
            <button key={p.id} onClick={()=>setActivePart(p)} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"14px 18px",borderRadius:12,
              border:`1px solid ${isMe?"rgba(59,130,246,.45)":done?"rgba(34,197,94,.3)":T.border}`,
              background:isMe?"rgba(59,130,246,.07)":T.surface,
              cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .15s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar user={p} size={36}/>
                <div>
                  <div style={{color:T.text,fontWeight:700,fontSize:14,marginBottom:4}}>
                    {p.name}
                    {isMe&&<span style={{fontSize:9,marginLeft:6,padding:"1px 5px",borderRadius:4,background:"rgba(59,130,246,.15)",color:T.primary,fontWeight:700}}>VOCÊ</span>}
                  </div>
                  <div style={{width:100,height:3,background:"rgba(255,255,255,.08)",borderRadius:2}}>
                    <div style={{width:`${(predCount/ALL_MATCHES.length)*100}%`,height:"100%",background:done?T.green:T.primary,borderRadius:2}}/>
                  </div>
                </div>
              </div>
              <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:done?`${T.green}18`:`${T.primary}18`,color:done?T.green:T.primaryLight}}>
                {done?"✓ Completo":`${predCount}/${ALL_MATCHES.length}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
  const p=activePart;
  const totalPts=ALL_MATCHES.reduce((acc,m)=>{const pts=calcPoints(predictions[p.id]?.[m.id],results[m.id]);return acc+(pts||0);},0);
  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"0 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setActivePart(null)} style={{background:"none",border:`1px solid ${T.border}`,color:T.primaryLight,cursor:"pointer",fontSize:12,fontWeight:600,padding:"6px 13px",borderRadius:8,fontFamily:"inherit"}}>← Voltar</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar user={p} size={40}/>
          <div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:T.text,letterSpacing:3,margin:0,lineHeight:1}}>{p.name.toUpperCase()}</h2>
            <p style={{color:T.sub,fontSize:11,margin:"2px 0 0"}}>{totalPts} pts · 72 jogos</p>
          </div>
        </div>
      </div>
      {Object.entries(GROUPS).map(([gKey,gData],gIdx)=>{
        const open=!collapsed.has(gKey);
        const predCount=gData.matches.filter(m=>{const pr=predictions[p.id]?.[m.id];return pr?.home!==undefined&&pr?.home!=="";}).length;
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
                  <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:predCount===6?`${T.green}18`:`${T.primary}18`,color:predCount===6?T.green:T.primaryLight}}>{predCount}/6</span>
                  <span style={{color:T.muted,fontSize:13}}>{open?"▲":"▼"}</span>
                </div>
              </div>
              {open&&[1,2,3].map(round=>(
                <div key={`${gKey}-${round}`} style={{marginBottom:8}}>
                  <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{gData.matches.find(m=>m.round===round)?.date} · Rodada {round}</div>
                  {gData.matches.filter(m=>m.round===round).map(match=>{
                    const pred=predictions[p.id]?.[match.id];
                    const actual=results[match.id];
                    const hasActual=actual?.home!==undefined&&actual?.home!==""&&actual?.away!==undefined&&actual?.away!=="";
                    const hasStarted=match.kickoff?Date.now()>=new Date(match.kickoff).getTime():false;
                    const locked=hasActual||hasStarted;
                    return (
                      <div key={match.id}>
                        <MatchCard match={match} hVal={pred?.home} aVal={pred?.away}
                          onH={v=>updatePrediction(p.id,match.id,"home",v)}
                          onA={v=>updatePrediction(p.id,match.id,"away",v)}
                          disabled={locked} pts={hasActual?calcPoints(pred,actual,rules):null}/>
                        {extraRules.length>0&&(
                          <div style={{padding:"8px 14px 10px",marginTop:-4,background:"rgba(59,130,246,.04)",borderRadius:"0 0 12px 12px",border:`1px solid ${T.border}`,borderTop:"none",display:"flex",flexDirection:"column",gap:8}}>
                            <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Palpites extras</div>
                            {extraRules.map(er=>(
                              <div key={er.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                                <span style={{fontSize:12,color:T.sub,flex:1}}>{er.label||er.id}</span>
                                {er.predType==="exact"
                                  ? <input type="number" min="0" disabled={locked}
                                      value={pred?.extras?.[er.id]||""}
                                      onChange={e=>updatePrediction(p.id,match.id,`extras/${er.id}`,e.target.value)}
                                      style={{width:60,padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:"rgba(255,255,255,.05)",color:T.text,fontSize:13,textAlign:"center",fontFamily:"inherit",outline:"none"}}/>
                                  : <div style={{display:"flex",gap:6}}>
                                      {["true","false"].map(v=>(
                                        <button key={v} disabled={locked}
                                          onClick={()=>updatePrediction(p.id,match.id,`extras/${er.id}`,v)}
                                          style={{padding:"4px 12px",borderRadius:20,border:`1px solid ${pred?.extras?.[er.id]===v?T.primary:T.border}`,background:pred?.extras?.[er.id]===v?"rgba(59,130,246,.2)":"transparent",color:pred?.extras?.[er.id]===v?T.primaryLight:T.sub,cursor:locked?"not-allowed":"pointer",fontSize:12,fontFamily:"inherit"}}>
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
                  })}
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
