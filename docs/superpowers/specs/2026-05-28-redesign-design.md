# Redesign Palpitômetro — Spec

**Data:** 2026-05-28  
**Abordagem escolhida:** B — Visual + Componentes  
**Status:** Aprovado pelo usuário

---

## 1. Visão Geral

Redesign completo do Palpitômetro: nova paleta de cores com suporte a dark/light mode, tipografia moderna, sidebar retrátil substituindo a nav bar superior, ícones Bold Fill em SVG, e separação do `App.js` (1182 linhas) em arquivos de view independentes.

---

## 2. Paleta de Cores — Esmeralda Noturna

O tema é controlado por CSS custom properties em `:root` e `:root[data-theme="light"]`. JavaScript alterna o atributo `data-theme` no `<html>`.

### Dark Mode (padrão)
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#030f0a` | Fundo da página |
| `--bg-2` | `#041f12` | Gradiente secundário |
| `--surface` | `rgba(16,185,129,0.07)` | Cards e superfícies |
| `--surface-hover` | `rgba(16,185,129,0.12)` | Hover de cards |
| `--border` | `rgba(16,185,129,0.18)` | Bordas padrão |
| `--border-hover` | `rgba(16,185,129,0.35)` | Bordas em hover |
| `--primary` | `#10b981` | Cor primária (emerald-500) |
| `--primary-light` | `#34d399` | Primária clara (emerald-400) |
| `--primary-gradient` | `linear-gradient(135deg,#059669,#6366f1)` | Botões e destaques |
| `--accent` | `#6366f1` | Indigo para contraste |
| `--text` | `#f1f5f9` | Texto principal |
| `--text-sub` | `#94a3b8` | Texto secundário |
| `--text-muted` | `rgba(255,255,255,0.35)` | Texto desabilitado |
| `--green` | `#22c55e` | Acerto de palpite |
| `--red` | `#f87171` | Erro de palpite |
| `--gold` | `#f5c518` | Destaque/troféu |
| `--sidebar-bg` | `rgba(3,10,6,0.98)` | Fundo da sidebar |

### Light Mode
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#f0fdf4` | Fundo da página |
| `--bg-2` | `#dcfce7` | Gradiente secundário |
| `--surface` | `rgba(16,185,129,0.07)` | Cards e superfícies |
| `--surface-hover` | `rgba(16,185,129,0.12)` | Hover de cards |
| `--border` | `rgba(16,185,129,0.18)` | Bordas padrão |
| `--border-hover` | `rgba(16,185,129,0.32)` | Bordas em hover |
| `--primary` | `#059669` | Cor primária (emerald-600) |
| `--primary-light` | `#065f46` | Primária escura (para contraste) |
| `--primary-gradient` | `linear-gradient(135deg,#059669,#4f46e5)` | Botões |
| `--accent` | `#4f46e5` | Indigo |
| `--text` | `#022c22` | Texto principal |
| `--text-sub` | `#374151` | Texto secundário |
| `--text-muted` | `rgba(0,0,0,0.35)` | Texto desabilitado |
| `--sidebar-bg` | `rgba(240,253,244,0.98)` | Fundo da sidebar |

---

## 3. Tipografia

Substituir **Bebas Neue** por **Plus Jakarta Sans** (Google Fonts).

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

- **Títulos principais** (landing, seções): `font-weight: 800`, `letter-spacing: 2px`
- **Títulos de card**: `font-weight: 700`
- **Texto de interface**: `font-weight: 400–600`
- `DM Mono` mantida para placares (inputs de score)

Remover a importação de Bebas Neue do `index.html`.

---

## 4. Navegação — Sidebar Retrátil

Substituir o `<header>` fixo com tabs horizontais por uma sidebar vertical.

### Comportamento
- **Desktop (≥768px):** sidebar fixa à esquerda, largura `56px` (ícones apenas). Hover no ícone mostra tooltip com nome da seção.
- **Mobile (<768px):** sidebar oculta por padrão. Botão hamburger `☰` no topo esquerdo abre overlay deslizando da esquerda. Clique fora fecha.
- Estado aberto/fechado controlado por `useState` no `App.js`.

