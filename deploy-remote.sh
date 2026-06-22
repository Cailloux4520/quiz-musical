#!/bin/bash
cd /home/quizapp/quiz-musical
echo "📥 Git pull..."
git pull origin main
echo "🔄 Mise à jour base de données..."
cd backend
npx prisma db push
echo "♻️  Redémarrage backend..."
pm2 restart quiz-backend
echo "📦 Installation dépendances frontend..."
cd ../frontend
npm install
echo "🏗️  Build frontend..."
npm run build
echo "✅ DEPLOIEMENT TERMINE!"
