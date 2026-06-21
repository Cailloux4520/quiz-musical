# 🚀 Guide de Déploiement - VPS Ubuntu 20.04 LTS

Ce guide vous accompagne dans le déploiement de Quiz Musical sur un VPS Hostinger avec Ubuntu 20.04 LTS.

## 📋 Prérequis

- VPS Ubuntu 20.04 LTS
- Accès root ou sudo
- Nom de domaine pointant vers votre VPS (ex: quizmusical.votredomaine.com)
- Connexion SSH au serveur

## 🔧 Étape 1 : Préparation du Serveur

### Connexion SSH

```bash
ssh root@votre-ip-vps
```

### Mise à jour du système

```bash
apt update && apt upgrade -y
```

### Installation des paquets essentiels

```bash
apt install -y curl wget git build-essential
```

## 📦 Étape 2 : Installation de Node.js 18+

```bash
# Installer Node.js 18.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Vérifier l'installation
node --version  # Devrait afficher v18.x.x
npm --version   # Devrait afficher 9.x.x
```

## 🐳 Étape 3 : Installation de Docker et Docker Compose

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Démarrer Docker
systemctl start docker
systemctl enable docker

# Installer Docker Compose
apt install -y docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

## 📂 Étape 4 : Cloner et Configurer l'Application

### Créer un utilisateur dédié (recommandé)

```bash
# Créer un utilisateur pour l'application
adduser quizapp
usermod -aG docker quizapp
usermod -aG sudo quizapp

# Se connecter avec le nouvel utilisateur
su - quizapp
```

### Cloner le repository

```bash
cd ~
git clone https://github.com/Cailloux4520/quiz-musical.git
cd quiz-musical
```

### Configuration Backend

```bash
cd backend

# Copier et éditer le fichier d'environnement
cp .env.example .env
nano .env
```

Modifiez les variables suivantes dans `.env` :

```env
# Base de données
DATABASE_URL="postgresql://quizuser:VOTRE_MOT_DE_PASSE_SECURISE@localhost:5432/quizmusical?schema=public"

# JWT (générez une clé sécurisée)
JWT_SECRET="votre-cle-secrete-tres-longue-et-aleatoire"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"

# CORS (votre nom de domaine)
FRONTEND_URL="https://quizmusical.votredomaine.com"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="votre-access-key"
MINIO_SECRET_KEY="votre-secret-key-securise"
MINIO_USE_SSL=false
MINIO_BUCKET="quiz-media"

# Redis
REDIS_URL="redis://localhost:6379"
```

**💡 Conseil** : Générez une clé JWT sécurisée :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Installation des dépendances Backend

```bash
npm install
npm run prisma:generate
```

### Configuration Frontend

```bash
cd ../frontend

# Copier et éditer le fichier d'environnement
cp .env.example .env
nano .env
```

Modifiez les variables :

```env
VITE_API_URL=https://quizmusical.votredomaine.com/api
VITE_WS_URL=https://quizmusical.votredomaine.com
```

### Installation des dépendances Frontend et Build

```bash
npm install
npm run build
```

Le dossier `dist` contient maintenant l'application frontend prête pour production.

## 🐳 Étape 5 : Configuration Docker

Modifiez `docker-compose.yml` pour la production :

```bash
cd ~/quiz-musical
nano docker-compose.yml
```

Vérifiez que les mots de passe sont sécurisés :

```yaml
services:
  db:
    environment:
      POSTGRES_PASSWORD: VOTRE_MOT_DE_PASSE_SECURISE
  
  minio:
    environment:
      MINIO_ROOT_USER: votre-access-key
      MINIO_ROOT_PASSWORD: votre-secret-key-securise
```

### Démarrer les services Docker

```bash
docker-compose up -d

# Vérifier que les services fonctionnent
docker-compose ps
```

### Initialiser la base de données

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

## 🔄 Étape 6 : Installation de PM2 (Process Manager)

PM2 permet de garder votre application backend en cours d'exécution.

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Démarrer le backend avec PM2
cd ~/quiz-musical/backend
npm run build  # Compiler TypeScript
pm2 start dist/server.js --name quiz-backend

# Configurer PM2 pour démarrer au boot
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs quiz-backend
```

## 🌐 Étape 7 : Installation et Configuration de Nginx

Nginx servira de reverse proxy et servira les fichiers statiques du frontend.

### Installation

```bash
sudo apt install -y nginx
```

### Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/quiz-musical
```

Ajoutez cette configuration :

