# 🚀 Guide de Déploiement de la Mise à Jour

Ce guide explique comment déployer la mise à jour avec les nouvelles pages sur votre VPS recalbox.live.

## 📋 Résumé des Changements

### Nouvelles Pages Créées
1. **QuizForm** (`/admin/quiz/new` et `/admin/quiz/:id`) - Créer et éditer des quiz
2. **CreateSession** (`/admin/session/new/:quizId`) - Lancer une nouvelle session
3. **MasterGame** (`/master/:sessionId`) - Écran maître de jeu avec liste des joueurs
4. **PlayerGame** (`/play/:inviteCode`) - Écran de jeu pour les joueurs

### Routes Ajoutées
- ✅ `/admin/quiz/new` - Créer un nouveau quiz
- ✅ `/admin/quiz/:id` - Éditer un quiz existant
- ✅ `/admin/session/new/:quizId` - Créer une session de jeu
- ✅ `/master/:sessionId` - Écran maître de jeu
- ✅ `/play/:inviteCode` - Écran joueur

### Nouveaux Scripts
- ✅ `update-app.sh` - Script de mise à jour automatique
- ✅ `generate-config.sh` - Génération du fichier de configuration

## 🔄 Déployer la Mise à Jour

### Méthode 1 : Script Automatique (Recommandé)

Connectez-vous en SSH à votre VPS et exécutez :

```bash
sudo /home/quizapp/quiz-musical/scripts/update-app.sh
```

**Ce script va automatiquement :**
1. Pull les derniers changements depuis GitHub
2. Installer les dépendances backend
3. Installer les dépendances frontend
4. Rebuild le frontend avec les nouvelles pages
5. Redémarrer le backend avec PM2

⏱️ **Durée** : 2-3 minutes

### Méthode 2 : Mise à Jour Manuelle

Si vous préférez faire les étapes manuellement :

```bash
# 1. Se connecter en SSH
ssh root@recalbox.live

# 2. Aller dans le répertoire
cd /home/quizapp/quiz-musical

# 3. Pull les changements
sudo -u quizapp git pull

# 4. Backend - Installer dépendances
cd backend
sudo -u quizapp npm install

# 5. Frontend - Installer dépendances et rebuild
cd ../frontend
sudo -u quizapp npm install
sudo -u quizapp npm run build

# 6. Redémarrer le backend
pm2 restart quiz-backend

# 7. Vérifier que tout fonctionne
pm2 status
```

## ✅ Vérification Post-Déploiement

Après la mise à jour, vérifiez que tout fonctionne :

### 1. Vérifier les Services
```bash
pm2 status
# quiz-backend devrait être "online"
```

### 2. Tester l'Application

Ouvrez votre navigateur et accédez à : **https://recalbox.live**

1. **Connexion Admin**
   - Allez sur https://recalbox.live/login
   - Connectez-vous avec : `admin@quiz.com` / `admin123`
   - ✅ Vous devriez arriver au tableau de bord

2. **Test Créer un Quiz**
   - Cliquez sur "**+ Nouveau Quiz**"
   - ✅ Vous devriez arriver sur `/admin/quiz/new`
   - ✅ Le formulaire de création devrait s'afficher
   - Remplissez le formulaire et créez un quiz test

3. **Test Éditer un Quiz**
   - Sur le tableau de bord, cliquez sur "**Éditer**" d'un quiz
   - ✅ Vous devriez arriver sur `/admin/quiz/:id`
   - ✅ Le formulaire devrait être pré-rempli avec les données du quiz

4. **Test Lancer une Session**
   - Sur le tableau de bord, cliquez sur "**Lancer**" d'un quiz
   - ✅ Vous devriez arriver sur `/admin/session/new/:quizId`
   - ✅ Un code de session devrait être généré
   - Cliquez sur "**Démarrer le jeu**"
   - ✅ Vous devriez arriver sur `/master/:sessionId`
   - ✅ L'écran maître devrait afficher le code et attendre des joueurs

