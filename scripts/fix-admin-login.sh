#!/bin/bash

# Script de réinitialisation automatique du mot de passe admin
# Usage: ./fix-admin-login.sh

set -e

echo "🔧 Réparation de la connexion admin - Quiz Musical"
echo "=================================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "/home/quizapp/quiz-musical" ]; then
    echo "❌ Erreur: Ce script doit être exécuté sur le VPS"
    exit 1
fi

cd /home/quizapp/quiz-musical

# 1. Récupérer les dernières modifications
echo "📥 1/5 - Récupération des dernières modifications..."
git pull origin main

# 2. Installer les dépendances si nécessaire
echo "📦 2/5 - Vérification des dépendances..."
cd backend
npm install --silent

# 3. Réinitialiser le mot de passe admin
echo "🔑 3/5 - Réinitialisation du mot de passe admin..."
npm run reset-admin

# 4. Redémarrer le backend
echo "🔄 4/5 - Redémarrage du backend..."
pm2 restart quiz-backend

# Attendre que le service démarre
sleep 3

# 5. Tester la connexion
echo "🧪 5/5 - Test de connexion..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quiz.com","password":"admin123"}')

if echo "$RESPONSE" | grep -q "token"; then
    echo ""
    echo "✅ SUCCESS! La connexion admin fonctionne!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📧 Email:        admin@quiz.com"
    echo "🔒 Mot de passe: admin123"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Connectez-vous sur: https://recalbox.live/login"
    echo ""
    echo "⚠️  IMPORTANT: Changez ce mot de passe après connexion!"
    echo ""
else
    echo ""
    echo "⚠️  Le mot de passe a été réinitialisé, mais le test de connexion a échoué."
    echo "Vérifiez les logs avec: pm2 logs quiz-backend"
    echo ""
    echo "Vous pouvez quand même essayer de vous connecter avec:"
    echo "📧 Email:        admin@quiz.com"
    echo "🔒 Mot de passe: admin123"
    echo ""
fi

# Afficher l'état du backend
echo "📊 État des services:"
pm2 status
