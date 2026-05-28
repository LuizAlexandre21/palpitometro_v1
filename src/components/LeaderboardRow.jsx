import { T } from "../theme";

const RANK_COLORS = {
  1: { bg: "rgba(245,197,24,0.15)", border: "#F5C518", color: "#F5C518" },
  2: { bg: "rgba(203,213,225,0.12)", border: "#CBD5E1", color: "#CBD5E1" },
  3: { bg: "rgba(180,83,9,0.15)", border: "#B45309", color: "#B08030" },
};

function getAvatarColor(id) {
  const colors = ["#3B82F6","#8B5CF6","#EC4899","#F97316","#14B8A6","#F59E0B"];
  let hash = 0;
  for (const c of String(id)) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

export function LeaderboardRow({ rank, participant, points, maxPoints, isCurrentUser }) {
  const rankStyle = RANK_COLORS[rank] || { bg: "rgba(255,255,255,0.04)", border: T.border, color: T.muted };
  const barWidth = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
  const avatarColor = getAvatarColor(participant.id);
  const initial = (participant.name || "?")[0].toUpperCase();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      borderRadius: 12,
      background: isCurrentUser ? "color-mix(in srgb, var(--primary) 8%, transparent)" : T.surface,
      border: `1px solid ${isCurrentUser ? "color-mix(in srgb, var(--primary) 50%, transparent)" : T.border}`,
      backdropFilter: T.blur,
      boxShadow: isCurrentUser ? "0 0 20px rgba(59,130,246,0.1)" : "none",
      marginBottom: 6,
      transition: "all 0.15s",
    }}>
      {/* Rank badge */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800,
        background: rankStyle.bg,
        border: `1.5px solid ${rankStyle.border}`,
        color: rankStyle.color,
      }}>
        {rank}
      </div>

      {/* Avatar */}
      {participant.picture ? (
        <img src={participant.picture} referrerPolicy="no-referrer" alt={participant.name}
          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${isCurrentUser ? T.primary : "rgba(255,255,255,0.1)"}` }} />
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: avatarColor + "25", border: `2px solid ${avatarColor}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, color: avatarColor,
        }}>
          {initial}
        </div>
      )}

      {/* Name + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ color: T.text, fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {participant.name}
          </span>
          {participant.isAdmin && (
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(245,197,24,0.15)", color: "#F5C518", fontWeight: 700 }}>ADMIN</span>
          )}
          {isCurrentUser && (
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(59,130,246,0.15)", color: T.primary, fontWeight: 700 }}>VOCÊ</span>
          )}
        </div>
        <div style={{ width: "100%", height: 3, background: "var(--divider)", borderRadius: 2 }}>
          <div style={{ width: `${barWidth}%`, height: "100%", background: T.primary, borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Points */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.primaryLight, lineHeight: 1 }}>{points}</div>
        <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>pts</div>
      </div>
    </div>
  );
}
