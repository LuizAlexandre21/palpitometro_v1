import { T, card, inp } from "../theme";
import { TeamCrest } from "../components/TeamCrest";
import { SectionHeader } from "../components/SectionHeader";
import { AdSlot } from "../components/AdSlot";
import { ALL_TEAMS } from "../data/matchData";

export function KnockoutView({ koMatches, updateKOMatch, currentUser }) {
  const isAdmin=currentUser?.isAdmin;
  const champion=koMatches?.final_winner;
  const rounds=[
    {key:"r16",label:"16avos de Final",slots:16},
    {key:"qf",label:"Quartas de Final",slots:8},
    {key:"sf",label:"Semifinais",slots:4},
    {key:"tf",label:"Disputa 3º Lugar",slots:1},
    {key:"final",label:"Final",slots:1},
  ];
  const selSt=inp({fontSize:11,padding:"6px 8px"});
  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:"0 20px"}}>
      <SectionHeader title="Mata-mata" subtitle="Fase eliminatória" />
      {champion&&(
        <div style={{
          textAlign:"center",padding:"28px",marginBottom:24,marginTop:16,
          background:"linear-gradient(135deg,rgba(245,197,24,.1),rgba(59,130,246,.08))",
          border:"2px solid rgba(245,197,24,.4)",borderRadius:18,
          boxShadow:"0 0 60px rgba(245,197,24,.12)",
        }}>
          <div style={{fontSize:56,filter:"drop-shadow(0 0 20px rgba(245,197,24,.5))",marginBottom:8}}>🏆</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#F5C518",letterSpacing:5,lineHeight:1}}>CAMPEÃO DO MUNDO</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:10}}>
            <TeamCrest team={champion} size={56}/>
            <span style={{color:T.text,fontSize:22,fontWeight:800}}>{champion}</span>
          </div>
        </div>
      )}
      {rounds.map(({key,label,slots},rIdx)=>{
        const matches=Array.from({length:slots},(_,i)=>{
          const mid=`${key}_${i+1}`;
          return {id:mid,...(koMatches?.[mid]||{})};
        });
        return(
          <div key={key}>
          {rIdx>0&&rIdx%2===0&&(
            <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_INLINE} format="rectangle" style={{margin:"0 0 16px"}}/>
          )}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10,marginTop:8}}>{label}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
              {matches.map(m=>(
                <div key={m.id} style={{...card}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:isAdmin?10:0}}>
                    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                      {m.homeTeam?(
                        <><span style={{color:T.text,fontWeight:700,fontSize:12,textAlign:"right"}}>{m.homeTeam}</span><TeamCrest team={m.homeTeam} size={36}/></>
                      ):(
                        <span style={{color:T.muted,fontSize:12,fontStyle:"italic"}}>A definir</span>
                      )}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                      <input type="number" min="0" max="20" value={m.home??""} onChange={e=>isAdmin&&updateKOMatch(m.id,"home",e.target.value)} disabled={!isAdmin}
                        style={{width:44,height:44,textAlign:"center",fontSize:20,fontWeight:800,background:"rgba(59,130,246,.08)",border:`2px solid ${T.border}`,borderRadius:10,color:T.text,outline:"none",fontFamily:"'DM Mono',monospace"}}/>
                      <span style={{color:T.muted,fontWeight:900,fontSize:13}}>–</span>
                      <input type="number" min="0" max="20" value={m.away??""} onChange={e=>isAdmin&&updateKOMatch(m.id,"away",e.target.value)} disabled={!isAdmin}
                        style={{width:44,height:44,textAlign:"center",fontSize:20,fontWeight:800,background:"rgba(59,130,246,.08)",border:`2px solid ${T.border}`,borderRadius:10,color:T.text,outline:"none",fontFamily:"'DM Mono',monospace"}}/>
                    </div>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
                      {m.awayTeam?(
                        <><TeamCrest team={m.awayTeam} size={36}/><span style={{color:T.text,fontWeight:700,fontSize:12}}>{m.awayTeam}</span></>
                      ):(
                        <span style={{color:T.muted,fontSize:12,fontStyle:"italic"}}>A definir</span>
                      )}
                    </div>
                  </div>
                  {isAdmin&&(
                    <div style={{display:"flex",gap:6}}>
                      <select value={m.homeTeam||""} onChange={e=>updateKOMatch(m.id,"homeTeam",e.target.value)} style={selSt}>
                        <option value="">— Time casa</option>
                        {ALL_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                      <select value={m.awayTeam||""} onChange={e=>updateKOMatch(m.id,"awayTeam",e.target.value)} style={selSt}>
                        <option value="">— Time fora</option>
                        {ALL_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>
        );
      })}
      {isAdmin&&(
        <div style={{...card,marginTop:8}}>
          <SectionHeader title="Campeão" />
          <select value={champion||""} onChange={e=>updateKOMatch("final_winner","",e.target.value)} style={inp({marginTop:10})}>
            <option value="">— Selecionar campeão</option>
            {ALL_TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
