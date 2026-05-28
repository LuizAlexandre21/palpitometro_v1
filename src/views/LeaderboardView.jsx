import { useState } from "react";
import { T, card } from "../theme";
import { TeamCrest } from "../components/TeamCrest";
import { SectionHeader } from "../components/SectionHeader";
import { LeaderboardRow } from "../components/LeaderboardRow";
import { GROUPS, ALL_MATCHES } from "../data/matchData";
import { calcPoints } from "../utils/scoring";

export function LeaderboardView({ leaderboard, predictions, results }) {
  const [sel,setSel]=useState(null);
  const maxPts=leaderboard[0]?.pts||1;
  const breakdown=sel?ALL_MATCHES.map(m=>({...m,pred:predictions[sel.id]?.[m.id],actual:results[m.id],pts:calcPoints(predictions[sel.id]?.[m.id],results[m.id])})):[];
  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"0 20px"}}>
      <SectionHeader title="Ranking Geral" subtitle={`${leaderboard.length} participantes`} />
      <div style={{marginTop:16}}>
        {leaderboard.map((p,i)=>(
          <div key={p.id} onClick={()=>setSel(sel?.id===p.id?null:p)} style={{cursor:"pointer"}}>
            <LeaderboardRow rank={i+1} participant={p} points={p.pts||0} maxPoints={maxPts} isCurrentUser={false}/>
            {sel?.id===p.id&&(
              <div style={{...card,marginBottom:8,marginTop:-2,borderTopLeftRadius:0,borderTopRightRadius:0}}>
                <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Palpites de <strong style={{color:T.text}}>{p.name}</strong></div>
                {Object.entries(GROUPS).map(([gKey,gData])=>{
                  const gPts=gData.matches.reduce((acc,m)=>{const pts=calcPoints(predictions[p.id]?.[m.id],results[m.id]);return acc+(pts||0);},0);
                  return(
                    <div key={gKey} style={{marginBottom:14}}>
                      <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
                        GRUPO {gKey}
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:`${T.primary}18`,color:T.primaryLight,fontWeight:700}}>{gPts} pts</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:4}}>
                        {gData.matches.map(m=>{
                          const bm=breakdown.find(x=>x.id===m.id);
                          const hasPred=bm?.pred?.home!==undefined&&bm?.pred?.home!=="";
                          const hasAct=bm?.actual?.home!==undefined&&bm?.actual?.home!=="";
                          return(
                            <div key={m.id} style={{padding:"6px 8px",borderRadius:8,fontSize:10,
                              background:bm?.pts===3?"rgba(34,197,94,.08)":bm?.pts===1?"rgba(59,130,246,.08)":bm?.pts===0&&hasAct?"rgba(248,113,113,.06)":"rgba(255,255,255,.03)",
                              border:`1px solid ${bm?.pts===3?"rgba(34,197,94,.2)":bm?.pts===1?"rgba(59,130,246,.2)":"rgba(255,255,255,.05)"}`}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,alignItems:"center"}}>
                                <div style={{display:"flex",gap:3,alignItems:"center"}}>
                                  <TeamCrest team={m.home} size={14}/>
                                  <span style={{color:T.muted,fontSize:9}}>vs</span>
                                  <TeamCrest team={m.away} size={14}/>
                                </div>
                                {bm?.pts!==null&&bm?.pts!==undefined&&(
                                  <span style={{width:14,height:14,borderRadius:"50%",background:bm.pts===3?T.green:bm.pts===1?T.primary:T.red,color:"#fff",fontSize:7,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>+{bm.pts}</span>
                                )}
                              </div>
                              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                {hasPred&&<span style={{color:T.muted}}>P:<strong style={{color:T.text}}>{bm.pred.home}–{bm.pred.away}</strong></span>}
                                {hasAct&&<span style={{color:T.muted}}>R:<strong style={{color:T.text}}>{bm.actual.home}–{bm.actual.away}</strong></span>}
                                {!hasPred&&<span style={{color:T.muted,fontStyle:"italic"}}>–</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
