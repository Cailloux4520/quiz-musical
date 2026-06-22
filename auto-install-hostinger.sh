#!/bin/bash
# Script d'installation automatique sur Hostinger VPS
# Usage: ./auto-install-hostinger.sh

VPS_IP="82.29.169.117"
VPS_PASSWORD="P@ssw0rd6238261169"
VPS_USER="root"

echo "=========================================="
echo "  Installation Quiz Musical sur Hostinger"
echo "  VPS: $VPS_IP"
echo "=========================================="
echo ""

# Vérifier si sshpass est installé
if command -v sshpass &> /dev/null; then
    echo "✅ Utilisation de sshpass pour automatisation..."
    echo ""
    
    # Supprimer l'ancienne clé SSH si existe
    ssh-keygen -R $VPS_IP 2>/dev/null
    
    # Connexion et installation automatique
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'ENDSSH'
echo "📥 Téléchargement du script d'installation..."
wget -q https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh

echo "✅ Script téléchargé!"
chmod +x install-full-auto.sh

echo "🚀 Lancement de l'installation..."
echo "⏱️  Cela prendra 10-15 minutes..."
echo ""

sudo ./install-full-auto.sh

echo ""
echo "=========================================="
echo "  ✅ Installation terminée!"
echo "=========================================="
echo ""
ENDSSH

    echo ""
    echo "🌐 Votre application est accessible sur:"
    echo "   https://recalbox.live"
    echo "   http://$VPS_IP"
    echo ""
    echo "👤 Login Admin:"
    echo "   Email: admin@quiz.com"
    echo "   Mot de passe: admin123"
    echo ""
    
else
    echo "⚠️  sshpass n'est pas installé."
    echo ""
    echo "📋 INSTALLATION MANUELLE REQUISE:"
    echo "──────────────────────────────────────────"
    echo ""
    echo "1️⃣  Ouvrez un nouveau terminal et connectez-vous:"
    echo "    ssh $VPS_USER@$VPS_IP"
    echo ""
    echo "2️⃣  Mot de passe:"
    echo "    $VPS_PASSWORD"
    echo ""
    echo "3️⃣  Puis exécutez ces commandes:"
    echo ""
    echo "    wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh"
    echo "    chmod +x install-full-auto.sh"
    echo "    sudo ./install-full-auto.sh"
    echo ""
    echo "──────────────────────────────────────────"
    echo ""
    echo "📖 Ou consultez: INSTRUCTIONS_INSTALLATION.txt"
    echo ""
    echo "💡 Pour installer sshpass sur Git Bash Windows:"
    echo "   Téléchargez depuis: https://sourceforge.net/projects/sshpass/"
    echo ""
fi
