#!/bin/bash

################################################################################
# Script d'installation et de déploiement AUTOMATIQUE
# Quiz Musical - Ubuntu 20.04 LTS
# 
# Ce script installe et configure automatiquement TOUT :
# - Dépendances système (Node.js, Docker, Nginx, etc.)
# - Application backend et frontend
# - Base de données et services
# - Nginx avec SSL (Let's Encrypt)
# - Sauvegardes automatiques
################################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier que le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then 
    print_error "Ce script doit être exécuté en tant que root (utilisez sudo)"
    exit 1
fi

print_header "🎵 INSTALLATION AUTOMATIQUE - QUIZ MUSICAL"

# ============================================================================
# COLLECTE DES INFORMATIONS
# ============================================================================

print_header "📋 Configuration"

# Demander les informations nécessaires
read -p "Nom de domaine (ex: quiz.votredomaine.com) : " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    print_error "Le nom de domaine est obligatoire"
    exit 1
fi

read -p "Email pour SSL (Let's Encrypt) : " SSL_EMAIL
if [ -z "$SSL_EMAIL" ]; then
    print_error "L'email est obligatoire"
    exit 1
fi

read -p "URL du repository Git (ex: https://github.com/user/quiz-musical.git) : " GIT_REPO
if [ -z "$GIT_REPO" ]; then
    print_error "L'URL du repository est obligatoire"
    exit 1
fi

read -p "Branche Git (défaut: main) : " GIT_BRANCH
GIT_BRANCH=${GIT_BRANCH:-main}

read -p "Nom d'utilisateur système (défaut: quizapp) : " APP_USER
APP_USER=${APP_USER:-quizapp}

read -p "Répertoire d'installation (défaut: /home/$APP_USER/quiz-musical) : " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-/home/$APP_USER/quiz-musical}

# Confirmation
print_info "Configuration :"
echo "  - Domaine       : $DOMAIN_NAME"
echo "  - Email         : $SSL_EMAIL"
echo "  - Repository    : $GIT_REPO"
echo "  - Branche       : $GIT_BRANCH"
echo "  - Utilisateur   : $APP_USER"
echo "  - Répertoire    : $INSTALL_DIR"
echo ""
read -p "Continuer avec cette configuration ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Installation annulée"
    exit 0
fi

# ============================================================================
# GÉNÉRATION DES CLÉS DE SÉCURITÉ
# ============================================================================

print_header "🔐 Génération des clés de sécurité"

JWT_SECRET=$(openssl rand -hex 64)
DB_PASSWORD=$(openssl rand -hex 32)
MINIO_ACCESS_KEY=$(openssl rand -hex 16)
MINIO_SECRET_KEY=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)

print_success "Clés de sécurité générées"

# ============================================================================
# MISE À JOUR DU SYSTÈME
# ============================================================================

print_header "🔄 Mise à jour du système"

apt update && apt upgrade -y
print_success "Système mis à jour"

# ============================================================================
# INSTALLATION DES DÉPENDANCES
# ============================================================================

print_header "📦 Installation des dépendances système"

# Paquets essentiels
print_info "Installation des paquets de base..."
apt install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw fail2ban htop
print_success "Paquets de base installés"

# Node.js 18
print_info "Installation de Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_success "Node.js $(node --version) installé"
else
    print_success "Node.js $(node --version) déjà installé"
fi

# Docker
print_info "Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
    print_success "Docker $(docker --version) installé"
else
    print_success "Docker déjà installé"
fi

# Docker Compose
print_info "Installation de Docker Compose..."
apt install -y docker-compose
print_success "Docker Compose installé"

# PM2
print_info "Installation de PM2..."
npm install -g pm2
print_success "PM2 installé"

# Nginx
print_info "Installation de Nginx..."
apt install -y nginx
systemctl enable nginx
print_success "Nginx installé"

# Certbot
print_info "Installation de Certbot..."
apt install -y certbot python3-certbot-nginx
print_success "Certbot installé"

# ============================================================================
# CRÉATION DE L'UTILISATEUR
# ============================================================================

print_header "👤 Configuration de l'utilisateur"

if ! id "$APP_USER" &>/dev/null; then
    print_info "Création de l'utilisateur $APP_USER..."
    adduser --disabled-password --gecos "" $APP_USER
    usermod -aG docker $APP_USER
    print_success "Utilisateur $APP_USER créé"
