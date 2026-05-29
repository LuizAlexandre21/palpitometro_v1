import { useState } from "react";

export function AuthModal({ onAuth, onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    backdropFilter: "var(--blur)", zIndex: 2000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  };
  const modal = {
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: 18, padding: "32px 28px", maxWidth: 400, width: "90%",
  };
  const inp = (extra) => ({
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--input-bg)", color: "var(--text)",
    fontFamily: "inherit", fontSize: 14, outline: "none",
    boxSizing: "border-box", marginBottom: 10, ...extra,
  });
  const btn = (primary) => ({
    width: "100%", padding: primary ? "12px" : "11px 16px", borderRadius: 10,
    border: primary ? "none" : "1px solid var(--border)", fontFamily: "inherit",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    background: primary ? "var(--primary-gradient)" : "var(--surface)",
    color: primary ? "#fff" : "var(--text)", marginBottom: 8,
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
    catch (err) {
      console.error("Google auth error:", err.code, err.message);
      setError(translateError(err.code));
    }
    finally { setLoading(false); }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 44 }}>🏆</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--text)", letterSpacing: 3, margin: "0 0 6px" }}>
            {mode === "register" ? "CRIAR CONTA" : "ENTRAR"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 24px" }}>Palpitômetro Copa 2026</p>
        </div>

        <button style={{ ...btn(false), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuar com Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 12px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}/><span style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>ou</span><div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input style={inp()} placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input style={inp()} type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={inp()} type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          {error && <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.3)", fontSize: 12, color: "var(--red)", marginBottom: 10 }}>{error}</div>}
          <button type="submit" style={btn(true)} disabled={loading}>
            {loading ? "Aguarde…" : mode === "register" ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button style={{ color: "var(--primary-light)", cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: "inherit", fontSize: 13 }} onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Criar nova conta" : "Já tenho conta — entrar"}
          </button>
        </div>
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
    "auth/operation-not-allowed": "Login com Google não está habilitado. Ative no Firebase Console.",
    "auth/unauthorized-domain": "Domínio não autorizado no Firebase Console.",
    "auth/popup-blocked": "Pop-up bloqueado pelo navegador. Libere pop-ups para este site.",
    "auth/cancelled-popup-request": "Login cancelado.",
    "auth/invalid-credential": "Credencial inválida ou expirada.",
  };
  return map[code] || `Erro ao autenticar (${code || "desconhecido"}). Tente novamente.`;
}
