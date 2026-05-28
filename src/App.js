import { useState, useEffect, useMemo } from "react";
import { useRules, DEFAULT_RULES } from "./hooks/useRules";
import { useAuth } from "./hooks/useAuth";
import { useCampeonato } from "./hooks/useCampeonato";
import { AuthModal } from "./components/AuthModal";
import { CampeonatoGate } from "./components/CampeonatoGate";
import { AdSlot } from "./components/AdSlot";
import { T, card, inp } from "./theme";
import { TeamCrest } from "./components/TeamCrest";
import { MatchCard } from "./components/MatchCard";
import { SectionHeader } from "./components/SectionHeader";
import { LeaderboardRow } from "./components/LeaderboardRow";

// ═══════════════════════════════════════════════════
//  DATA  (same 48 seleções, 12 grupos, 72 jogos)
// ═══════════════════════════════════════════════════
const FLAGS = {
  "México":"🇲🇽","África do Sul":"🇿🇦","Coreia do Sul":"🇰🇷","Tchéquia":"🇨🇿",
  "Canadá":"🇨🇦","Bósnia":"🇧🇦","Catar":"🇶🇦","Suíça":"🇨🇭",
  "Brasil":"🇧🇷","Marrocos":"🇲🇦","Haiti":"🇭🇹","Escócia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "EUA":"🇺🇸","Paraguai":"🇵🇾","Austrália":"🇦🇺","Turquia":"🇹🇷",
  "Alemanha":"🇩🇪","Curaçao":"🇨🇼","C. Marfim":"🇨🇮","Equador":"🇪🇨",
  "Holanda":"🇳🇱","Japão":"🇯🇵","Suécia":"🇸🇪","Tunísia":"🇹🇳",
  "Bélgica":"🇧🇪","Egito":"🇪🇬","Irã":"🇮🇷","N. Zelândia":"🇳🇿",
  "Espanha":"🇪🇸","Cabo Verde":"🇨🇻","A. Saudita":"🇸🇦","Uruguai":"🇺🇾",
  "França":"🇫🇷","Senegal":"🇸🇳","Iraque":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argélia":"🇩🇿","Áustria":"🇦🇹","Jordânia":"🇯🇴",
  "Portugal":"🇵🇹","RD Congo":"🇨🇩","Uzbequistão":"🇺🇿","Colômbia":"🇨🇴",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croácia":"🇭🇷","Gana":"🇬🇭","Panamá":"🇵🇦",
};
const ALL_TEAMS = Object.keys(FLAGS).sort((a,b)=>a.localeCompare(b));

