# 🚀 Déploiement Quiz Musical sur Hostinger

Guide complet pour installer l'application Quiz Musical sur un VPS Hostinger.

## 📋 Prérequis Hostinger

### Type d'Hébergement Requis

⚠️ **VPS Hostinger recommandé** - L'hébergement partagé n'est PAS compatible.

**Plan minimum recommandé :**
- **VPS 1** ou supérieur
- 1 vCPU, 4 GB RAM, 50 GB SSD
- Ubuntu 20.04 ou 22.04 LTS
- Accès SSH root
- Prix : ~4-8€/mois

### Vérifier votre Plan

1. Connectez-vous à [hPanel Hostinger](https://hpanel.hostinger.com)
2. Allez dans **VPS** > **Tableau de bord**
3. Vérifiez que vous avez un VPS Ubuntu (pas un hébergement web partagé)

---

## 🎯 Installation Automatique (Méthode Recommandée)

### Étape 1 : Connexion SSH au VPS Hostinger

#### Via hPanel (Interface Web)
1. Connectez-vous à [hPanel](https://hpanel.hostinger.com)
2. Cliquez sur **VPS** dans le menu
3. Sélectionnez votre VPS
4. Cliquez sur **Browser terminal** (terminal navigateur)

#### Via SSH Local (Recommandé)
```bash
# Récupérez vos identifiants dans hPanel > VPS > Informations SSH
ssh root@VOTRE_IP_VPS
# Entrez le mot de passe root affiché dans hPanel
```

**Trouver votre IP VPS :**
- hPanel > VPS > Tableau de bord > **Adresse IP**

### Étape 2 : Installation Automatique

Une fois connecté en SSH, exécutez :

```bash
# Télécharger le script d'installation
wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh

# Rendre exécutable
chmod +x install-full-auto.sh

# Lancer l'installation
sudo ./install-full-auto.sh
```

Le script va :
- ✅ Installer Node.js 18, PostgreSQL, MinIO, Nginx, PM2
- ✅ Cloner le dépôt GitHub
- ✅ Configurer la base de données
- ✅ Builder le frontend
- ✅ Démarrer le backend avec PM2
- ✅ Configurer Nginx comme reverse proxy

⏱️ **Durée : 10-15 minutes**

---

## 🌐 Configuration DNS Hostinger

### Étape 3 : Pointer votre Domaine vers le VPS

#### Si vous avez un domaine chez Hostinger

1. **Dans hPanel**, allez dans **Domaines**
2. Cliquez sur **Gérer** à côté de votre domaine
3. Allez dans **DNS / Serveurs de noms**
4. Ajoutez/modifiez les enregistrements DNS :

```
Type    Nom     Valeur              TTL
A       @       VOTRE_IP_VPS        14400
A       www     VOTRE_IP_VPS        14400
```

5. Sauvegardez (propagation DNS : 1-24h, généralement <1h)

#### Si votre domaine est ailleurs

Pointez les serveurs DNS vers Hostinger ou ajoutez des enregistrements A vers l'IP du VPS.

### Étape 4 : Configurer Nginx avec votre Domaine

```bash
# SSH vers votre VPS
ssh root@VOTRE_IP_VPS

# Éditer la configuration Nginx
nano /etc/nginx/sites-available/quiz-musical

# Remplacez 'localhost' ou l'IP par votre domaine
# Changez cette ligne :
#   server_name localhost;
# Par :
server_name votredomaine.com www.votredomaine.com;

# Sauvegarder : Ctrl+O, Entrée, Ctrl+X

# Tester la config
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 🔒 SSL Gratuit avec Let's Encrypt

### Étape 5 : Activer HTTPS

```bash
# Installer Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat SSL (remplacez par votre domaine)
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com

# Suivez les instructions :
# - Entrez votre email
# - Acceptez les conditions
# - Choisissez "2" pour rediriger HTTP → HTTPS
```

**Renouvellement automatique :**
```bash
# Tester le renouvellement
sudo certbot renew --dry-run
```

Le certificat se renouvelle automatiquement tous les 90 jours.

---

## ✅ Vérification de l'Installation

### Étape 6 : Tester l'Application

1. **Ouvrez votre navigateur** : `https://votredomaine.com`
2. **Page d'accueil** devrait s'afficher
3. **Connexion admin** : `https://votredomaine.com/login`
   - Email : `admin@quiz.com`
   - Mot de passe : `admin123`

### Vérifier les Services

```bash
# Backend PM2
pm2 status
# Devrait afficher "quiz-backend" avec status "online"

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql

# MinIO
sudo systemctl status minio
```

---

## 🎨 Configuration Backend - URL Hostinger

### Étape 7 : Mettre à Jour l'URL Backend

Si vous utilisez un domaine personnalisé, mettez à jour le fichier `.env` backend :

```bash
# Éditer le fichier .env
nano /var/www/quiz-musical/backend/.env

# Modifier cette ligne :
FRONTEND_URL=https://votredomaine.com

# Sauvegarder et redémarrer
pm2 restart quiz-backend
```

### Étape 8 : Mettre à Jour l'URL Frontend

```bash
# Éditer le fichier de config API frontend
nano /var/www/quiz-musical/frontend/src/services/api.ts

# Vérifier que baseURL utilise l'URL relative ou votre domaine
# Pour un domaine custom, utilisez :
baseURL: 'https://votredomaine.com/api',

# Rebuild le frontend
cd /var/www/quiz-musical/frontend
npm run build
```

---

## 🛠️ Scripts de Maintenance Hostinger

### Mise à Jour de l'Application

```bash
# Se connecter en SSH
ssh root@VOTRE_IP_VPS

# Exécuter le script de mise à jour
sudo /var/www/quiz-musical/scripts/update-app.sh
```

### Sauvegarde de la Base de Données

```bash
# Sauvegarde complète
/var/www/quiz-musical/scripts/backup.sh

# Les backups sont dans : /var/www/quiz-musical/backups/
```

### Redémarrer les Services

```bash
# Backend
pm2 restart quiz-backend

# Nginx
sudo systemctl restart nginx

# PostgreSQL
sudo systemctl restart postgresql
```

### Voir les Logs

```bash
# Logs backend
pm2 logs quiz-backend

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 🔧 Spécificités Hostinger

### Firewall VPS

Hostinger utilise un firewall par défaut. Assurez-vous d'ouvrir les ports :

**Via hPanel :**
1. VPS > Tableau de bord > **Firewall**
2. Ajoutez ces règles :

```
Port 80    TCP    Anywhere    # HTTP
Port 443   TCP    Anywhere    # HTTPS
Port 22    TCP    Anywhere    # SSH (déjà ouvert)
Port 5000  TCP    127.0.0.1   # Backend (local seulement)
```

**Via ligne de commande (UFW) :**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Limite de Ressources

Surveillez l'utilisation dans **hPanel > VPS > Statistiques** :
- CPU
- RAM
- Espace disque
- Bande passante

### Snapshots (Sauvegardes VPS)

**Recommandé avant mises à jour importantes :**
1. hPanel > VPS > **Snapshots**
2. Créer un snapshot
3. Restauration possible en 1 clic si problème

---

## 📊 Performance et Optimisation

### Cache Nginx

Déjà configuré par le script d'installation. Pour vérifier :

```bash
grep "expires" /etc/nginx/sites-available/quiz-musical
```

### PM2 Monitoring

```bash
# Dashboard temps réel
pm2 monit

# Statistiques détaillées
pm2 show quiz-backend
```

### Optimisation PostgreSQL

```bash
# Pour VPS avec 4GB RAM
sudo nano /etc/postgresql/14/main/postgresql.conf

# Ajustez ces valeurs :
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10485kB
min_wal_size = 1GB
max_wal_size = 4GB

# Redémarrer
sudo systemctl restart postgresql
```

---

## 🆘 Dépannage Hostinger

### Problème : "502 Bad Gateway"

```bash
# Vérifier que le backend tourne
pm2 status

# Si arrêté, redémarrer
pm2 restart quiz-backend

# Vérifier les logs
pm2 logs quiz-backend --lines 50
```

### Problème : "Cannot connect to database"

```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Redémarrer si nécessaire
sudo systemctl restart postgresql

# Vérifier les credentials dans .env
cat /var/www/quiz-musical/backend/.env | grep DATABASE
```

### Problème : SSL ne fonctionne pas

```bash
# Vérifier Certbot
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew --force-renewal

# Vérifier config Nginx
sudo nginx -t
```

### Problème : Espace disque plein

```bash
# Vérifier l'espace
df -h

# Nettoyer les logs PM2
pm2 flush

# Nettoyer les packages NPM
cd /var/www/quiz-musical/frontend && npm cache clean --force
cd /var/www/quiz-musical/backend && npm cache clean --force

# Nettoyer apt
sudo apt autoremove
sudo apt clean
```

---

## 📞 Support

### Ressources Hostinger
- **Documentation VPS** : https://support.hostinger.com/fr/collections/1742557-vps
- **Support Chat** : Disponible 24/7 dans hPanel
- **Tutoriels** : https://www.hostinger.fr/tutoriels/vps

### Ressources Application
- **GitHub Issues** : https://github.com/Cailloux4520/quiz-musical/issues
- **Documentation complète** : [README.md](./README.md)
- **Guide API** : [docs/API.md](./docs/API.md)

---

## 📝 Checklist Post-Installation

- [ ] Application accessible via `https://votredomaine.com`
- [ ] SSL actif (cadenas vert dans le navigateur)
- [ ] Admin login fonctionne (`admin@quiz.com` / `admin123`)
- [ ] Backend PM2 status "online"
- [ ] Nginx running
- [ ] PostgreSQL running
- [ ] MinIO accessible (uploads de médias fonctionnent)
- [ ] Firewall configuré correctement
- [ ] DNS propagé (domaine pointe vers VPS)
- [ ] Backup automatique configuré
- [ ] Changé le mot de passe admin par défaut
- [ ] Snapshot VPS créé

---

## 🎉 Installation Terminée !

Votre Quiz Musical est maintenant en ligne sur Hostinger !

**Prochaines étapes :**
1. Changez le mot de passe admin : Dashboard > Paramètres
2. Créez votre premier quiz : Dashboard > Nouveau Quiz
3. Testez une session en direct
4. Configurez les sauvegardes automatiques

**Bon quiz ! 🎵🎮**
