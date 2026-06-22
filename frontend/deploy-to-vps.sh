#!/bin/bash
# Script de déploiement frontend vers VPS
# Usage: ./deploy-to-vps.sh

VPS_HOST="82.29.169.117"
VPS_USER="root"
VPS_PATH="/home/quizapp/quiz-musical/frontend/dist"
LOCAL_DIST="dist"

echo "🚀 Déploiement du frontend Quiz Musical..."

# Vérifier que dist/ existe
if [ ! -d "$LOCAL_DIST" ]; then
    echo "❌ Erreur: Le dossier dist/ n'existe pas. Exécutez 'npm run build' d'abord."
    exit 1
fi

echo "📦 Création de l'archive..."
tar -czf dist.tar.gz $LOCAL_DIST

echo "📤 Envoi vers le VPS..."
echo "Mot de passe VPS requis..."

# Envoi de l'archive
scp dist.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/

# Extraction sur le VPS
echo "📂 Extraction sur le VPS..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
    cd /tmp
    rm -rf dist
    tar -xzf dist.tar.gz
    rm -rf /home/quizapp/quiz-musical/frontend/dist/*
    cp -r dist/* /home/quizapp/quiz-musical/frontend/dist/
    rm -rf dist dist.tar.gz
    echo '✅ Déploiement terminé'
    ls -lh /home/quizapp/quiz-musical/frontend/dist/ | head -10
EOF

# Nettoyage local
rm -f dist.tar.gz

echo ""
echo "✅ Déploiement terminé avec succès!"
echo "🌐 Application accessible sur: https://recalbox.live"
echo "🎨 Gestion des thèmes: https://recalbox.live/admin/themes"
