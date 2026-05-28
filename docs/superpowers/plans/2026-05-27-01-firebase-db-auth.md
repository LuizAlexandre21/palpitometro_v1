# Firebase Realtime DB + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir `window.storage` por Firebase Realtime Database e adicionar autenticação via Firebase Auth (e-mail/senha + Google SSO), com suporte a múltiplos campeonatos identificados por `?id=` na URL.

**Architecture:** Cada campeonato vive em `/campeonatos/{id}` no Firebase. A identidade do usuário usa Firebase Auth (UID). O `currentUser` local é derivado do Firebase Auth user + dados do participante no banco. O app lê `?id` da URL para saber qual campeonato carregar.

**Tech Stack:** Firebase v12 (firebase/app, firebase/auth, firebase/database), React 19, Vercel

---

## Estrutura de Arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `src/firebase.js` | Criar | Inicializa Firebase App, exporta `auth` e `db` |
| `src/hooks/useCampeonato.js` | Criar | Hook que lê/escreve dados do campeonato no Firebase |
| `src/hooks/useAuth.js` | Criar | Hook que gerencia Firebase Auth (login/logout/estado) |
| `src/components/AuthModal.jsx` | Criar | Modal de login: Google SSO + e-mail/senha + criar conta |
| `src/components/CampeonatoGate.jsx` | Criar | Tela inicial: criar campeonato ou entrar com código |
| `src/App.js` | Modificar | Remove window.storage, usa hooks novos, lê `?id` da URL |
| `.env` | Criar | Variáveis REACT_APP_FIREBASE_* |
| `.env.example` | Criar | Template sem valores reais |

---

## Task 1: Configurar Firebase e variáveis de ambiente

**Files:**
- Create: `src/firebase.js`
- Create: `.env.example`
- Create: `.env` (não commitado)

- [ ] **Criar `.env.example`**

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_DATABASE_URL=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_APP_ID=
```

- [ ] **Criar `.env` com os valores reais do Firebase Console**

Acessar Firebase Console → Project Settings → Your apps → Web app → Config.
Copiar cada valor para o `.env`.

- [ ] **Verificar que `.env` está no `.gitignore`**

```bash
grep "\.env" /home/alexandre/palpitometro_v1/.gitignore
```

Se não estiver, adicionar:
```bash
echo ".env" >> /home/alexandre/palpitometro_v1/.gitignore
echo ".env.local" >> /home/alexandre/palpitometro_v1/.gitignore
```

- [ ] **Criar `src/firebase.js`**

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
```

- [ ] **Verificar que o app compila sem erros**

```bash
cd /home/alexandre/palpitometro_v1 && CI=false npm run build 2>&1 | tail -5
```

Esperado: `The build folder is ready to be deployed.`

- [ ] **Commit**

```bash
git add src/firebase.js .env.example .gitignore
git commit -m "feat: initialize Firebase app with env config"
```

---

## Task 2: Configurar Firebase Console

**Files:** Nenhum arquivo de código — configuração no painel do Firebase.

- [ ] **Ativar Realtime Database**

Firebase Console → Build → Realtime Database → Create Database → Start in test mode.
Copiar a URL do banco (ex: `https://seu-projeto-default-rtdb.firebaseio.com`) para `.env` como `REACT_APP_FIREBASE_DATABASE_URL`.

- [ ] **Definir regras abertas (temporário para desenvolvimento)**

No painel do Realtime Database → Rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

- [ ] **Ativar Firebase Authentication**

Firebase Console → Build → Authentication → Get started.
Ativar os providers:
1. **Email/Password** → Enable → Save
2. **Google** → Enable → Support email → Save

- [ ] **Adicionar domínio autorizado para Google OAuth**

Firebase Console → Authentication → Settings → Authorized domains.
Adicionar: `localhost` (para dev) e `seu-app.vercel.app` (para produção).

---

## Task 3: Hook `useAuth` — Firebase Authentication

