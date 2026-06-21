#!/bin/bash

# Script de déploiement Phase 9 - Exports PDF/Excel/CSV
# À exécuter sur le VPS Ubuntu

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement Phase 9 - Exports PDF/Excel/CSV"
echo "================================================"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "/home/quizapp/quiz-musical" ]; then
    echo "❌ Erreur: Répertoire /home/quizapp/quiz-musical introuvable"
    echo "Veuillez exécuter ce script sur le VPS"
    exit 1
fi

# 1. Récupérer les dernières modifications
echo "📥 1/6 - Récupération des modifications depuis GitHub..."
cd /home/quizapp/quiz-musical
git pull origin main

# 2. Installer puppeteer
echo "📦 2/6 - Installation de puppeteer (cela peut prendre 5-10 minutes)..."
cd backend
npm install puppeteer

# 3. Installer les dépendances système pour Chromium
echo "🔧 3/6 - Installation des dépendances système pour Chromium..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    wget \
    xdg-utils > /dev/null 2>&1

# 4. Recompiler le backend
echo "🔨 4/6 - Recompilation du backend..."
npm run build

# 5. Recompiler le frontend
echo "🎨 5/6 - Recompilation du frontend..."
cd ../frontend
npm run build

# 6. Redémarrer les services
echo "🔄 6/6 - Redémarrage des services..."
pm2 restart quiz-backend

# Attendre que le backend démarre
sleep 3

# Vérifier l'état
echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 État des services:"
pm2 status

echo ""
echo "📝 Logs du backend:"
pm2 logs quiz-backend --lines 10 --nostream

echo ""
echo "🎉 Phase 9 déployée avec succès !"
echo ""
echo "Testez les exports sur: https://recalbox.live"
echo "- 📄 Export PDF (rapport complet)"
echo "- 📊 Export Excel (multi-feuilles)"
echo "- 📋 Export CSV (classement simple)"
echo ""
