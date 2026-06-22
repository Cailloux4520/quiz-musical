#!/bin/bash
# Script à exécuter sur le VPS

echo "=========================================="
echo "  Installation Quiz Musical"
echo "=========================================="
echo ""

# Télécharger le script
echo "📥 Téléchargement du script..."
wget -q https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh

if [ $? -eq 0 ]; then
    echo "✅ Script téléchargé"
    chmod +x install-full-auto.sh
    
    echo "🚀 Lancement de l'installation..."
    echo ""
    sudo ./install-full-auto.sh
else
    echo "❌ Erreur téléchargement"
    exit 1
fi
