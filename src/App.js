import { useState, useEffect, useMemo, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════
//  FLAGS  (48 seleções)
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
function calcPoints(pred,actual){
  if(!pred||actual?.home===undefined||actual?.away===undefined) return null;
  const ph=parseInt(pred.home),pa=parseInt(pred.away),ah=parseInt(actual.home),aa=parseInt(actual.away);
  if(isNaN(ph)||isNaN(pa)||isNaN(ah)||isNaN(aa)) return null;
  if(ph===ah&&pa===aa) return 3;
  if(outcome(ph,pa)===outcome(ah,aa)) return 1;
  return 0;
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
function decodeGoogleJWT(token){
  try{
    const b64=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
    const json=decodeURIComponent(atob(b64).split("").map(c=>"%"+("00"+c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  }catch(e){return null;}
}

// ═══════════════════════════════════════════════════
//  TOKENS
// ═══════════════════════════════════════════════════
const T={
  bg:"#070a14",surface:"rgba(255,255,255,0.035)",border:"rgba(255,255,255,0.07)",
  gold:"#f5c518",green:"#22c55e",blue:"#60a5fa",red:"#f87171",purple:"#a78bfa",
  text:"#e2e8f0",sub:"#94a3b8",muted:"#475569",
};
const card={background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:"24px 28px",backdropFilter:"blur(12px)"};
const inp=(extra={})=>({width:"100%",padding:"11px 14px",borderRadius:10,boxSizing:"border-box",border:`1px solid rgba(245,197,24,.3)`,background:"rgba(255,255,255,.05)",color:T.text,fontSize:14,outline:"none",fontFamily:"inherit",...extra,});

// ═══════════════════════════════════════════════════
//  COMPONENTES BASE
// ═══════════════════════════════════════════════════
function Avatar({user,size=32}){
  if(!user) return null;
  if(user.picture) return <img src={user.picture} referrerPolicy="no-referrer" alt={user.name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.gold}`,flexShrink:0}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:user.isAdmin?"rgba(245,197,24,.2)":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0,border:`2px solid ${user.isAdmin?T.gold:"rgba(255,255,255,.2)"}`}}>{user.isAdmin?"👑":"👤"}</div>;
}
function ScoreBox({value,onChange,disabled}){
  return <input type="number" min="0" max="20" value={value??""} onChange={e=>onChange(e.target.value)} disabled={disabled} style={{width:48,height:44,textAlign:"center",fontSize:20,fontWeight:800,background:disabled?"rgba(255,255,255,.04)":"rgba(245,197,24,.07)",border:`2px solid ${disabled?"rgba(255,255,255,.08)":"rgba(245,197,24,.35)"}`,borderRadius:10,color:T.text,outline:"none",fontFamily:"'DM Mono',monospace"}}/>;
}
function MatchCard({match,hVal,aVal,onH,onA,disabled,pts}){
  const scored=hVal!==""&&hVal!==undefined&&aVal!==""&&aVal!==undefined;
  const bg=pts===3?"rgba(34,197,94,.09)":pts===1?"rgba(96,165,250,.09)":pts===0&&scored?"rgba(248,113,113,.06)":"rgba(255,255,255,.025)";
  const bd=pts===3?"rgba(34,197,94,.25)":pts===1?"rgba(96,165,250,.25)":"rgba(255,255,255,.06)";
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px",borderRadius:12,background:bg,border:`1px solid ${bd}`,marginBottom:7}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,minWidth:0}}>
        <span style={{color:T.text,fontWeight:700,fontSize:12,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.home}</span>
        <span style={{fontSize:20,flexShrink:0}}>{FLAGS[match.home]||"🏳️"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
        <ScoreBox value={hVal} onChange={onH} disabled={disabled}/>
        <span style={{color:T.muted,fontSize:15,fontWeight:900}}>–</span>
        <ScoreBox value={aVal} onChange={onA} disabled={disabled}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:6,minWidth:0}}>
        <span style={{fontSize:20,flexShrink:0}}>{FLAGS[match.away]||"🏳️"}</span>
        <span style={{color:T.text,fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.away}</span>
      </div>
      {pts!==null&&<div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,background:pts===3?T.green:pts===1?T.blue:T.red,color:"#fff"}}>+{pts}</div>}
    </div>
  );
}
function SectionTitle({children,sub}){
  return <div style={{marginBottom:24}}><h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(28px,4.5vw,44px)",color:T.gold,letterSpacing:4,margin:0,lineHeight:1}}>{children}</h2>{sub&&<p style={{color:T.sub,fontSize:13,marginTop:5}}>{sub}</p>}</div>;
}
function Tag({children,color=T.green}){
  return <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:`${color}18`,color,letterSpacing:.4}}>{children}</span>;
}
function QRImage({data,size=200}){
  if(!data) return null;
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=070A14&color=F5C518&margin=14&ecc=M`} alt="QR" style={{width:size,height:size,borderRadius:14,display:"block",border:"1px solid rgba(245,197,24,.2)"}}/>;
}
function CopyBtn({text,label="Copiar"}){
  const [ok,setOk]=useState(false);
  return <button onClick={async()=>{try{await navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2e3);}catch(e){}}} style={{padding:"8px 15px",borderRadius:9,border:`1px solid ${ok?T.green:T.border}`,background:ok?`${T.green}15`:"rgba(255,255,255,.06)",color:ok?T.green:T.sub,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,transition:"all .2s"}}>{ok?"✓ Copiado!":"📋 "+label}</button>;
}
function LabelInput({label,value,onChange,placeholder,type="text",disabled,hint}){
  return(
    <div style={{marginBottom:15}}>
      <label style={{display:"block",color:T.sub,fontSize:10,fontWeight:700,marginBottom:5,letterSpacing:.8,textTransform:"uppercase"}}>{label}</label>
      <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={inp({opacity:disabled?.6:1,cursor:disabled?"not-allowed":"text"})}/>
      {hint&&<div style={{fontSize:11,color:T.muted,marginTop:4}}>{hint}</div>}
    </div>
  );
}
function GoogleSignInButton({googleReady}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!googleReady||!ref.current) return;
    const t=setTimeout(()=>{
      try{window.google?.accounts?.id?.renderButton(ref.current,{theme:"filled_black",size:"large",text:"signin_with",shape:"rectangular",logo_alignment:"left",width:ref.current.offsetWidth||340});}catch(e){}
    },80);
    return()=>clearTimeout(t);
  },[googleReady]);
  if(!googleReady) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"13px 20px",borderRadius:11,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,color:T.muted,fontSize:14,cursor:"not-allowed"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>Carregando Google…</div>;
  return <div ref={ref} style={{width:"100%",minHeight:44}}/>;
}