else
    print_warning "L'utilisateur $APP_USER existe déjà"
    usermod -aG docker $APP_USER
fi

# ============================================================================
# CONFIGURATION DU PARE-FEU
# ============================================================================

print_header "🔥 Configuration du pare-feu"

ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
print_success "Pare-feu configuré"

# ============================================================================
# CLONAGE DU REPOSITORY
# ============================================================================

print_header "📥 Clonage du repository"

# Supprimer le répertoire s'il existe déjà
if [ -d "$INSTALL_DIR" ]; then
    print_warning "Le répertoire $INSTALL_DIR existe déjà. Sauvegarde en cours..."
    mv "$INSTALL_DIR" "$INSTALL_DIR.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Créer le répertoire parent
mkdir -p "$(dirname "$INSTALL_DIR")"

# Cloner le repository
print_info "Clonage de $GIT_REPO..."
su - $APP_USER -c "git clone -b $GIT_BRANCH $GIT_REPO $INSTALL_DIR"
print_success "Repository cloné"

# ============================================================================
# CONFIGURATION DES FICHIERS .ENV
# ============================================================================

print_header "⚙️  Configuration des fichiers d'environnement"

# Docker .env
print_info "Configuration Docker..."
cat > "$INSTALL_DIR/.env.docker" <<EOF
POSTGRES_USER=quizuser
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=quizmusical
POSTGRES_PORT=5432

MINIO_ROOT_USER=$MINIO_ACCESS_KEY
MINIO_ROOT_PASSWORD=$MINIO_SECRET_KEY
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_BUCKET=quiz-media

REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
EOF
chown $APP_USER:$APP_USER "$INSTALL_DIR/.env.docker"
print_success "Configuration Docker créée"

# Backend .env
print_info "Configuration Backend..."
cat > "$INSTALL_DIR/backend/.env" <<EOF
DATABASE_URL="postgresql://quizuser:$DB_PASSWORD@localhost:5432/quizmusical?schema=public"

JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="7d"

PORT=3000
NODE_ENV="production"

FRONTEND_URL="https://$DOMAIN_NAME"

MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="$MINIO_ACCESS_KEY"
MINIO_SECRET_KEY="$MINIO_SECRET_KEY"
MINIO_USE_SSL=false
MINIO_BUCKET="quiz-media"

REDIS_URL="redis://:$REDIS_PASSWORD@localhost:6379"
EOF
chown $APP_USER:$APP_USER "$INSTALL_DIR/backend/.env"
print_success "Configuration Backend créée"

# Frontend .env
print_info "Configuration Frontend..."
cat > "$INSTALL_DIR/frontend/.env" <<EOF
VITE_API_URL=https://$DOMAIN_NAME/api
VITE_WS_URL=https://$DOMAIN_NAME
EOF
chown $APP_USER:$APP_USER "$INSTALL_DIR/frontend/.env"
print_success "Configuration Frontend créée"

# ============================================================================
# DÉMARRAGE DES SERVICES DOCKER
# ============================================================================

print_header "🐳 Démarrage des services Docker"

cd "$INSTALL_DIR"

