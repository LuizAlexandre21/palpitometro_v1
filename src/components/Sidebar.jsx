import { useState } from "react";

const NAV_ITEMS = [
  { id: "home",        label: "Início",    flag: "🇧🇷" },
  { id: "predictions", label: "Palpites",  flag: "🇦🇷" },
  { id: "results",     label: "Resultados",flag: "🇩🇪" },
  { id: "groups",      label: "Grupos",    flag: "🇫🇷" },
  { id: "knockout",    label: "Mata-mata", flag: "🇪🇸" },
  { id: "leaderboard", label: "Ranking",   flag: "🇵🇹" },
  { id: "config",      label: "Config",    flag: "⚙️"  },
];

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
  </svg>
);

export function Sidebar({ view, setView, theme, onToggleTheme, currentUser, onLogout, onSwitch }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navBtn = (item) => {
    const active = view === item.id;
    return (
      <button
        key={item.id}
        onClick={() => { setView(item.id); setMenuOpen(false); }}
        title={item.label}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "6px 10px", borderRadius: 10, border: "none", cursor: "pointer",
          background: active ? "var(--surface)" : "transparent",
          boxShadow: active ? "inset 0 0 0 1px var(--border)" : "none",
          color: active ? "var(--primary)" : "var(--text-muted)",
          fontFamily: "inherit", transition: "all .15s", flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>{item.flag}</span>
        <span style={{
          fontSize: 9, fontWeight: active ? 700 : 500,
          letterSpacing: .5, textTransform: "uppercase",
          color: active ? "var(--primary)" : "var(--text-muted)",
          whiteSpace: "nowrap",
        }}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Top bar */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--sidebar-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "var(--blur)",
        height: 58,
        display: "flex", alignItems: "center",
        padding: "0 12px", gap: 4,
      }}>
        {/* Logo */}
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: "var(--primary-gradient)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, marginRight: 8,
        }}>⚽</div>

        {/* Nav items — desktop */}
        <nav style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }} className="topnav-desktop">
          {NAV_ITEMS.map(navBtn)}
        </nav>

        {/* Right: theme toggle + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
          <button
            onClick={onToggleTheme}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text-sub)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <div
            onClick={onSwitch}
            title={currentUser?.name || "Usuário"}
            style={{
              width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
              background: "var(--primary-gradient)", border: "2px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, overflow: "hidden", flexShrink: 0,
            }}
          >
            {currentUser?.photoURL
              ? <img src={currentUser.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👤"}
          </div>
        </div>

        {/* Mobile: hamburger */}
        <button
          className="topnav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--surface)", color: "var(--text)", cursor: "pointer",
            display: "none", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}
        >☰</button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 98 }}
          />
          <div style={{
            position: "fixed", top: 58, left: 0, right: 0, zIndex: 99,
            background: "var(--sidebar-bg)", borderBottom: "1px solid var(--border)",
            backdropFilter: "var(--blur)",
            display: "flex", flexWrap: "wrap", gap: 4, padding: "10px 12px",
          }}>
            {NAV_ITEMS.map(navBtn)}
          </div>
        </>
      )}

      {/* Spacer so content doesn't hide under fixed header */}
      <div style={{ height: 58 }} className="topnav-spacer" />

      <style>{`
        @media (max-width: 640px) {
          .topnav-desktop { display: none !important; }
          .topnav-hamburger { display: flex !important; }
        }
        .topnav-desktop::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
