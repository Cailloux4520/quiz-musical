# 🚀 Déploiement Rapide - Ubuntu 20.04 LTS

Guide rapide pour déployer Quiz Musical sur un VPS Ubuntu 20.04 LTS (Hostinger).

## 📋 Prérequis

- VPS Ubuntu 20.04 LTS
- Accès root SSH
- Nom de domaine pointant vers le VPS
- Port 80 et 443 ouverts

## ⚡ Installation en 3 étapes

### Étape 1 : Installation automatique de base

Connectez-vous en SSH à votre VPS et exécutez :

```bash
# Télécharger le script d'installation
wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-ubuntu.sh

# Rendre le script exécutable
chmod +x install-ubuntu.sh

# Exécuter (en tant que root)
sudo ./install-ubuntu.sh
```

Le script va :
- ✅ Installer Node.js, Docker, Nginx, Certbot
- ✅ Créer un utilisateur dédié
- ✅ Configurer le pare-feu
- ✅ Générer des clés de sécurité

**⚠️ Important** : Notez les clés de sécurité affichées !

### Étape 2 : Cloner et configurer le projet

```bash
# Se connecter avec l'utilisateur créé
su - quizapp

# Cloner le repository
git clone https://github.com/Cailloux4520/quiz-musical.git
cd quiz-musical

# Configurer le backend
cd backend
cp .env.example .env
nano .env  # Remplir avec les clés générées

# Configurer le frontend
cd ../frontend
cp .env.example .env
nano .env  # Mettre votre nom de domaine

cd ..
```

### Étape 3 : Déployer l'application

```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Exécuter le déploiement
./scripts/deploy.sh
```

### Étape 4 : Configurer Nginx et SSL

```bash
# Copier la configuration Nginx
sudo cp nginx.conf /etc/nginx/sites-available/quiz-musical

# Modifier avec votre domaine
sudo nano /etc/nginx/sites-available/quiz-musical

# Activer le site
sudo ln -s /etc/nginx/sites-available/quiz-musical /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Installer le certificat SSL
sudo certbot --nginx -d quizmusical.votredomaine.com
```

### Étape 5 : Vérifier

Accédez à : **https://quizmusical.votredomaine.com**

Compte admin par défaut :
- Email : `admin@quiz.com`
- Mot de passe : `admin123`

## 🔄 Maintenance

### Mettre à jour l'application

```bash
cd ~/quiz-musical
./scripts/update.sh
```

### Sauvegarder la base de données

```bash
# Sauvegarde manuelle
./scripts/backup.sh

# Sauvegarde automatique (cron)
crontab -e
# Ajouter : 0 2 * * * /home/quizapp/quiz-musical/scripts/backup.sh
```

### Voir les logs

```bash
# Logs backend
pm2 logs quiz-backend

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs Docker
docker-compose logs -f
```

## 🛠️ Commandes utiles

```bash
# Redémarrer le backend
pm2 restart quiz-backend

# Redémarrer Nginx
sudo systemctl restart nginx

# Redémarrer Docker
docker-compose restart

# Status de tous les services
pm2 status
docker-compose ps
sudo systemctl status nginx
```

## 📚 Documentation complète

Pour plus de détails, consultez :
- [Guide complet de déploiement](docs/DEPLOYMENT_UBUNTU.md)
- [Documentation API](docs/API.md)
- [Événements Socket.io](docs/SOCKET_EVENTS.md)

## 🆘 Aide

En cas de problème :
1. Vérifiez les logs : `pm2 logs quiz-backend`
2. Consultez la section Dépannage dans [DEPLOYMENT_UBUNTU.md](docs/DEPLOYMENT_UBUNTU.md)
3. Vérifiez que Docker fonctionne : `docker-compose ps`

## 🔒 Sécurité

Après le déploiement :
- ✅ Changez le mot de passe admin
- ✅ Configurez les sauvegardes automatiques
- ✅ Activez le monitoring
- ✅ Gardez le système à jour

---

**Besoin d'aide ?** Consultez la documentation complète ou ouvrez une issue sur GitHub.
