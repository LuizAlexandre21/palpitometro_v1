import { useState } from "react";
import { Avatar } from "./ui";

export function UserMenu({ currentUser, onSwitch, onLogout }) {
  const [open, setOpen] = useState(false);
  if (!currentUser) return null;
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 7, padding: "6px 10px",
        borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)",
        cursor: "pointer", userSelect: "none", fontFamily: "inherit", color: "var(--text)",
      }}>
        <Avatar user={currentUser} size={28} />
        <span style={{ color: "var(--text)", fontSize: 12, fontWeight: 600,
          maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {currentUser.name}
        </span>
        {currentUser.isAdmin && <span style={{ fontSize: 13 }}>👑</span>}
        <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)",
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 8, minWidth: 200, zIndex: 200,
            backdropFilter: "var(--blur)", boxShadow: "0 8px 32px rgba(0,0,0,.3)",
          }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
              <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13 }}>{currentUser.name}</div>
              {currentUser.email && <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 1 }}>{currentUser.email}</div>}
              <div style={{ fontSize: 10, color: currentUser.isAdmin ? "var(--primary-light)" : "var(--text-muted)", marginTop: 2 }}>
                {currentUser.isAdmin ? "👑 Administrador" : "Participante"}
              </div>
            </div>
            <button onClick={() => { setOpen(false); onSwitch(); }} style={{
              width: "100%", padding: "8px 12px", borderRadius: 8, border: "none",
              background: "transparent", color: "var(--text-sub)", cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", textAlign: "left",
            }}>🔄 Trocar usuário</button>
            <button onClick={() => { setOpen(false); onLogout(); }} style={{
              width: "100%", padding: "8px 12px", borderRadius: 8, border: "none",
              background: "transparent", color: "var(--red)", cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", textAlign: "left",
            }}>🚪 Sair</button>
          </div>
        </>
      )}
    </div>
  );
}
