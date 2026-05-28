# Palpitômetro Android — Capacitor Design

**Data:** 2026-05-28
**Status:** Aprovado pelo usuário

---

## 1. Visão Geral

Empacotar o app React existente como app Android nativo usando Capacitor (Ionic). O Firebase SDK roda dentro da WebView sem alteração de código. O projeto React continua sendo o source of truth; Android é apenas o container.

---

## 2. Arquitetura

```
palpitometro_v1/
├── android/               ← gerado pelo Capacitor (não editar manualmente)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/        ← ícones, splash screen
│   │   └── build.gradle
│   └── build.gradle
├── src/                   ← código React (sem mudança)
├── build/                 ← output de npm run build (copiado pelo cap sync)
├── capacitor.config.ts    ← configuração do Capacitor
└── package.json
```

**Fluxo de build:**
```
npm run build          → gera build/ com o app React compilado
npx cap sync android   → copia build/ para android/app/src/main/assets/public/
Android Studio         → abre android/, gera APK (debug) ou AAB (produção)
```

O APK inclui o app completo embutido — sem dependência de servidor externo. Firebase funciona normalmente via HTTPS dentro da WebView.

---

## 3. Configuração do App Android

| Parâmetro | Valor |
|-----------|-------|
| App ID (package name) | `com.palpitometro.app` |
| App name | `Palpitômetro` |
| Android mínimo | API 22 (Android 5.1) |
| Orientação | Portrait + Landscape |
| Permissão | `android.permission.INTERNET` |

---

## 4. Dependências a Instalar

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### capacitor.config.ts
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

---

## 5. Google Sign-In no Android

O `signInWithPopup` do Firebase funciona em WebView, mas requer configuração adicional no Firebase Console:

1. No **Firebase Console → Project Settings → Your apps**, adicionar app Android com package name `com.palpitometro.app`
2. Gerar o **SHA-1 fingerprint** do keystore de debug:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
3. Adicionar o SHA-1 no Firebase Console → salvar `google-services.json` na pasta `android/app/`
4. Para produção: repetir com o SHA-1 do keystore de produção

---

## 6. Ícone e Splash Screen

Usar `@capacitor/assets` para gerar automaticamente os ícones em todas as resoluções:

```bash
npm install @capacitor/assets --save-dev
```

Fornecer:
- `assets/icon.png` — 1024×1024px (fundo verde `#030f0a`, troféu 🏆 centralizado)
- `assets/splash.png` — 2732×2732px (fundo verde, logo PALPITÔMETRO centralizado)

Gerar:
```bash
npx capacitor-assets generate --android
```

---

## 7. Passos de Build

### Debug (teste local)
```bash
npm run build
npx cap sync android
# Abrir Android Studio → android/ → Run no dispositivo/emulador
```

### Produção (Play Store)
```bash
npm run build
npx cap sync android
# Android Studio → Build → Generate Signed Bundle/APK
# → Android App Bundle (.aab) → keystore de produção
```

---

## 8. Publicação na Play Store

Pré-requisitos:
- Conta Google Play Developer ($25 taxa única)
- App assinado com keystore de produção (guardar o `.jks` com segurança — perder é fatal)
- Screenshots do app (mínimo 2, recomendado 4-8)
- Ícone 512×512px
- Descrição curta (80 chars) e longa (4000 chars)

Upload: Google Play Console → Create app → Internal testing → Production.

---

## 9. Fora do Escopo

- Notificações push (pode ser adicionado depois via `@capacitor/push-notifications` + Firebase Cloud Messaging)
- Modo offline completo (Firebase Realtime Database já tem cache limitado por padrão)
- iOS (requer Mac com Xcode)
- React Native rewrite
