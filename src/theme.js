export const T = {
  bg:           "#070A14",
  surface:      "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border:       "rgba(59,130,246,0.2)",
  borderHover:  "rgba(59,130,246,0.45)",
  primary:      "#3B82F6",
  primaryLight: "#60A5FA",
  primaryDark:  "#2563EB",
  text:         "#F1F5F9",
  sub:          "#94A3B8",
  muted:        "rgba(255,255,255,0.35)",
  green:        "#22C55E",
  red:          "#F87171",
  gold:         "#F5C518",
  blur:         "blur(12px)",
};

export const card = {
  background:    T.surface,
  border:        `1px solid ${T.border}`,
  borderRadius:  14,
  padding:       "20px 22px",
  backdropFilter: T.blur,
};

export const inp = (extra = {}) => ({
  width:          "100%",
  padding:        "11px 14px",
  borderRadius:   10,
  boxSizing:      "border-box",
  border:         `1px solid ${T.border}`,
  background:     "rgba(255,255,255,0.05)",
  color:          T.text,
  fontSize:       14,
  outline:        "none",
  fontFamily:     "inherit",
  ...extra,
});