# Utiliser docker-compose.prod.yml s'il existe, sinon docker-compose.yml
if [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

print_info "Démarrage des conteneurs..."
docker-compose -f $COMPOSE_FILE --env-file .env.docker up -d

print_info "Attente du démarrage complet (30 secondes)..."
sleep 30

print_success "Services Docker démarrés"

# ============================================================================
# INSTALLATION ET BUILD DU BACKEND
# ============================================================================

print_header "🔧 Installation du Backend"

cd "$INSTALL_DIR/backend"

print_info "Installation des dépendances..."
su - $APP_USER -c "cd $INSTALL_DIR/backend && npm install"
print_success "Dépendances installées"

print_info "Génération du client Prisma..."
su - $APP_USER -c "cd $INSTALL_DIR/backend && npm run prisma:generate"
print_success "Client Prisma généré"

print_info "Application du schéma à la base de données..."
su - $APP_USER -c "cd $INSTALL_DIR/backend && npx prisma db push --accept-data-loss"
print_success "Schéma appliqué"

print_info "Initialisation de la base de données..."
su - $APP_USER -c "cd $INSTALL_DIR/backend && npm run prisma:seed"
print_success "Base de données initialisée"

print_info "Build du backend..."
su - $APP_USER -c "cd $INSTALL_DIR/backend && npm run build"
print_success "Backend compilé"

# ============================================================================
# INSTALLATION ET BUILD DU FRONTEND
# ============================================================================

print_header "🎨 Installation du Frontend"

cd "$INSTALL_DIR/frontend"

print_info "Installation des dépendances..."
su - $APP_USER -c "cd $INSTALL_DIR/frontend && npm install"
print_success "Dépendances installées"

print_info "Build du frontend..."
su - $APP_USER -c "cd $INSTALL_DIR/frontend && npm run build"
print_success "Frontend compilé"

# ============================================================================
# CONFIGURATION PM2
# ============================================================================

print_header "🚀 Configuration PM2"

print_info "Démarrage du backend avec PM2..."
su - $APP_USER -c "cd $INSTALL_DIR/backend && pm2 delete quiz-backend 2>/dev/null || true && pm2 start dist/server.js --name quiz-backend"

print_info "Configuration du démarrage automatique..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
su - $APP_USER -c "pm2 save"

print_success "PM2 configuré"

# ============================================================================
# CONFIGURATION NGINX
# ============================================================================

print_header "🌐 Configuration Nginx"

print_info "Création de la configuration Nginx..."
cat > /etc/nginx/sites-available/quiz-musical <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    root $INSTALL_DIR/frontend/dist;
    index index.html;

    access_log /var/log/nginx/quiz-musical-access.log;
    error_log /var/log/nginx/quiz-musical-error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 50M;
}
EOF

# Activer le site
print_info "Activation du site..."
ln -sf /etc/nginx/sites-available/quiz-musical /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
print_info "Test de la configuration Nginx..."
nginx -t

# Redémarrer Nginx
print_info "Redémarrage de Nginx..."
systemctl restart nginx

print_success "Nginx configuré"

# ============================================================================
# CONFIGURATION SSL (Let's Encrypt)
# ============================================================================

print_header "🔒 Configuration SSL"

print_info "Installation du certificat SSL avec Let's Encrypt..."
print_warning "Assurez-vous que votre domaine $DOMAIN_NAME pointe vers ce serveur !"
sleep 3

certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email $SSL_EMAIL --redirect

print_success "SSL configuré"

# ============================================================================
# CONFIGURATION DES SAUVEGARDES
# ============================================================================

print_header "💾 Configuration des sauvegardes automatiques"

# Créer le répertoire de backup
mkdir -p /home/$APP_USER/backups
chown $APP_USER:$APP_USER /home/$APP_USER/backups

# Rendre les scripts exécutables
chmod +x "$INSTALL_DIR/scripts/"*.sh 2>/dev/null || true

# Ajouter au cron (tous les jours à 2h du matin)
print_info "Configuration du cron pour les sauvegardes..."
(crontab -u $APP_USER -l 2>/dev/null; echo "0 2 * * * $INSTALL_DIR/scripts/backup.sh") | crontab -u $APP_USER -

print_success "Sauvegardes automatiques configurées"

# ============================================================================
# SAUVEGARDE DE LA CONFIGURATION
# ============================================================================

print_header "📝 Sauvegarde de la configuration"

CONFIG_FILE="/home/$APP_USER/quiz-musical-config.txt"

cat > "$CONFIG_FILE" <<EOF
====================================
CONFIGURATION QUIZ MUSICAL
====================================

Installation réalisée le : $(date)

INFORMATIONS GÉNÉRALES
----------------------
Domaine          : https://$DOMAIN_NAME
Email SSL        : $SSL_EMAIL
Repository Git   : $GIT_REPO
Branche          : $GIT_BRANCH
Utilisateur      : $APP_USER
Répertoire       : $INSTALL_DIR

CLÉS DE SÉCURITÉ (⚠️ CONFIDENTIEL)
----------------------------------
JWT_SECRET       : $JWT_SECRET
DB_PASSWORD      : $DB_PASSWORD
MINIO_ACCESS_KEY : $MINIO_ACCESS_KEY
MINIO_SECRET_KEY : $MINIO_SECRET_KEY
REDIS_PASSWORD   : $REDIS_PASSWORD

ACCÈS À L'APPLICATION
---------------------
URL              : https://$DOMAIN_NAME
Admin Email      : admin@quiz.com
Admin Password   : admin123

⚠️  IMPORTANT : Changez le mot de passe admin dès votre première connexion !

