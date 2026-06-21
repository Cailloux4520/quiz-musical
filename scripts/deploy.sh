#!/bin/bash

# Script de déploiement automatique
# À exécuter après l'installation de base (install-ubuntu.sh)

set -e

echo "🚀 Déploiement de Quiz Musical"
echo "=============================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    error "Ce script doit être exécuté depuis la racine du projet quiz-musical"
    exit 1
fi

# 1. Vérifier les fichiers .env
info "Vérification des fichiers .env..."
if [ ! -f "backend/.env" ]; then
    error "Fichier backend/.env manquant. Copiez backend/.env.example et configurez-le."
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    error "Fichier frontend/.env manquant. Copiez frontend/.env.example et configurez-le."
    exit 1
fi

# 2. Démarrer Docker
info "Démarrage des services Docker..."
docker-compose up -d

info "Attente du démarrage de PostgreSQL (10 secondes)..."
sleep 10

# 3. Backend - Installation et build
info "Installation des dépendances backend..."
cd backend
npm install

info "Génération du client Prisma..."
npm run prisma:generate

info "Exécution des migrations..."
npm run prisma:migrate

read -p "Voulez-vous initialiser la base avec des données de test ? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "Initialisation de la base de données..."
    npm run prisma:seed
fi

info "Build du backend..."
npm run build

# 4. Frontend - Installation et build
info "Installation des dépendances frontend..."
cd ../frontend
npm install

info "Build du frontend..."
npm run build

# 5. Configuration PM2
info "Configuration PM2..."
cd ../backend
pm2 delete quiz-backend 2>/dev/null || true
pm2 start dist/server.js --name quiz-backend
pm2 save

# 6. Vérification
info "Vérification du déploiement..."
echo ""
pm2 status
echo ""

info "Services Docker :"
docker-compose ps
echo ""

# 7. Instructions finales
echo "============================================"
info "Déploiement terminé !"
echo "============================================"
echo ""
warn "Prochaines étapes :"
echo "  1. Configurez Nginx (voir docs/DEPLOYMENT_UBUNTU.md)"
echo "  2. Installez le certificat SSL avec Certbot"
echo "  3. Testez votre application"
echo ""
info "Commandes utiles :"
echo "  - Logs backend : pm2 logs quiz-backend"
echo "  - Status PM2 : pm2 status"
echo "  - Logs Docker : docker-compose logs -f"
echo ""
