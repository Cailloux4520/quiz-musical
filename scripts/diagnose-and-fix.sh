#!/bin/bash

# Script de diagnostic et réparation complète
# Usage: ./diagnose-and-fix.sh

set -e

echo "🔍 DIAGNOSTIC COMPLET - Quiz Musical"
echo "===================================="
echo ""

# Vérifier qu'on est sur le VPS
if [ ! -d "/home/quizapp/quiz-musical" ]; then
    echo "❌ Ce script doit être exécuté sur le VPS"
    exit 1
fi

cd /home/quizapp/quiz-musical

echo "📊 1. Vérification des services Docker..."
echo "-------------------------------------------"
docker ps | grep -E 'quiz-musical|CONTAINER'

if ! docker ps | grep -q "quiz-musical-db"; then
    echo "❌ PostgreSQL n'est pas démarré !"
    echo "🔧 Démarrage de Docker Compose..."
    cd /home/quizapp/quiz-musical
    docker-compose up -d
    sleep 5
else
    echo "✅ PostgreSQL est démarré"
fi

echo ""
echo "📊 2. Vérification de la connexion PostgreSQL..."
echo "------------------------------------------------"
if docker exec quiz-musical-db psql -U quizuser -d quizmusical -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Connexion PostgreSQL OK"
else
    echo "❌ Impossible de se connecter à PostgreSQL"
    echo "🔧 Redémarrage de PostgreSQL..."
    docker-compose restart postgres
    sleep 5
fi

echo ""
echo "📊 3. Vérification du fichier .env..."
echo "--------------------------------------"
cd /home/quizapp/quiz-musical/backend
if [ -f ".env" ]; then
    echo "✅ Fichier .env existe"
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL configuré"
    else
        echo "❌ DATABASE_URL manquant dans .env"
    fi
    if grep -q "JWT_SECRET" .env; then
        echo "✅ JWT_SECRET configuré"
    else
        echo "❌ JWT_SECRET manquant dans .env"
    fi
else
    echo "❌ Fichier .env n'existe pas !"
    exit 1
fi

echo ""
echo "📊 4. État du backend PM2..."
echo "----------------------------"
pm2 status quiz-backend

echo ""
echo "📊 5. Derniers logs du backend..."
echo "----------------------------------"
pm2 logs quiz-backend --lines 20 --nostream

echo ""
echo "🔧 6. RÉPARATION DE LA BASE DE DONNÉES"
echo "======================================="
echo ""

cd /home/quizapp/quiz-musical/backend

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --silent

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Vérifier si les tables existent
echo "🔍 Vérification des tables..."
TABLE_COUNT=$(docker exec quiz-musical-db psql -U quizuser -d quizmusical -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -lt 5 ]; then
    echo "⚠️  Base de données vide ou incomplète (${TABLE_COUNT} tables)"
    echo "🔄 Application des migrations..."
    npx prisma migrate deploy
    
    echo "🌱 Seed de la base de données..."
    npm run seed
else
    echo "✅ Base de données contient ${TABLE_COUNT} tables"
    
    # Vérifier si l'admin existe
    ADMIN_EXISTS=$(docker exec quiz-musical-db psql -U quizuser -d quizmusical -t -c "SELECT COUNT(*) FROM \"User\" WHERE email = 'admin@quiz.com'" 2>/dev/null || echo "0")
    
    if [ "$ADMIN_EXISTS" -eq 0 ]; then
        echo "⚠️  Utilisateur admin n'existe pas"
        echo "🌱 Seed de la base de données..."
        npm run seed
    else
        echo "✅ Utilisateur admin existe déjà"
        echo "🔑 Réinitialisation du mot de passe admin..."
        
        # Réinitialiser le mot de passe avec Node.js
        node -e "
        const { PrismaClient } = require('@prisma/client');
        const bcrypt = require('bcryptjs');
        const prisma = new PrismaClient();
        (async () => {
          try {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.user.update({
              where: { email: 'admin@quiz.com' },
              data: { password: hashedPassword }
            });
            console.log('✅ Mot de passe réinitialisé !');
            await prisma.\$disconnect();
          } catch (e) {
            console.error('❌ Erreur:', e.message);
            process.exit(1);
          }
        })();
        "
    fi
fi

echo ""
echo "🔄 7. Redémarrage du backend..."
echo "-------------------------------"
pm2 restart quiz-backend
sleep 3

echo ""
echo "🧪 8. TEST DE CONNEXION"
echo "======================="
echo ""

RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quiz.com","password":"admin123"}')

if echo "$RESPONSE" | grep -q "token"; then
    echo "✅ ✅ ✅ SUCCESS ! ✅ ✅ ✅"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 LA CONNEXION ADMIN FONCTIONNE !"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📧 Email:        admin@quiz.com"
    echo "🔒 Mot de passe: admin123"
    echo ""
    echo "🌐 Connectez-vous sur: https://recalbox.live/login"
    echo ""
    echo "⚠️  IMPORTANT: Changez ce mot de passe après connexion!"
    echo ""
else
    echo "❌ La connexion a échoué"
    echo ""
    echo "Réponse de l'API:"
    echo "$RESPONSE"
    echo ""
    echo "Vérifiez les logs:"
    echo "pm2 logs quiz-backend"
fi

echo ""
echo "📊 État final des services:"
echo "=============================="
pm2 status
echo ""
docker ps | grep quiz-musical
