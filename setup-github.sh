#!/bin/bash

# 🚀 SCRIPT AUTOMÁTICO: Palpitômetro → GitHub
# Use: bash setup-github.sh

echo "=========================================="
echo "🎯 Setup Palpitômetro + GitHub"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está no diretório certo
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Execute este script na raiz do seu projeto React${NC}"
    echo "Exemplo: cd ~/palpitometro && bash setup-github.sh"
    exit 1
fi

echo -e "${BLUE}1️⃣  Criando .gitignore${NC}"
cat > .gitignore << 'IGNORE'
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Production
build/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Firebase
.firebase/
.firebaserc
database-debug.log
IGNORE
echo -e "${GREEN}✅  .gitignore criado${NC}"

echo ""
echo -e "${BLUE}2️⃣  Criando vercel.json${NC}"
cat > vercel.json << 'VERCEL'
{
  "buildCommand": "CI=false npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_FIREBASE_API_KEY": "@firebase_api_key",
    "REACT_APP_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "REACT_APP_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "REACT_APP_FIREBASE_STORAGE_BUCKET": "@firebase_storage_bucket",
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID": "@firebase_messaging_sender_id",
    "REACT_APP_FIREBASE_APP_ID": "@firebase_app_id",
    "REACT_APP_ADSENSE_PUBLISHER_ID": "@adsense_publisher_id"
  }
}
VERCEL
echo -e "${GREEN}✅  vercel.json criado${NC}"

echo ""
echo -e "${BLUE}3️⃣  Criando .env.local (NÃO será commitado)${NC}"
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'ENV'
# Firebase
REACT_APP_FIREBASE_API_KEY=SEU_API_KEY_AQUI
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=SEU_NUMERO
REACT_APP_FIREBASE_APP_ID=SEU_APP_ID

# Google AdSense
REACT_APP_ADSENSE_PUBLISHER_ID=ca-pub-SEU_ID
ENV
    echo -e "${GREEN}✅  .env.local criado (PREENCHA COM SEUS VALORES!)${NC}"
else
    echo -e "${YELLOW}⏭️   .env.local já existe, pulando...${NC}"
fi

echo ""
echo -e "${BLUE}4️⃣  Criando README.md${NC}"
cat > README.md << 'README'
# 🎯 Palpitômetro - Copa 2026

**Aposte na Copa do Mundo 2026 de forma 100% gratuita!**

## 🎮 Características

- ✅ 12 grupos com 48 seleções
- ✅ 72 jogos para fazer palpites
- ✅ Sistema de ranking em tempo real
- ✅ Login com Google
- ✅ 100% gratuito (sem taxas)
- ✅ Monetizado com Google AdSense

## 🚀 Deploy

Hospedado em Vercel: https://palpitometro.vercel.app

## 📖 Como Usar

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USER/palpitometro.git
cd palpitometro

# 2. Instale dependências
npm install

# 3. Configure .env.local
# Copie .env.local.example e preencha com seus dados Firebase

# 4. Inicie o servidor
npm start

# 5. Abra http://localhost:3000
```

## 📚 Documentação

- [SUMARIO_PALPITOMETRO.md](./SUMARIO_PALPITOMETRO.md) - Visão geral e timeline
- [MUDANCAS_BOLAO_PARA_PALPITOMETRO.md](./MUDANCAS_BOLAO_PARA_PALPITOMETRO.md) - Mudanças exatas
- [GUIA_GOOGLE_ADSENSE.md](./GUIA_GOOGLE_ADSENSE.md) - Como ganhar dinheiro

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Backend**: Firebase Realtime Database
- **Hosting**: Vercel
- **Monetização**: Google AdSense
- **Autenticação**: Google Sign-In

## ⚖️ Disclaimer

Este é um projeto **100% não-comercial**. Nenhuma taxa é cobrada dos usuários. Anúncios Google AdSense ajudam a manter o servidor rodando.

## 📄 Licença

MIT - Livre para usar, modificar e distribuir

---

**Made with ⚽ and ☕**
README
echo -e "${GREEN}✅  README.md criado${NC}"

echo ""
echo -e "${BLUE}5️⃣  Inicializando Git${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅  Git inicializado${NC}"
else
    echo -e "${YELLOW}⏭️   Git já inicializado${NC}"
fi

echo ""
echo -e "${BLUE}6️⃣  Adicionando arquivos${NC}"
git add .
echo -e "${GREEN}✅  Arquivos adicionados${NC}"

echo ""
echo -e "${BLUE}7️⃣  Fazendo commit${NC}"
git commit -m "Initial commit: Palpitômetro com Google AdSense - 100% Gratuito"
echo -e "${GREEN}✅  Commit feito${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅  Setup Completo!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1️⃣  Criar repositório em https://github.com/new"
echo "   - Nome: palpitometro"
echo "   - Descrição: Palpitômetro - Copa 2026 100% Gratuito"
echo "   - NÃO inicialize com README"
echo ""
echo "2️⃣  Adicionar remoto e fazer push:"
echo ""
echo "   git remote add origin https://github.com/SEU_USER/palpitometro.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3️⃣  Preencher .env.local com credenciais Firebase e AdSense"
echo ""
echo "4️⃣  Conectar Vercel para deploy automático"
echo ""
echo "=========================================="
