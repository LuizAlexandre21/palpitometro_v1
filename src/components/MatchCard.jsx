import { useState } from "react";
import { TeamCrest } from "./TeamCrest";

function ScoreInput({ value, onChange, disabled, label }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      min="0"
      max="20"
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      aria-label={label}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: 48,
        height: 48,
        textAlign: "center",
        fontSize: 22,
        fontWeight: 800,
        background: disabled ? "var(--surface)" : "color-mix(in srgb, var(--primary) 10%, transparent)",
        border: `2px solid ${focused ? "var(--primary)" : disabled ? "rgba(255,255,255,0.08)" : "var(--border)"}`,
        borderRadius: 10,
        color: "var(--text)",
        outline: "none",
        fontFamily: "'DM Mono', monospace",
        cursor: disabled ? "default" : "text",
      }}
    />
  );
}

export function MatchCard({ match, hVal, aVal, onH, onA, disabled, pts }) {
  if (!match) return null;
  const hasResult = hVal !== "" && hVal !== undefined && aVal !== "" && aVal !== undefined;
  const borderColor =
    pts === 3 ? "color-mix(in srgb, var(--green) 50%, transparent)" :
    pts === 1 ? "color-mix(in srgb, var(--primary) 50%, transparent)" :
    pts === 0 && hasResult ? "color-mix(in srgb, var(--red) 40%, transparent)" :
    "var(--border)";
  const bgColor =
    pts === 3 ? "color-mix(in srgb, var(--green) 8%, transparent)" :
    pts === 1 ? "color-mix(in srgb, var(--primary) 8%, transparent)" :
    pts === 0 && hasResult ? "color-mix(in srgb, var(--red) 6%, transparent)" :
    "var(--surface)";

  return (
    <div style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      borderRadius: 12,
      background: bgColor,
      border: `1px solid ${borderColor}`,
      backdropFilter: "var(--blur)",
      marginBottom: 8,
    }}>
      {/* Home */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, minWidth: 0 }}>
        <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 12, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {match.home}
        </span>
        <TeamCrest team={match.home} size={36} />
      </div>

      {/* Score */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <ScoreInput value={hVal} onChange={onH} disabled={disabled} label={`Gols ${match.home}`} />
        <span style={{ color: "var(--text-muted)", fontSize: 16, fontWeight: 900 }}>–</span>
        <ScoreInput value={aVal} onChange={onA} disabled={disabled} label={`Gols ${match.away}`} />
      </div>

      {/* Away */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <TeamCrest team={match.away} size={36} />
        <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {match.away}
        </span>
      </div>

      {/* Points badge */}
      {pts !== null && pts !== undefined && (
        <div style={{
          position: "absolute", top: 6, right: 8,
          width: 22, height: 22, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 800,
          background: pts === 3 ? "var(--green)" : pts === 1 ? "var(--primary)" : "var(--red)",
          color: "#fff",
        }}>
          +{pts}
        </div>
      )}
    </div>
  );
}