### Ícones Bold Fill (SVG inline)
Cada item da sidebar usa SVG inline (sem dependência de biblioteca):

| Seção | Ícone |
|-------|-------|
| Início | `HomeIcon` — casa preenchida |
| Palpites | `PencilIcon` — lápis preenchido |
| Resultados | `BoltIcon` — raio preenchido |
| Grupos | `GridIcon` — 4 quadrados preenchidos |
| Mata-mata | `TrophyIcon` — troféu preenchido |
| Ranking | `ChartBarIcon` — barras preenchidas |
| Config | `CogIcon` — engrenagem preenchida |

SVGs extraídos do Heroicons v2 solid (MIT license, sem dependência de npm).

### Toggle dark/light mode
Botão na parte inferior da sidebar com ícone sol/lua. Persiste preferência em `localStorage`.

---

## 5. Separação do App.js em Views

O `App.js` atual tem 1182 linhas. Extrair cada view para arquivo próprio:

```
src/views/
  HomeView.jsx
  PredictionsView.jsx
  ResultsView.jsx
  GroupsView.jsx
  KnockoutView.jsx
  LeaderboardView.jsx
  ConfigView.jsx
src/components/
  Sidebar.jsx        ← novo
  ThemeToggle.jsx    ← novo
src/theme.js         ← substituído por CSS custom properties + hook
src/hooks/
  useTheme.js        ← novo
```

`App.js` passa a importar os views e a `Sidebar`, reduzindo para ~150 linhas de orquestração.

---

## 6. Sistema de Tema (useTheme)

```js
// src/hooks/useTheme.js
export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}
```

O `theme.js` atual (objeto JS) é substituído pelas CSS custom properties. Os componentes deixam de importar `T` e passam a usar `var(--primary)` etc. diretamente nos estilos inline ou via classes CSS em `index.css`.

---

## 7. Atualização dos Componentes Existentes

Cada componente existente (`AuthModal`, `CampeonatoGate`, `MatchCard`, `LeaderboardRow`, `SectionHeader`, `TeamCrest`) troca referências a `T.xxx` por `var(--xxx)`.

Mudanças de layout nos componentes são mínimas — o redesign é principalmente de cor e tipografia. Nenhuma lógica de negócio é alterada.

---

## 8. Arquivos Alterados / Criados

| Arquivo | Ação |
|---------|------|
| `src/theme.js` | Substituído por CSS custom properties |
| `src/index.css` | Adicionar custom properties dark/light + fonte |
| `public/index.html` | Trocar fonte Google Fonts |
| `src/App.js` | Refatorar: extrair views, adicionar Sidebar |
| `src/views/HomeView.jsx` | Extraído de App.js |
| `src/views/PredictionsView.jsx` | Extraído de App.js |
| `src/views/ResultsView.jsx` | Extraído de App.js |
| `src/views/GroupsView.jsx` | Extraído de App.js |
| `src/views/KnockoutView.jsx` | Extraído de App.js |
| `src/views/LeaderboardView.jsx` | Extraído de App.js |
| `src/views/ConfigView.jsx` | Extraído de App.js |
| `src/components/Sidebar.jsx` | Novo componente |
| `src/components/ThemeToggle.jsx` | Novo componente |
| `src/hooks/useTheme.js` | Novo hook |
| `src/components/AuthModal.jsx` | Atualizar cores |
| `src/components/CampeonatoGate.jsx` | Atualizar cores |
| `src/components/MatchCard.jsx` | Atualizar cores |
| `src/components/LeaderboardRow.jsx` | Atualizar cores |
| `src/components/SectionHeader.jsx` | Atualizar cores |

---

## 9. Fora do Escopo

- Lógica de negócio (palpites, resultados, regras) — sem alteração
- Hooks de dados (`useCampeonato`, `useRules`, `useAuth`) — sem alteração
- Firebase — sem alteração
- Animações de transição entre telas — não incluído nesta versão
