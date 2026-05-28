import { T, card } from "../theme";
import { TeamCrest } from "../components/TeamCrest";
import { SectionHeader } from "../components/SectionHeader";
import { GROUPS } from "../data/matchData";

export function GroupsView({ allStandings }) {
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
