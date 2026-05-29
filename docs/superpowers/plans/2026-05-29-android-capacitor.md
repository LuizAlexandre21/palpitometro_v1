# Android Capacitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Empacotar o app React Palpitômetro como app Android nativo usando Capacitor.

**Architecture:** O app React existente é compilado com `npm run build` e copiado para dentro do projeto Android via `npx cap sync`. O Firebase SDK roda dentro da WebView sem alteração de código React. Android é apenas o container — o código React continua sendo o source of truth.

**Tech Stack:** React (existente), Capacitor 6, Android Studio, Firebase (existente), `@capacitor/assets` para ícones/splash.

---

### Task 1: Instalar dependências do Capacitor

**Files:**
- Modify: `package.json` (dependências adicionadas pelo npm)

- [ ] **Step 1: Instalar pacotes Capacitor**

```bash
cd /home/alexandre/palpitometro_v1
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install --save-dev @capacitor/assets
```

- [ ] **Step 2: Verificar instalação**

```bash
npx cap --version
```

Esperado: versão do Capacitor CLI impressa (ex: `6.x.x`)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: instalar @capacitor/core, cli, android e assets"
```

---

### Task 2: Criar arquivo de configuração do Capacitor

**Files:**
- Create: `capacitor.config.ts`

- [ ] **Step 1: Criar o arquivo de configuração**

Criar o arquivo `capacitor.config.ts` na raiz do projeto com o seguinte conteúdo:

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.palpitometro.app',
  appName: 'Palpitômetro',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;
```

- [ ] **Step 2: Verificar que o arquivo existe e está correto**

```bash
cat capacitor.config.ts
```

Esperado: conteúdo igual ao definido acima, sem erros de sintaxe.

- [ ] **Step 3: Commit**

```bash
git add capacitor.config.ts
git commit -m "chore: adicionar capacitor.config.ts com appId com.palpitometro.app"
```

---

### Task 3: Compilar o React e inicializar o projeto Android

**Files:**
- Create: `android/` (gerado pelo Capacitor — não editar manualmente)
- Read: `build/` (gerado por npm run build)

- [ ] **Step 1: Compilar o app React**

```bash
npm run build
```

Esperado: pasta `build/` criada/atualizada sem erros. Pode levar 30-60s.

- [ ] **Step 2: Inicializar o projeto Android**

```bash
npx cap add android
```

Esperado: pasta `android/` criada com estrutura de projeto Gradle. Mensagem final deve incluir "✔ Adding native android project in android in 0ms" ou similar.

- [ ] **Step 3: Sincronizar o build com o Android**

```bash
npx cap sync android
```

Esperado: arquivos de `build/` copiados para `android/app/src/main/assets/public/`. Sem erros.

- [ ] **Step 4: Verificar estrutura gerada**

```bash
ls android/app/src/main/assets/public/ | head -5
```

Esperado: arquivos do React (index.html, static/, etc.) presentes.

- [ ] **Step 5: Adicionar android/ ao .gitignore parcialmente**

A pasta `android/` deve ser commitada (ao contrário de `node_modules`). Apenas arquivos de build intermediários do Gradle devem ser ignorados. Verificar se `.gitignore` já tem entradas para Android:

```bash
grep -i android .gitignore || echo "sem entradas android no gitignore"
```

Se não houver, adicionar ao `.gitignore`:

```
# Android build artifacts (gerados pelo Gradle, não commitados)
android/.gradle/
android/build/
android/app/build/
android/local.properties
```

- [ ] **Step 6: Commit**

```bash
git add android/ capacitor.config.ts .gitignore
git commit -m "feat: inicializar projeto Android com Capacitor"
```

---

### Task 4: Preparar assets (ícone e splash screen)

**Files:**
- Create: `assets/icon.png` — 1024×1024px
- Create: `assets/splash.png` — 2732×2732px

- [ ] **Step 1: Criar a pasta assets**

```bash
mkdir -p assets
```

- [ ] **Step 2: Criar o ícone do app**

O ícone deve ser um PNG de **1024×1024px** com:
- Fundo verde escuro `#030f0a`
- Texto ou logo "P" ou troféu centralizado em branco/dourado

**Opção rápida:** Use qualquer editor de imagem (GIMP, Figma, Canva) ou gere programaticamente. O arquivo deve se chamar `assets/icon.png`.

Para testar com um placeholder temporário:
```bash
# Verificar se existe
ls assets/icon.png
```

- [ ] **Step 3: Criar o splash screen**

O splash deve ser um PNG de **2732×2732px** com:
- Fundo verde escuro `#030f0a`
- Logo "PALPITÔMETRO" centralizado em branco

O arquivo deve se chamar `assets/splash.png`.

- [ ] **Step 4: Gerar todos os tamanhos para Android**

```bash
npx capacitor-assets generate --android
```

Esperado: ícones em múltiplas resoluções gerados em `android/app/src/main/res/`.

- [ ] **Step 5: Verificar ícones gerados**

```bash
ls android/app/src/main/res/ | grep mipmap
```

Esperado: pastas `mipmap-hdpi`, `mipmap-mdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`.

- [ ] **Step 6: Commit**

