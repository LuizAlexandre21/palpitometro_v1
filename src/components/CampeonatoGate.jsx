import { useState } from "react";
import { T } from "../theme";

export function CampeonatoGate({ firebaseUser, onCreateCampeonato, onJoinByCode, onJoinById, campeonatos }) {
  const [mode, setMode] = useState("home"); // "home" | "create" | "join"
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(59,130,246,.25)",
    background: "rgba(255,255,255,.05)", color: T.text, fontFamily: "inherit",
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };
  const btn = (primary) => ({
    width: "100%", padding: "13px", borderRadius: 10,
    border: primary ? "none" : `1px solid ${T.border}`, fontFamily: "inherit",
    fontWeight: primary ? 700 : 600, fontSize: 14, cursor: loading ? "default" : "pointer", marginTop: 10,
    background: primary ? T.primary : T.surface,
    color: primary ? "#fff" : T.text,
  });

  async function handleCreate() {
    if (!name.trim()) return;
    setError(""); setLoading(true);
    try { await onCreateCampeonato(name.trim()); }
    catch { setError("Erro ao criar campeonato. Tente novamente."); }
    finally { setLoading(false); }
  }

  async function handleJoin() {
    if (!code.trim()) return;
    setError(""); setLoading(true);
    try {
      const found = await onJoinByCode(code.trim());
      if (!found) setError("Código não encontrado. Verifique e tente novamente.");
    } catch { setError("Erro ao entrar. Tente novamente."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "90%", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ background: "rgba(13,21,37,.95)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 18, padding: "32px 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 58, filter: "drop-shadow(0 0 24px rgba(245,197,24,.5))" }}>🏆</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: T.text, letterSpacing: 3, margin: "0 0 8px" }}>PALPITÔMETRO</h1>
          <p style={{ color: T.sub, fontSize: 13, margin: "0 0 24px" }}>Copa do Mundo 2026 · Olá, {firebaseUser.displayName || firebaseUser.email}</p>
        </div>

        {campeonatos && campeonatos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Seus campeonatos</div>
            {campeonatos.map(c => (
              <button key={c.id} onClick={() => onJoinById(c.id)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: "rgba(255,255,255,.04)", color: T.text, fontFamily: "inherit", cursor: "pointer", textAlign: "left", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                🏆 {c.name}
              </button>
            ))}
            <div style={{ height: 1, background: T.border, margin: "16px 0" }} />
          </div>
        )}

        {mode === "home" && (
          <>
            <button style={btn(true)} onClick={() => setMode("create")}>+ Criar novo campeonato</button>
            <button style={btn(false)} onClick={() => setMode("join")}>Entrar com código</button>
          </>
        )}

        {mode === "create" && (
          <>
            <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Nome do campeonato</div>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Bolão do Trabalho" />
            {error && <div style={{ fontSize: 12, color: T.red, marginTop: 6 }}>{error}</div>}
            <button style={btn(true)} onClick={handleCreate} disabled={!name.trim() || loading}>{loading ? "Criando…" : "🚀 Criar campeonato"}</button>
            <button style={{ background: "none", border: "1px solid " + T.border, color: T.primaryLight, borderRadius: 8, padding: "6px 13px", cursor: "pointer", fontFamily: "inherit", marginTop: 10 }} onClick={() => { setMode("home"); setError(""); }}>← Voltar</button>
          </>
        )}

        {mode === "join" && (
          <>
            <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Código do campeonato</div>
            <input style={inp} value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: COPA26" maxLength={6} />
            {error && <div style={{ fontSize: 12, color: T.red, marginTop: 6 }}>{error}</div>}
            <button style={btn(true)} onClick={handleJoin} disabled={!code.trim() || loading}>{loading ? "Buscando…" : "Entrar no campeonato"}</button>
            <button style={{ background: "none", border: "1px solid " + T.border, color: T.primaryLight, borderRadius: 8, padding: "6px 13px", cursor: "pointer", fontFamily: "inherit", marginTop: 10 }} onClick={() => { setMode("home"); setError(""); }}>← Voltar</button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
