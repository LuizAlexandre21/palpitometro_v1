# 🔄 Mudanças de Bolão → Palpitômetro
 
## Resumo de Mudanças
 
**Removido**: 45 linhas de código Pix  
**Removido**: Componentes de taxa/pagamento  
**Adicionado**: Google AdSense slots (15 linhas)  
**Adicionado**: Disclaimer de gratuidade (3 linhas)  
**Renomeado**: "Bolão" → "Palpitômetro"  
**Simplificado**: ConfigView (remove aba Pix)  
 
---
 
## **MUDANÇA 1: Renomear no app inteiro**
 
### Buscar e Substituir (Ctrl+H no VS Code):
 
```
"Bolão da Copa" → "Palpitômetro"
"BOLÃO DA COPA" → "PALPITÔMETRO"
"TAX" / "taxa" / "entryFee" → REMOVER
"PIX" / "pix" → REMOVER
poolConfig → appConfig
```
 
---
 
## **MUDANÇA 2: Remover PIX da HomeView**
 
### ANTES (linhas ~150-190 em bolao-copa-v2.jsx):
```jsx
const pix=poolConfig?.pixConfig;
const hasPix=pix?.key&&pix?.holderName;
...
{hasPix&&(
  <div style={{...card,marginBottom:20,...}}>
    <div style={{display:"flex",...}}>
      <div>
        <div style={{display:"flex",alignItems:"center",...}}>
          <span style={{fontSize:18}}>💳</span>
          <span>Pagamento via Pix</span>
          <Tag color={T.green}>R$ {poolConfig.entryFee},00</Tag>
        </div>
        ...
      </div>
      <div>...</div>
    </div>
  </div>
)}
```
 
### DEPOIS: DELETAR TUDO ISSO
 
No lugar, adicione anúncio:
```jsx
{/* 📊 Google AdSense Slot 1 */}
<div style={{margin:"28px auto",maxWidth:730,textAlign:"center"}}>
  <ins className="adsbygoogle" style={{display:"block"}} 
    data-ad-client="ca-pub-SEU_PUBLISHER_ID" 
    data-ad-slot="SLOT_1" data-ad-format="auto" 
    data-full-width-responsive="true"/>
</div>
```
 
---
 
## **MUDANÇA 3: Stats do Home (remover taxa)**
 
### ANTES:
```jsx
{[
  {ico:"👥",val:participants.length,lab:"Participantes"},
  {ico:"⚽",val:`${played}/${total}`,lab:"Jogos"},
  {ico:"🥇",val:leader?.name||"—",lab:"Líder"},
  {ico:"⭐",val:leader?.pts??0,lab:"Pts Líder"},
  {ico:"💰",val:`R$ ${poolConfig?.entryFee||0}`,lab:"Taxa"},  // ← REMOVER ESTA LINHA
].map(s=>(...))}
```
 
### DEPOIS:
```jsx
{[
  {ico:"👥",val:participants.length,lab:"Participantes"},
  {ico:"⚽",val:`${played}/${total}`,lab:"Jogos"},
  {ico:"🥇",val:leader?.name||"—",lab:"Líder"},
  {ico:"⭐",val:leader?.pts??0,lab:"Pts Líder"},
].map(s=>(...))}
```
 
---
 
## **MUDANÇA 4: Remover aba PIX da ConfigView**
 
### ANTES (linhas ~950):
```jsx
const tabs=[
  {id:"google",label:"🔑 Google OAuth"},
  {id:"pix",label:"💳 Chave Pix"},      // ← REMOVER
  {id:"invite",label:"🔗 QR Convite"},   // ← REMOVER (QR convite sem pix não faz sentido)
  {id:"pool",label:"⚙️ Bolão"}
];
```
 
### DEPOIS:
```jsx
const tabs=[
  {id:"google",label:"🔑 Google OAuth"},
  {id:"pool",label:"⚙️ Configurações"}
];
```
 
### Remover seções inteiras:
```jsx
{tab==="pix"&&( ... )}  // ← DELETAR TODO ESTE BLOCO
{tab==="invite"&&( ... )}  // ← DELETAR TODO ESTE BLOCO
```
 
---
 
## **MUDANÇA 5: Remover PIX de LoginModal**
 
### ANTES (linhas ~350):
```jsx
{poolConfig?.pixConfig?.key&&(
  <div style={{...}}>
    <div style={{fontSize:11,...}}>💳 Pague a taxa via Pix</div>
    <div style={{color:T.text,...}}>{poolConfig.pixConfig.key}</div>
    <div>...</div>
  </div>
)}
```
 
### DEPOIS: DELETAR TUDO
 
---
 
## **MUDANÇA 6: Adicionar disclaimer de gratuidade**
 
### Adicionar no final da HomeView, antes do fechamento `</div>`:
 
```jsx
<div style={{padding:"12px 16px",borderRadius:10,background:"rgba(96,165,250,.08)",
  border:"1px solid rgba(96,165,250,.2)",fontSize:12,color:T.blue,
  textAlign:"center",lineHeight:1.6}}>
  💙 <strong>Palpitômetro é 100% gratuito e sem fins lucrativos.</strong> 
  Nenhuma taxa, nenhuma cobrança. Apenas diversão! 
  Anúncios ajudam a manter o servidor rodando.
</div>
```
 
---
 
## **MUDANÇA 7: Adicionar Google AdSense em public/index.html**
 
