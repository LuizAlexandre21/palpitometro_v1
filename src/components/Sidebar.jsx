import { useState } from "react";

const NAV_ITEMS = [
  {
    id: "home", label: "Início",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M10.55 2.533a2.25 2.25 0 012.9 0l6.75 5.695c.508.427.8 1.056.8 1.717V19.75A2.25 2.25 0 0118.75 22H15a.75.75 0 01-.75-.75V15h-4.5v6.25a.75.75 0 01-.75.75H5.25A2.25 2.25 0 013 19.75V9.945c0-.661.292-1.29.8-1.717l6.75-5.695z"/></svg>,
  },
  {
    id: "predictions", label: "Palpites",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z"/></svg>,
  },
  {
    id: "results", label: "Resultados",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"/></svg>,
  },
  { divider: true },
  {
    id: "groups", label: "Grupos",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 3h8v8H3zm0 10h8v8H3zM13 3h8v8h-8zm0 10h8v8h-8z"/></svg>,
  },
  {
    id: "knockout", label: "Mata-mata",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M5.166 9.585a2.25 2.25 0 000 4.83C5.64 17.16 8.565 19.5 12 19.5s6.36-2.34 6.834-5.085a2.25 2.25 0 000-4.83C18.36 6.84 15.435 4.5 12 4.5S5.64 6.84 5.166 9.585zM12 12a2.25 2.25 0 100-4.5A2.25 2.25 0 0012 12z" clipRule="evenodd"/></svg>,
  },
  {
    id: "leaderboard", label: "Ranking",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"/></svg>,
  },
  {
    id: "config", label: "Config",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd"/></svg>,
  },
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

  const navBtn = (item, i) => {
    if (item.divider) return (
      <div key={i} style={{ width: 1, height: 20, background: "var(--border)", alignSelf: "center", flexShrink: 0 }} />
    );
    const active = view === item.id;
    return (
      <button
        key={item.id}
        onClick={() => { setView(item.id); setMenuOpen(false); }}
        title={item.label}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 9, border: "none", cursor: "pointer",
          background: active ? "var(--surface)" : "transparent",
          boxShadow: active ? "inset 0 0 0 1px var(--border)" : "none",
          color: active ? "var(--primary)" : "var(--text-muted)",
          fontFamily: "inherit", fontSize: 12, fontWeight: active ? 700 : 500,
          transition: "all .15s", flexShrink: 0, whiteSpace: "nowrap",
        }}
      >
        {item.icon}
        <span className="nav-label">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--sidebar-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "var(--blur)",
        height: 54,
        display: "flex", alignItems: "center",
        padding: "0 14px", gap: 6,
      }}>
        {/* Logo */}
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: "var(--primary-gradient)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 6,
        }}>⚽</div>

        {/* Nav items */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, overflowX: "auto" }} className="topnav-items">
          {NAV_ITEMS.map((item, i) => navBtn(item, i))}
        </nav>

        {/* Right: theme toggle + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={onToggleTheme}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)",
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
              width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
              background: "var(--primary-gradient)", border: "2px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, overflow: "hidden",
            }}
          >
            {currentUser?.photoURL
              ? <img src={currentUser.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "👤"}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="topnav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--surface)", color: "var(--text)", cursor: "pointer",
            display: "none", alignItems: "center", justifyContent: "center", fontSize: 17,
          }}
        >☰</button>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
          <div style={{
            position: "fixed", top: 54, left: 0, right: 0, zIndex: 99,
            background: "var(--sidebar-bg)", borderBottom: "1px solid var(--border)",
            backdropFilter: "var(--blur)",
            display: "flex", flexWrap: "wrap", gap: 4, padding: "10px 14px",
          }}>
            {NAV_ITEMS.filter(i => !i.divider).map((item, i) => navBtn(item, i))}
          </div>
        </>
      )}

      {/* Spacer */}
      <div style={{ height: 54 }} />

      <style>{`
        @media (max-width: 700px) {
          .topnav-items { display: none !important; }
          .topnav-hamburger { display: flex !important; }
        }
        @media (max-width: 900px) {
          .nav-label { display: none; }
        }
        .topnav-items::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
