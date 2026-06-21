#!/bin/bash

# Script d'installation automatique pour Ubuntu 20.04 LTS
# Quiz Musical - Déploiement VPS

set -e  # Arrêter en cas d'erreur

echo "🎵 Installation de Quiz Musical sur Ubuntu 20.04 LTS"
echo "=================================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then 
    error "Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

# Demander les informations nécessaires
read -p "Nom de domaine (ex: quiz.votredomaine.com) : " DOMAIN_NAME
read -p "Email pour Let's Encrypt : " EMAIL
read -p "Nom d'utilisateur pour l'application (défaut: quizapp) : " APP_USER
APP_USER=${APP_USER:-quizapp}

info "Configuration :"
echo "  - Domaine : $DOMAIN_NAME"
echo "  - Email : $EMAIL"
echo "  - Utilisateur : $APP_USER"
echo ""
read -p "Continuer ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. Mise à jour du système
info "Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation des paquets essentiels
info "Installation des paquets essentiels..."
apt install -y curl wget git build-essential ufw fail2ban htop

# 3. Installation de Node.js 18
info "Installation de Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

info "Node.js version : $(node --version)"
info "npm version : $(npm --version)"

# 4. Installation de Docker
info "Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

info "Docker version : $(docker --version)"

# 5. Installation de Docker Compose
info "Installation de Docker Compose..."
apt install -y docker-compose

info "Docker Compose version : $(docker-compose --version)"

# 6. Installation de PM2
info "Installation de PM2..."
npm install -g pm2

# 7. Création de l'utilisateur
info "Création de l'utilisateur $APP_USER..."
if ! id "$APP_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" $APP_USER
    usermod -aG docker $APP_USER
    usermod -aG sudo $APP_USER
    info "Utilisateur $APP_USER créé"
else
    warn "L'utilisateur $APP_USER existe déjà"
fi

# 8. Installation de Nginx
info "Installation de Nginx..."
apt install -y nginx
systemctl enable nginx

# 9. Installation de Certbot
info "Installation de Certbot..."
apt install -y certbot python3-certbot-nginx

# 10. Configuration du pare-feu
info "Configuration du pare-feu..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw status

# 11. Générer des clés sécurisées
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
DB_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
MINIO_ACCESS_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
MINIO_SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

info "Clés de sécurité générées"

# 12. Créer le fichier de configuration
cat > /tmp/quiz-config.txt <<EOF
====================================
Configuration Quiz Musical
====================================

Domaine : $DOMAIN_NAME
Email : $EMAIL
Utilisateur : $APP_USER

Clés de sécurité (À CONSERVER PRÉCIEUSEMENT) :
------------------------------------
JWT_SECRET=$JWT_SECRET
DB_PASSWORD=$DB_PASSWORD
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY

Prochaines étapes :
------------------------------------
1. Connectez-vous avec l'utilisateur $APP_USER :
   su - $APP_USER

2. Clonez votre repository :
   git clone https://github.com/votre-user/quiz-musical.git
   cd quiz-musical

3. Configurez les fichiers .env avec les clés ci-dessus

4. Suivez les étapes dans docs/DEPLOYMENT_UBUNTU.md

====================================
EOF

cat /tmp/quiz-config.txt
cp /tmp/quiz-config.txt /home/$APP_USER/quiz-config.txt
chown $APP_USER:$APP_USER /home/$APP_USER/quiz-config.txt

info "Configuration sauvegardée dans /home/$APP_USER/quiz-config.txt"

# 13. Créer le répertoire de backup
mkdir -p /home/$APP_USER/backups
chown $APP_USER:$APP_USER /home/$APP_USER/backups

echo ""
echo "============================================"
info "Installation de base terminée !"
echo "============================================"
echo ""
warn "IMPORTANT : Notez les clés de sécurité affichées ci-dessus !"
echo ""
info "Prochaines étapes :"
echo "  1. su - $APP_USER"
echo "  2. Clonez le repository"
echo "  3. Configurez les fichiers .env"
echo "  4. Suivez le guide : docs/DEPLOYMENT_UBUNTU.md"
echo ""
