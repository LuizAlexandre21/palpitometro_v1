# 🚀 PALPITÔMETRO - Guia Completo com Google AdSense
 
**Versão**: Sem PIX, 100% Gratuito, Monetizado apenas com AdSense
 
---
 
## **MUDANÇAS PRINCIPAIS**
 
✅ Nome: **Palpitômetro** (ao invés de "Bolão da Copa")  
✅ Removido: Seção inteira de Pix  
✅ Removido: Configuração de taxa de entrada  
✅ Removido: QR codes de pagamento  
✅ Adicionado: **Google AdSense** (3 pontos estratégicos)  
✅ Adicionado: Aviso de gratuidade  
✅ Seguro legalmente: Nenhuma cobrança em nenhum lugar  
 
---
 
## **PASSO 1: Ativar Google AdSense**
 
### 1.1 Criar conta AdSense
1. Acesse **[google.com/adsense](https://google.com/adsense)**
2. Clique **"Começar agora"**
3. Faça login com sua conta Google
4. Preencha seus dados:
   - País
   - Fuso horário
   - Tipo de site (blog, etc)
### 1.2 Verificação de site
1. Google pedirá para você verificar o domínio
2. Adicione o código Google no `<head>` do seu HTML
3. Aguarde **Google verificar** (pode levar dias)
**IMPORTANTE**: Você recebe um **Publisher ID** assim: `ca-pub-0000000000000000`
 
---
 
## **PASSO 2: Criar Ad Slots**
 
### 2.1 Criar slots no AdSense Console
1. Vá em **Anúncios → Por código → Novo ad unit**
2. Crie 2-3 slots:
**Slot 1 - Home (Banner horizontal)**
- Tipo: Display
- Nome: `home_banner_top`
- Tamanho: 728x90 (leaderboard) ou responsivo
- Copie o `data-ad-slot="123456789"`
**Slot 2 - Sidebar**
- Tipo: Display
- Nome: `sidebar_ads`
- Tamanho: 300x250 (medium rectangle) ou 160x600 (wide skyscraper)
**Slot 3 - Footer**
- Tipo: Display
- Nome: `footer_ads`
- Tamanho: 728x90 ou 970x90 (billboard)
---
 
## **PASSO 3: Integrar no Código React**
 
### 3.1 Instalar script AdSense
No `public/index.html`, adicione no `<head>`:
 
```html
<head>
  ...
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-SEU_PUBLISHER_ID"
     crossorigin="anonymous"></script>
  ...
</head>
```
 
Substitua `SEU_PUBLISHER_ID` pelo seu ID do AdSense.
 
### 3.2 Componente de Anúncio
 
Crie um arquivo `src/AdSlot.jsx`:
 
```jsx
import { useEffect } from 'react';
 
export default function AdSlot({ slotId, width, height, responsive = true }) {
  useEffect(() => {
    if (window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        console.log('AdSense error:', e);
      }
    }
  }, [slotId]);
 
  const style = responsive 
    ? { display: 'block' }
    : { display: 'inline-block', width, height };
 
  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-SEU_PUBLISHER_ID"
      data-ad-slot={slotId}
      data-ad-format={responsive ? 'auto' : 'rectangle'}
      data-full-width-responsive="true"
    />
  );
}
```
 
### 3.3 Usar em HomeView
 
```jsx
import AdSlot from './AdSlot';
 
function HomeView(...) {
  return (
    <div>
      {/* Conteúdo existente */}
      
      {/* Anúncio 1 - Depois do resumo */}
      <div style={{margin:"28px auto",maxWidth:730,textAlign:"center"}}>
        <AdSlot slotId="HOME_BANNER_1" responsive={true} />
      </div>
      
      {/* Conteúdo mais */}
      <div>...</div>
      
      {/* Anúncio 2 - No meio do participantes */}
      <div style={{margin:"28px auto",maxWidth:300}}>
        <AdSlot slotId="SIDEBAR_ADS" responsive={false} width="300px" height="250px" />
      </div>
      
      {/* Mais conteúdo */}
      <div>...</div>
    </div>
  );
}
```