No `<head>` do arquivo `public/index.html`:
 
```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Palpitômetro - Aposte na Copa 2026 100% Grátis" />
    <title>Palpitômetro - Copa 2026</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@500;700&display=swap" rel="stylesheet">
    
    <!-- ⭐ NOVO: Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-SEU_PUBLISHER_ID"
       crossorigin="anonymous"></script>
  </head>
  <body style="margin:0;background:#070a14;">
    <div id="root"></div>
    <script src="index.js" type="module"></script>
  </body>
</html>
```
 
---
 
## **MUDANÇA 8: Header - Renomear**
 
### ANTES:
```jsx
<div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,...}}>
  {poolConfig?.name||"BOLÃO DA COPA"}
</div>
```
 
### DEPOIS:
```jsx
<div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,...}}>
  {appConfig?.name||"PALPITÔMETRO"}
</div>
```
 
---
 
## **MUDANÇA 9: LoginModal - Renomear texto**
 
### ANTES:
```jsx
<h2 style={{...}}>CRIAR BOLÃO</h2>
<p>Bolão da Copa do Mundo 2026 - Firebase + Vercel</p>
<LabelInput label="Nome do Bolão" value={poolName} .../>
<LabelInput label="Taxa de entrada (R$)" ... /> // ← REMOVER
<LabelInput label="Seu nome (você será o admin 👑)" ... />
<button>🚀 Criar Bolão</button>
```
 
### DEPOIS:
```jsx
<h2 style={{...}}>CRIAR CAMPEONATO</h2>
<p>Palpitômetro Copa 2026 - 100% Gratuito</p>
<LabelInput label="Nome do Campeonato" value={appName} onChange={setAppName}/>
<LabelInput label="Seu nome (você será o administrador)" value={adminName}.../>
<button>🚀 Criar Campeonato</button>
```
 
---
 
## **MUDANÇA 10: Remover estado/funções de PIX**
 
### REMOVER DO STATE DO APP:
```javascript
const [pixConfig,setPixConfig]=useState({keyType:"cpf",key:"",holderName:"",city:""});
 
// E destas funções:
const updatePixConfig=(cfg)=>{setPixConfig(cfg);sv("bc-pix",cfg);};
 
// E do load/save:
if(pix) setPixConfig(JSON.parse(pix.value));
await sv("bc-pix",cfg);
```
 
---
 
## **MUDANÇA 11: PIX_TYPES → REMOVER**
 
### ANTES:
```javascript
const PIX_TYPES=[
  {value:"cpf",label:"CPF",...},
  {value:"cnpj",label:"CNPJ",...},
  ...
];
```
 
### DEPOIS: DELETAR TUDO
 
Qualquer referência para `PIX_TYPES.find()` também remove.
 
---
 
## **RESUMO DE ARQUIVOS A EDITAR**
 
| Arquivo | Linhas Removidas | Linhas Adicionadas | Ação |
|---------|------------------|-------------------|------|
| `src/App.jsx` | ~60 (PIX) | ~15 (AdSense) | Substituir |
| `public/index.html` | 0 | ~4 (script AdSense) | Adicionar |
| Arquivo novo | N/A | ~40 | Criar `src/AdSlot.jsx` |
| Arquivo novo | N/A | ~50 | Criar `pages/privacy.jsx` |
 
---
 
## **TESTAR LOCALMENTE**
 
```bash
# Antes de fazer commit:
npm start
 
# Verificar:
✅ Sem referência a PIX
✅ Nome é "Palpitômetro"
✅ Aviso de gratuidade aparece
✅ Google Sign-In funciona
✅ Sem erros no console
```
 
---
 
## **CHECKLIST DE MUDANÇAS**
 
- [ ] Renomear "Bolão" → "Palpitômetro" (buscar e substituir)
- [ ] Remover bloco PIX da HomeView
- [ ] Remover taxa do stats
- [ ] Remover aba PIX da ConfigView
- [ ] Remover PIX de LoginModal
- [ ] Adicionar disclaimer de gratuidade
- [ ] Adicionar script AdSense em index.html
- [ ] Adicionar slots de AdSense na HomeView
- [ ] Criar arquivo AdSlot.jsx
- [ ] Criar página de Política de Privacidade
- [ ] Remover PIX_TYPES
- [ ] Remover estado pixConfig
- [ ] Testar localmente (npm start)
- [ ] Fazer commit e push
- [ ] Vercel auto-deploy
---
 
## **ESTRUTURA FINAL DO ARQUIVO .jsx**
 
```
palpitometro-v1.jsx (1120 linhas)
├── 1-100: Imports + FLAGS
├── 101-500: GROUPS + ALL_MATCHES
├── 501-600: Helpers (sem PIX)
├── 601-650: Tokens + Card styles
├── 651-750: Componentes base (ScoreBox, MatchCard, etc)
├── 751-850: LoginModal (sem PIX)
├── 851-950: HomeView (com AdSense, sem PIX)
├── 951-1050: PredictionsView (cópia do anterior)
├── 1051-1100: Outras views (cópia do anterior)
└── 1101-1120: App component (sem PIX state)
```
 
---
 
## **PRÓXIMO: Deploy com AdSense**
 
Após as mudanças acima:
 
1. `git push origin main`
2. Vercel faz deploy automático
3. Você vai para Google AdSense e verifica seu site
4. Google aprova em ~1-3 dias
5. Primeiros ganhos começam! 💰
