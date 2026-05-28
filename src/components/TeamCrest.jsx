import { CREST_URLS } from "../data/crestUrls";

const FLAGS = {
  "México":"🇲🇽","África do Sul":"🇿🇦","Coreia do Sul":"🇰🇷","Tchéquia":"🇨🇿",
  "Canadá":"🇨🇦","Bósnia":"🇧🇦","Catar":"🇶🇦","Suíça":"🇨🇭",
  "Brasil":"🇧🇷","Marrocos":"🇲🇦","Haiti":"🇭🇹","Escócia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "EUA":"🇺🇸","Paraguai":"🇵🇾","Austrália":"🇦🇺","Turquia":"🇹🇷",
  "Alemanha":"🇩🇪","Curaçao":"🇨🇼","C. Marfim":"🇨🇮","Equador":"🇪🇨",
  "Holanda":"🇳🇱","Japão":"🇯🇵","Suécia":"🇸🇪","Tunísia":"🇹🇳",
  "Bélgica":"🇧🇪","Egito":"🇪🇬","Irã":"🇮🇷","N. Zelândia":"🇳🇿",
  "Espanha":"🇪🇸","Cabo Verde":"🇨🇻","A. Saudita":"🇸🇦","Uruguai":"🇺🇾",
  "França":"🇫🇷","Senegal":"🇸🇳","Iraque":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argélia":"🇩🇿","Áustria":"🇦🇹","Jordânia":"🇯🇴",
  "Portugal":"🇵🇹","RD Congo":"🇨🇩","Uzbequistão":"🇺🇿","Colômbia":"🇨🇴",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croácia":"🇭🇷","Gana":"🇬🇭","Panamá":"🇵🇦",
};

export function TeamCrest({ team, size = 32 }) {
  if (!team) return null;
  const url = CREST_URLS[team];
  if (!url) {
    return (
      <span style={{ fontSize: size * 0.75, lineHeight: 1, flexShrink: 0 }}>
        {FLAGS[team] || "🏳️"}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={team}
      style={{
        width: size, height: size * 0.67,
        objectFit: "cover", flexShrink: 0,
        borderRadius: 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }}
      onError={e => { e.target.style.display = "none"; }}
    />
  );
}
