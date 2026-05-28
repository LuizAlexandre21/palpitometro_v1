export const T = {
  bg:           "var(--bg)",
  surface:      "var(--surface)",
  surfaceHover: "var(--surface-hover)",
  border:       "var(--border)",
  borderHover:  "var(--border-hover)",
  primary:      "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark:  "var(--primary-dark)",
  text:         "var(--text)",
  sub:          "var(--text-sub)",
  muted:        "var(--text-muted)",
  green:        "var(--green)",
  red:          "var(--red)",
  gold:         "var(--gold)",
  blur:         "var(--blur)",
};

export const card = {
  background:    "var(--surface)",
  border:        "1px solid var(--border)",
  borderRadius:  14,
  padding:       "20px 22px",
  backdropFilter: "var(--blur)",
};

export const inp = (extra = {}) => ({
  width:        "100%",
  padding:      "11px 14px",
  borderRadius: 10,
  boxSizing:    "border-box",
  border:       "1px solid var(--border)",
  background:   "var(--input-bg)",
  color:        "var(--text)",
  fontSize:     14,
  outline:      "none",
  fontFamily:   "inherit",
  ...extra,
});