const GROUPS = {
  A:{teams:["México","África do Sul","Coreia do Sul","Tchéquia"],matches:[
    {id:"A1",home:"México",away:"África do Sul",round:1,date:"11 Jun"},{id:"A2",home:"Coreia do Sul",away:"Tchéquia",round:1,date:"11 Jun"},
    {id:"A3",home:"Tchéquia",away:"África do Sul",round:2,date:"18 Jun"},{id:"A4",home:"México",away:"Coreia do Sul",round:2,date:"18 Jun"},
    {id:"A5",home:"México",away:"Tchéquia",round:3,date:"25 Jun"},{id:"A6",home:"África do Sul",away:"Coreia do Sul",round:3,date:"25 Jun"},
  ]},
  B:{teams:["Canadá","Bósnia","Catar","Suíça"],matches:[
    {id:"B1",home:"Canadá",away:"Bósnia",round:1,date:"12 Jun"},{id:"B2",home:"Catar",away:"Suíça",round:1,date:"13 Jun"},
    {id:"B3",home:"Suíça",away:"Bósnia",round:2,date:"18 Jun"},{id:"B4",home:"Canadá",away:"Catar",round:2,date:"18 Jun"},
    {id:"B5",home:"Suíça",away:"Canadá",round:3,date:"24 Jun"},{id:"B6",home:"Bósnia",away:"Catar",round:3,date:"24 Jun"},
  ]},
  C:{teams:["Brasil","Marrocos","Haiti","Escócia"],matches:[
    {id:"C1",home:"Brasil",away:"Marrocos",round:1,date:"13 Jun"},{id:"C2",home:"Haiti",away:"Escócia",round:1,date:"13 Jun"},
    {id:"C3",home:"Escócia",away:"Marrocos",round:2,date:"19 Jun"},{id:"C4",home:"Brasil",away:"Haiti",round:2,date:"19 Jun"},
    {id:"C5",home:"Escócia",away:"Brasil",round:3,date:"24 Jun"},{id:"C6",home:"Haiti",away:"Marrocos",round:3,date:"24 Jun"},
  ]},
  D:{teams:["EUA","Paraguai","Austrália","Turquia"],matches:[
    {id:"D1",home:"EUA",away:"Paraguai",round:1,date:"12 Jun"},{id:"D2",home:"Austrália",away:"Turquia",round:1,date:"13 Jun"},
    {id:"D3",home:"EUA",away:"Austrália",round:2,date:"19 Jun"},{id:"D4",home:"Turquia",away:"Paraguai",round:2,date:"19 Jun"},
    {id:"D5",home:"EUA",away:"Turquia",round:3,date:"25 Jun"},{id:"D6",home:"Paraguai",away:"Austrália",round:3,date:"25 Jun"},
  ]},
  E:{teams:["Alemanha","Curaçao","C. Marfim","Equador"],matches:[
    {id:"E1",home:"Alemanha",away:"Curaçao",round:1,date:"14 Jun"},{id:"E2",home:"C. Marfim",away:"Equador",round:1,date:"14 Jun"},
    {id:"E3",home:"Alemanha",away:"C. Marfim",round:2,date:"20 Jun"},{id:"E4",home:"Equador",away:"Curaçao",round:2,date:"20 Jun"},
    {id:"E5",home:"Alemanha",away:"Equador",round:3,date:"25 Jun"},{id:"E6",home:"Curaçao",away:"C. Marfim",round:3,date:"25 Jun"},
  ]},
  F:{teams:["Holanda","Japão","Suécia","Tunísia"],matches:[
    {id:"F1",home:"Holanda",away:"Japão",round:1,date:"14 Jun"},{id:"F2",home:"Suécia",away:"Tunísia",round:1,date:"14 Jun"},
    {id:"F3",home:"Holanda",away:"Suécia",round:2,date:"20 Jun"},{id:"F4",home:"Tunísia",away:"Japão",round:2,date:"20 Jun"},
    {id:"F5",home:"Holanda",away:"Tunísia",round:3,date:"25 Jun"},{id:"F6",home:"Japão",away:"Suécia",round:3,date:"25 Jun"},
  ]},
  G:{teams:["Bélgica","Egito","Irã","N. Zelândia"],matches:[
    {id:"G1",home:"Bélgica",away:"Egito",round:1,date:"15 Jun"},{id:"G2",home:"Irã",away:"N. Zelândia",round:1,date:"15 Jun"},
    {id:"G3",home:"Bélgica",away:"Irã",round:2,date:"21 Jun"},{id:"G4",home:"N. Zelândia",away:"Egito",round:2,date:"21 Jun"},
    {id:"G5",home:"Bélgica",away:"N. Zelândia",round:3,date:"26 Jun"},{id:"G6",home:"Egito",away:"Irã",round:3,date:"26 Jun"},
  ]},
  H:{teams:["Espanha","Cabo Verde","A. Saudita","Uruguai"],matches:[
    {id:"H1",home:"Espanha",away:"Cabo Verde",round:1,date:"15 Jun"},{id:"H2",home:"A. Saudita",away:"Uruguai",round:1,date:"15 Jun"},
    {id:"H3",home:"Espanha",away:"A. Saudita",round:2,date:"21 Jun"},{id:"H4",home:"Uruguai",away:"Cabo Verde",round:2,date:"21 Jun"},
    {id:"H5",home:"Espanha",away:"Uruguai",round:3,date:"26 Jun"},{id:"H6",home:"Cabo Verde",away:"A. Saudita",round:3,date:"26 Jun"},
  ]},
  I:{teams:["França","Senegal","Iraque","Noruega"],matches:[
    {id:"I1",home:"França",away:"Senegal",round:1,date:"16 Jun"},{id:"I2",home:"Iraque",away:"Noruega",round:1,date:"16 Jun"},
    {id:"I3",home:"França",away:"Iraque",round:2,date:"22 Jun"},{id:"I4",home:"Noruega",away:"Senegal",round:2,date:"22 Jun"},
    {id:"I5",home:"França",away:"Noruega",round:3,date:"27 Jun"},{id:"I6",home:"Senegal",away:"Iraque",round:3,date:"27 Jun"},
  ]},
  J:{teams:["Argentina","Argélia","Áustria","Jordânia"],matches:[
    {id:"J1",home:"Argentina",away:"Argélia",round:1,date:"16 Jun"},{id:"J2",home:"Áustria",away:"Jordânia",round:1,date:"16 Jun"},
    {id:"J3",home:"Argentina",away:"Áustria",round:2,date:"22 Jun"},{id:"J4",home:"Jordânia",away:"Argélia",round:2,date:"22 Jun"},
    {id:"J5",home:"Argentina",away:"Jordânia",round:3,date:"27 Jun"},{id:"J6",home:"Argélia",away:"Áustria",round:3,date:"27 Jun"},
  ]},
  K:{teams:["Portugal","RD Congo","Uzbequistão","Colômbia"],matches:[
    {id:"K1",home:"Portugal",away:"RD Congo",round:1,date:"17 Jun"},{id:"K2",home:"Uzbequistão",away:"Colômbia",round:1,date:"17 Jun"},
    {id:"K3",home:"Portugal",away:"Uzbequistão",round:2,date:"23 Jun"},{id:"K4",home:"Colômbia",away:"RD Congo",round:2,date:"23 Jun"},
    {id:"K5",home:"Portugal",away:"Colômbia",round:3,date:"27 Jun"},{id:"K6",home:"RD Congo",away:"Uzbequistão",round:3,date:"27 Jun"},
  ]},
  L:{teams:["Inglaterra","Croácia","Gana","Panamá"],matches:[
    {id:"L1",home:"Inglaterra",away:"Croácia",round:1,date:"17 Jun"},{id:"L2",home:"Gana",away:"Panamá",round:1,date:"17 Jun"},
    {id:"L3",home:"Inglaterra",away:"Gana",round:2,date:"23 Jun"},{id:"L4",home:"Panamá",away:"Croácia",round:2,date:"23 Jun"},
    {id:"L5",home:"Inglaterra",away:"Panamá",round:3,date:"26 Jun"},{id:"L6",home:"Croácia",away:"Gana",round:3,date:"26 Jun"},
  ]},
};
const ALL_MATCHES = Object.entries(GROUPS).flatMap(([g,d])=>d.matches.map(m=>({...m,group:g})));


// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
const outcome=(h,a)=>h>a?"H":h<a?"A":"D";
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
function groupStandings(key,results){
  const st={};
  GROUPS[key].teams.forEach(t=>{st[t]={team:t,pts:0,gf:0,ga:0,gd:0,w:0,d:0,l:0,p:0};});
  GROUPS[key].matches.forEach(m=>{
    const r=results[m.id];
    if(!r||r.home===""||r.home===undefined||r.away===""||r.away===undefined) return;
    const h=parseInt(r.home),a=parseInt(r.away);
    if(isNaN(h)||isNaN(a)) return;
    st[m.home].gf+=h;st[m.home].ga+=a;st[m.home].gd+=h-a;st[m.home].p++;
    st[m.away].gf+=a;st[m.away].ga+=h;st[m.away].gd+=a-h;st[m.away].p++;
    if(h>a){st[m.home].pts+=3;st[m.home].w++;st[m.away].l++;}
    else if(h<a){st[m.away].pts+=3;st[m.away].w++;st[m.home].l++;}
    else{st[m.home].pts+=1;st[m.home].d++;st[m.away].pts+=1;st[m.away].d++;}
  });
  return Object.values(st).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
}

// ═══════════════════════════════════════════════════
//  BASE COMPONENTS
// ═══════════════════════════════════════════════════
function Avatar({user,size=32}){
  if(!user) return null;
  if(user.picture) return <img src={user.picture} referrerPolicy="no-referrer" alt={user.name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.gold}`,flexShrink:0}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:user.isAdmin?"rgba(245,197,24,.2)":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0,border:`2px solid ${user.isAdmin?T.gold:"rgba(255,255,255,.2)"}`}}>{user.isAdmin?"👑":"👤"}</div>;
}
function Tag({children,color=T.green}){
  return <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:`${color}18`,color,letterSpacing:.4}}>{children}</span>;
}
function CopyBtn({text,label="Copiar"}){
  const [ok,setOk]=useState(false);
  return <button onClick={async()=>{try{await navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2e3);}catch(e){}}} style={{padding:"8px 15px",borderRadius:9,border:`1px solid ${ok?T.green:T.border}`,background:ok?`${T.green}15`:"rgba(255,255,255,.06)",color:ok?T.green:T.sub,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,transition:"all .2s"}}>{ok?"✓ Copiado!":"📋 "+label}</button>;
}
function LabelInput({label,value,onChange,placeholder,type="text",disabled,hint}){
  return(
    <div style={{marginBottom:15}}>
      <label style={{display:"block",color:T.sub,fontSize:10,fontWeight:700,marginBottom:5,letterSpacing:.8,textTransform:"uppercase"}}>{label}</label>
      <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={inp({opacity:disabled?.6:1,cursor:disabled?"not-allowed":"text"})}/>
      {hint&&<div style={{fontSize:11,color:T.muted,marginTop:4}}>{hint}</div>}
    </div>
  );
}


// ═══════════════════════════════════════════════════
//  HOME VIEW
// ═══════════════════════════════════════════════════
function HomeView({participants,newName,setNewName,addParticipant,removeParticipant,predictions,results,leaderboard,setView,poolConfig,currentUser,campeonatoId,inviteCode}){
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

// ═══════════════════════════════════════════════════
//  PREDICTIONS VIEW
// ═══════════════════════════════════════════════════
function PredictionsView({participants,activePart,setActivePart,predictions,updatePrediction,results,currentUser,rules=DEFAULT_RULES}){
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
      {Object.entries(GROUPS).map(([gKey,gData])=>{
        const open=!collapsed.has(gKey);
        const predCount=gData.matches.filter(m=>{const pr=predictions[p.id]?.[m.id];return pr?.home!==undefined&&pr?.home!=="";}).length;
        return(
          <div key={gKey} style={{...card,marginBottom:10}}>
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
              <div key={round} style={{marginBottom:8}}>
                <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{gData.matches.find(m=>m.round===round)?.date} · Rodada {round}</div>
                {gData.matches.filter(m=>m.round===round).map(match=>{
                  const pred=predictions[p.id]?.[match.id];
                  const actual=results[match.id];
                  const hasActual=actual?.home!==undefined&&actual?.home!==""&&actual?.away!==undefined&&actual?.away!=="";
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
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  RESULTS VIEW
// ═══════════════════════════════════════════════════
function ResultsView({results,updateResult,currentUser}){
  const [collapsed,setCollapsed]=useState(new Set());
  const toggle=g=>setCollapsed(prev=>{const n=new Set(prev);n.has(g)?n.delete(g):n.add(g);return n;});
  const done=ALL_MATCHES.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
  const isAdmin=currentUser?.isAdmin;
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
      {Object.entries(GROUPS).map(([gKey,gData])=>{
        const open=!collapsed.has(gKey);
        const gDone=gData.matches.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
        return(
          <div key={gKey} style={{...card,marginBottom:10}}>
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
              <MatchCard key={match.id} match={match} hVal={results[match.id]?.home} aVal={results[match.id]?.away}
                onH={v=>isAdmin&&updateResult(match.id,"home",v)} onA={v=>isAdmin&&updateResult(match.id,"away",v)} disabled={!isAdmin} pts={null}/>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  GROUPS VIEW
// ═══════════════════════════════════════════════════
function GroupsView({allStandings}){
  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px"}}>
      <SectionHeader title="Fase de Grupos" subtitle="2 primeiros + 8 melhores terceiros avançam" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:14,marginTop:16}}>
        {Object.entries(allStandings).map(([key,st])=>(
          <div key={key} style={card}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:32,height:32,borderRadius:8,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:"#fff"}}>{key}</div>
              <div>
                <div style={{color:T.text,fontWeight:700,fontSize:13}}>Grupo {key}</div>
                <div style={{display:"flex",gap:4,marginTop:3}}>
                  {GROUPS[key].teams.map(t=><TeamCrest key={t} team={t} size={18}/>)}
                </div>
              </div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
                {["#","Seleção","J","V","E","D","GP","GC","SG","Pts"].map(h=>(
                  <th key={h} style={{padding:"5px 3px",color:T.muted,fontSize:9,fontWeight:700,textAlign:h==="Seleção"?"left":"center",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {st.map((s,i)=>(
                  <tr key={s.team} style={{borderBottom:"1px solid rgba(255,255,255,.04)",background:i<2?"rgba(59,130,246,.04)":"transparent"}}>
                    <td style={{padding:"7px 3px",textAlign:"center",color:i<2?T.primaryLight:T.muted,fontWeight:700,fontSize:11}}>{i+1}</td>
                    <td style={{padding:"7px 3px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <TeamCrest team={s.team} size={18}/>
                        <span style={{color:T.text,fontSize:10,fontWeight:i<2?700:400}}>{s.team}</span>
                        {i<2&&<span style={{fontSize:7,color:T.primary,border:`1px solid ${T.primary}40`,padding:"1px 3px",borderRadius:2,flexShrink:0}}>Q</span>}
                      </div>
                    </td>
                    {[s.p,s.w,s.d,s.l,s.gf,s.ga,s.gd>0?`+${s.gd}`:s.gd,s.pts].map((v,vi)=>(
                      <td key={vi} style={{padding:"7px 3px",textAlign:"center",color:vi===7?T.primaryLight:T.sub,fontWeight:vi===7?800:400,fontSize:10}}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  KNOCKOUT VIEW
// ═══════════════════════════════════════════════════
function KnockoutView({koMatches,updateKOMatch,currentUser}){
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
      {rounds.map(({key,label,slots})=>{
        const matches=Array.from({length:slots},(_,i)=>{
          const mid=`${key}_${i+1}`;
          return {id:mid,...(koMatches?.[mid]||{})};
        });
        return(
          <div key={key} style={{marginBottom:20}}>
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

// ═══════════════════════════════════════════════════
//  LEADERBOARD VIEW
// ═══════════════════════════════════════════════════
function LeaderboardView({leaderboard,predictions,results}){
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

// ═══════════════════════════════════════════════════
//  CONFIG VIEW
// ═══════════════════════════════════════════════════
function ConfigView({poolConfig,updatePoolConfig,participants,currentUser,campeonatoId,inviteCode}){
  const [tab,setTab]=useState("pool");
  const isAdmin=currentUser?.isAdmin;
  const tabs=[{id:"pool",label:"⚙️ Configurações"},{id:"invite",label:"🔗 Convite"}];
  return(
    <div style={{maxWidth:920,margin:"0 auto",padding:"0 20px"}}>
      <SectionHeader title="CONFIGURAÇÕES" subtitle={isAdmin?`Administrador: ${currentUser?.name}`:"Visualização — somente o admin edita"} />
      {!isAdmin&&<div style={{padding:"9px 14px",borderRadius:9,marginBottom:16,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",fontSize:12,color:T.primaryLight}}>
        👀 Somente o administrador <strong>{participants.find(p=>p.isAdmin)?.name}</strong> pode editar.
      </div>}
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 15px",borderRadius:8,border:tab===t.id?"none":"1px solid "+T.border,background:tab===t.id?T.primary:T.surface,color:tab===t.id?"#fff":T.sub,fontWeight:tab===t.id?700:500,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>{t.label}</button>)}
      </div>

      {tab==="pool"&&(
        <div style={card}>
          <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 16px"}}>⚙️ Configurações do Palpitômetro</h3>
          <LabelInput label="Nome do Campeonato" value={poolConfig?.name} onChange={v=>isAdmin&&updatePoolConfig({...poolConfig,name:v})} placeholder="Palpitômetro" disabled={!isAdmin}/>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:16,marginTop:4}}>
            <h4 style={{color:T.sub,fontSize:10,margin:"0 0 11px",textTransform:"uppercase",letterSpacing:.8,fontWeight:700}}>Participantes ({participants.length})</h4>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {participants.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderRadius:10,background:p.isAdmin?"rgba(59,130,246,.05)":"rgba(255,255,255,.03)",border:`1px solid ${p.isAdmin?"rgba(59,130,246,.3)":T.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}><Avatar user={p} size={34}/><div><div style={{color:T.text,fontWeight:600,fontSize:13}}>{p.name}</div><div style={{fontSize:10,color:p.isAdmin?T.primaryLight:T.muted,marginTop:1}}>{p.isAdmin?"Administrador · ":""}{p.email||`Entrou em ${new Date(p.id).toLocaleDateString("pt-BR")}`}</div></div></div>
                  {p.isAdmin&&<Tag color={T.primary}>Admin</Tag>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==="invite"&&(
        <div style={card}>
          <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 16px"}}>🔗 Convite</h3>
          <div style={{marginBottom:14}}>
            <div style={{color:T.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Código de acesso</div>
            <div style={{fontFamily:"monospace",fontSize:22,fontWeight:800,color:T.primaryLight,letterSpacing:4}}>{inviteCode}</div>
          </div>
          <div>
            <div style={{color:T.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Link direto</div>
            <div style={{fontFamily:"monospace",fontSize:12,color:T.sub,padding:"8px 12px",background:"rgba(255,255,255,.04)",borderRadius:8,wordBreak:"break-all"}}>
              {window.location.origin}?id={campeonatoId}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  USER MENU (header dropdown)
// ═══════════════════════════════════════════════════
function UserMenu({currentUser,onSwitch,onLogout}){
  const [open,setOpen]=useState(false);
  if(!currentUser) return null;
  return(
    <div style={{position:"relative"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 10px",borderRadius:10,background:T.surface,border:"1px solid "+T.border,cursor:"pointer",userSelect:"none",fontFamily:"inherit",color:T.text}}>
        <Avatar user={currentUser} size={28}/>
        <span style={{color:T.text,fontSize:12,fontWeight:600,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.name}</span>
        {currentUser.isAdmin&&<span style={{fontSize:13}}>👑</span>}
        <span style={{color:T.muted,fontSize:10}}>{open?"▲":"▼"}</span>
      </div>
      {open&&(
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
          <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"#0D1525",border:"1px solid rgba(59,130,246,.2)",borderRadius:12,padding:8,minWidth:200,zIndex:200,backdropFilter:"blur(20px)",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
            <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:6}}>
              <div style={{color:T.text,fontWeight:700,fontSize:13}}>{currentUser.name}</div>
              {currentUser.email&&<div style={{color:T.muted,fontSize:11,marginTop:1}}>{currentUser.email}</div>}
              <div style={{fontSize:10,color:currentUser.isAdmin?T.primaryLight:T.muted,marginTop:2}}>{currentUser.isAdmin?"👑 Administrador":"Participante"}</div>
            </div>
            <button onClick={()=>{setOpen(false);onSwitch();}} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"none",background:"transparent",color:T.sub,cursor:"pointer",fontSize:13,fontFamily:"inherit",textAlign:"left",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🔄 Trocar usuário</button>
            <button onClick={()=>{setOpen(false);onLogout();}} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"none",background:"transparent",color:T.red,cursor:"pointer",fontSize:13,fontFamily:"inherit",textAlign:"left",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🚪 Sair</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const { firebaseUser, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const [campeonatoId, setCampeonatoId] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("id") || null;
  });

  const { data, loading, notFound, write, createCampeonato, findByCode, joinCampeonato } = useCampeonato(campeonatoId, firebaseUser);
  const { rules } = useRules(campeonatoId);

  const [view, setView] = useState("home");
  const [activePart, setActivePart] = useState(null);
  const [newName, setNewName] = useState("");

  const currentUser = useMemo(() => {
    if (!firebaseUser || !data?.participants) return null;
    return data.participants[firebaseUser.uid] || null;
  }, [firebaseUser, data]);

  useEffect(() => {
    if (campeonatoId) {
      const params = new URLSearchParams(window.location.search);
      params.set("id", campeonatoId);
      window.history.replaceState({}, "", `?${params}`);
    }
  }, [campeonatoId]);

  async function handleAuth(method, payload) {
    if (method === "google") await loginWithGoogle();
    else if (method === "email") await loginWithEmail(payload.email, payload.password);
    else if (method === "register") await registerWithEmail(payload.email, payload.password, payload.name);
    setShowAuth(false);
  }

  async function handleCreateCampeonato(name) {
    const { id } = await createCampeonato(name, firebaseUser);
    setCampeonatoId(id);
  }

  async function handleJoinByCode(code) {
    const id = await findByCode(code);
    if (!id) return false;
    if (!data?.participants?.[firebaseUser.uid]) {
      await joinCampeonato(id, firebaseUser, firebaseUser.displayName);
    }
    setCampeonatoId(id);
    return true;
  }

  function handleJoinById(id) { setCampeonatoId(id); }

  const participants = useMemo(() => Object.values(data?.participants || {}), [data]);
  const results = data?.results || {};
  const predictions = data?.predictions || {};
  const koMatches = data?.komatches || {};

  const addParticipant = async () => {
    if (!newName.trim()) return;
    const u = { uid: newName.trim(), name: newName.trim(), isAdmin: false, joinedAt: Date.now() };
    await write(`participants/${newName.trim()}`, u);
    setNewName("");
  };
  const removeParticipant = async (uid) => {
    if (data?.participants?.[uid]?.isAdmin) return;
    await write(`participants/${uid}`, null);
    const np = { ...predictions };
    delete np[uid];
    await write("predictions", np);
  };
  const updateResult = async (mid, side, val) => { await write(`results/${mid}/${side}`, val); };
  const updatePrediction = async (pid, mid, side, val) => { await write(`predictions/${pid}/${mid}/${side}`, val); };
  const updateKOMatch = async (mid, field, val) => { await write(`komatches/${mid}/${field}`, val); };
  const updatePoolConfig = async (cfg) => { await write("pool", cfg); };

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

  const allStandings = useMemo(() => {
    const s = {};
    Object.keys(GROUPS).forEach(k => { s[k] = groupStandings(k, results); });
    return s;
  }, [results]);

  const navItems = [
    { id: "home", label: "Início", ico: "🏠" },
    { id: "predictions", label: "Palpites", ico: "✏️" },
    { id: "results", label: "Resultados", ico: "⚽" },
    { id: "groups", label: "Grupos", ico: "📊" },
    { id: "knockout", label: "Mata-mata", ico: "🥊" },
    { id: "leaderboard", label: "Ranking", ico: "🥇" },
    { id: "config", label: "Config", ico: "⚙️" },
  ];

  if (firebaseUser === undefined) {
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#070a14",color:"#f5c518",fontFamily:"sans-serif",gap:12 }}>
        <div style={{ fontSize:48 }}>⚽</div>
        <div style={{ fontSize:15,letterSpacing:2 }}>CARREGANDO PALPITÔMETRO…</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div style={{ minHeight:"100vh",background:"#070a14",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
        <div style={{ maxWidth:420,width:"100%",textAlign:"center" }}>
          <div style={{ fontSize:70,filter:"drop-shadow(0 0 32px rgba(245,197,24,.4))" }}>🏆</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:52,color:"#f5c518",letterSpacing:6,margin:"12px 0 4px" }}>PALPITÔMETRO</h1>
          <p style={{ color:"#94a3b8",fontSize:13,marginBottom:28 }}>Copa do Mundo 2026 · 100% Gratuito</p>
          <button onClick={() => setShowAuth(true)}
            style={{ padding:"14px 40px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f5c518,#c9a200)",color:"#000",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit" }}>
            Entrar / Criar conta
          </button>
        </div>
        {showAuth && <AuthModal onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  if (!campeonatoId || notFound) {
    return (
      <CampeonatoGate
        firebaseUser={firebaseUser}
        onCreateCampeonato={handleCreateCampeonato}
        onJoinByCode={handleJoinByCode}
        onJoinById={handleJoinById}
        campeonatos={[]}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#070a14",color:"#f5c518",fontFamily:"sans-serif",fontSize:15,letterSpacing:2 }}>
        CARREGANDO CAMPEONATO…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight:"100vh",background:"#070a14",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
        <div style={{ maxWidth:400,width:"100%",background:"rgba(9,13,26,.98)",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,padding:"32px 24px",textAlign:"center" }}>
          <div style={{ fontSize:48,marginBottom:12 }}>🔗</div>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#f5c518",letterSpacing:3,margin:"0 0 8px" }}>
            {data?.pool?.name || "CAMPEONATO"}
          </h2>
          <p style={{ color:"#94a3b8",fontSize:13,marginBottom:20 }}>Você foi convidado! Confirme seu nome para entrar.</p>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder={firebaseUser.displayName || "Seu nome no campeonato"}
            style={{ width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.05)",color:"#f1f5f9",fontFamily:"inherit",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12 }}
          />
          <button
            onClick={async () => {
              await joinCampeonato(campeonatoId, firebaseUser, newName || firebaseUser.displayName || firebaseUser.email);
            }}
            style={{ width:"100%",padding:13,borderRadius:11,border:"none",background:"linear-gradient(135deg,#f5c518,#c9a200)",color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>
            Entrar no campeonato →
          </button>
        </div>
      </div>
    );
  }

  const poolConfig = data?.pool || { name: "PALPITÔMETRO" };

  return (
    <div style={{ minHeight:"100vh",background:"#070a14",fontFamily:"'DM Sans',system-ui,sans-serif",color:"#f1f5f9" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 60% 40% at 10% 0%,rgba(34,100,34,.1) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 90% 100%,rgba(245,197,24,.07) 0%,transparent 60%)" }}/>
      <header style={{ position:"sticky",top:0,zIndex:100,background:"rgba(7,10,20,.94)",borderBottom:"1px solid rgba(255,255,255,.08)",backdropFilter:"blur(20px)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,minHeight:56 }}>
          <div style={{ display:"flex",alignItems:"center",gap:9 }}>
            <span style={{ fontSize:20,filter:"drop-shadow(0 0 8px rgba(245,197,24,.5))" }}>🏆</span>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:"#f5c518",letterSpacing:4,lineHeight:1 }}>{poolConfig.name||"PALPITÔMETRO"}</div>
              <div style={{ fontSize:8,color:"#475569",letterSpacing:2,textTransform:"uppercase" }}>FIFA World Cup 2026 · 48 Seleções</div>
            </div>
          </div>
          <nav style={{ display:"flex",gap:2,flexWrap:"wrap",flex:1,justifyContent:"center" }}>
            {navItems.map(tab => {
              const active = view === tab.id;
              return (
                <button key={tab.id} onClick={() => { setView(tab.id); if(tab.id !== "predictions") setActivePart(null); }}
                  style={{ display:"flex",alignItems:"center",gap:3,padding:"6px 9px",borderRadius:7,border:"none",background:active?"#f5c518":"transparent",color:active?"#000":"#94a3b8",fontWeight:active?700:500,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .2s" }}>
                  <span>{tab.ico}</span><span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          <UserMenu currentUser={currentUser} onLogout={async () => { await logout(); setCampeonatoId(null); }} onSwitch={() => setCampeonatoId(null)} />
        </div>
      </header>
      <main style={{ position:"relative",zIndex:1,paddingTop:26,paddingBottom:120 }}>
        {view==="home"&&<HomeView participants={participants} newName={newName} setNewName={setNewName} addParticipant={addParticipant} removeParticipant={removeParticipant} predictions={predictions} results={results} leaderboard={leaderboard} setView={setView} poolConfig={poolConfig} currentUser={currentUser} campeonatoId={campeonatoId} inviteCode={data?.pool?.inviteCode}/>}
        {view==="predictions"&&<PredictionsView participants={participants} activePart={activePart} setActivePart={setActivePart} predictions={predictions} updatePrediction={updatePrediction} results={results} currentUser={currentUser} rules={rules}/>}
        {view==="results"&&<ResultsView results={results} updateResult={updateResult} currentUser={currentUser} rules={rules} write={write} campeonatoId={campeonatoId}/>}
        {view==="groups"&&<GroupsView allStandings={allStandings}/>}
        {view==="knockout"&&<KnockoutView koMatches={koMatches} updateKOMatch={updateKOMatch} currentUser={currentUser}/>}
        {view==="leaderboard"&&<LeaderboardView leaderboard={leaderboard} predictions={predictions} results={results}/>}
        {view==="config"&&<ConfigView poolConfig={poolConfig} updatePoolConfig={updatePoolConfig} participants={participants} currentUser={currentUser} campeonatoId={campeonatoId} inviteCode={data?.pool?.inviteCode} rules={rules} write={write}/>}
      </main>
      {/* Banner fixo rodapé */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(7,10,20,.95)", borderTop: "1px solid rgba(255,255,255,.08)",
        backdropFilter: "blur(12px)", padding: "6px 16px",
      }}>
        <AdSlot
          slot={process.env.REACT_APP_ADSENSE_SLOT_FOOTER}
          format="horizontal"
          style={{ maxWidth: 728, margin: "0 auto" }}
        />
      </div>
    </div>
  );
}