```nginx
server {
    listen 80;
    server_name quizmusical.votredomaine.com;

    # Frontend - Fichiers statiques
    root /home/quizapp/quiz-musical/frontend/dist;
    index index.html;

    # Gestion des routes React (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket pour Socket.io
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optimisations
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Activer le site

```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/quiz-musical /etc/nginx/sites-enabled/

# Supprimer le site par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Étape 8 : Configuration SSL avec Let's Encrypt

### Installation de Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtenir un certificat SSL

```bash
sudo certbot --nginx -d quizmusical.votredomaine.com
```

Suivez les instructions :
- Entrez votre email
- Acceptez les conditions
- Choisissez de rediriger HTTP vers HTTPS (option 2)

Certbot configurera automatiquement Nginx pour HTTPS.

### Renouvellement automatique

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Le renouvellement automatique est configuré via cron
```

## 🔥 Étape 9 : Configuration du Pare-feu

```bash
# Autoriser SSH, HTTP et HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le pare-feu
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## ✅ Étape 10 : Vérification

### Tester l'application

Ouvrez votre navigateur et accédez à :
- **https://quizmusical.votredomaine.com**

Vous devriez voir la page d'accueil du Quiz Musical !

### Connexion admin

- Email : admin@quiz.com
- Mot de passe : admin123

**⚠️ Important** : Changez le mot de passe admin après la première connexion !

### Vérifier les logs

```bash
# Logs PM2
pm2 logs quiz-backend

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs Docker
docker-compose logs -f
```

## 🔄 Mise à jour de l'application

### Mettre à jour le code

```bash
cd ~/quiz-musical
git pull origin main

# Backend
cd backend
npm install
npm run build
pm2 restart quiz-backend

# Frontend
cd ../frontend
npm install
npm run build

# Redémarrer Nginx
sudo systemctl reload nginx
```

### Migrations de base de données

```bash
cd ~/quiz-musical/backend
npm run prisma:migrate
```

## 🛠️ Commandes Utiles

### Gestion PM2

```bash
pm2 status                    # Voir l'état des processus
pm2 logs quiz-backend         # Voir les logs
pm2 restart quiz-backend      # Redémarrer
pm2 stop quiz-backend         # Arrêter
pm2 delete quiz-backend       # Supprimer
```

### Gestion Docker

```bash
docker-compose ps             # État des services
docker-compose logs -f        # Voir les logs
docker-compose restart        # Redémarrer tous les services
docker-compose down           # Arrêter tous les services
docker-compose up -d          # Démarrer tous les services
```

### Gestion Nginx

```bash
sudo nginx -t                 # Tester la configuration
sudo systemctl restart nginx  # Redémarrer
sudo systemctl status nginx   # Voir l'état
```

## 🔒 Sécurité Additionnelle

### Changer le mot de passe admin par défaut

Connectez-vous à l'application et changez le mot de passe dans les paramètres.

### Limiter les tentatives de connexion

Installez Fail2Ban :

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Sauvegardes automatiques

Créez un script de sauvegarde :

```bash
nano ~/backup-quiz.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/quizapp/backups"

mkdir -p $BACKUP_DIR

# Backup base de données
docker exec quiz-musical-db pg_dump -U quizuser quizmusical > $BACKUP_DIR/db_$DATE.sql

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Backup terminé : db_$DATE.sql"
```

```bash
chmod +x ~/backup-quiz.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e
# Ajouter : 0 2 * * * /home/quizapp/backup-quiz.sh
```

## 📊 Monitoring

### Installer htop pour monitorer les ressources

```bash
sudo apt install -y htop
htop
```

### Monitorer PM2

```bash
pm2 monit
```

## ❓ Dépannage

### L'application ne se charge pas

1. Vérifiez les logs PM2 : `pm2 logs quiz-backend`
2. Vérifiez Nginx : `sudo nginx -t`
3. Vérifiez Docker : `docker-compose ps`

### Erreur de connexion à la base de données

1. Vérifiez que PostgreSQL fonctionne : `docker-compose ps`
2. Vérifiez le `DATABASE_URL` dans `backend/.env`
3. Relancez les migrations : `npm run prisma:migrate`

### Socket.io ne fonctionne pas

1. Vérifiez la configuration Nginx pour `/socket.io`
2. Vérifiez que le backend est démarré : `pm2 status`
3. Vérifiez les CORS dans `backend/.env`

## 🎉 Félicitations !

Votre application Quiz Musical est maintenant déployée et accessible en ligne !

Pour toute question ou problème, consultez les logs et la documentation.