// ═══════════════════════════════════════════════════
//  LOGIN MODAL
// ═══════════════════════════════════════════════════
function LoginModal({participants,appConfig,onCreateApp,onLogin,onJoin,googleConfig,googleReady,googleError}){
  const [mode,setMode]=useState(participants.length===0?"setup":"select");
  const [appName,setAppName]=useState("Palpitômetro Copa 2026");
  const [adminName,setAdminName]=useState("");
  const [newName,setNewName]=useState("");
  const hasGoogle=!!(googleConfig?.clientId&&googleReady);
  const overlay={position:"fixed",inset:0,background:"rgba(0,0,0,.9)",backdropFilter:"blur(20px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"};
  const modal={...card,maxWidth:460,width:"100%",background:"rgba(9,13,26,.98)",boxShadow:"0 0 80px rgba(245,197,24,.1),0 32px 100px rgba(0,0,0,.8)"};

  if(mode==="setup") return(
    <div style={overlay}><div style={modal}>
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{fontSize:58,filter:"drop-shadow(0 0 24px rgba(245,197,24,.5))"}}>🎯</div>
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:T.gold,letterSpacing:5,margin:"10px 0 3px",lineHeight:1}}>CRIAR CAMPEONATO</h2>
        <p style={{color:T.sub,fontSize:13,margin:0}}>Copa do Mundo 2026 · 48 seleções · 100% Gratuito</p>
      </div>
      <LabelInput label="Nome do Campeonato" value={appName} onChange={setAppName} placeholder="Palpitômetro Copa 2026"/>
      <LabelInput label="Seu nome (você será o administrador)" value={adminName} onChange={setAdminName} placeholder="Seu nome"/>
      <button disabled={!appName.trim()||!adminName.trim()} onClick={()=>onCreateApp(appName.trim(),adminName.trim())}
        style={{width:"100%",padding:15,borderRadius:12,border:"none",marginTop:6,fontFamily:"inherit",
          background:appName.trim()&&adminName.trim()?`linear-gradient(135deg,${T.gold},#c9a200)`:"rgba(255,255,255,.08)",
          color:appName.trim()&&adminName.trim()?"#000":T.muted,fontWeight:800,fontSize:15,
          cursor:appName.trim()&&adminName.trim()?"pointer":"default"}}>🚀 Criar Campeonato</button>
    </div></div>
  );

  if(mode==="new") return(
    <div style={overlay}><div style={modal}>
      <button onClick={()=>setMode("select")} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:14,marginBottom:16,padding:0}}>← Voltar</button>
      <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:T.gold,letterSpacing:3,margin:"0 0 4px"}}>NOVO PARTICIPANTE</h2>
      <p style={{color:T.sub,fontSize:13,marginBottom:18}}>Campeonato: <strong style={{color:T.text}}>{appConfig?.name}</strong></p>
      {hasGoogle&&(
        <div style={{marginBottom:16}}>
          <GoogleSignInButton googleReady={googleReady}/>
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0"}}>
            <div style={{flex:1,height:1,background:T.border}}/><span style={{color:T.muted,fontSize:11}}>ou</span><div style={{flex:1,height:1,background:T.border}}/>
          </div>
        </div>
      )}
      <LabelInput label="Seu nome" value={newName} onChange={setNewName} placeholder="Como quer ser chamado?"/>
      <button disabled={!newName.trim()} onClick={()=>onJoin(newName.trim())}
        style={{width:"100%",padding:14,borderRadius:11,border:"none",fontFamily:"inherit",
          background:newName.trim()?`linear-gradient(135deg,${T.gold},#c9a200)`:"rgba(255,255,255,.08)",
          color:newName.trim()?"#000":T.muted,fontWeight:800,fontSize:15,cursor:newName.trim()?"pointer":"default"}}>
        Entrar no Campeonato →
      </button>
    </div></div>
  );

  return(
    <div style={overlay}><div style={modal}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:46}}>🎯</div>
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:T.gold,letterSpacing:4,margin:"8px 0 2px",lineHeight:1}}>{appConfig?.name||"PALPITÔMETRO"}</h2>
        <p style={{color:T.sub,fontSize:12,margin:0}}>Identifique-se para entrar</p>
      </div>

      {googleConfig?.clientId&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
            {googleConfig.adminEmail?`Admin: ${googleConfig.adminEmail}`:"Login com conta Google"}
          </div>
          <GoogleSignInButton googleReady={googleReady}/>
          {googleError&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)",fontSize:12,color:T.red}}>{googleError}</div>}
        </div>
      )}

      {participants.length>0&&(
        <>
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 12px"}}>
            <div style={{flex:1,height:1,background:T.border}}/>
            <span style={{color:T.muted,fontSize:11}}>{googleConfig?.clientId?"ou selecione seu nome":"Quem é você?"}</span>
            <div style={{flex:1,height:1,background:T.border}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto",marginBottom:12}}>
            {participants.map(p=>(
              <button key={p.id} onClick={()=>onLogin(p)}
                style={{padding:"11px 16px",borderRadius:10,border:`1px solid ${p.isAdmin?"rgba(245,197,24,.3)":"rgba(255,255,255,.08)"}`,
                  background:p.isAdmin?"rgba(245,197,24,.06)":"rgba(255,255,255,.04)",cursor:"pointer",fontFamily:"inherit",
                  textAlign:"left",display:"flex",alignItems:"center",gap:10,transition:"all .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=p.isAdmin?"rgba(245,197,24,.1)":"rgba(255,255,255,.07)"}
                onMouseLeave={e=>e.currentTarget.style.background=p.isAdmin?"rgba(245,197,24,.06)":"rgba(255,255,255,.04)"}>
                <Avatar user={p} size={36}/>
                <div>
                  <div style={{color:T.text,fontWeight:700,fontSize:14}}>{p.name}</div>
                  <div style={{fontSize:10,color:p.isAdmin?T.gold:T.muted,marginTop:1}}>
                    {p.isAdmin?"Administrador":(p.email||new Date(p.id).toLocaleDateString("pt-BR"))}
                  </div>
                </div>
                {p.isAdmin&&<span style={{marginLeft:"auto",fontSize:18}}>👑</span>}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
        <button onClick={()=>setMode("new")} style={{width:"100%",padding:"10px",borderRadius:10,border:`1px dashed ${T.border}`,background:"transparent",color:T.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13}}>
          ＋ Sou novo — quero entrar no campeonato
        </button>
      </div>
    </div></div>
  );
}

// ═══════════════════════════════════════════════════
//  HOME VIEW (REMOVIDO PIX, FOCADO EM GOOGLE ADS)
// ═══════════════════════════════════════════════════
function HomeView({participants,newName,setNewName,addParticipant,removeParticipant,predictions,results,leaderboard,setView,appConfig,currentUser}){
  const total=ALL_MATCHES.length;
  const played=ALL_MATCHES.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
  const leader=leaderboard[0];
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px"}}>
      <div style={{textAlign:"center",padding:"36px 0 28px"}}>
        <div style={{fontSize:70,lineHeight:1,filter:"drop-shadow(0 0 32px rgba(245,197,24,.4))"}}>🎯</div>
        <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(42px,8vw,80px)",color:T.gold,letterSpacing:6,margin:"10px 0 5px",lineHeight:.95,textShadow:"0 0 60px rgba(245,197,24,.25)"}}>{appConfig?.name||"PALPITÔMETRO"}</h1>
        <p style={{color:T.sub,fontSize:12,letterSpacing:2}}>FIFA WORLD CUP 2026 · 100% GRATUITO · SEM TAXAS</p>
        <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:18,marginTop:28,padding:"20px 24px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,backdropFilter:"blur(12px)"}}>
          {[{ico:"👥",val:participants.length,lab:"Participantes"},{ico:"⚽",val:`${played}/${total}`,lab:"Jogos"},{ico:"🥇",val:leader?.name||"—",lab:"Líder"},{ico:"⭐",val:leader?.pts??0,lab:"Pts Líder"}].map(s=>(
            <div key={s.lab} style={{textAlign:"center",minWidth:70}}>
              <div style={{fontSize:20}}>{s.ico}</div>
              <div style={{fontSize:18,fontWeight:800,color:T.gold,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{s.val}</div>
              <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s.lab}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 📊 Google AdSense Slot 1 */}
      <div style={{margin:"28px auto",maxWidth:730,textAlign:"center"}}>
        <ins className="adsbygoogle" style={{display:"block"}} data-ad-client="ca-pub-SEU_PUBLISHER_ID" data-ad-slot="SLOT_1" data-ad-format="auto" data-full-width-responsive="true"/>
      </div>

      <div style={{...card,marginBottom:20}}>
        <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 14px",display:"flex",alignItems:"center",gap:7}}><span>👥</span> Participantes{currentUser?.isAdmin&&<Tag color={T.gold}>Admin</Tag>}</h3>
        {currentUser?.isAdmin&&(
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input placeholder="Adicionar participante…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addParticipant()} style={inp({flex:1})}/>
            <button onClick={addParticipant} style={{padding:"10px 20px",borderRadius:9,border:"none",whiteSpace:"nowrap",background:`linear-gradient(135deg,${T.gold},#c9a200)`,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Adicionar</button>
          </div>
        )}
        {participants.length===0?(
          <div style={{textAlign:"center",padding:"24px 0",color:T.muted}}><div style={{fontSize:28,marginBottom:7}}>🎯</div><p style={{margin:0,fontSize:13}}>Nenhum participante ainda.</p></div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {leaderboard.map((p,i)=>{
              const predCount=Object.values(predictions[p.id]||{}).filter(pr=>pr?.home!==undefined&&pr?.home!=="").length;
              const pct=Math.round((predCount/total)*100);
              const isMe=currentUser?.id===p.id;
              return(
                <div key={p.id} style={{padding:"11px 13px",borderRadius:11,background:isMe?"rgba(245,197,24,.06)":p.isAdmin?"rgba(167,139,250,.04)":"rgba(255,255,255,.04)",border:`1px solid ${isMe?"rgba(245,197,24,.3)":p.isAdmin?"rgba(167,139,250,.2)":T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
                    <Avatar user={p} size={30}/>
                    <div style={{minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                        <span style={{color:T.text,fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                        {isMe&&<Tag color={T.gold}>você</Tag>}
                      </div>
                      <div style={{width:"100%",height:3,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:2}}><div style={{width:`${pct}%`,height:"100%",background:T.gold,borderRadius:2}}/></div>
                      <div style={{fontSize:9,color:T.muted}}>{p.pts} pts · {predCount}/{total}</div>
                    </div>
                  </div>
                  {currentUser?.isAdmin&&!p.isAdmin&&<button onClick={()=>removeParticipant(p.id)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:15,padding:2,flexShrink:0}}>×</button>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📊 Google AdSense Slot 2 */}
      <div style={{margin:"28px auto",maxWidth:300,textAlign:"center"}}>
        <ins className="adsbygoogle" style={{display:"block"}} data-ad-client="ca-pub-SEU_PUBLISHER_ID" data-ad-slot="SLOT_2" data-ad-format="vertical" data-full-width-responsive="true"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:32}}>
        {[{ico:"✏️",label:"Fazer Palpites",sub:"Aposte nos 72 jogos",view:"predictions",accent:"#60a5fa"},{ico:"⚽",label:"Resultados",sub:"Inserir placares reais",view:"results",accent:T.green},{ico:"📊",label:"Grupos",sub:"12 grupos A–L",view:"groups",accent:"#f97316"},{ico:"🥊",label:"Mata-mata",sub:"16avos até a Final",view:"knockout",accent:"#a78bfa"},{ico:"🥇",label:"Ranking",sub:"Quem está ganhando",view:"leaderboard",accent:T.gold},{ico:"⚙️",label:"Config",sub:"Configurações",view:"config",accent:T.green}].map(a=>(
          <button key={a.view} onClick={()=>setView(a.view)} style={{padding:"16px 13px",borderRadius:13,textAlign:"left",border:`1px solid ${a.accent}22`,background:`${a.accent}0b`,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 24px ${a.accent}20`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            <div style={{fontSize:24,marginBottom:7}}>{a.ico}</div>
            <div style={{color:T.text,fontWeight:700,fontSize:13,marginBottom:2}}>{a.label}</div>
            <div style={{color:T.muted,fontSize:11}}>{a.sub}</div>
          </button>
        ))}
      </div>

      <div style={{...card,marginBottom:32,background:"rgba(245,197,24,.04)",border:"1px solid rgba(245,197,24,.15)"}}>
        <h3 style={{color:T.gold,fontWeight:700,fontSize:14,margin:"0 0 10px"}}>📋 Como Funciona</h3>
        <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
          {[{pts:3,ico:"🎯",txt:"Placar exato"},{pts:1,ico:"✅",txt:"Resultado correto (V/E/D)"},{pts:0,ico:"❌",txt:"Resultado errado"}].map(r=>(
            <div key={r.pts} style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,background:r.pts===3?`${T.green}20`:r.pts===1?`${T.blue}20`:`${T.red}20`,color:r.pts===3?T.green:r.pts===1?T.blue:T.red}}>+{r.pts}</div>
              <span style={{color:T.sub,fontSize:12}}>{r.ico} {r.txt}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 16px",borderRadius:10,background:"rgba(96,165,250,.08)",border:"1px solid rgba(96,165,250,.2)",fontSize:12,color:T.blue,textAlign:"center",lineHeight:1.6}}>
        💙 <strong>Palpitômetro é 100% gratuito e sem fins lucrativos.</strong> Nenhuma taxa, nenhuma cobrança. Apenas diversão! Anúncios ajudam a manter o servidor rodando.
      </div>
    </div>
  );
}

// [COPIAR TODAS AS OUTRAS VIEWS IGUAL AO ARQUIVO ANTERIOR]
// PredictionsView, ResultsView, GroupsView, KnockoutView, LeaderboardView, ConfigView (SEM PIX!)

// ═══════════════════════════════════════════════════
//  APP ROOT (PLACEHOLDER - COPIAR DO ARQUIVO ANTERIOR)
// ═══════════════════════════════════════════════════
export default function App(){
  return (
    <div style={{textAlign:"center",padding:"100px 20px",color:T.text}}>
      <h1>🎯 PALPITÔMETRO - Copa 2026</h1>
      <p>Cole o código completo de App() do arquivo anterior aqui, apenas removendo PIX e adicionando Google AdSense slots</p>
    </div>
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

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

const PIX_TYPES=[
  {value:"cpf",label:"CPF",placeholder:"000.000.000-00"},
  {value:"cnpj",label:"CNPJ",placeholder:"00.000.000/0000-00"},
  {value:"email",label:"E-mail",placeholder:"seu@email.com"},
  {value:"celular",label:"Celular",placeholder:"+55 11 99999-9999"},
  {value:"aleatoria",label:"Chave Aleatória",placeholder:"xxxxxxxx-xxxx-xxxx"},
];

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
const outcome=(h,a)=>h>a?"H":h<a?"A":"D";
function calcPoints(pred,actual){
  if(!pred||actual?.home===undefined||actual?.away===undefined) return null;
  const ph=parseInt(pred.home),pa=parseInt(pred.away),ah=parseInt(actual.home),aa=parseInt(actual.away);
  if(isNaN(ph)||isNaN(pa)||isNaN(ah)||isNaN(aa)) return null;
  if(ph===ah&&pa===aa) return 3;
  if(outcome(ph,pa)===outcome(ah,aa)) return 1;
  return 0;
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
function crc16CCITT(str){
  let crc=0xFFFF;
  for(let i=0;i<str.length;i++){crc^=str.charCodeAt(i)<<8;for(let j=0;j<8;j++){crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1);crc&=0xFFFF;}}
  return crc.toString(16).toUpperCase().padStart(4,"0");
}
function buildPixPayload({key,holderName,city,amount}){
  const f=(id,val)=>{const s=String(val);return`${id}${String(s.length).padStart(2,"0")}${s}`;};
  const merchant=f("00","BR.GOV.BCB.PIX")+f("01",key);
  const parts=[f("00","01"),f("01","11"),f("26",merchant),f("52","0000"),f("53","986"),
    ...(Number(amount)>0?[f("54",Number(amount).toFixed(2))]:[]),
    f("58","BR"),f("59",(holderName||"ADMIN").trim().slice(0,25).toUpperCase()),
    f("60",(city||"BRASIL").trim().slice(0,15).toUpperCase()),f("62",f("05","***")),"6304"];
  const payload=parts.join("");
  return payload+crc16CCITT(payload);
}
function decodeGoogleJWT(token){
  try{
    const b64=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");
    const json=decodeURIComponent(atob(b64).split("").map(c=>"%"+("00"+c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  }catch(e){return null;}
}

// ═══════════════════════════════════════════════════
//  TOKENS
// ═══════════════════════════════════════════════════
const T={
  bg:"#070a14",surface:"rgba(255,255,255,0.035)",border:"rgba(255,255,255,0.07)",
  gold:"#f5c518",green:"#22c55e",blue:"#60a5fa",red:"#f87171",purple:"#a78bfa",
  text:"#e2e8f0",sub:"#94a3b8",muted:"#475569",
};
const card={background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:"24px 28px",backdropFilter:"blur(12px)"};
const inp=(extra={})=>({
  width:"100%",padding:"11px 14px",borderRadius:10,boxSizing:"border-box",
  border:`1px solid rgba(245,197,24,.3)`,background:"rgba(255,255,255,.05)",
  color:T.text,fontSize:14,outline:"none",fontFamily:"inherit",...extra,
});

// ═══════════════════════════════════════════════════
//  BASE COMPONENTS
// ═══════════════════════════════════════════════════
function Avatar({user,size=32}){
  if(!user) return null;
  if(user.picture) return <img src={user.picture} referrerPolicy="no-referrer" alt={user.name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.gold}`,flexShrink:0}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:user.isAdmin?"rgba(245,197,24,.2)":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0,border:`2px solid ${user.isAdmin?T.gold:"rgba(255,255,255,.2)"}`}}>{user.isAdmin?"👑":"👤"}</div>;
}
function ScoreBox({value,onChange,disabled}){
  return <input type="number" min="0" max="20" value={value??""} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:48,height:44,textAlign:"center",fontSize:20,fontWeight:800,
      background:disabled?"rgba(255,255,255,.04)":"rgba(245,197,24,.07)",
      border:`2px solid ${disabled?"rgba(255,255,255,.08)":"rgba(245,197,24,.35)"}`,
      borderRadius:10,color:T.text,outline:"none",fontFamily:"'DM Mono',monospace"}}/>;
}
function MatchCard({match,hVal,aVal,onH,onA,disabled,pts}){
  const scored=hVal!==""&&hVal!==undefined&&aVal!==""&&aVal!==undefined;
  const bg=pts===3?"rgba(34,197,94,.09)":pts===1?"rgba(96,165,250,.09)":pts===0&&scored?"rgba(248,113,113,.06)":"rgba(255,255,255,.025)";
  const bd=pts===3?"rgba(34,197,94,.25)":pts===1?"rgba(96,165,250,.25)":"rgba(255,255,255,.06)";
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px",borderRadius:12,background:bg,border:`1px solid ${bd}`,marginBottom:7}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,minWidth:0}}>
        <span style={{color:T.text,fontWeight:700,fontSize:12,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.home}</span>
        <span style={{fontSize:20,flexShrink:0}}>{FLAGS[match.home]||"🏳️"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
        <ScoreBox value={hVal} onChange={onH} disabled={disabled}/>
        <span style={{color:T.muted,fontSize:15,fontWeight:900}}>–</span>
        <ScoreBox value={aVal} onChange={onA} disabled={disabled}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:6,minWidth:0}}>
        <span style={{fontSize:20,flexShrink:0}}>{FLAGS[match.away]||"🏳️"}</span>
        <span style={{color:T.text,fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{match.away}</span>
      </div>
      {pts!==null&&<div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,background:pts===3?T.green:pts===1?T.blue:T.red,color:"#fff"}}>+{pts}</div>}
    </div>
  );
}
function SectionTitle({children,sub}){
  return <div style={{marginBottom:24}}><h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(28px,4.5vw,44px)",color:T.gold,letterSpacing:4,margin:0,lineHeight:1}}>{children}</h2>{sub&&<p style={{color:T.sub,fontSize:13,marginTop:5}}>{sub}</p>}</div>;
}
function Tag({children,color=T.green}){
  return <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:`${color}18`,color,letterSpacing:.4}}>{children}</span>;
}
function QRImage({data,size=200}){
  if(!data) return null;
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=070A14&color=F5C518&margin=14&ecc=M`} alt="QR" style={{width:size,height:size,borderRadius:14,display:"block",border:"1px solid rgba(245,197,24,.2)"}}/>;
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
//  GOOGLE SIGN-IN BUTTON  (rendered by GSI SDK)
// ═══════════════════════════════════════════════════
function GoogleSignInButton({googleReady,label="Entrar com Google"}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!googleReady||!ref.current) return;
    const t=setTimeout(()=>{
      try{
        window.google?.accounts?.id?.renderButton(ref.current,{
          theme:"filled_black",size:"large",text:"signin_with",
          shape:"rectangular",logo_alignment:"left",width:ref.current.offsetWidth||340,
        });
      }catch(e){}
    },80);
    return()=>clearTimeout(t);
  },[googleReady]);

  if(!googleReady) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"13px 20px",borderRadius:11,background:"rgba(255,255,255,.06)",border:`1px solid ${T.border}`,color:T.muted,fontSize:14,cursor:"not-allowed"}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>
      Carregando Google…
    </div>
  );
  return <div ref={ref} style={{width:"100%",minHeight:44}}/>;
}

// ═══════════════════════════════════════════════════
//  LOGIN MODAL
// ═══════════════════════════════════════════════════
function LoginModal({participants,poolConfig,onCreatePool,onLogin,onJoin,googleConfig,googleReady,googleError}){
  const [mode,setMode]=useState(participants.length===0?"setup":"select");
  const [poolName,setPoolName]=useState("Bolão da Copa 2026");
  const [adminName,setAdminName]=useState("");
  const [fee,setFee]=useState("20");
  const [newName,setNewName]=useState("");
  const hasGoogle=!!(googleConfig?.clientId&&googleReady);
  const overlay={position:"fixed",inset:0,background:"rgba(0,0,0,.9)",backdropFilter:"blur(20px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"};
  const modal={...card,maxWidth:460,width:"100%",background:"rgba(9,13,26,.98)",boxShadow:"0 0 80px rgba(245,197,24,.1),0 32px 100px rgba(0,0,0,.8)"};

  if(mode==="setup") return(
    <div style={overlay}><div style={modal}>
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{fontSize:58,filter:"drop-shadow(0 0 24px rgba(245,197,24,.5))"}}>🏆</div>
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:T.gold,letterSpacing:5,margin:"10px 0 3px",lineHeight:1}}>CRIAR BOLÃO</h2>
        <p style={{color:T.sub,fontSize:13,margin:0}}>Copa do Mundo 2026 · 48 seleções · 72 jogos</p>
      </div>
      <LabelInput label="Nome do Bolão" value={poolName} onChange={setPoolName} placeholder="Bolão da Copa 2026"/>
      <LabelInput label="Seu nome (você será o admin 👑)" value={adminName} onChange={setAdminName} placeholder="Seu nome"/>
      <LabelInput label="Taxa de entrada (R$)" value={fee} onChange={setFee} placeholder="20" type="number"/>
      <button disabled={!poolName.trim()||!adminName.trim()} onClick={()=>onCreatePool(poolName.trim(),adminName.trim(),Number(fee)||0)}
        style={{width:"100%",padding:15,borderRadius:12,border:"none",marginTop:6,fontFamily:"inherit",
          background:poolName.trim()&&adminName.trim()?`linear-gradient(135deg,${T.gold},#c9a200)`:"rgba(255,255,255,.08)",
          color:poolName.trim()&&adminName.trim()?"#000":T.muted,fontWeight:800,fontSize:15,
          cursor:poolName.trim()&&adminName.trim()?"pointer":"default"}}>🚀 Criar Bolão</button>
    </div></div>
  );

  if(mode==="new") return(
    <div style={overlay}><div style={modal}>
      <button onClick={()=>setMode("select")} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:14,marginBottom:16,padding:0}}>← Voltar</button>
      <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:T.gold,letterSpacing:3,margin:"0 0 4px"}}>NOVO PARTICIPANTE</h2>
      <p style={{color:T.sub,fontSize:13,marginBottom:18}}>Taxa: <strong style={{color:T.gold}}>R$ {poolConfig?.entryFee},00</strong></p>
      {hasGoogle&&(
        <div style={{marginBottom:16}}>
          <GoogleSignInButton googleReady={googleReady}/>
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0"}}>
            <div style={{flex:1,height:1,background:T.border}}/><span style={{color:T.muted,fontSize:11}}>ou</span><div style={{flex:1,height:1,background:T.border}}/>
          </div>
        </div>
      )}
      <LabelInput label="Seu nome" value={newName} onChange={setNewName} placeholder="Como quer ser chamado?"/>
      {poolConfig?.pixConfig?.key&&(
        <div style={{padding:"11px 14px",borderRadius:10,background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",marginBottom:14}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:3}}>💳 Pague a taxa via Pix</div>
          <div style={{color:T.text,fontWeight:700,fontSize:14,fontFamily:"monospace"}}>{poolConfig.pixConfig.key}</div>
          <div style={{color:T.muted,fontSize:11,marginTop:2}}>{PIX_TYPES.find(t=>t.value===poolConfig.pixConfig.keyType)?.label} · {poolConfig.pixConfig.holderName}</div>
        </div>
      )}
      <button disabled={!newName.trim()} onClick={()=>onJoin(newName.trim())}
        style={{width:"100%",padding:14,borderRadius:11,border:"none",fontFamily:"inherit",
          background:newName.trim()?`linear-gradient(135deg,${T.gold},#c9a200)`:"rgba(255,255,255,.08)",
          color:newName.trim()?"#000":T.muted,fontWeight:800,fontSize:15,cursor:newName.trim()?"pointer":"default"}}>
        Entrar no Bolão →
      </button>
    </div></div>
  );

  // Select mode
  return(
    <div style={overlay}><div style={modal}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:46}}>🏆</div>
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:T.gold,letterSpacing:4,margin:"8px 0 2px",lineHeight:1}}>{poolConfig?.name||"BOLÃO DA COPA"}</h2>
        <p style={{color:T.sub,fontSize:12,margin:0}}>Identifique-se para entrar</p>
      </div>

      {/* Google Sign-In — always on top */}
      {googleConfig?.clientId&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:T.muted,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>
            {googleConfig.adminEmail?`Admin: ${googleConfig.adminEmail}`:"Login com conta Google"}
          </div>
          <GoogleSignInButton googleReady={googleReady}/>
          {googleError&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)",fontSize:12,color:T.red}}>{googleError}</div>}
          {!googleReady&&!googleError&&(
            <div style={{marginTop:6,fontSize:11,color:T.muted}}>Carregando SDK do Google…</div>
          )}
        </div>
      )}

      {participants.length>0&&(
        <>
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 12px"}}>
            <div style={{flex:1,height:1,background:T.border}}/>
            <span style={{color:T.muted,fontSize:11}}>{googleConfig?.clientId?"ou selecione seu nome":"Quem é você?"}</span>
            <div style={{flex:1,height:1,background:T.border}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto",marginBottom:12}}>
            {participants.map(p=>(
              <button key={p.id} onClick={()=>onLogin(p)}
                style={{padding:"11px 16px",borderRadius:10,border:`1px solid ${p.isAdmin?"rgba(245,197,24,.3)":"rgba(255,255,255,.08)"}`,
                  background:p.isAdmin?"rgba(245,197,24,.06)":"rgba(255,255,255,.04)",cursor:"pointer",fontFamily:"inherit",
                  textAlign:"left",display:"flex",alignItems:"center",gap:10,transition:"all .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=p.isAdmin?"rgba(245,197,24,.1)":"rgba(255,255,255,.07)"}
                onMouseLeave={e=>e.currentTarget.style.background=p.isAdmin?"rgba(245,197,24,.06)":"rgba(255,255,255,.04)"}>
                <Avatar user={p} size={36}/>
                <div>
                  <div style={{color:T.text,fontWeight:700,fontSize:14}}>{p.name}</div>
                  <div style={{fontSize:10,color:p.isAdmin?T.gold:T.muted,marginTop:1}}>
                    {p.isAdmin?"Administrador":(p.email||new Date(p.id).toLocaleDateString("pt-BR"))}
                  </div>
                </div>
                {p.isAdmin&&<span style={{marginLeft:"auto",fontSize:18}}>👑</span>}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
        <button onClick={()=>setMode("new")} style={{width:"100%",padding:"10px",borderRadius:10,border:`1px dashed ${T.border}`,background:"transparent",color:T.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13}}>
          ＋ Sou novo — quero entrar no bolão
        </button>
      </div>
    </div></div>
  );
}

// ═══════════════════════════════════════════════════
//  HOME VIEW
// ═══════════════════════════════════════════════════
function HomeView({participants,newName,setNewName,addParticipant,removeParticipant,predictions,results,leaderboard,setView,poolConfig,currentUser}){
  const total=ALL_MATCHES.length;
  const played=ALL_MATCHES.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
  const leader=leaderboard[0];
  const pix=poolConfig?.pixConfig;
  const hasPix=pix?.key&&pix?.holderName;
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px"}}>
      <div style={{textAlign:"center",padding:"36px 0 28px"}}>
        <div style={{fontSize:70,lineHeight:1,filter:"drop-shadow(0 0 32px rgba(245,197,24,.4))"}}>🏆</div>
        <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(42px,8vw,80px)",color:T.gold,letterSpacing:6,margin:"10px 0 5px",lineHeight:.95,textShadow:"0 0 60px rgba(245,197,24,.25)"}}>{poolConfig?.name||"BOLÃO DA COPA"}</h1>
        <p style={{color:T.sub,fontSize:12,letterSpacing:2}}>FIFA WORLD CUP 2026 · EUA · MÉXICO · CANADÁ · 48 SELEÇÕES · 12 GRUPOS</p>
        <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:18,marginTop:28,padding:"20px 24px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,backdropFilter:"blur(12px)"}}>
          {[{ico:"👥",val:participants.length,lab:"Participantes"},{ico:"⚽",val:`${played}/${total}`,lab:"Jogos"},{ico:"🥇",val:leader?.name||"—",lab:"Líder"},{ico:"⭐",val:leader?.pts??0,lab:"Pts Líder"},{ico:"💰",val:`R$ ${poolConfig?.entryFee||0}`,lab:"Taxa"}].map(s=>(
            <div key={s.lab} style={{textAlign:"center",minWidth:70}}>
              <div style={{fontSize:20}}>{s.ico}</div>
              <div style={{fontSize:18,fontWeight:800,color:T.gold,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1}}>{s.val}</div>
              <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{s.lab}</div>
            </div>
          ))}
        </div>
      </div>
      {hasPix&&(
        <div style={{...card,marginBottom:20,background:"linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02))",border:"1px solid rgba(34,197,94,.2)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><span style={{fontSize:18}}>💳</span><span style={{color:T.text,fontWeight:700,fontSize:14}}>Pagamento via Pix</span><Tag color={T.green}>R$ {poolConfig.entryFee},00</Tag></div>
              <div style={{color:T.sub,fontSize:12,marginBottom:2}}><strong style={{color:T.text}}>{PIX_TYPES.find(t=>t.value===pix.keyType)?.label}:</strong>{" "}<span style={{fontFamily:"monospace",color:T.gold}}>{pix.key}</span></div>
              <div style={{color:T.muted,fontSize:11}}>Titular: {pix.holderName}</div>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}><CopyBtn text={pix.key} label="Copiar chave"/><button onClick={()=>setView("config")} style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(34,197,94,.3)",background:"rgba(34,197,94,.1)",color:T.green,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>Ver QR →</button></div>
          </div>
        </div>
      )}
      <div style={{...card,marginBottom:20}}>
        <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 14px",display:"flex",alignItems:"center",gap:7}}><span>👥</span> Participantes{currentUser?.isAdmin&&<Tag color={T.gold}>Admin</Tag>}</h3>
        {currentUser?.isAdmin&&(
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input placeholder="Adicionar participante…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addParticipant()} style={inp({flex:1})}/>
            <button onClick={addParticipant} style={{padding:"10px 20px",borderRadius:9,border:"none",whiteSpace:"nowrap",background:`linear-gradient(135deg,${T.gold},#c9a200)`,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Adicionar</button>
          </div>
        )}
        {participants.length===0?(
          <div style={{textAlign:"center",padding:"24px 0",color:T.muted}}><div style={{fontSize:28,marginBottom:7}}>🎯</div><p style={{margin:0,fontSize:13}}>Nenhum participante ainda.</p></div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {leaderboard.map((p,i)=>{
              const predCount=Object.values(predictions[p.id]||{}).filter(pr=>pr?.home!==undefined&&pr?.home!=="").length;
              const pct=Math.round((predCount/total)*100);
              const isMe=currentUser?.id===p.id;
              return(
                <div key={p.id} style={{padding:"11px 13px",borderRadius:11,background:isMe?"rgba(245,197,24,.06)":p.isAdmin?"rgba(167,139,250,.04)":"rgba(255,255,255,.04)",border:`1px solid ${isMe?"rgba(245,197,24,.3)":p.isAdmin?"rgba(167,139,250,.2)":T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
                    <Avatar user={p} size={30}/>
                    <div style={{minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                        <span style={{color:T.text,fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                        {isMe&&<Tag color={T.gold}>você</Tag>}
                      </div>
                      <div style={{width:"100%",height:3,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:2}}><div style={{width:`${pct}%`,height:"100%",background:T.gold,borderRadius:2}}/></div>
                      <div style={{fontSize:9,color:T.muted}}>{p.pts} pts · {predCount}/{total}</div>
                    </div>
                  </div>
                  {currentUser?.isAdmin&&!p.isAdmin&&<button onClick={()=>removeParticipant(p.id)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:15,padding:2,flexShrink:0}}>×</button>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:32}}>
        {[{ico:"✏️",label:"Fazer Palpites",sub:"Aposte nos 72 jogos",view:"predictions",accent:"#60a5fa"},{ico:"⚽",label:"Resultados",sub:"Inserir placares reais",view:"results",accent:T.green},{ico:"📊",label:"Grupos",sub:"12 grupos A–L",view:"groups",accent:"#f97316"},{ico:"🥊",label:"Mata-mata",sub:"16avos até a Final",view:"knockout",accent:"#a78bfa"},{ico:"🥇",label:"Ranking",sub:"Quem está ganhando",view:"leaderboard",accent:T.gold},{ico:"⚙️",label:"Config & Pix",sub:"Admin e Google OAuth",view:"config",accent:T.green}].map(a=>(
          <button key={a.view} onClick={()=>setView(a.view)} style={{padding:"16px 13px",borderRadius:13,textAlign:"left",border:`1px solid ${a.accent}22`,background:`${a.accent}0b`,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 24px ${a.accent}20`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            <div style={{fontSize:24,marginBottom:7}}>{a.ico}</div>
            <div style={{color:T.text,fontWeight:700,fontSize:13,marginBottom:2}}>{a.label}</div>
            <div style={{color:T.muted,fontSize:11}}>{a.sub}</div>
          </button>
        ))}
      </div>
      <div style={{...card,marginBottom:32,background:"rgba(245,197,24,.04)",border:"1px solid rgba(245,197,24,.15)"}}>
        <h3 style={{color:T.gold,fontWeight:700,fontSize:13,margin:"0 0 10px"}}>📋 Regras do Bolão</h3>
        <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
          {[{pts:3,ico:"🎯",txt:"Placar exato"},{pts:1,ico:"✅",txt:"Resultado correto (V/E/D)"},{pts:0,ico:"❌",txt:"Resultado errado"}].map(r=>(
            <div key={r.pts} style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,background:r.pts===3?`${T.green}20`:r.pts===1?`${T.blue}20`:`${T.red}20`,color:r.pts===3?T.green:r.pts===1?T.blue:T.red}}>+{r.pts}</div>
              <span style={{color:T.sub,fontSize:12}}>{r.ico} {r.txt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  PREDICTIONS VIEW
// ═══════════════════════════════════════════════════
function PredictionsView({participants,activePart,setActivePart,predictions,updatePrediction,results,currentUser}){
  const [collapsed,setCollapsed]=useState(new Set());
  const toggle=g=>setCollapsed(prev=>{const n=new Set(prev);n.has(g)?n.delete(g):n.add(g);return n;});
  if(participants.length===0) return <div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}><div style={{fontSize:48,marginBottom:12}}>👥</div><p>Adicione participantes primeiro.</p></div>;
  if(!activePart) return(
    <div style={{maxWidth:720,margin:"0 auto",padding:"0 20px"}}>
      <SectionTitle sub="Selecione um participante para registrar palpites">PALPITES</SectionTitle>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {participants.map(p=>{
          const predCount=Object.values(predictions[p.id]||{}).filter(pr=>pr?.home!==undefined&&pr?.home!=="").length;
          const done=predCount===ALL_MATCHES.length;
          const isMe=p.id===currentUser?.id;
          return <button key={p.id} onClick={()=>setActivePart(p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",borderRadius:13,border:`1px solid ${isMe?"rgba(245,197,24,.4)":done?"rgba(34,197,94,.2)":"rgba(255,255,255,.08)"}`,background:isMe?"rgba(245,197,24,.06)":done?"rgba(34,197,94,.04)":"rgba(255,255,255,.03)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar user={p} size={36}/>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span style={{color:T.text,fontWeight:700,fontSize:14}}>{p.name}</span>{isMe&&<Tag color={T.gold}>você</Tag>}</div>
                <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:90,height:3,background:"rgba(255,255,255,.08)",borderRadius:2}}><div style={{width:`${(predCount/ALL_MATCHES.length)*100}%`,height:"100%",background:done?T.green:T.gold,borderRadius:2}}/></div><span style={{color:T.muted,fontSize:11}}>{predCount}/{ALL_MATCHES.length}</span></div>
              </div>
            </div>
            <Tag color={done?T.green:T.gold}>{done?"✓ Completo":`${predCount}/${ALL_MATCHES.length}`}</Tag>
          </button>;
        })}
      </div>
    </div>
  );
  const p=activePart;
  const totalPts=ALL_MATCHES.reduce((acc,m)=>{const pts=calcPoints(predictions[p.id]?.[m.id],results[m.id]);return acc+(pts||0);},0);
  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"0 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setActivePart(null)} style={{background:"none",border:`1px solid ${T.border}`,color:T.gold,cursor:"pointer",fontSize:12,fontWeight:600,padding:"6px 13px",borderRadius:8,fontFamily:"inherit"}}>← Voltar</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar user={p} size={40}/><div><h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:T.gold,letterSpacing:3,margin:0,lineHeight:1}}>PALPITES: {p.name.toUpperCase()}</h2><p style={{color:T.sub,fontSize:11,margin:"2px 0 0"}}>{totalPts} pts acumulados · 72 jogos</p></div></div>
      </div>
      <div style={{display:"flex",gap:8,padding:"9px 13px",background:"rgba(245,197,24,.05)",border:"1px solid rgba(245,197,24,.16)",borderRadius:9,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
        {[{pts:3,c:T.green,txt:"Exato"},{pts:1,c:T.blue,txt:"Resultado"},{pts:0,c:T.red,txt:"Errado"}].map(r=>(
          <span key={r.pts} style={{fontSize:11,color:T.sub,display:"flex",alignItems:"center",gap:4}}><span style={{width:18,height:18,borderRadius:"50%",background:r.c,color:"#fff",fontSize:9,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>+{r.pts}</span>{r.txt}</span>
        ))}
        <span style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>▲▼ para expandir/recolher</span>
      </div>
      {Object.entries(GROUPS).map(([gKey,gData])=>{
        const open=!collapsed.has(gKey);
        const predCount=gData.matches.filter(m=>{const pr=predictions[p.id]?.[m.id];return pr?.home!==undefined&&pr?.home!=="";}).length;
        return(
          <div key={gKey} style={{...card,marginBottom:12}}>
            <div onClick={()=>toggle(gKey)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:open?12:0}}>
              <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${T.gold},#c9a200)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#000",flexShrink:0}}>{gKey}</div>
              <span style={{color:T.text,fontWeight:700,fontSize:13}}>Grupo {gKey}</span>
              <span style={{fontSize:15}}>{gData.teams.map(t=>FLAGS[t]||"🏳️").join(" ")}</span>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:7}}><Tag color={predCount===6?T.green:T.gold}>{predCount}/6</Tag><span style={{color:T.muted,fontSize:14}}>{open?"▲":"▼"}</span></div>
            </div>
            {open&&[1,2,3].map(round=>(
              <div key={round} style={{marginBottom:8}}>
                <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{gData.matches.find(m=>m.round===round)?.date} · Rodada {round}</div>
                {gData.matches.filter(m=>m.round===round).map(match=>{
                  const pred=predictions[p.id]?.[match.id];
                  const actual=results[match.id];
                  const hasActual=actual?.home!==undefined&&actual?.home!==""&&actual?.away!==undefined&&actual?.away!=="";
                  return <MatchCard key={match.id} match={match} hVal={pred?.home} aVal={pred?.away} onH={v=>updatePrediction(p.id,match.id,"home",v)} onA={v=>updatePrediction(p.id,match.id,"away",v)} disabled={hasActual} pts={hasActual?calcPoints(pred,actual):null}/>;
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
      <SectionTitle sub={isAdmin?"Insira os placares reais — pontos calculados automaticamente":"Somente o admin pode inserir resultados"}>RESULTADOS REAIS</SectionTitle>
      {!isAdmin&&<div style={{padding:"9px 14px",borderRadius:9,marginBottom:14,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",fontSize:12,color:T.purple}}>👀 Modo visualização — somente o admin insere os resultados.</div>}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"12px 16px",background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.2)",borderRadius:10}}>
        <div style={{fontSize:22}}>⚽</div>
        <div><div style={{color:T.text,fontWeight:600,fontSize:13}}>{done} de {ALL_MATCHES.length} jogos com resultado</div>
          <div style={{width:160,height:4,background:"rgba(255,255,255,.08)",borderRadius:3,marginTop:5}}><div style={{width:`${(done/ALL_MATCHES.length)*100}%`,height:"100%",background:T.green,borderRadius:3}}/></div></div>
      </div>
      {Object.entries(GROUPS).map(([gKey,gData])=>{
        const open=!collapsed.has(gKey);
        const gDone=gData.matches.filter(m=>{const r=results[m.id];return r&&r.home!==""&&r.home!==undefined&&r.away!==""&&r.away!==undefined;}).length;
        return(
          <div key={gKey} style={{...card,marginBottom:12}}>
            <div onClick={()=>toggle(gKey)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:open?12:0}}>
              <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${T.gold},#c9a200)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#000",flexShrink:0}}>{gKey}</div>
              <span style={{color:T.text,fontWeight:700,fontSize:13}}>Grupo {gKey}</span>
              <span>{gData.teams.map(t=>FLAGS[t]||"🏳️").join(" ")}</span>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:7}}><Tag color={gDone===6?T.green:T.gold}>{gDone}/6</Tag><span style={{color:T.muted,fontSize:14}}>{open?"▲":"▼"}</span></div>
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
      <SectionTitle sub="12 grupos · 2 primeiros + 8 melhores terceiros avançam">FASE DE GRUPOS</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:14}}>
        {Object.entries(allStandings).map(([key,st])=>(
          <div key={key} style={card}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:34,height:34,borderRadius:8,background:`linear-gradient(135deg,${T.gold},#c9a200)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#000"}}>{key}</div>
              <div><div style={{color:T.text,fontWeight:700,fontSize:13}}>Grupo {key}</div><div style={{fontSize:14}}>{GROUPS[key].teams.map(t=>FLAGS[t]||"🏳️").join(" ")}</div></div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
                {["#","Seleção","J","V","E","D","GP","GC","SG","Pts"].map(h=>(
                  <th key={h} style={{padding:"5px 3px",color:T.muted,fontSize:9,fontWeight:700,textAlign:h==="Seleção"?"left":"center",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {st.map((s,i)=>(
                  <tr key={s.team} style={{borderBottom:"1px solid rgba(255,255,255,.04)",background:i<2?"rgba(245,197,24,.04)":"transparent"}}>
                    <td style={{padding:"7px 3px",textAlign:"center",color:i<2?T.gold:T.muted,fontWeight:700,fontSize:11}}>{i+1}</td>
                    <td style={{padding:"7px 3px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontSize:15}}>{FLAGS[s.team]||"🏳️"}</span>
                        <span style={{color:T.text,fontSize:10,fontWeight:i<2?700:400}}>{s.team}</span>
                        {i<2&&<span style={{fontSize:7,color:T.gold,border:`1px solid ${T.gold}40`,padding:"1px 3px",borderRadius:2,flexShrink:0}}>Q</span>}
                      </div>
                    </td>
                    {[s.p,s.w,s.d,s.l,s.gf,s.ga,s.gd>0?`+${s.gd}`:s.gd,s.pts].map((v,vi)=>(
                      <td key={vi} style={{padding:"7px 3px",textAlign:"center",color:vi===7?T.gold:T.sub,fontWeight:vi===7?800:400,fontSize:10}}>{v}</td>
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
  const [tab,setTab]=useState("r32");
  const isAdmin=currentUser?.isAdmin;
  const ROUNDS=[
    {id:"r32",label:"16avos",ico:"⚡",count:16,dates:"29 Jun–4 Jul"},
    {id:"r16",label:"Oitavas",ico:"🔥",count:8,dates:"6–9 Jul"},
    {id:"qf",label:"Quartas",ico:"💥",count:4,dates:"11–12 Jul"},
    {id:"sf",label:"Semis",ico:"🎯",count:2,dates:"15–16 Jul"},
    {id:"tp",label:"3º Lugar",ico:"🥉",count:1,dates:"18 Jul"},
    {id:"final",label:"Final",ico:"🏆",count:1,dates:"19 Jul"},
  ];
  const currRound=ROUNDS.find(r=>r.id===tab);
  const getM=id=>koMatches[id]||{};
  const setField=(id,field,val)=>updateKOMatch(id,field,val);
  const getWinner=id=>{const m=getM(id);if(!m.homeScore||!m.awayScore||m.homeScore===""||m.awayScore==="") return null;const h=parseInt(m.homeScore),a=parseInt(m.awayScore);if(isNaN(h)||isNaN(a)||h===a) return null;return h>a?m.homeTeam:m.awayTeam;};
  const champion=getWinner("final_1");
  const matchIds=Array.from({length:currRound.count},(_,i)=>`${tab}_${i+1}`);
  const selSt=inp({fontSize:12,padding:"8px 11px",background:"rgba(255,255,255,.06)",cursor:isAdmin?"pointer":"default"});
  function KOCard({matchId}){
    const m=getM(matchId);const num=matchId.split("_")[1];const winner=getWinner(matchId);
    return(
      <div style={{...card,padding:"12px 14px",marginBottom:0,borderColor:winner?"rgba(245,197,24,.2)":T.border}}>
        <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Jogo {num}</div>
        <div style={{display:"flex",alignItems:"stretch",gap:7}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
            <select value={m.homeTeam||""} onChange={e=>isAdmin&&setField(matchId,"homeTeam",e.target.value)} disabled={!isAdmin} style={{...selSt,textAlign:"right"}}>
              <option value="">— Selecione —</option>
              {ALL_TEAMS.map(t=><option key={t} value={t}>{FLAGS[t]||"🏳️"} {t}</option>)}
            </select>
            {m.homeTeam&&<div style={{fontSize:26,textAlign:"right"}}>{FLAGS[m.homeTeam]||"🏳️"}</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <ScoreBox value={m.homeScore} onChange={v=>isAdmin&&setField(matchId,"homeScore",v)} disabled={!isAdmin||!m.homeTeam}/>
              <span style={{color:T.muted,fontWeight:900,fontSize:13}}>–</span>
              <ScoreBox value={m.awayScore} onChange={v=>isAdmin&&setField(matchId,"awayScore",v)} disabled={!isAdmin||!m.awayTeam}/>
            </div>
            {winner&&<div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:.5,textAlign:"center"}}>✓ {winner}</div>}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
            <select value={m.awayTeam||""} onChange={e=>isAdmin&&setField(matchId,"awayTeam",e.target.value)} disabled={!isAdmin} style={selSt}>
              <option value="">— Selecione —</option>
              {ALL_TEAMS.map(t=><option key={t} value={t}>{FLAGS[t]||"🏳️"} {t}</option>)}
            </select>
            {m.awayTeam&&<div style={{fontSize:26}}>{FLAGS[m.awayTeam]||"🏳️"}</div>}
          </div>
        </div>
      </div>
    );
  }
  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"0 20px"}}>
      <SectionTitle sub="48 equipes → 32 classificados → 16avos de final">MATA-MATA</SectionTitle>
      {!isAdmin&&<div style={{padding:"9px 13px",borderRadius:9,marginBottom:16,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",fontSize:12,color:T.purple}}>👀 Somente o admin pode inserir times e resultados.</div>}
      {champion&&<div style={{textAlign:"center",padding:"24px",marginBottom:24,background:"linear-gradient(135deg,rgba(245,197,24,.12),rgba(245,197,24,.03))",border:`2px solid ${T.gold}`,borderRadius:18,boxShadow:"0 0 60px rgba(245,197,24,.15)"}}><div style={{fontSize:54,filter:"drop-shadow(0 0 20px rgba(245,197,24,.5))"}}>🏆</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:44,color:T.gold,letterSpacing:6,lineHeight:1,marginTop:6}}>CAMPEÃO DO MUNDO</div><div style={{color:T.text,fontSize:24,fontWeight:800,marginTop:5}}>{FLAGS[champion]||"🏳️"} {champion}</div></div>}
      <div style={{display:"flex",gap:5,marginBottom:20,flexWrap:"wrap"}}>
        {ROUNDS.map(r=><button key={r.id} onClick={()=>setTab(r.id)} style={{padding:"8px 13px",borderRadius:8,border:"none",background:tab===r.id?T.gold:"rgba(255,255,255,.06)",color:tab===r.id?"#000":T.sub,fontWeight:tab===r.id?700:500,cursor:"pointer",fontSize:12,fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}><span>{r.ico} {r.label}</span><span style={{fontSize:8,opacity:.7}}>{r.dates}</span></button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:11}}>
        {matchIds.map(id=><KOCard key={id} matchId={id}/>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  LEADERBOARD VIEW
// ═══════════════════════════════════════════════════
function LeaderboardView({leaderboard,predictions,results}){
  const [sel,setSel]=useState(null);
  if(leaderboard.length===0) return <div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}><div style={{fontSize:48,marginBottom:12}}>🏆</div><p>Adicione participantes para ver o ranking.</p></div>;
  const medals=["🥇","🥈","🥉"];
  const breakdown=sel?ALL_MATCHES.map(m=>({...m,pred:predictions[sel.id]?.[m.id],actual:results[m.id],pts:calcPoints(predictions[sel.id]?.[m.id],results[m.id])})):[];
  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"0 20px"}}>
      <SectionTitle sub="Ranking completo · Máx. 216 pts (72 jogos × 3)">RANKING DO BOLÃO</SectionTitle>
      {leaderboard[0]?.pts>0&&<div style={{...card,textAlign:"center",padding:"26px",marginBottom:20,background:"linear-gradient(135deg,rgba(245,197,24,.1),rgba(245,197,24,.02))",border:"1px solid rgba(245,197,24,.3)"}}>
        <Avatar user={leaderboard[0]} size={64}/><div style={{marginTop:8}}/>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:T.gold,letterSpacing:4,marginTop:6,lineHeight:1}}>{leaderboard[0].name.toUpperCase()}</div>
        <div style={{color:T.text,fontSize:28,fontWeight:800,marginTop:3}}>{leaderboard[0].pts} pts</div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:8}}><Tag color={T.green}>🎯 {leaderboard[0].exact} exatos</Tag><Tag color={T.blue}>✓ {leaderboard[0].correct} corretos</Tag></div>
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
        {leaderboard.map((p,i)=>(
          <div key={p.id} onClick={()=>setSel(sel?.id===p.id?null:p)} style={{padding:"13px 16px",borderRadius:12,cursor:"pointer",background:i===0?"rgba(245,197,24,.07)":i===1?"rgba(148,163,184,.05)":i===2?"rgba(180,120,60,.05)":"rgba(255,255,255,.025)",border:`1px solid ${sel?.id===p.id?"rgba(245,197,24,.4)":i===0?"rgba(245,197,24,.2)":T.border}`,transition:"all .2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div style={{fontSize:22,minWidth:30,textAlign:"center"}}>{i<3?medals[i]:<span style={{color:T.muted,fontWeight:700,fontSize:13}}>{i+1}º</span>}</div>
              <Avatar user={p} size={38}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:T.text,fontWeight:700,fontSize:14}}>{p.name}</span>{p.isAdmin&&<Tag color={T.purple}>👑 Admin</Tag>}{p.email&&<span style={{fontSize:10,color:T.muted}}>· {p.email}</span>}</div>
                <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}><Tag color={T.green}>🎯 {p.exact} exatos</Tag><Tag color={T.blue}>✓ {p.correct} corretos</Tag></div>
              </div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:i===0?34:26,color:i===0?T.gold:T.text,lineHeight:1,letterSpacing:1}}>{p.pts}</div><div style={{color:T.muted,fontSize:9}}>PTS</div></div>
            </div>
            {sel?.id===p.id&&<div style={{marginTop:11,paddingTop:11,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:7,textTransform:"uppercase",letterSpacing:.5}}>Detalhamento por grupo</div>
              {Object.entries(GROUPS).map(([gKey,gData])=>{
                const gPts=gData.matches.reduce((acc,m)=>{const pts=calcPoints(predictions[p.id]?.[m.id],results[m.id]);return acc+(pts||0);},0);
                return <div key={gKey} style={{marginBottom:7}}>
                  <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:4}}>Grupo {gKey} — {gPts} pts</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:4}}>
                    {gData.matches.map(m=>{const bm=breakdown.find(x=>x.id===m.id);const hasPred=bm?.pred?.home!==undefined&&bm?.pred?.home!=="";const hasAct=bm?.actual?.home!==undefined&&bm?.actual?.home!=="";return <div key={m.id} style={{padding:"5px 7px",borderRadius:6,fontSize:10,background:bm?.pts===3?"rgba(34,197,94,.08)":bm?.pts===1?"rgba(96,165,250,.08)":bm?.pts===0&&hasAct?"rgba(248,113,113,.06)":"rgba(255,255,255,.03)",border:`1px solid ${bm?.pts===3?"rgba(34,197,94,.2)":bm?.pts===1?"rgba(96,165,250,.2)":"rgba(255,255,255,.05)"}`}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:T.sub}}>{FLAGS[m.home]||"🏳️"} vs {FLAGS[m.away]||"🏳️"}</span>{bm?.pts!==null&&bm?.pts!==undefined&&<span style={{width:14,height:14,borderRadius:"50%",background:bm.pts===3?T.green:bm.pts===1?T.blue:T.red,color:"#fff",fontSize:7,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>+{bm.pts}</span>}</div><div style={{display:"flex",gap:5,marginTop:2,flexWrap:"wrap"}}>{hasPred&&<span style={{color:T.muted}}>P:<strong style={{color:T.text}}>{bm.pred.home}–{bm.pred.away}</strong></span>}{hasAct&&<span style={{color:T.muted}}>R:<strong style={{color:T.text}}>{bm.actual.home}–{bm.actual.away}</strong></span>}{!hasPred&&<span style={{color:T.muted,fontStyle:"italic"}}>–</span>}</div></div>;})}
                  </div>
                </div>;
              })}
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  CONFIG VIEW
// ═══════════════════════════════════════════════════
function ConfigView({poolConfig,updatePoolConfig,pixConfig,updatePixConfig,googleConfig,updateGoogleConfig,participants,currentUser,googleReady,googleError}){
  const [tab,setTab]=useState("google");
  const isAdmin=currentUser?.isAdmin;
  const pixPayload=pixConfig?.key&&pixConfig?.holderName&&pixConfig?.city
    ?buildPixPayload({key:pixConfig.key,holderName:pixConfig.holderName,city:pixConfig.city,amount:poolConfig?.entryFee||0}):null;
  const inviteLines=[`🏆 ${poolConfig?.name||"Bolão da Copa"}`,``,`Você foi convidado para o bolão da Copa 2026!`,``,
    `💰 Taxa: R$ ${poolConfig?.entryFee||0},00`,
    pixConfig?.key?`\n📱 Pix (${PIX_TYPES.find(t=>t.value===pixConfig.keyType)?.label}): ${pixConfig.key}`:"",
    pixConfig?.holderName?`👤 Titular: ${pixConfig.holderName}`:"",
    ``,`✅ Pague, cadastre seu nome e faça seus palpites!`,
  ].filter(l=>l!=="").join("\n");
  const tabs=[{id:"google",label:"🔑 Google OAuth"},{id:"pix",label:"💳 Chave Pix"},{id:"invite",label:"🔗 QR Convite"},{id:"pool",label:"⚙️ Bolão"}];
  return(
    <div style={{maxWidth:920,margin:"0 auto",padding:"0 20px"}}>
      <SectionTitle sub={isAdmin?`Administrador: ${currentUser?.name}`:"Visualização — somente o admin edita"}>CONFIGURAÇÕES</SectionTitle>
      {!isAdmin&&<div style={{padding:"9px 14px",borderRadius:9,marginBottom:16,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",fontSize:12,color:T.purple}}>
        👀 Somente o administrador <strong>{participants.find(p=>p.isAdmin)?.name}</strong> pode editar.
      </div>}
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 15px",borderRadius:8,border:"none",background:tab===t.id?T.gold:"rgba(255,255,255,.06)",color:tab===t.id?"#000":T.sub,fontWeight:tab===t.id?700:500,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>{t.label}</button>)}
      </div>

      {/* ── GOOGLE OAUTH TAB ── */}
      {tab==="google"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:16}}>
          <div style={card}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </div>
              <div>
                <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:0}}>Google Sign-In</h3>
                <div style={{fontSize:11,color:googleReady?T.green:googleConfig?.clientId?T.gold:T.muted,marginTop:2}}>
                  {googleReady?"✓ Configurado e ativo":googleConfig?.clientId?googleError||"⏳ Carregando…":"Não configurado"}
                </div>
              </div>
              {googleReady&&<div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:20,background:`${T.green}15`,border:`1px solid ${T.green}30`,fontSize:11,color:T.green,fontWeight:600}}>● Ativo</div>}
            </div>

            <LabelInput label="Client ID do Google"
              value={googleConfig?.clientId}
              onChange={v=>isAdmin&&updateGoogleConfig({...googleConfig,clientId:v.trim()})}
              placeholder="000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
              disabled={!isAdmin}
              hint="Cole aqui o Client ID OAuth 2.0 do Google Cloud Console"/>
            <LabelInput label="E-mail do Administrador (recebe acesso de admin ao fazer login com Google)"
              value={googleConfig?.adminEmail}
              onChange={v=>isAdmin&&updateGoogleConfig({...googleConfig,adminEmail:v.trim()})}
              placeholder="admin@gmail.com"
              disabled={!isAdmin}
              hint="Qualquer conta Google que fizer login com este e-mail será administrador"/>

            {googleError&&<div style={{padding:"10px 14px",borderRadius:9,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",fontSize:12,color:T.red,marginBottom:14}}>{googleError}</div>}

            {isAdmin&&googleReady&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Prévia do botão</div>
                <GoogleSignInButton googleReady={googleReady}/>
              </div>
            )}
          </div>

          {/* Setup instructions */}
          <div style={{...card,background:"rgba(96,165,250,.04)",border:"1px solid rgba(96,165,250,.15)"}}>
            <h4 style={{color:T.blue,fontWeight:700,fontSize:14,margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}>
              📖 Como configurar o Google Sign-In
            </h4>
            <ol style={{color:T.sub,fontSize:13,lineHeight:1.9,paddingLeft:18,margin:0}}>
              <li>Acesse <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{color:T.blue}}>console.cloud.google.com</a></li>
              <li>Crie ou selecione um projeto</li>
              <li>Vá em <strong style={{color:T.text}}>APIs e Serviços → Credenciais</strong></li>
              <li>Clique em <strong style={{color:T.text}}>Criar credenciais → ID do cliente OAuth 2.0</strong></li>
              <li>Tipo de aplicativo: <strong style={{color:T.text}}>Aplicativo da Web</strong></li>
              <li>Em <strong style={{color:T.text}}>Origens JavaScript autorizadas</strong>, adicione:<br/>
                <code style={{background:"rgba(255,255,255,.07)",padding:"2px 6px",borderRadius:4,fontSize:12,color:T.gold}}>https://claude.ai</code>
              </li>
              <li>Copie o <strong style={{color:T.text}}>Client ID</strong> e cole no campo acima</li>
              <li>Defina o <strong style={{color:T.text}}>e-mail do admin</strong> para dar acesso de administrador</li>
            </ol>
            <div style={{marginTop:14,padding:"10px 14px",borderRadius:9,background:"rgba(245,197,24,.07)",border:"1px solid rgba(245,197,24,.2)",fontSize:12,color:T.sub,lineHeight:1.6}}>
              ⚠️ <strong style={{color:T.gold}}>Importante:</strong> O Google Sign-In funciona via popup. Se o navegador bloquear popups, permita o acesso para <code style={{color:T.gold}}>claude.ai</code>.
            </div>
          </div>
        </div>
      )}

      {/* ── PIX TAB ── */}
      {tab==="pix"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:18,alignItems:"start"}}>
          <div style={card}>
            <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 16px"}}>💳 Chave Pix do Admin</h3>
            <div style={{marginBottom:13}}>
              <label style={{display:"block",color:T.sub,fontSize:10,fontWeight:700,marginBottom:6,letterSpacing:.8,textTransform:"uppercase"}}>Tipo de Chave</label>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {PIX_TYPES.map(pt=><button key={pt.value} disabled={!isAdmin} onClick={()=>isAdmin&&updatePixConfig({...pixConfig,keyType:pt.value})}
                  style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${pixConfig?.keyType===pt.value?"rgba(245,197,24,.5)":T.border}`,background:pixConfig?.keyType===pt.value?"rgba(245,197,24,.12)":"rgba(255,255,255,.04)",color:pixConfig?.keyType===pt.value?T.gold:T.muted,fontWeight:pixConfig?.keyType===pt.value?700:400,cursor:isAdmin?"pointer":"default",fontSize:11,fontFamily:"inherit"}}>{pt.label}</button>)}
              </div>
            </div>
            <LabelInput label="Chave Pix" value={pixConfig?.key} onChange={v=>isAdmin&&updatePixConfig({...pixConfig,key:v})} placeholder={PIX_TYPES.find(t=>t.value===pixConfig?.keyType)?.placeholder} disabled={!isAdmin}/>
            <LabelInput label="Nome do titular" value={pixConfig?.holderName} onChange={v=>isAdmin&&updatePixConfig({...pixConfig,holderName:v})} placeholder="Fulano da Silva" disabled={!isAdmin}/>
            <LabelInput label="Cidade" value={pixConfig?.city} onChange={v=>isAdmin&&updatePixConfig({...pixConfig,city:v})} placeholder="São Paulo" disabled={!isAdmin}/>
            <LabelInput label="Valor da taxa (R$)" value={poolConfig?.entryFee} onChange={v=>isAdmin&&updatePoolConfig({...poolConfig,entryFee:v})} placeholder="20" type="number" disabled={!isAdmin}/>
            {pixConfig?.key&&<div style={{padding:"10px 14px",borderRadius:9,background:`${T.green}0a`,border:`1px solid ${T.green}25`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:7,marginTop:5}}><div style={{fontSize:9,color:T.muted,marginBottom:1,textTransform:"uppercase"}}>Chave configurada</div><div style={{color:T.text,fontWeight:700,fontSize:13,fontFamily:"monospace"}}>{pixConfig.key}</div><CopyBtn text={pixConfig.key} label="Copiar"/></div>}
          </div>
          <div style={{...card,textAlign:"center",minWidth:220}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>QR Code Pix</div>
            {pixPayload?<><div style={{display:"flex",justifyContent:"center",marginBottom:9}}><QRImage data={pixPayload} size={180}/></div><div style={{fontSize:10,color:T.muted,marginBottom:7}}>📱 Escaneie com o app do banco</div><CopyBtn text={pixPayload} label="Copiar payload"/>{Number(poolConfig?.entryFee)>0&&<div style={{marginTop:11,padding:"7px 11px",borderRadius:8,background:`${T.gold}10`,border:`1px solid ${T.gold}25`}}><div style={{color:T.muted,fontSize:9,marginBottom:1}}>Valor no QR</div><div style={{color:T.gold,fontWeight:800,fontSize:19,fontFamily:"'Bebas Neue',sans-serif"}}>R$ {Number(poolConfig.entryFee).toFixed(2)}</div></div>}</>
              :<div style={{width:180,height:180,borderRadius:11,background:"rgba(255,255,255,.03)",border:`2px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:T.muted,fontSize:11,gap:6,margin:"0 auto"}}><span style={{fontSize:26}}>📱</span><span style={{textAlign:"center",lineHeight:1.5}}>Preencha a chave,<br/>nome e cidade</span></div>}
          </div>
        </div>
      )}
      {tab==="invite"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:18,alignItems:"start"}}>
          <div style={card}>
            <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 11px"}}>🔗 QR Code de Convite</h3>
            <p style={{color:T.sub,fontSize:13,marginBottom:14,lineHeight:1.6}}>Compartilhe para convidar novos participantes. Ao escanear, verão as informações do bolão e a chave Pix.</p>
            <div style={{padding:"12px 14px",borderRadius:9,background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,fontFamily:"monospace",fontSize:11,color:T.sub,whiteSpace:"pre-wrap",lineHeight:1.7,marginBottom:12}}>{inviteLines}</div>
            <CopyBtn text={inviteLines} label="Copiar texto de convite"/>
          </div>
          <div style={{...card,textAlign:"center",minWidth:220}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>QR de Convite</div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:9}}><QRImage data={inviteLines} size={180}/></div>
            <div style={{fontSize:10,color:T.muted,marginBottom:7}}>📷 Qualquer câmera lê</div>
            <div style={{padding:"7px 11px",borderRadius:8,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",fontSize:11,color:T.purple,marginTop:7,lineHeight:1.5}}>Envie pelo WhatsApp ou imprima</div>
          </div>
        </div>
      )}
      {tab==="pool"&&(
        <div style={card}>
          <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 16px"}}>⚙️ Configurações do Bolão</h3>
          <LabelInput label="Nome do Bolão" value={poolConfig?.name} onChange={v=>isAdmin&&updatePoolConfig({...poolConfig,name:v})} placeholder="Bolão da Copa 2026" disabled={!isAdmin}/>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:16,marginTop:4}}>
            <h4 style={{color:T.sub,fontSize:10,margin:"0 0 11px",textTransform:"uppercase",letterSpacing:.8,fontWeight:700}}>Participantes ({participants.length})</h4>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {participants.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderRadius:10,background:p.isAdmin?"rgba(245,197,24,.05)":"rgba(255,255,255,.03)",border:`1px solid ${p.isAdmin?"rgba(245,197,24,.2)":T.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}><Avatar user={p} size={34}/><div><div style={{color:T.text,fontWeight:600,fontSize:13}}>{p.name}</div><div style={{fontSize:10,color:p.isAdmin?T.gold:T.muted,marginTop:1}}>{p.isAdmin?"Administrador · ":""}{p.email||`Entrou em ${new Date(p.id).toLocaleDateString("pt-BR")}`}</div></div></div>
                  {p.isAdmin&&<Tag color={T.gold}>Admin</Tag>}
                </div>
              ))}
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
      <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 10px 4px 5px",borderRadius:20,background:"rgba(255,255,255,.07)",border:`1px solid ${T.border}`,cursor:"pointer",userSelect:"none"}}>
        <Avatar user={currentUser} size={28}/>
        <span style={{color:T.text,fontSize:12,fontWeight:600,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.name}</span>
        {currentUser.isAdmin&&<span style={{fontSize:13}}>👑</span>}
        <span style={{color:T.muted,fontSize:10}}>{open?"▲":"▼"}</span>
      </div>
      {open&&(
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
          <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"rgba(12,16,30,.98)",border:`1px solid ${T.border}`,borderRadius:12,padding:8,minWidth:200,zIndex:200,backdropFilter:"blur(20px)",boxShadow:"0 8px 40px rgba(0,0,0,.6)"}}>
            <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:6}}>
              <div style={{color:T.text,fontWeight:700,fontSize:13}}>{currentUser.name}</div>
              {currentUser.email&&<div style={{color:T.muted,fontSize:11,marginTop:1}}>{currentUser.email}</div>}
              <div style={{fontSize:10,color:currentUser.isAdmin?T.gold:T.muted,marginTop:2}}>{currentUser.isAdmin?"👑 Administrador":"Participante"}</div>
            </div>
            <button onClick={()=>{setOpen(false);onSwitch();}} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"none",background:"transparent",color:T.sub,cursor:"pointer",fontSize:13,fontFamily:"inherit",textAlign:"left",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🔄 Trocar usuário</button>
            <button onClick={()=>{setOpen(false);onLogout();}} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"none",background:"transparent",color:T.red,cursor:"pointer",fontSize:13,fontFamily:"inherit",textAlign:"left",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🚪 Sair</button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════
export default function App(){
  const [view,setView]=useState("home");
  const [participants,setParticipants]=useState([]);
  const [results,setResults]=useState({});
  const [predictions,setPredictions]=useState({});
  const [activePart,setActivePart]=useState(null);
  const [newName,setNewName]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [koMatches,setKoMatches]=useState({});
  const [currentUser,setCurrentUser]=useState(null);
  const [showLogin,setShowLogin]=useState(false);
  const [poolConfig,setPoolConfig]=useState({name:"Bolão da Copa 2026",entryFee:20});
  const [pixConfig,setPixConfig]=useState({keyType:"cpf",key:"",holderName:"",city:""});
  const [googleConfig,setGoogleConfig]=useState({clientId:"",adminEmail:""});
  const [googleReady,setGoogleReady]=useState(false);
  const [googleError,setGoogleError]=useState("");

  // Refs for stable callbacks (avoid stale closures in Google's callback)
  const participantsRef=useRef([]);
  const googleConfigRef=useRef({clientId:"",adminEmail:""});
  useEffect(()=>{participantsRef.current=participants;},[participants]);
  useEffect(()=>{googleConfigRef.current=googleConfig;},[googleConfig]);

  // Inject fonts
  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@500;700&display=swap";
    document.head.appendChild(link);
  },[]);

  // Stable Google credential handler (uses refs to avoid stale data)
  const handleGoogleCredential=useCallback((response)=>{
    try{
      const payload=decodeGoogleJWT(response.credential);
      if(!payload) return;
      const {name,email,picture,sub:googleId}=payload;
      const gCfg=googleConfigRef.current;
      const parts=participantsRef.current;
      let user=parts.find(p=>p.googleId===googleId||(p.email&&p.email.toLowerCase()===email.toLowerCase()));
      if(!user){
        const isFirstUser=parts.length===0;
        const isAdminEmail=gCfg.adminEmail&&email.toLowerCase()===gCfg.adminEmail.toLowerCase();
        user={id:Date.now(),name:name||email.split("@")[0],email,picture,googleId,isAdmin:isFirstUser||isAdminEmail};
        const updated=[...parts,user];
        setParticipants(updated);
        sv("bc-participants",updated);
      } else {
        // Update picture / check admin email
        const shouldAdmin=gCfg.adminEmail&&email.toLowerCase()===gCfg.adminEmail.toLowerCase();
        const updated=parts.map(p=>p.id===user.id?{...p,picture:picture||p.picture,googleId,isAdmin:p.isAdmin||shouldAdmin}:p);
        setParticipants(updated);
        sv("bc-participants",updated);
        user={...user,picture:picture||user.picture,isAdmin:user.isAdmin||shouldAdmin};
      }
      setCurrentUser(user);
      sv("bc-currentUser",user);
      setShowLogin(false);
      setGoogleError("");
    }catch(e){
      setGoogleError("Erro ao autenticar com Google. Tente novamente.");
    }
  },[]);

  // Load Google Sign-In SDK
  useEffect(()=>{
    if(!googleConfig.clientId) return;
    setGoogleReady(false);
    setGoogleError("");
    window._bolaoGoogleCb=(r)=>handleGoogleCredential(r);
    const init=()=>{
      try{
        window.google.accounts.id.initialize({
          client_id:googleConfig.clientId,
          callback:(r)=>window._bolaoGoogleCb(r),
          auto_select:false,
          use_fedcm_for_prompt:false,
          itp_support:true,
        });
        setGoogleReady(true);
      }catch(e){
        setGoogleError("Erro ao inicializar Google Sign-In. Verifique o Client ID.");
      }
    };
    if(window.google?.accounts?.id){init();}
    else{
      const existing=document.getElementById("gsi-script");
      if(!existing){
        const s=document.createElement("script");
        s.id="gsi-script";s.src="https://accounts.google.com/gsi/client";
        s.async=true;s.defer=true;
        s.onload=init;
        s.onerror=()=>setGoogleError("Falha ao carregar SDK do Google.");
        document.head.appendChild(s);
      } else {
        // Script already loading; wait
        const t=setInterval(()=>{if(window.google?.accounts?.id){clearInterval(t);init();}},200);
        setTimeout(()=>clearInterval(t),10000);
      }
    }
  },[googleConfig.clientId]);

  // Load all state from storage
  useEffect(()=>{
    async function load(){
      try{
        const keys=["bc-participants","bc-results","bc-predictions","bc-komatches","bc-pool","bc-pix","bc-google","bc-currentUser"];
        const [p,r,pr,km,pool,pix,gc,cu]=await Promise.all(keys.map(k=>window.storage.get(k).catch(()=>null)));
        if(p) setParticipants(JSON.parse(p.value));
        if(r) setResults(JSON.parse(r.value));
        if(pr) setPredictions(JSON.parse(pr.value));
        if(km) setKoMatches(JSON.parse(km.value));
        if(pool) setPoolConfig(JSON.parse(pool.value));
        if(pix) setPixConfig(JSON.parse(pix.value));
        if(gc) setGoogleConfig(JSON.parse(gc.value));
        if(cu){
          const saved=JSON.parse(cu.value);
          const ps=p?JSON.parse(p.value):[];
          if(ps.find(pp=>pp.id===saved.id)){setCurrentUser(saved);}
          else{setShowLogin(true);}
        } else {setShowLogin(true);}
      }catch(e){setShowLogin(true);}
      setLoaded(true);
    }
    load();
  },[]);

  const sv=async(key,val)=>{try{await window.storage.set(key,JSON.stringify(val));}catch(e){}};
  const addParticipant=()=>{if(!newName.trim()) return;const u=[...participants,{id:Date.now(),name:newName.trim(),isAdmin:false}];setParticipants(u);sv("bc-participants",u);setNewName("");};
  const removeParticipant=(id)=>{if(participants.find(p=>p.id===id)?.isAdmin) return;const u=participants.filter(p=>p.id!==id);setParticipants(u);sv("bc-participants",u);const np={...predictions};delete np[id];setPredictions(np);sv("bc-predictions",np);};
  const updateResult=(mid,side,val)=>{const u={...results,[mid]:{...(results[mid]||{}),[side]:val}};setResults(u);sv("bc-results",u);};
  const updatePrediction=(pid,mid,side,val)=>{const u={...predictions,[pid]:{...(predictions[pid]||{}),[mid]:{...(predictions[pid]?.[mid]||{}),[side]:val}}};setPredictions(u);sv("bc-predictions",u);};
  const updateKOMatch=(mid,field,val)=>{const u={...koMatches,[mid]:{...(koMatches[mid]||{}),[field]:val}};setKoMatches(u);sv("bc-komatches",u);};
  const updatePoolConfig=(cfg)=>{setPoolConfig(cfg);sv("bc-pool",cfg);};
  const updatePixConfig=(cfg)=>{setPixConfig(cfg);sv("bc-pix",cfg);};
  const updateGoogleConfig=(cfg)=>{setGoogleConfig(cfg);sv("bc-google",cfg);};
  const handleCreatePool=(name,adminName,fee)=>{
    const admin={id:Date.now(),name:adminName,isAdmin:true};
    const pool={name,entryFee:fee};
    setParticipants([admin]);sv("bc-participants",[admin]);
    setPoolConfig(pool);sv("bc-pool",pool);
    setCurrentUser(admin);sv("bc-currentUser",admin);
    setShowLogin(false);
  };
  const handleLogin=(p)=>{setCurrentUser(p);sv("bc-currentUser",p);setShowLogin(false);};
  const handleJoin=(name)=>{const u={id:Date.now(),name,isAdmin:false};const all=[...participants,u];setParticipants(all);sv("bc-participants",all);setCurrentUser(u);sv("bc-currentUser",u);setShowLogin(false);};
  const handleLogout=()=>{setCurrentUser(null);sv("bc-currentUser",null);setShowLogin(true);};

  const leaderboard=useMemo(()=>participants.map(p=>{
    let pts=0,exact=0,correct=0;
    ALL_MATCHES.forEach(m=>{const mp=calcPoints(predictions[p.id]?.[m.id],results[m.id]);if(mp===3){pts+=3;exact++;}else if(mp===1){pts+=1;correct++;}});
    return{...p,pts,exact,correct};
  }).sort((a,b)=>b.pts-a.pts),[participants,predictions,results]);

  const allStandings=useMemo(()=>{const s={};Object.keys(GROUPS).forEach(k=>{s[k]=groupStandings(k,results);});return s;},[results]);

  const navItems=[{id:"home",label:"Início",ico:"🏠"},{id:"predictions",label:"Palpites",ico:"✏️"},{id:"results",label:"Resultados",ico:"⚽"},{id:"groups",label:"Grupos",ico:"📊"},{id:"knockout",label:"Mata-mata",ico:"🥊"},{id:"leaderboard",label:"Ranking",ico:"🥇"},{id:"config",label:"Config",ico:"⚙️"}];
  const mergedPool={...poolConfig,pixConfig};

  if(!loaded) return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,color:T.gold,fontFamily:"sans-serif",gap:12}}><div style={{fontSize:48}}>⚽</div><div style={{fontSize:15,letterSpacing:2}}>CARREGANDO BOLÃO…</div></div>;

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 60% 40% at 10% 0%,rgba(34,100,34,.1) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 90% 100%,rgba(245,197,24,.07) 0%,transparent 60%)"}}/>
      {showLogin&&<LoginModal participants={participants} poolConfig={mergedPool} onCreatePool={handleCreatePool} onLogin={handleLogin} onJoin={handleJoin} googleConfig={googleConfig} googleReady={googleReady} googleError={googleError}/>}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(7,10,20,.94)",borderBottom:`1px solid ${T.border}`,backdropFilter:"blur(20px)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,minHeight:56}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:20,filter:"drop-shadow(0 0 8px rgba(245,197,24,.5))"}}>🏆</span>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:T.gold,letterSpacing:4,lineHeight:1}}>{poolConfig?.name||"BOLÃO DA COPA"}</div>
              <div style={{fontSize:8,color:T.muted,letterSpacing:2,textTransform:"uppercase"}}>FIFA World Cup 2026 · 48 Seleções</div>
            </div>
          </div>
          <nav style={{display:"flex",gap:2,flexWrap:"wrap",flex:1,justifyContent:"center"}}>
            {navItems.map(tab=>{const active=view===tab.id;return <button key={tab.id} onClick={()=>{setView(tab.id);if(tab.id!=="predictions")setActivePart(null);}} style={{display:"flex",alignItems:"center",gap:3,padding:"6px 9px",borderRadius:7,border:"none",background:active?T.gold:"transparent",color:active?"#000":T.sub,fontWeight:active?700:500,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}><span>{tab.ico}</span><span>{tab.label}</span></button>;})}
          </nav>
          <UserMenu currentUser={currentUser} onSwitch={()=>setShowLogin(true)} onLogout={handleLogout}/>
        </div>
      </header>
      <main style={{position:"relative",zIndex:1,paddingTop:26,paddingBottom:80}}>
        {view==="home"&&<HomeView participants={participants} newName={newName} setNewName={setNewName} addParticipant={addParticipant} removeParticipant={removeParticipant} predictions={predictions} results={results} leaderboard={leaderboard} setView={setView} poolConfig={mergedPool} currentUser={currentUser}/>}
        {view==="predictions"&&<PredictionsView participants={participants} activePart={activePart} setActivePart={setActivePart} predictions={predictions} updatePrediction={updatePrediction} results={results} currentUser={currentUser}/>}
        {view==="results"&&<ResultsView results={results} updateResult={updateResult} currentUser={currentUser}/>}
        {view==="groups"&&<GroupsView allStandings={allStandings}/>}
        {view==="knockout"&&<KnockoutView koMatches={koMatches} updateKOMatch={updateKOMatch} currentUser={currentUser}/>}
        {view==="leaderboard"&&<LeaderboardView leaderboard={leaderboard} predictions={predictions} results={results}/>}
        {view==="config"&&<ConfigView poolConfig={mergedPool} updatePoolConfig={updatePoolConfig} pixConfig={pixConfig} updatePixConfig={updatePixConfig} googleConfig={googleConfig} updateGoogleConfig={updateGoogleConfig} participants={participants} currentUser={currentUser} googleReady={googleReady} googleError={googleError}/>}
      </main>
    </div>
  );
}}