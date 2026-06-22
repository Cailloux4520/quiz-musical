#!/bin/bash
# Script d'installation automatique pour Hostinger VPS
# Exécutez ce script après vous être connecté en SSH

set -e

echo "=========================================="
echo "  Installation Quiz Musical sur Hostinger"
echo "  VPS: 82.29.169.117"
echo "=========================================="
echo ""

# Télécharger le script d'installation
echo "📥 Téléchargement du script d'installation..."
wget -q https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh

# Rendre exécutable
chmod +x install-full-auto.sh

echo "✅ Script téléchargé avec succès!"
echo ""
echo "🚀 Lancement de l'installation..."
echo "   Cela prendra environ 10-15 minutes..."
echo ""

# Lancer l'installation
sudo ./install-full-auto.sh

echo ""
echo "=========================================="
echo "  ✅ Installation terminée!"
echo "=========================================="
echo ""
echo "🌐 Votre application est accessible sur:"
echo "   http://82.29.169.117"
echo "   https://recalbox.live"
echo ""
echo "👤 Login Admin:"
echo "   Email: admin@quiz.com"
echo "   Mot de passe: admin123"
echo ""
echo "🔒 N'oubliez pas de changer le mot de passe admin!"
echo ""
