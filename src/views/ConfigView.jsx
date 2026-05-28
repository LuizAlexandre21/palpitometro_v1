import { useState } from "react";
import { T, card, inp } from "../theme";
import { SectionHeader } from "../components/SectionHeader";
import { Avatar, Tag, LabelInput } from "../components/ui";
import { DEFAULT_RULES } from "../hooks/useRules";

export function ConfigView({ poolConfig, updatePoolConfig, participants, currentUser, campeonatoId, inviteCode, rules = DEFAULT_RULES, write }) {
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
              {type==="auto"&&!(rules[id]?.active??false)&&(
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
    </div>
  );
}