SERVICES INSTALLÉS
------------------
- Backend        : PM2 (port 3000)
- Frontend       : Nginx (https://$DOMAIN_NAME)
- PostgreSQL     : Docker (port 5432)
- MinIO          : Docker (port 9000, console 9001)
- Redis          : Docker (port 6379)

COMMANDES UTILES
----------------
Logs backend     : pm2 logs quiz-backend
Status PM2       : pm2 status
Logs Docker      : docker-compose -f $INSTALL_DIR/$COMPOSE_FILE logs -f
Logs Nginx       : sudo tail -f /var/log/nginx/error.log
Redémarrer       : pm2 restart quiz-backend
Mise à jour      : $INSTALL_DIR/scripts/update.sh
Backup manuel    : $INSTALL_DIR/scripts/backup.sh

SAUVEGARDES
-----------
Répertoire       : /home/$APP_USER/backups
Automatique      : Tous les jours à 2h du matin
Rétention        : 7 jours

====================================
⚠️  CONSERVEZ CE FICHIER EN LIEU SÛR
====================================
EOF

chown $APP_USER:$APP_USER "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"

print_success "Configuration sauvegardée dans $CONFIG_FILE"

# ============================================================================
# VÉRIFICATIONS FINALES
# ============================================================================

print_header "✅ Vérifications finales"

print_info "État des services Docker :"
docker-compose -f "$INSTALL_DIR/$COMPOSE_FILE" ps

echo ""
print_info "État de PM2 :"
su - $APP_USER -c "pm2 status"

echo ""
print_info "État de Nginx :"
systemctl status nginx --no-pager | head -5

# ============================================================================
# RÉSUMÉ
# ============================================================================

print_header "🎉 INSTALLATION TERMINÉE !"

cat << EOF

${GREEN}✓ Votre application Quiz Musical est maintenant en ligne !${NC}

${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${YELLOW}📱 ACCÉDER À L'APPLICATION${NC}
   URL : ${GREEN}https://$DOMAIN_NAME${NC}

${YELLOW}🔑 CONNEXION ADMIN${NC}
   Email    : ${GREEN}admin@quiz.com${NC}
   Password : ${GREEN}admin123${NC}
   
   ${RED}⚠️  CHANGEZ CE MOT DE PASSE DÈS MAINTENANT !${NC}

${YELLOW}📋 SERVICES ACTIFS${NC}
   ✓ Backend (Node.js + Express + Socket.io)
   ✓ Frontend (React + Vite)
   ✓ PostgreSQL (Base de données)
   ✓ MinIO (Stockage de fichiers)
   ✓ Redis (Cache)
   ✓ Nginx (Reverse proxy + HTTPS)
   ✓ PM2 (Process manager)
   ✓ Certbot (SSL automatique)

${YELLOW}📁 FICHIERS IMPORTANTS${NC}
   Configuration : ${GREEN}$CONFIG_FILE${NC}
   Logs backend  : ${GREEN}pm2 logs quiz-backend${NC}
   Logs Nginx    : ${GREEN}/var/log/nginx/quiz-musical-error.log${NC}

${YELLOW}🛠️  COMMANDES UTILES${NC}
   Redémarrer     : ${GREEN}pm2 restart quiz-backend${NC}
   Mettre à jour  : ${GREEN}$INSTALL_DIR/scripts/update.sh${NC}
   Backup         : ${GREEN}$INSTALL_DIR/scripts/backup.sh${NC}
   Status         : ${GREEN}pm2 status${NC}

${YELLOW}💾 SAUVEGARDES${NC}
   Répertoire     : ${GREEN}/home/$APP_USER/backups${NC}
   Automatique    : ${GREEN}Tous les jours à 2h${NC}

${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${GREEN}Félicitations ! Votre Quiz Musical est prêt à être utilisé ! 🎵${NC}

${YELLOW}Prochaines étapes :${NC}
  1. Connectez-vous à ${GREEN}https://$DOMAIN_NAME${NC}
  2. Changez le mot de passe admin
  3. Créez votre premier quiz
  4. Partagez le lien avec vos participants !

${RED}⚠️  N'oubliez pas de sauvegarder le fichier : $CONFIG_FILE${NC}

EOF

# Afficher le fichier de configuration
print_info "Configuration complète disponible dans : $CONFIG_FILE"

exit 0