```bash
git add assets/ android/app/src/main/res/
git commit -m "feat: adicionar ícone e splash screen gerados com capacitor-assets"
```

---

### Task 5: Configurar Google Sign-In para Android no Firebase Console

> Esta task envolve ações manuais no Firebase Console e no terminal.

**Files:**
- Modify: `android/app/google-services.json` (baixado do Firebase Console)

- [ ] **Step 1: Gerar SHA-1 do keystore de debug**

```bash
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android 2>/dev/null | grep SHA1
```

Esperado: linha como `SHA1: AB:CD:EF:...`. Copiar esse valor.

- [ ] **Step 2: Adicionar app Android no Firebase Console**

1. Abrir [Firebase Console](https://console.firebase.google.com/) → seu projeto
2. Ir em **Project Settings** (engrenagem) → aba **Your apps**
3. Clicar em **Add app** → ícone Android
4. Package name: `com.palpitometro.app`
5. App nickname: `Palpitômetro Android`
6. SHA-1: colar o valor do Step 1
7. Clicar **Register app**
8. Baixar o arquivo `google-services.json`

- [ ] **Step 3: Mover google-services.json para a pasta correta**

```bash
mv ~/Downloads/google-services.json android/app/google-services.json
```

- [ ] **Step 4: Verificar que o arquivo está no lugar certo**

```bash
cat android/app/google-services.json | grep package_name
```

Esperado: `"package_name": "com.palpitometro.app"`

- [ ] **Step 5: Commit**

```bash
git add android/app/google-services.json
git commit -m "feat: adicionar google-services.json para auth Android"
```

---

### Task 6: Build de debug e teste no emulador/dispositivo

> Requer Android Studio instalado. [Download](https://developer.android.com/studio)

**Files:**
- Nenhum arquivo novo — apenas comandos de build

- [ ] **Step 1: Compilar React novamente (garantir build atualizado)**

```bash
npm run build
npx cap sync android
```

- [ ] **Step 2: Abrir projeto no Android Studio**

```bash
npx cap open android
```

Isso abre o Android Studio com a pasta `android/` como projeto.

- [ ] **Step 3: Aguardar Gradle sync no Android Studio**

Quando o Android Studio abrir, ele vai sincronizar o projeto Gradle automaticamente (pode levar 2-5 minutos na primeira vez). Aguardar o progresso na barra inferior sumir.

- [ ] **Step 4: Rodar no emulador ou dispositivo**

No Android Studio:
- Se emulador: **Device Manager** → criar emulador API 30+ → Run (▶)
- Se dispositivo físico: conectar via USB com **Developer Options** + **USB Debugging** ativados → Run (▶)

Esperado: app abre no dispositivo exibindo a tela inicial do Palpitômetro.

- [ ] **Step 5: Verificar fluxo de login**

No app aberto:
1. Tocar em "Entrar com Google"
2. Selecionar conta Google
3. Verificar que o login funciona e a tela principal carrega

Se der erro de autenticação, verificar se o SHA-1 foi adicionado corretamente no Firebase Console (Task 5).

---

### Task 7: Gerar APK de debug para distribuição

**Files:**
- Nenhum arquivo novo — output gerado pelo Gradle em `android/app/build/outputs/`

- [ ] **Step 1: Gerar APK via Android Studio**

No Android Studio:
- Menu **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

Esperado: mensagem "Build successful" com link para localizar o APK.

- [ ] **Step 2: Localizar o APK**

```bash
find android/app/build/outputs/apk -name "*.apk"
```

Esperado: caminho como `android/app/build/outputs/apk/debug/app-debug.apk`

- [ ] **Step 3: Instalar o APK num dispositivo para teste**

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Ou compartilhar o arquivo `.apk` diretamente para instalar manualmente.

---

### Task 8: (Opcional) Preparar para Play Store

> Esta task só é necessária para publicar na Play Store. Requer conta Google Play Developer ($25 taxa única).

**Files:**
- Nenhum arquivo de código — processo no Android Studio + Play Console

- [ ] **Step 1: Criar keystore de produção (guardar com segurança!)**

```bash
keytool -genkey -v \
  -keystore ~/palpitometro-release.jks \
  -alias palpitometro \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Preencher os campos solicitados (nome, organização, país). **ATENÇÃO: guardar o arquivo `.jks` e a senha com segurança — perder o keystore impossibilita atualizar o app na Play Store.**

- [ ] **Step 2: Gerar AAB assinado no Android Studio**

No Android Studio:
- Menu **Build** → **Generate Signed Bundle / APK**
- Selecionar **Android App Bundle**
- Informar o keystore criado no Step 1
- Build variant: **release**
- Clicar **Finish**

- [ ] **Step 3: Fazer upload no Google Play Console**

1. Acessar [Google Play Console](https://play.google.com/console)
2. Criar novo app → preencher detalhes
3. Ir em **Testing** → **Internal testing** → criar release
4. Upload do `.aab` gerado
5. Adicionar screenshots (mínimo 2)
6. Publicar para teste interno

---

## Fluxo de Atualização (após mudanças no React)

Sempre que fizer mudanças no código React e quiser atualizar o app Android:

```bash
npm run build
npx cap sync android
# No Android Studio: Run (▶) para testar ou Build APK para distribuir
```
