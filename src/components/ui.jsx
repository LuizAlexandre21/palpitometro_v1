import { useState } from "react";
import { T } from "../theme";

export function Avatar({ user, size = 32 }) {
  if (!user) return null;
  if (user.picture) return (
    <img src={user.picture} referrerPolicy="no-referrer" alt={user.name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover",
        border: `2px solid ${T.gold}`, flexShrink: 0 }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user.isAdmin ? "rgba(245,197,24,.2)" : "var(--surface)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, flexShrink: 0,
      border: `2px solid ${user.isAdmin ? T.gold : "var(--border)"}`,
    }}>
      {user.isAdmin ? "👑" : "👤"}
    </div>
  );
}

export function Tag({ children, color = "var(--green)" }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
      background: `color-mix(in srgb, ${color} 15%, transparent)`, color, letterSpacing: .4 }}>
      {children}
    </span>
  );
}

export function CopyBtn({ text, label = "Copiar" }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => {
      try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2e3); } catch (e) {}
    }} style={{
      padding: "8px 15px", borderRadius: 9,
      border: `1px solid ${ok ? "var(--green)" : "var(--border)"}`,
      background: ok ? "rgba(34,197,94,.15)" : "var(--surface)",
      color: ok ? "var(--green)" : "var(--text-sub)",
      cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600, transition: "all .2s",
    }}>
      {ok ? "✓ Copiado!" : "📋 " + label}
    </button>
  );
}

export function LabelInput({ label, value, onChange, placeholder, type = "text", disabled, hint }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ display: "block", color: "var(--text-sub)", fontSize: 10, fontWeight: 700,
        marginBottom: 5, letterSpacing: .8, textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
          border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--text)",
          fontSize: 14, outline: "none", fontFamily: "inherit",
          opacity: disabled ? .6 : 1, cursor: disabled ? "not-allowed" : "text",
        }} />
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
