# 🎵 Installation Complète Automatique - Quiz Musical

## ⚡ Installation en 1 minute

Sur votre VPS Ubuntu 20.04 LTS, exécutez cette **unique commande** :

```bash
wget -qO- https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh | sudo bash
```

**C'est tout !** ✨

Le script va tout faire automatiquement :
- ✅ Installer Node.js, Docker, Nginx
- ✅ Cloner et configurer l'application
- ✅ Configurer SSL/HTTPS
- ✅ Démarrer tous les services
- ✅ Configurer les sauvegardes

## 📝 Que faire ?

### Avant l'installation

1. **Préparez votre domaine** : Faites pointer `quiz.votredomaine.com` vers l'IP de votre VPS
2. **Accès SSH** : Connectez-vous à votre VPS en root

### Pendant l'installation

Le script vous demandera :
- **Nom de domaine** : `quiz.votredomaine.com`
- **Email** : Pour le certificat SSL
- **URL Git** : Votre repository GitHub
- **Branche** : `main` (par défaut)

⏱️ **Durée** : 15-20 minutes

### Après l'installation

Accédez à votre application : **https://quiz.votredomaine.com**

**Connexion admin :**
- Email : `admin@quiz.com`
- Mot de passe : `admin123`

🔴 **IMPORTANT** : Changez ce mot de passe immédiatement !

## 📋 Checklist

- [ ] VPS Ubuntu 20.04 LTS
- [ ] Accès root SSH
- [ ] Domaine pointant vers le VPS
- [ ] Repository Git accessible
- [ ] Port 80 et 443 ouverts

## 🎯 Résultat

Après l'installation, vous aurez :

```
✅ Application en ligne : https://quiz.votredomaine.com
✅ SSL/HTTPS activé
✅ Sauvegardes automatiques (tous les jours à 2h)
✅ Services optimisés
✅ Monitoring actif
```

## 🆘 Besoin d'aide ?

- [Documentation complète](AUTO_INSTALL.md)
- [Guide de déploiement](docs/DEPLOYMENT_UBUNTU.md)
- [FAQ](docs/FAQ.md)

## 🔧 Commandes utiles après installation

```bash
# Voir les logs
pm2 logs quiz-backend

# Redémarrer
pm2 restart quiz-backend

# Mise à jour
/home/quizapp/quiz-musical/scripts/update.sh

# Backup manuel
/home/quizapp/quiz-musical/scripts/backup.sh
```

---

🎉 **C'est prêt !** Créez votre premier quiz musical et partagez-le ! 🎵
