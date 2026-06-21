#!/bin/bash

# Script de mise à jour de l'application
# À exécuter après un git pull

set -e

echo "🔄 Mise à jour de Quiz Musical"
echo "=============================="
echo ""

GREEN='\033[0;32m'
NC='\033[0m'

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# 1. Pull des dernières modifications
info "Récupération des dernières modifications..."
git pull origin main

# 2. Backend
info "Mise à jour du backend..."
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build

# 3. Redémarrer PM2
info "Redémarrage du backend..."
pm2 restart quiz-backend

# 4. Frontend
info "Mise à jour du frontend..."
cd ../frontend
npm install
npm run build

# 5. Redémarrer Nginx
info "Rechargement de Nginx..."
sudo systemctl reload nginx

# 6. Vérification
echo ""
info "Mise à jour terminée !"
pm2 status
echo ""
info "Vérifiez les logs : pm2 logs quiz-backend"
