#!/bin/bash

# Script de redéploiement complet du backend
# Usage: ./redeploy-backend.sh

set -e

echo "🚀 REDÉPLOIEMENT COMPLET DU BACKEND"
echo "===================================="
echo ""

cd /home/quizapp/quiz-musical

echo "📥 1. Mise à jour du code depuis GitHub..."
git reset --hard HEAD
git pull origin main

echo ""
echo "🐳 2. Vérification de Docker..."
docker ps | grep quiz-musical-db || {
    echo "🔧 Démarrage de Docker Compose..."
    docker-compose up -d
    sleep 10
}

echo ""
echo "📦 3. Installation des dépendances backend..."
cd backend
rm -rf node_modules package-lock.json
npm install

echo ""
echo "🔧 4. Génération du client Prisma..."
npx prisma generate

echo ""
echo "📊 5. Application des migrations..."
npx prisma migrate deploy || {
    echo "⚠️  Migrations échouées, tentative de reset..."
    npx prisma migrate reset --force --skip-seed
    npx prisma migrate deploy
}

echo ""
echo "🌱 6. Seed de la base de données..."
npm run seed

echo ""
echo "🏗️  7. Compilation TypeScript..."
npm run build

echo ""
echo "🔄 8. Configuration PM2..."
pm2 delete quiz-backend 2>/dev/null || true
pm2 start dist/server.js --name quiz-backend --time

echo ""
echo "⏳ 9. Attente du démarrage (10 secondes)..."
sleep 10

echo ""
echo "🧪 10. TEST DE CONNEXION"
echo "========================"
echo ""

# Test de l'API
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quiz.com","password":"admin123"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q "token"; then
    echo "✅ ✅ ✅ SUCCESS ! ✅ ✅ ✅"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 LE BACKEND FONCTIONNE PARFAITEMENT !"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📧 Email:        admin@quiz.com"
    echo "🔒 Mot de passe: admin123"
    echo ""
    echo "🌐 Accédez à: https://recalbox.live"
    echo ""
else
    echo "❌ ÉCHEC DU TEST (Code HTTP: $HTTP_CODE)"
    echo ""
    echo "Réponse:"
    echo "$BODY"
    echo ""
    echo "📋 Logs du backend:"
    pm2 logs quiz-backend --lines 30 --nostream
    echo ""
    echo "💡 Vérifiez manuellement avec: pm2 logs quiz-backend"
fi

echo ""
echo "📊 État final:"
echo "=============="
pm2 status
echo ""
docker ps | grep quiz-musical

echo ""
echo "✅ Redéploiement terminé !"
echo ""
echo "Commandes utiles:"
echo "  pm2 logs quiz-backend     # Voir les logs"
echo "  pm2 restart quiz-backend  # Redémarrer"
echo "  pm2 status                # État des services"