**Files:**
- Create: `src/hooks/useAuth.js`

- [ ] **Criar `src/hooks/useAuth.js`**

```js
import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user ?? null);
    });
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { firebaseUser, loginWithGoogle, loginWithEmail, registerWithEmail, logout };
}
```

- [ ] **Commit**

```bash
git add src/hooks/useAuth.js
git commit -m "feat: useAuth hook with Google SSO and email/password"
```

---

## Task 4: Hook `useCampeonato` — Realtime Database

**Files:**
- Create: `src/hooks/useCampeonato.js`

- [ ] **Criar `src/hooks/useCampeonato.js`**

```js
import { useEffect, useState, useCallback } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../firebase";

function genId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function useCampeonato(campeonatoId, firebaseUser) {
  const [data, setData] = useState(null);   // dados completos do campeonato
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Subscreve mudanças em tempo real
  useEffect(() => {
    if (!campeonatoId) { setLoading(false); return; }
    const r = ref(db, `campeonatos/${campeonatoId}`);
    const unsub = onValue(r, (snap) => {
      if (snap.exists()) {
        setData(snap.val());
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
    return unsub;
  }, [campeonatoId]);

  const write = useCallback(async (path, value) => {
    await set(ref(db, `campeonatos/${campeonatoId}/${path}`), value);
  }, [campeonatoId]);

  // Cria um novo campeonato e retorna o ID gerado
  const createCampeonato = useCallback(async (name, adminUser) => {
    const id = genId();
    const inviteCode = genId();
    const adminParticipant = {
      uid: adminUser.uid,
      name: adminUser.displayName || adminUser.email,
      email: adminUser.email,
      photoURL: adminUser.photoURL || null,
      isAdmin: true,
      joinedAt: Date.now(),
    };
    await set(ref(db, `campeonatos/${id}`), {
      pool: { name, adminUid: adminUser.uid, inviteCode },
      participants: { [adminUser.uid]: adminParticipant },
      results: {},
      predictions: {},
      komatches: {},
    });
    return { id, inviteCode };
  }, []);

  // Busca campeonato por inviteCode (varre todos — OK para escala deste app)
  const findByCode = useCallback(async (code) => {
    const snap = await get(ref(db, "campeonatos"));
    if (!snap.exists()) return null;
    const all = snap.val();
    const entry = Object.entries(all).find(
      ([, v]) => v?.pool?.inviteCode === code.toUpperCase()
    );
    return entry ? entry[0] : null; // retorna o ID
  }, []);

  // Adiciona o usuário autenticado como participante
  const joinCampeonato = useCallback(async (campId, user, displayName) => {
    const participant = {
      uid: user.uid,
      name: displayName || user.displayName || user.email,
      email: user.email,
      photoURL: user.photoURL || null,
      isAdmin: false,
      joinedAt: Date.now(),
    };
    await set(ref(db, `campeonatos/${campId}/participants/${user.uid}`), participant);
  }, []);

  return { data, loading, notFound, write, createCampeonato, findByCode, joinCampeonato };
}
```

- [ ] **Commit**

```bash
git add src/hooks/useCampeonato.js
git commit -m "feat: useCampeonato hook with Firebase Realtime DB"
```

---

## Task 5: Componente `AuthModal`

**Files:**
- Create: `src/components/AuthModal.jsx`

- [ ] **Criar `src/components/AuthModal.jsx`**

```jsx
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
```

- [ ] **Commit**

```bash
git add src/components/AuthModal.jsx
git commit -m "feat: AuthModal with Google SSO and email/password"
```

---

## Task 6: Componente `CampeonatoGate`

**Files:**
- Create: `src/components/CampeonatoGate.jsx`

- [ ] **Criar `src/components/CampeonatoGate.jsx`**

