import { T } from "../theme";

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 1.5 }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>{subtitle}</span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ height: 1, background: "var(--divider)" }} />
    </div>
  );
}
