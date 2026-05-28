import { useState } from "react";
import { T, card, inp } from "../theme";
import { AdSlot } from "../components/AdSlot";
import { TeamCrest } from "../components/TeamCrest";
import { SectionHeader } from "../components/SectionHeader";
import { LeaderboardRow } from "../components/LeaderboardRow";
import { Avatar, CopyBtn } from "../components/ui";
import { ALL_MATCHES } from "../data/matchData";
import { calcPoints } from "../utils/scoring";

export function HomeView({ participants, newName, setNewName, addParticipant, removeParticipant, predictions, results, leaderboard, setView, poolConfig, currentUser, campeonatoId, inviteCode }) {
  const total=ALL_MATCHES.length;
  const played=ALL_MATCHES.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
  const leader=leaderboard[0];
  const maxPts=leader?.pts||1;
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px"}}>
      {/* Hero */}
      <div style={{textAlign:"center",padding:"40px 0 32px"}}>
        <div style={{fontSize:64,lineHeight:1,filter:"drop-shadow(0 0 28px rgba(59,130,246,.5))"}}>⚽</div>
        <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(40px,8vw,76px)",color:T.text,letterSpacing:5,margin:"10px 0 4px",lineHeight:.95}}>
          {poolConfig?.name||"PALPITÔMETRO"}
        </h1>
        <p style={{color:T.sub,fontSize:11,letterSpacing:2,marginBottom:28}}>FIFA WORLD CUP 2026 · 48 SELEÇÕES · 12 GRUPOS</p>
        <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:20,padding:"18px 24px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,backdropFilter:T.blur,maxWidth:480,margin:"0 auto"}}>
          {[
            {val:participants.length,lab:"Participantes"},
            {val:`${played}/${total}`,lab:"Jogos"},
            {val:leader?.name||"—",lab:"Líder"},
            {val:leader?.pts??0,lab:"Pts"},
          ].map(s=>(
            <div key={s.lab} style={{textAlign:"center",minWidth:60}}>
              <div style={{fontSize:20,fontWeight:800,color:T.primaryLight,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{s.val}</div>
              <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s.lab}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AdSlot */}
      <div style={{margin:"0 auto 28px",maxWidth:730}}>
        <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_HOME} format="auto" />
      </div>

      {/* Invite card (admin only) */}
      {currentUser?.isAdmin&&inviteCode&&(
        <div style={{...card,marginBottom:20,background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.25)"}}>
          <SectionHeader title="Convidar Participantes" />
          <div style={{display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start",marginTop:10}}>
            <div>
              <div style={{color:T.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Código</div>
              <div style={{fontFamily:"monospace",fontSize:28,fontWeight:800,color:T.primaryLight,letterSpacing:6}}>{inviteCode}</div>
            </div>
            <div style={{flex:1,minWidth:180}}>
              <div style={{color:T.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Link direto</div>
              <div style={{fontFamily:"monospace",fontSize:11,color:T.sub,wordBreak:"break-all",marginBottom:8}}>
                {window.location.origin}?id={campeonatoId}
              </div>
              <CopyBtn text={`${window.location.origin}?id=${campeonatoId}`} label="Copiar link" />
            </div>
          </div>
        </div>
      )}

      {/* Ranking */}
      <div style={{...card,marginBottom:20}}>
        <SectionHeader title="Ranking" subtitle={`${participants.length} participantes`} />
        {currentUser?.isAdmin&&(
          <div style={{display:"flex",gap:8,marginBottom:14,marginTop:10}}>
            <input placeholder="Adicionar participante…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addParticipant()} style={inp({flex:1})}/>
            <button onClick={addParticipant} style={{padding:"10px 18px",borderRadius:9,border:"none",whiteSpace:"nowrap",background:T.primary,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Adicionar</button>
          </div>
        )}
        {participants.length===0?(
          <div style={{textAlign:"center",padding:"24px 0",color:T.muted}}>
            <div style={{fontSize:28,marginBottom:7}}>🎯</div>
            <p style={{margin:0,fontSize:13}}>Nenhum participante ainda.</p>
          </div>
        ):(
          <div style={{marginTop:10}}>
            {leaderboard.map((p,i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{flex:1}}>
                  <LeaderboardRow rank={i+1} participant={p} points={p.pts||0} maxPoints={maxPts} isCurrentUser={currentUser?.id===p.id} />
                </div>
                {currentUser?.isAdmin&&!p.isAdmin&&(
                  <button onClick={()=>removeParticipant(p.id)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18,padding:"0 4px",marginBottom:6,flexShrink:0}}>×</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:28}}>
        {[
          {ico:"✏️",label:"Fazer Palpites",sub:"72 jogos",view:"predictions"},
          {ico:"⚽",label:"Resultados",sub:"Placares reais",view:"results"},
          {ico:"📊",label:"Grupos",sub:"12 grupos A–L",view:"groups"},
          {ico:"🥊",label:"Mata-mata",sub:"Fase eliminatória",view:"knockout"},
          {ico:"🥇",label:"Ranking",sub:"Classificação",view:"leaderboard"},
          {ico:"⚙️",label:"Configurações",sub:"Admin",view:"config"},
        ].map(a=>(
          <button key={a.view} onClick={()=>setView(a.view)} style={{
            padding:"16px 14px",borderRadius:12,textAlign:"left",
            border:`1px solid ${T.border}`,background:T.surface,
            cursor:"pointer",fontFamily:"inherit",transition:"all .15s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderHover;e.currentTarget.style.background=T.surfaceHover;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}>
            <div style={{fontSize:22,marginBottom:6}}>{a.ico}</div>
            <div style={{color:T.text,fontWeight:700,fontSize:13,marginBottom:2}}>{a.label}</div>
            <div style={{color:T.muted,fontSize:11}}>{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Rules */}
      <div style={{...card,marginBottom:28,background:"rgba(59,130,246,.03)"}}>
        <SectionHeader title="Pontuação" />
        <div style={{display:"flex",flexWrap:"wrap",gap:14,marginTop:10}}>
          {[{pts:3,ico:"🎯",txt:"Placar exato"},{pts:1,ico:"✅",txt:"Resultado correto"},{pts:0,ico:"❌",txt:"Resultado errado"}].map(r=>(
            <div key={r.pts} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,background:r.pts===3?`${T.green}25`:r.pts===1?`${T.primary}25`:`${T.red}25`,color:r.pts===3?T.green:r.pts===1?T.primaryLight:T.red}}>+{r.pts}</div>
              <span style={{color:T.sub,fontSize:12}}>{r.ico} {r.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{padding:"12px 16px",borderRadius:10,background:"rgba(59,130,246,.06)",border:`1px solid rgba(59,130,246,.2)`,fontSize:12,color:T.primaryLight,textAlign:"center",lineHeight:1.6,marginBottom:32}}>
        💙 <strong>Palpitômetro é 100% gratuito e sem fins lucrativos.</strong>{" "}
        Nenhuma taxa, nenhuma cobrança. Apenas diversão!
      </div>
    </div>
  );
}