5. **Test Joueur**
   - Sur un autre appareil (mobile), allez sur https://recalbox.live
   - Cliquez sur "**Rejoindre une partie**"
   - Entrez le code affiché sur l'écran maître
   - ✅ Le joueur devrait apparaître dans la liste sur l'écran maître

### 3. Vérifier les Logs

Si quelque chose ne fonctionne pas :

```bash
# Voir les logs du backend
pm2 logs quiz-backend

# Voir les logs Nginx
tail -f /var/log/nginx/error.log

# Vérifier les services Docker
docker ps
```

## 📝 Générer le Fichier de Configuration

Si vous n'avez toujours pas le fichier `/home/quizapp/quiz-musical-config.txt`, générez-le :

```bash
sudo /home/quizapp/quiz-musical/scripts/generate-config.sh
```

Ce fichier contient :
- Toutes les variables d'environnement
- Les credentials des services (PostgreSQL, Redis, MinIO)
- Les informations de connexion admin
- Les commandes utiles

Pour le consulter :
```bash
cat /home/quizapp/quiz-musical-config.txt
```

## 🐛 Dépannage

### Le frontend ne se met pas à jour

**Problème** : Les anciennes pages s'affichent encore.

**Solution** : Vider le cache du navigateur
- Chrome/Edge : `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Firefox : `Ctrl + F5`
- Ou mode navigation privée pour tester

### Erreur 404 sur les nouvelles routes

**Problème** : Les nouvelles routes `/admin/quiz/new`, etc. donnent une erreur 404.

**Solution** : 
1. Vérifier que le frontend a bien été rebuild :
   ```bash
   cd /home/quizapp/quiz-musical/frontend
   ls -la dist/
   # Vérifier la date de création des fichiers
   ```

2. Si les fichiers sont anciens, rebuild manuellement :
   ```bash
   sudo -u quizapp npm run build
   ```

### Le backend ne redémarre pas

**Problème** : `pm2 restart quiz-backend` échoue.

**Solution** :
```bash
# Voir les logs d'erreur
pm2 logs quiz-backend --lines 50

# Redémarrer avec rechargement complet
pm2 delete quiz-backend
cd /home/quizapp/quiz-musical/backend
pm2 start npm --name "quiz-backend" -- run dev
pm2 save
```

### Les boutons continuent de rediriger au home

**Problème** : Même après la mise à jour, les boutons renvoient à la page d'accueil.

**Solutions** :
1. Vérifier que Git a bien pull les changements :
   ```bash
   cd /home/quizapp/quiz-musical
   git log --oneline -5
   # Vous devriez voir : "feat: Ajouter toutes les pages manquantes"
   ```

2. Vérifier que App.tsx contient les nouvelles routes :
   ```bash
   grep "admin/quiz/new" frontend/src/App.tsx
   # Devrait retourner une ligne
   ```

3. Si ce n'est pas le cas, pull à nouveau :
   ```bash
   sudo -u quizapp git pull
   cd frontend
   sudo -u quizapp npm run build
   ```

## 📊 Monitoring

### Surveiller les Performances

```bash
# CPU et RAM
htop

# Espace disque
df -h

# Logs en temps réel
pm2 logs quiz-backend --lines 100
```

### Statistiques PM2

```bash
# Infos détaillées
pm2 show quiz-backend

# Monitoring en temps réel
pm2 monit
```

## 🎉 Félicitations !

Votre application Quiz Musical est maintenant à jour avec toutes les fonctionnalités de navigation !

Les utilisateurs peuvent maintenant :
- ✅ Créer des quiz via l'interface
- ✅ Éditer des quiz existants
- ✅ Lancer des sessions de jeu
- ✅ Jouer en temps réel

---

**Besoin d'aide ?** Consultez les logs ou la documentation complète dans [DEPLOYMENT.md](docs/DEPLOYMENT.md)
