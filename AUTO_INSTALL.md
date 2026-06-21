# 🚀 Installation Automatique Complète

## Installation en UNE SEULE COMMANDE

Ce script installe et configure automatiquement **TOUT** sur votre VPS Ubuntu 20.04 LTS :

- ✅ Node.js, Docker, Nginx, Certbot, PM2
- ✅ Application backend et frontend
- ✅ Base de données PostgreSQL
- ✅ Configuration SSL/HTTPS automatique
- ✅ Sauvegardes automatiques
- ✅ Sécurité (pare-feu, fail2ban)

## 📋 Prérequis

1. **VPS Ubuntu 20.04 LTS** (Hostinger ou autre)
2. **Accès root SSH**
3. **Nom de domaine** pointant vers votre VPS
4. **Repository Git** de votre application

## ⚡ Installation Rapide

### Étape 1 : Télécharger le script

Connectez-vous en SSH à votre VPS et exécutez :

```bash
wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical-/main/scripts/install-full-auto.sh
```

Ou avec curl :

```bash
curl -O https://raw.githubusercontent.com/Cailloux4520/quiz-musical-/main/scripts/install-full-auto.sh
```

### Étape 2 : Rendre le script exécutable

```bash
chmod +x install-full-auto.sh
```

### Étape 3 : Lancer l'installation

```bash
sudo ./install-full-auto.sh
```

### Étape 4 : Répondre aux questions

Le script vous demandera :

1. **Nom de domaine** : `quiz.votredomaine.com`
2. **Email pour SSL** : `votre@email.com`
3. **URL du repository** : `https://github.com/votre-user/quiz-musical.git`
4. **Branche Git** : `main` (par défaut)
5. **Nom d'utilisateur** : `quizapp` (par défaut)

### Étape 5 : Attendez la fin

L'installation prend environ **15-20 minutes**.

Le script va :
- 📦 Installer toutes les dépendances
- 🔐 Générer des clés de sécurité
- 🐳 Configurer Docker
- 🔧 Installer et compiler l'application
- 🌐 Configurer Nginx
- 🔒 Installer le certificat SSL
- 💾 Configurer les sauvegardes

## ✅ Résultat

À la fin, vous aurez :

- **Application en ligne** : `https://quiz.votredomaine.com`
- **Compte admin** : `admin@quiz.com` / `admin123`
- **Fichier de configuration** : `/home/quizapp/quiz-musical-config.txt`

## 🎯 Exemple Complet

```bash
# Sur votre VPS
wget https://raw.githubusercontent.com/votre-user/quiz-musical/main/scripts/install-full-auto.sh
chmod +x install-full-auto.sh
sudo ./install-full-auto.sh

# Répondre aux questions :
# Nom de domaine : quiz.monsite.com
# Email : admin@monsite.com
# Repository : https://github.com/monuser/quiz-musical.git
# Branche : main
# Utilisateur : quizapp

# Attendre 15-20 minutes...
# ✓ Installation terminée !

# Accéder à votre application :
# https://quiz.monsite.com
```

## 📝 Ce qui est installé

### Logiciels

- **Node.js 18** - Runtime JavaScript
- **Docker & Docker Compose** - Conteneurisation
- **Nginx** - Serveur web / Reverse proxy
- **Certbot** - SSL/HTTPS automatique
- **PM2** - Gestionnaire de processus
- **PostgreSQL** - Base de données
- **MinIO** - Stockage de fichiers
- **Redis** - Cache

### Configuration

- **Pare-feu UFW** - Ports 22, 80, 443 ouverts
- **Fail2Ban** - Protection contre les attaques
- **SSL/TLS** - HTTPS avec Let's Encrypt
- **Sauvegardes** - Automatiques tous les jours à 2h
- **Monitoring** - PM2 pour le backend

## 🔐 Sécurité

Le script génère automatiquement :

- Clé JWT sécurisée (128 caractères)
- Mot de passe PostgreSQL (64 caractères)
- Clés MinIO (32-64 caractères)
- Mot de passe Redis (64 caractères)

Toutes les clés sont sauvegardées dans `/home/quizapp/quiz-musical-config.txt`

**⚠️ IMPORTANT** : Conservez ce fichier en lieu sûr !

## 📊 Après l'installation

### Première connexion

