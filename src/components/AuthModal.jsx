import { useState } from "react";

const T = {
  bg: "#070a14", surface: "rgba(255,255,255,.05)", border: "rgba(255,255,255,.1)",
  text: "#f1f5f9", sub: "#94a3b8", muted: "#475569", gold: "#f5c518",
  red: "#f87171", blue: "#60a5fa", green: "#4ade80",
};

export function AuthModal({ onAuth, onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.85)",
    backdropFilter: "blur(20px)", zIndex: 2000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  };
  const modal = {
    background: "rgba(9,13,26,.98)", border: `1px solid ${T.border}`,
    borderRadius: 18, padding: "28px 24px", maxWidth: 400, width: "100%",
    boxShadow: "0 0 80px rgba(245,197,24,.08)",
  };
  const inp = (extra) => ({
    width: "100%", padding: "10px 13px", borderRadius: 9, border: `1px solid ${T.border}`,
    background: "rgba(255,255,255,.05)", color: T.text, fontFamily: "inherit",
    fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10, ...extra,
  });
  const btn = (primary) => ({
    width: "100%", padding: 13, borderRadius: 11, border: "none", fontFamily: "inherit",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    background: primary ? `linear-gradient(135deg,${T.gold},#c9a200)` : "rgba(255,255,255,.07)",
    color: primary ? "#000" : T.sub, marginBottom: 8,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "register") {
        await onAuth("register", { email, password, name });
      } else {
        await onAuth("email", { email, password });
      }
    } catch (err) {
      setError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(""); setLoading(true);
    try { await onAuth("google"); }
    catch (err) { setError(translateError(err.code)); }
    finally { setLoading(false); }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 44 }}>🏆</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: T.gold, letterSpacing: 4, margin: "8px 0 2px" }}>
            {mode === "register" ? "CRIAR CONTA" : "ENTRAR"}
          </h2>
          <p style={{ color: T.sub, fontSize: 12, margin: 0 }}>Palpitômetro Copa 2026</p>
        </div>

        <button style={{ ...btn(false), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar com Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 12px" }}>
          <div style={{ flex: 1, height: 1, background: T.border }}/><span style={{ color: T.muted, fontSize: 11 }}>ou</span><div style={{ flex: 1, height: 1, background: T.border }}/>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input style={inp()} placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input style={inp()} type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={inp()} type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          {error && <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", fontSize: 12, color: T.red, marginBottom: 10 }}>{error}</div>}
          <button type="submit" style={btn(true)} disabled={loading}>
            {loading ? "Aguarde…" : mode === "register" ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <button style={{ ...btn(false), marginBottom: 0 }} onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Criar nova conta" : "Já tenho conta — entrar"}
        </button>
      </div>
    </div>
  );
}

function translateError(code) {
  const map = {
    "auth/user-not-found": "E-mail não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "Senha muito fraca (mínimo 6 caracteres).",
    "auth/invalid-email": "E-mail inválido.",
    "auth/popup-closed-by-user": "Login cancelado.",
    "auth/network-request-failed": "Erro de conexão.",
  };
  return map[code] || "Erro ao autenticar. Tente novamente.";
}
