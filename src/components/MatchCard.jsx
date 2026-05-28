import { useState } from "react";
import { T } from "../theme";
import { TeamCrest } from "./TeamCrest";

function ScoreInput({ value, onChange, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      min="0"
      max="20"
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: 48,
        height: 48,
        textAlign: "center",
        fontSize: 22,
        fontWeight: 800,
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(59,130,246,0.08)",
        border: `2px solid ${focused ? T.primary : disabled ? "rgba(255,255,255,0.08)" : T.border}`,
        borderRadius: 10,
        color: T.text,
        outline: "none",
        fontFamily: "'DM Mono', monospace",
        cursor: disabled ? "default" : "text",
      }}
    />
  );
}

export function MatchCard({ match, hVal, aVal, onH, onA, disabled, pts }) {
  const hasResult = hVal !== "" && hVal !== undefined && aVal !== "" && aVal !== undefined;
  const borderColor =
    pts === 3 ? "rgba(34,197,94,0.4)" :
    pts === 1 ? "rgba(59,130,246,0.4)" :
    pts === 0 && hasResult ? "rgba(248,113,113,0.3)" :
    T.border;
  const bgColor =
    pts === 3 ? "rgba(34,197,94,0.06)" :
    pts === 1 ? "rgba(59,130,246,0.06)" :
    pts === 0 && hasResult ? "rgba(248,113,113,0.04)" :
    T.surface;

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
      backdropFilter: T.blur,
      marginBottom: 8,
    }}>
      {/* Home */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, minWidth: 0 }}>
        <span style={{ color: T.text, fontWeight: 700, fontSize: 12, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {match.home}
        </span>
        <TeamCrest team={match.home} size={36} />
      </div>

      {/* Score */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <ScoreInput value={hVal} onChange={onH} disabled={disabled} />
        <span style={{ color: T.muted, fontSize: 16, fontWeight: 900 }}>–</span>
        <ScoreInput value={aVal} onChange={onA} disabled={disabled} />
      </div>

      {/* Away */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <TeamCrest team={match.away} size={36} />
        <span style={{ color: T.text, fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
          background: pts === 3 ? T.green : pts === 1 ? T.primary : T.red,
          color: "#fff",
        }}>
          +{pts}
        </div>
      )}
    </div>
  );
}