```jsx
import { useState } from "react";

const T = {
  bg: "#070a14", border: "rgba(255,255,255,.1)", text: "#f1f5f9",
  sub: "#94a3b8", muted: "#475569", gold: "#f5c518", red: "#f87171",
};

export function CampeonatoGate({ firebaseUser, onCreateCampeonato, onJoinByCode, onJoinById, campeonatos }) {
  const [mode, setMode] = useState("home"); // "home" | "create" | "join"
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inp = {
    width: "100%", padding: "10px 13px", borderRadius: 9, border: `1px solid ${T.border}`,
    background: "rgba(255,255,255,.05)", color: T.text, fontFamily: "inherit",
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };
  const btn = (primary) => ({
    width: "100%", padding: 13, borderRadius: 11, border: "none", fontFamily: "inherit",
    fontWeight: 700, fontSize: 14, cursor: loading ? "default" : "pointer", marginTop: 10,
    background: primary ? `linear-gradient(135deg,${T.gold},#c9a200)` : "rgba(255,255,255,.07)",
    color: primary ? "#000" : T.sub,
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
      <div style={{ maxWidth: 460, width: "100%", background: "rgba(9,13,26,.98)", border: `1px solid ${T.border}`, borderRadius: 18, padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 58, filter: "drop-shadow(0 0 24px rgba(245,197,24,.5))" }}>🏆</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, color: T.gold, letterSpacing: 5, margin: "10px 0 4px" }}>PALPITÔMETRO</h1>
          <p style={{ color: T.sub, fontSize: 12, margin: 0 }}>Copa do Mundo 2026 · Olá, {firebaseUser.displayName || firebaseUser.email}</p>
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
            <button style={btn(false)} onClick={() => { setMode("home"); setError(""); }}>← Voltar</button>
          </>
        )}

        {mode === "join" && (
          <>
            <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Código do campeonato</div>
            <input style={inp} value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: COPA26" maxLength={6} />
            {error && <div style={{ fontSize: 12, color: T.red, marginTop: 6 }}>{error}</div>}
            <button style={btn(true)} onClick={handleJoin} disabled={!code.trim() || loading}>{loading ? "Buscando…" : "Entrar no campeonato"}</button>
            <button style={btn(false)} onClick={() => { setMode("home"); setError(""); }}>← Voltar</button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/CampeonatoGate.jsx
git commit -m "feat: CampeonatoGate screen for creating/joining campeonatos"
```

---

## Task 7: Refatorar `App.js` — integrar tudo

**Files:**
- Modify: `src/App.js`

Esta task substitui toda a lógica de `window.storage`, `LoginModal`, e o state de participantes/resultados pelo Firebase.

- [ ] **Adicionar imports no topo de `src/App.js`**

Substituir a primeira linha por:
```js
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useCampeonato } from "./hooks/useCampeonato";
import { AuthModal } from "./components/AuthModal";
import { CampeonatoGate } from "./components/CampeonatoGate";
```

- [ ] **Remover `LoginModal`, `GoogleSignInButton`, `decodeGoogleJWT` e `buildPixPayload` do App.js**

Localizar e deletar as funções/componentes (linhas ~140-350):
- `function decodeGoogleJWT`
- `function buildPixPayload`
- `function QRImage`
- `function GoogleSignInButton`
- `function LoginModal`

Esses foram substituídos por `AuthModal` e `CampeonatoGate`.

- [ ] **Reescrever o componente `App()` em `src/App.js`**

Substituir o bloco `export default function App()` (linha ~865 ao fim) por:

```jsx
export default function App() {
  // ── Auth ──────────────────────────────────────────────
  const { firebaseUser, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // ── Campeonato ID (URL param) ─────────────────────────
  const [campeonatoId, setCampeonatoId] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("id") || null;
  });

  // ── Dados do campeonato (Firebase) ────────────────────
  const { data, loading, notFound, write, createCampeonato, findByCode, joinCampeonato } = useCampeonato(campeonatoId, firebaseUser);

  // ── Estado local de navegação ─────────────────────────
  const [view, setView] = useState("home");
  const [activePart, setActivePart] = useState(null);
  const [newName, setNewName] = useState("");

  // ── Participante atual (derivado dos dados do Firebase) ─
  const currentUser = useMemo(() => {
    if (!firebaseUser || !data?.participants) return null;
    return data.participants[firebaseUser.uid] || null;
  }, [firebaseUser, data]);

  // ── Navegação de URL ──────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (campeonatoId) {
      params.set("id", campeonatoId);
      window.history.replaceState({}, "", `?${params}`);
    }
  }, [campeonatoId]);

  // ── Handlers de Auth ─────────────────────────────────
  async function handleAuth(method, payload) {
    if (method === "google") await loginWithGoogle();
    else if (method === "email") await loginWithEmail(payload.email, payload.password);
    else if (method === "register") await registerWithEmail(payload.email, payload.password, payload.name);
    setShowAuth(false);
  }

  // ── Handlers de Campeonato ────────────────────────────
  async function handleCreateCampeonato(name) {
    const { id } = await createCampeonato(name, firebaseUser);
    setCampeonatoId(id);
  }

  async function handleJoinByCode(code) {
    const id = await findByCode(code);
    if (!id) return false;
    const alreadyIn = data?.participants?.[firebaseUser.uid];
    if (!alreadyIn) {
      await joinCampeonato(id, firebaseUser, firebaseUser.displayName);
    }
    setCampeonatoId(id);
    return true;
  }

  function handleJoinById(id) {
    setCampeonatoId(id);
  }

  // ── Handlers de dados ─────────────────────────────────
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
  const updateResult = async (mid, side, val) => {
    await write(`results/${mid}/${side}`, val);
  };
  const updatePrediction = async (pid, mid, side, val) => {
    await write(`predictions/${pid}/${mid}/${side}`, val);
  };
  const updateKOMatch = async (mid, field, val) => {
    await write(`komatches/${mid}/${field}`, val);
  };
  const updatePoolConfig = async (cfg) => {
    await write("pool", cfg);
  };

  const leaderboard = useMemo(() =>
    participants.map(p => {
      let pts = 0, exact = 0, correct = 0;
      ALL_MATCHES.forEach(m => {
        const mp = calcPoints(predictions[p.uid]?.[m.id], results[m.id]);
        if (mp === 3) { pts += 3; exact++; }
        else if (mp === 1) { pts += 1; correct++; }
      });
      return { ...p, id: p.uid, pts, exact, correct };
    }).sort((a, b) => b.pts - a.pts),
  [participants, predictions, results]);

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

  // ── Tela de carregamento inicial ──────────────────────
  if (firebaseUser === undefined) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#070a14", color: "#f5c518", fontFamily: "sans-serif", gap: 12 }}>
        <div style={{ fontSize: 48 }}>⚽</div>
        <div style={{ fontSize: 15, letterSpacing: 2 }}>CARREGANDO PALPITÔMETRO…</div>
      </div>
    );
  }

  // ── Não autenticado ───────────────────────────────────
  if (!firebaseUser) {
    return (
      <div style={{ minHeight: "100vh", background: "#070a14", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 70, filter: "drop-shadow(0 0 32px rgba(245,197,24,.4))" }}>🏆</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: "#f5c518", letterSpacing: 6, margin: "12px 0 4px" }}>PALPITÔMETRO</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 28 }}>Copa do Mundo 2026 · 100% Gratuito</p>
          <button onClick={() => setShowAuth(true)}
            style={{ padding: "14px 40px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f5c518,#c9a200)", color: "#000", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
            Entrar / Criar conta
          </button>
        </div>
        {showAuth && <AuthModal onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  // ── Sem campeonato selecionado ────────────────────────
  if (!campeonatoId || notFound) {
    // Busca campeonatos do usuário (participação)
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

  // ── Carregando dados do campeonato ────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#070a14", color: "#f5c518", fontFamily: "sans-serif", fontSize: 15, letterSpacing: 2 }}>
        CARREGANDO CAMPEONATO…
      </div>
    );
  }

  // ── Participante não está no campeonato ───────────────
  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: "#070a14", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 400, width: "100%", background: "rgba(9,13,26,.98)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#f5c518", letterSpacing: 3, margin: "0 0 8px" }}>
            {data?.pool?.name || "CAMPEONATO"}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>Você foi convidado! Confirme seu nome para entrar.</p>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder={firebaseUser.displayName || "Seu nome no campeonato"}
            style={{ width: "100%", padding: "10px 13px", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#f1f5f9", fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
          />
          <button
            onClick={async () => {
              await joinCampeonato(campeonatoId, firebaseUser, newName || firebaseUser.displayName || firebaseUser.email);
            }}
            style={{ width: "100%", padding: 13, borderRadius: 11, border: "none", background: "linear-gradient(135deg,#f5c518,#c9a200)", color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Entrar no campeonato →
          </button>
        </div>
      </div>
    );
  }

  // ── App principal ─────────────────────────────────────
  const poolConfig = data?.pool || { name: "PALPITÔMETRO" };

  return (
    <div style={{ minHeight: "100vh", background: "#070a14", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#f1f5f9" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 60% 40% at 10% 0%,rgba(34,100,34,.1) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 90% 100%,rgba(245,197,24,.07) 0%,transparent 60%)" }} />
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,10,20,.94)", borderBottom: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, minHeight: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 20, filter: "drop-shadow(0 0 8px rgba(245,197,24,.5))" }}>🏆</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: "#f5c518", letterSpacing: 4, lineHeight: 1 }}>{poolConfig.name || "PALPITÔMETRO"}</div>
              <div style={{ fontSize: 8, color: "#475569", letterSpacing: 2, textTransform: "uppercase" }}>FIFA World Cup 2026 · 48 Seleções</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 2, flexWrap: "wrap", flex: 1, justifyContent: "center" }}>
            {navItems.map(tab => {
              const active = view === tab.id;
              return (
                <button key={tab.id} onClick={() => { setView(tab.id); if (tab.id !== "predictions") setActivePart(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 3, padding: "6px 9px", borderRadius: 7, border: "none", background: active ? "#f5c518" : "transparent", color: active ? "#000" : "#94a3b8", fontWeight: active ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
                  <span>{tab.ico}</span><span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          <UserMenu currentUser={currentUser} onLogout={async () => { await logout(); setCampeonatoId(null); }} onSwitch={() => setCampeonatoId(null)} />
        </div>
      </header>
      <main style={{ position: "relative", zIndex: 1, paddingTop: 26, paddingBottom: 80 }}>
        {view === "home" && <HomeView participants={participants} newName={newName} setNewName={setNewName} addParticipant={addParticipant} removeParticipant={removeParticipant} predictions={predictions} results={results} leaderboard={leaderboard} setView={setView} poolConfig={poolConfig} currentUser={currentUser} campeonatoId={campeonatoId} inviteCode={data?.pool?.inviteCode} />}
        {view === "predictions" && <PredictionsView participants={participants} activePart={activePart} setActivePart={setActivePart} predictions={predictions} updatePrediction={updatePrediction} results={results} currentUser={currentUser} />}
        {view === "results" && <ResultsView results={results} updateResult={updateResult} currentUser={currentUser} />}
        {view === "groups" && <GroupsView allStandings={allStandings} />}
        {view === "knockout" && <KnockoutView koMatches={koMatches} updateKOMatch={updateKOMatch} currentUser={currentUser} />}
        {view === "leaderboard" && <LeaderboardView leaderboard={leaderboard} predictions={predictions} results={results} />}
        {view === "config" && <ConfigView poolConfig={poolConfig} updatePoolConfig={updatePoolConfig} participants={participants} currentUser={currentUser} campeonatoId={campeonatoId} inviteCode={data?.pool?.inviteCode} />}
      </main>
    </div>
  );
}
```

- [ ] **Atualizar `HomeView` para exibir link/código de convite quando admin**

Localizar em `HomeView` o bloco de botões de navegação e adicionar antes do fechamento do `</div>` principal:

```jsx
{currentUser?.isAdmin && inviteCode && (
  <div style={{ ...card, marginBottom: 20, background: "rgba(245,197,24,.04)", border: "1px solid rgba(245,197,24,.15)" }}>
    <h3 style={{ color: T.gold, fontWeight: 700, fontSize: 13, margin: "0 0 10px" }}>🔗 Convite</h3>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <div style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Código</div>
        <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: T.gold, letterSpacing: 4 }}>{inviteCode}</div>
      </div>
      <div>
        <div style={{ color: T.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Link direto</div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.sub, wordBreak: "break-all" }}>
          {window.location.origin}?id={campeonatoId}
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Atualizar assinatura de `HomeView` para aceitar `campeonatoId` e `inviteCode`**

```jsx
function HomeView({participants,newName,setNewName,addParticipant,removeParticipant,predictions,results,leaderboard,setView,poolConfig,currentUser,campeonatoId,inviteCode}){
```

- [ ] **Atualizar `ConfigView` — remover props `googleConfig/updateGoogleConfig`, adicionar `inviteCode`**

```jsx
function ConfigView({poolConfig,updatePoolConfig,participants,currentUser,campeonatoId,inviteCode}){
```

Remover todo o bloco `{tab==="google"&&(...)}` já que a autenticação agora é feita via Firebase Auth.
Atualizar `tabs`:
```jsx
const tabs=[{id:"pool",label:"⚙️ Configurações"},{id:"invite",label:"🔗 Convite"}];
```

Adicionar tab de convite:
```jsx
{tab==="invite"&&(
  <div style={card}>
    <h3 style={{color:T.text,fontWeight:700,fontSize:15,margin:"0 0 16px"}}>🔗 Convite</h3>
    <div style={{marginBottom:14}}>
      <div style={{color:T.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Código de acesso</div>
      <div style={{fontFamily:"monospace",fontSize:28,fontWeight:800,color:T.gold,letterSpacing:6}}>{inviteCode}</div>
    </div>
    <div>
      <div style={{color:T.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Link direto</div>
      <div style={{fontFamily:"monospace",fontSize:12,color:T.sub,padding:"8px 12px",background:"rgba(255,255,255,.04)",borderRadius:8,wordBreak:"break-all"}}>
        {window.location.origin}?id={campeonatoId}
      </div>
    </div>
  </div>
)}
```

- [ ] **Verificar build**

```bash
CI=false npm run build 2>&1 | tail -8
```

Esperado: `The build folder is ready to be deployed.`

- [ ] **Commit**

```bash
git add src/App.js
git commit -m "feat: integrate Firebase Auth + Realtime DB into App"
```

---

## Task 8: Adicionar variáveis de ambiente no Vercel

**Files:** Configuração no painel do Vercel.

- [ ] **Acessar Vercel → projeto → Settings → Environment Variables**

Adicionar cada variável do `.env`:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_DATABASE_URL`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_APP_ID`

Escopo: Production + Preview + Development.

- [ ] **Fazer deploy e verificar**

```bash
git push
```

Aguardar deploy no Vercel. Acessar a URL e verificar que a tela de login aparece corretamente.

---

## Task 9: Limpeza — remover arquivos obsoletos

**Files:**
- Delete: `src/App.js.bak`

- [ ] **Remover backup**

```bash
rm /home/alexandre/palpitometro_v1/src/App.js.bak
```

- [ ] **Commit final**

```bash
git add -A
git commit -m "chore: remove obsolete App.js.bak"
```