1. Accédez à `https://votre-domaine.com`
2. Connectez-vous avec `admin@quiz.com` / `admin123`
3. **Changez immédiatement le mot de passe admin**

### Commandes utiles

```bash
# Voir les logs du backend
pm2 logs quiz-backend

# Redémarrer le backend
pm2 restart quiz-backend

# Voir l'état des services
pm2 status
docker ps
systemctl status nginx

# Faire une sauvegarde manuelle
/home/quizapp/quiz-musical/scripts/backup.sh

# Mettre à jour l'application
/home/quizapp/quiz-musical/scripts/update.sh
```

### Configuration MinIO Console

Accédez à MinIO Console :
- URL : `http://votre-ip:9001`
- User : voir dans `/home/quizapp/quiz-musical-config.txt`
- Password : voir dans le même fichier

**⚠️ Attention** : MinIO Console n'est pas accessible via HTTPS par défaut. Utilisez SSH tunnel ou VPN pour plus de sécurité.

## 🔄 Mises à jour

Pour mettre à jour l'application :

```bash
cd /home/quizapp/quiz-musical
./scripts/update.sh
```

## 💾 Sauvegardes

### Automatiques

Les sauvegardes sont automatiques tous les jours à 2h du matin :
- Base de données PostgreSQL
- Fichiers MinIO
- Configuration

Les backups sont conservés 7 jours.

### Manuelles

```bash
# Faire un backup maintenant
/home/quizapp/quiz-musical/scripts/backup.sh

# Voir les backups
ls -lh /home/quizapp/backups/
```

### Restauration

```bash
# Restaurer la base de données
docker exec -i quiz-musical-db psql -U quizuser quizmusical < backup.sql

# Restaurer MinIO
tar xzf minio-backup.tar.gz -C /
docker-compose restart minio
```

## ❓ Résolution de problèmes

### Le script échoue

1. Vérifiez que vous êtes bien root : `whoami`
2. Vérifiez la connexion internet : `ping google.com`
3. Vérifiez que le domaine pointe bien vers le VPS : `nslookup votre-domaine.com`

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs quiz-backend

# Vérifier Docker
docker ps
docker-compose logs

# Redémarrer tout
pm2 restart quiz-backend
docker-compose restart
systemctl restart nginx
```

### Erreur SSL

Si Certbot échoue :

1. Vérifiez que votre domaine pointe vers le VPS
2. Attendez quelques minutes (propagation DNS)
3. Relancez : `sudo certbot --nginx -d votre-domaine.com`

### Base de données inaccessible

```bash
# Vérifier PostgreSQL
docker ps | grep postgres
docker logs quiz-musical-db

# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier la connexion
docker exec -it quiz-musical-db psql -U quizuser -d quizmusical
```

## 🆘 Support

En cas de problème :

1. Consultez les logs : `pm2 logs quiz-backend`
2. Vérifiez le fichier de config : `/home/quizapp/quiz-musical-config.txt`
3. Consultez la documentation complète : [DEPLOYMENT_UBUNTU.md](../docs/DEPLOYMENT_UBUNTU.md)

## ⚙️ Configuration avancée

### Personnaliser l'installation

Éditez le script avant de l'exécuter pour modifier :

- Ports utilisés
- Répertoire d'installation
- Configuration Nginx
- Paramètres de sécurité

### Variables d'environnement

Tous les fichiers `.env` sont générés automatiquement. Pour les modifier :

```bash
nano /home/quizapp/quiz-musical/backend/.env
nano /home/quizapp/quiz-musical/frontend/.env
```

Puis redémarrez :

```bash
pm2 restart quiz-backend
npm run build  # dans frontend
```

## 📈 Performance

### VPS recommandé

- **RAM** : 2 GB minimum (4 GB recommandé)
- **CPU** : 2 cœurs minimum
- **Stockage** : 20 GB SSD minimum
- **Bande passante** : Illimitée

### Optimisation

Pour améliorer les performances :

1. Augmentez la RAM du VPS
2. Activez la compression Nginx (déjà configurée)
3. Utilisez un CDN pour les assets statiques
4. Configurez Redis pour le cache

## 🎉 Félicitations !

Votre Quiz Musical est maintenant en ligne et prêt à être utilisé !

Créez votre premier quiz et partagez le lien avec vos participants ! 🎵

---

**Besoin d'aide ?** Consultez la [documentation complète](../docs/DEPLOYMENT_UBUNTU.md)
