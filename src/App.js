import { useState, useEffect, useMemo } from "react";
import { useRules, DEFAULT_RULES } from "./hooks/useRules";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { useCampeonato, useUserCampeonatos } from "./hooks/useCampeonato";
import { AuthModal } from "./components/AuthModal";
import { CampeonatoGate } from "./components/CampeonatoGate";
import { Sidebar } from "./components/Sidebar";
import { AdSlot } from "./components/AdSlot";
import { HomeView } from "./views/HomeView";
import { PredictionsView } from "./views/PredictionsView";
import { ResultsView } from "./views/ResultsView";
import { GroupsView } from "./views/GroupsView";
import { KnockoutView } from "./views/KnockoutView";
import { LeaderboardView } from "./views/LeaderboardView";
import { ConfigView } from "./views/ConfigView";
import { GROUPS, ALL_MATCHES } from "./data/matchData";
import { calcPoints, groupStandings } from "./utils/scoring";

export default function App() {
  const { firebaseUser, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [showAuth, setShowAuth] = useState(false);

  const [campeonatoId, setCampeonatoId] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("id") || null;
  });

  const { data, loading, notFound, write, createCampeonato, findByCode, joinCampeonato } = useCampeonato(campeonatoId, firebaseUser);
  const { rules } = useRules(campeonatoId);
  const userCampeonatos = useUserCampeonatos(firebaseUser);

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

  if (firebaseUser === undefined) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        height:"100vh", background:"var(--bg)", color:"var(--primary)", fontFamily:"inherit", gap:12 }}>
        <div style={{ fontSize:48 }}>⚽</div>
        <div style={{ fontSize:15, letterSpacing:2, fontWeight:700 }}>CARREGANDO PALPITÔMETRO…</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex",
        alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ maxWidth:420, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:70, filter:"drop-shadow(0 0 32px color-mix(in srgb, var(--primary) 40%, transparent))" }}>🏆</div>
          <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:52, color:"var(--primary-light)",
            letterSpacing:3, margin:"12px 0 4px", fontWeight:800 }}>PALPITÔMETRO</h1>
          <p style={{ color:"var(--text-sub)", fontSize:13, marginBottom:28 }}>Copa do Mundo 2026 · 100% Gratuito</p>
          <button onClick={() => setShowAuth(true)} style={{
            padding:"14px 40px", borderRadius:12, border:"none",
            background:"var(--primary-gradient)", color:"#fff",
            fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"inherit",
          }}>
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
        campeonatos={userCampeonatos}
        onLogout={async () => { await logout(); }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        height:"100vh", background:"var(--bg)", color:"var(--primary)",
        fontFamily:"inherit", fontSize:15, letterSpacing:2, fontWeight:700 }}>
        CARREGANDO CAMPEONATO…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex",
        alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ maxWidth:400, width:"100%", background:"var(--surface)",
          border:"1px solid var(--border)", borderRadius:18, padding:"32px 24px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔗</div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:28,
            color:"var(--primary-light)", fontWeight:800, letterSpacing:2, margin:"0 0 8px" }}>
            {data?.pool?.name || "CAMPEONATO"}
          </h2>
          <p style={{ color:"var(--text-sub)", fontSize:13, marginBottom:20 }}>
            Você foi convidado! Confirme seu nome para entrar.
          </p>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder={firebaseUser.displayName || "Seu nome no campeonato"}
            style={{ width:"100%", padding:"10px 13px", borderRadius:9,
              border:"1px solid var(--border)", background:"var(--input-bg)",
              color:"var(--text)", fontFamily:"inherit", fontSize:14, outline:"none",
              boxSizing:"border-box", marginBottom:12 }} />
          <button onClick={async () => {
            await joinCampeonato(campeonatoId, firebaseUser, newName || firebaseUser.displayName || firebaseUser.email);
          }} style={{ width:"100%", padding:13, borderRadius:11, border:"none",
            background:"var(--primary-gradient)", color:"#fff", fontWeight:800,
            fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
            Entrar no campeonato →
          </button>
        </div>
      </div>
    );
  }

  const poolConfig = data?.pool || { name: "PALPITÔMETRO" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
      color:"var(--text)" }}>
      <Sidebar
        view={view}
        setView={(v) => { setView(v); if (v !== "predictions") setActivePart(null); }}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={async () => { await logout(); setCampeonatoId(null); }}
        onSwitch={() => setCampeonatoId(null)}
      />
      <main style={{ paddingTop:20, paddingBottom:120, paddingLeft:16, paddingRight:16,
        overflowX:"hidden", position:"relative", maxWidth:1200, margin:"0 auto" }}>
        {view==="home" && <HomeView participants={participants} newName={newName} setNewName={setNewName}
          addParticipant={addParticipant} removeParticipant={removeParticipant} predictions={predictions}
          results={results} leaderboard={leaderboard} setView={setView} poolConfig={poolConfig}
          currentUser={currentUser} campeonatoId={campeonatoId} inviteCode={data?.pool?.inviteCode}/>}
        {view==="predictions" && <PredictionsView participants={participants} activePart={activePart}
          setActivePart={setActivePart} predictions={predictions} updatePrediction={updatePrediction}
          results={results} currentUser={currentUser} rules={rules}/>}
        {view==="results" && <ResultsView results={results} updateResult={updateResult}
          currentUser={currentUser} rules={rules} write={write} campeonatoId={campeonatoId}/>}
        {view==="groups" && <GroupsView allStandings={allStandings}/>}
        {view==="knockout" && <KnockoutView koMatches={koMatches} updateKOMatch={updateKOMatch} currentUser={currentUser}/>}
        {view==="leaderboard" && <LeaderboardView leaderboard={leaderboard} predictions={predictions} results={results}/>}
        {view==="config" && <ConfigView poolConfig={poolConfig} updatePoolConfig={updatePoolConfig}
          participants={participants} currentUser={currentUser} campeonatoId={campeonatoId}
          inviteCode={data?.pool?.inviteCode} rules={rules} write={write}/>}
      </main>
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50,
        background:"color-mix(in srgb, var(--bg) 95%, transparent)",
        borderTop:"1px solid var(--border)", backdropFilter:"var(--blur)", padding:"6px 16px" }}>
        <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_FOOTER} format="horizontal"
          style={{ maxWidth:728, margin:"0 auto" }} />
      </div>
    </div>
  );
}
