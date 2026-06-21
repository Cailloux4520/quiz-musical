#!/bin/bash

#####################################################
# Script de Mise à Jour - Quiz Musical
# Pour VPS Ubuntu 20.04 LTS
#####################################################

set -e

echo "==================================="
echo "🔄 Mise à jour Quiz Musical"
echo "==================================="

# Variables
APP_DIR="/home/quizapp/quiz-musical"
USER="quizapp"

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Erreur: Le répertoire $APP_DIR n'existe pas"
    exit 1
fi

cd "$APP_DIR"

echo ""
echo "📥 1. Pull des derniers changements depuis GitHub..."
sudo -u "$USER" git pull

echo ""
echo "📦 2. Installation des dépendances backend..."
cd backend
sudo -u "$USER" npm install

echo ""
echo "📦 3. Installation des dépendances frontend..."
cd ../frontend
sudo -u "$USER" npm install

echo ""
echo "🏗️  4. Build du frontend..."
sudo -u "$USER" npm run build

echo ""
echo "🔄 5. Redémarrage du backend avec PM2..."
pm2 restart quiz-backend

echo ""
echo "✅ Mise à jour terminée !"
echo ""
echo "Application disponible sur: https://recalbox.live"
echo ""
