import { useEffect, useRef } from "react";

export function AdSlot({ slot, format = "auto", style = {} }) {
  const ref = useRef(null);
  const client = process.env.REACT_APP_ADSENSE_CLIENT;
  const isDev = !client || client.includes("SEU_PUBLISHER") || client.includes("ca-pub-SEU");

  useEffect(() => {
    if (isDev || !window.adsbygoogle) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // slot já inicializado
    }
  }, [isDev]);

  if (isDev) {
    const heights = { auto: 90, horizontal: 90, rectangle: 250 };
    const h = heights[format] || 90;
    return (
      <div style={{
        height: h, background: "rgba(255,255,255,.03)", border: "1px dashed rgba(255,255,255,.1)",
        borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,.2)", fontSize: 11, fontFamily: "monospace",
        ...style,
      }}>
        AdSense [{format}] — slot: {slot || "não configurado"}
      </div>
    );
  }

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
