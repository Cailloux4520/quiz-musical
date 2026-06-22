# Guide de Déploiement - MyQuiz

Ce guide couvre le déploiement de MyQuiz sur différents environnements de production.

## Table des matières
- [Prérequis](#prérequis)
- [Architecture de Déploiement](#architecture-de-déploiement)
- [Déploiement VPS Ubuntu](#déploiement-vps-ubuntu)
- [Déploiement Docker](#déploiement-docker)
- [Configuration Nginx](#configuration-nginx)
- [SSL/TLS](#ssltls)
- [Variables d'Environnement](#variables-denvironnement)
- [Monitoring](#monitoring)
- [Maintenance](#maintenance)

## Prérequis

### Serveur
- **OS**: Ubuntu 20.04 LTS ou 22.04 LTS (recommandé)
- **RAM**: Minimum 2 GB, 4 GB recommandé
- **CPU**: 2 cores minimum
- **Stockage**: 20 GB minimum
- **Bande passante**: Illimitée recommandée

### Logiciels requis
- Node.js 18.x ou supérieur
- PostgreSQL 15
- Nginx
- Docker & Docker Compose (optionnel)
- PM2 (gestionnaire de processus)
- Git

## Architecture de Déploiement

```
┌─────────────┐
│   Internet  │
└──────┬──────┘
       │
┌──────▼──────┐
│    Nginx    │ ← Reverse Proxy + SSL
│   (Port 80) │
│  (Port 443) │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐  ┌───────▼────────┐
│   Frontend  │  │    Backend     │
│   (Static)  │  │  (Node.js API) │
│             │  │   (Port 5000)  │
└─────────────┘  └────────┬───────┘
                          │
                 ┌────────▼─────────┐
                 │   PostgreSQL     │
                 │   (Port 5432)    │
                 └──────────────────┘
```

## Déploiement VPS Ubuntu

### Option 1: Installation Automatique (Recommandé)

```bash
wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh
chmod +x install-full-auto.sh
sudo ./install-full-auto.sh
```

Le script installe automatiquement:
- Node.js 18.x
- PostgreSQL 15
- Docker & Docker Compose
- Nginx
- PM2
- Clone le projet
- Configure la base de données
- Build le frontend
- Configure Nginx
- Configure SSL avec Let's Encrypt

### Option 2: Installation Manuelle

Voir le [Guide Détaillé Ubuntu](./DEPLOYMENT_UBUNTU.md)

## Déploiement Docker

### Production avec Docker Compose

1. **Cloner le repository:**
```bash
git clone https://github.com/Cailloux4520/quiz-musical.git
cd quiz-musical
```

2. **Configurer l'environnement:**
```bash
cp .env.docker.example .env
# Éditer .env avec vos valeurs
nano .env
```

3. **Lancer les containers:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Vérifier le status:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Services Docker

- **frontend**: React app (port 3000)
- **backend**: Node.js API (port 5000)
- **postgres**: Base de données (port 5432)
- **nginx**: Reverse proxy (ports 80, 443)

## Configuration Nginx

### Configuration de base

```nginx
# /etc/nginx/sites-available/myquiz

upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name votre-domaine.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (Static Files)
    location / {
        root /home/quizapp/quiz-musical/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
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
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Limits
    client_max_body_size 50M;
}
```

### Activer la configuration

```bash
sudo ln -s /etc/nginx/sites-available/myquiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/TLS

### Avec Let's Encrypt (Gratuit)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

Certbot configure automatiquement Nginx et crée un cron job pour le renouvellement.

### Renouvellement manuel

```bash
sudo certbot renew --dry-run
sudo certbot renew
```

## Variables d'Environnement

### Backend (.env)

```env
# Serveur
NODE_ENV=production
PORT=5000

# Base de données
DATABASE_URL="postgresql://postgres:password@localhost:5432/quiz_musical"

# JWT
JWT_SECRET=votre_secret_tres_securise_changez_moi
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://votre-domaine.com

# Uploads
MAX_FILE_SIZE=52428800

# Session
SESSION_SECRET=votre_session_secret_securise
```

### Frontend (.env)

```env
VITE_API_URL=https://votre-domaine.com/api
VITE_SOCKET_URL=https://votre-domaine.com
```

## Monitoring

### PM2 (Backend)

```bash
# Démarrer avec PM2
pm2 start backend/dist/index.js --name quiz-backend

# Monitoring en temps réel
pm2 monit

# Logs
pm2 logs quiz-backend

# Redémarrer
pm2 restart quiz-backend

# Status
pm2 status
```

### Configuration PM2 Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'quiz-backend',
    script: './backend/dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Logs Nginx

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Monitoring PostgreSQL

```bash
# Connexion
sudo -u postgres psql quiz_musical

# Taille de la base
SELECT pg_size_pretty(pg_database_size('quiz_musical'));

# Tables les plus volumineuses
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Maintenance

### Mise à jour de l'application

```bash
cd /home/quizapp/quiz-musical
git pull origin main
cd backend && npm install && npm run build
pm2 restart quiz-backend
cd ../frontend && npm install && npm run build
```

Ou utiliser le script automatique:
```bash
sudo /home/quizapp/quiz-musical/scripts/update-app.sh
```

### Sauvegarde de la base de données

```bash
# Backup
pg_dump -U postgres quiz_musical > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U postgres quiz_musical < backup_20260622_100000.sql
```

Script automatique:
```bash
/home/quizapp/quiz-musical/scripts/backup.sh
```

### Nettoyage des logs

```bash
# PM2 logs
pm2 flush

# Nginx logs (rotation automatique configurée)
# Les logs sont automatiquement rotatés par logrotate

# Docker logs
docker system prune -a
```

## Performance

### Optimisations Nginx

```nginx
# Dans http block de /etc/nginx/nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

### Optimisations Node.js

```javascript
// Backend: Activer le cluster mode
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Votre app Express
}
```

### Optimisations PostgreSQL

```sql
-- Dans postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 6MB
min_wal_size = 1GB
max_wal_size = 4GB
```

## Sécurité

### Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### PostgreSQL

```bash
# Autoriser uniquement localhost
# Dans /etc/postgresql/15/main/pg_hba.conf
local   all             postgres                                peer
host    quiz_musical    postgres        127.0.0.1/32           md5
```

### Fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
pm2 logs quiz-backend --lines 100

# Vérifier le port
sudo netstat -tulpn | grep 5000

# Vérifier la connexion DB
psql -U postgres -h localhost quiz_musical
```

### Erreurs 502 Bad Gateway

```bash
# Vérifier que le backend tourne
pm2 status

# Vérifier les logs Nginx
tail -f /var/log/nginx/error.log

# Tester la connexion backend
curl http://localhost:5000/api/health
```

### WebSocket ne fonctionne pas

```bash
# Vérifier la config Nginx pour /socket.io
sudo nginx -t

# Vérifier les headers WebSocket
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:5000/socket.io/
```

## Support

Pour plus d'aide:
- [Guide Ubuntu Détaillé](./DEPLOYMENT_UBUNTU.md)
- [Guide Hostinger](../HOSTINGER_DEPLOYMENT.md)
- [Issues GitHub](https://github.com/Cailloux4520/quiz-musical/issues)
