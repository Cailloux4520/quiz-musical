# 🚀 Déploiement Phase 9 - Exports

## Étapes de déploiement sur VPS

### 1. Connectez-vous en SSH à votre VPS

```bash
ssh root@recalbox.live
# ou
ssh quizapp@recalbox.live
```

### 2. Naviguez vers le répertoire de l'application

```bash
cd /home/quizapp/quiz-musical
```

### 3. Récupérez les dernières modifications

```bash
git pull origin main
```

### 4. Installez puppeteer dans le backend

```bash
cd backend
npm install puppeteer
```

**Note** : L'installation de puppeteer téléchargera Chromium (~170-300 MB) et peut prendre 5-10 minutes.

### 5. Recompilez le backend

```bash
npm run build
```

### 6. Redémarrez le service backend

```bash
pm2 restart quiz-backend
```

### 7. Vérifiez que tout fonctionne

```bash
pm2 logs quiz-backend
```

Vous devriez voir :
```
✓ Server started on port 5000
✓ Socket.io initialized
```

### 8. Testez les exports

1. Allez sur https://recalbox.live
2. Connectez-vous en tant qu'admin
3. Créez ou lancez une session de quiz
4. Allez sur la page de résultats
5. Testez les 3 boutons d'export :
   - 📄 PDF (rapport complet)
   - 📊 Excel (multi-feuilles)
   - 📋 CSV (classement simple)

## Dépendances système pour Puppeteer

Si puppeteer échoue avec une erreur de dépendances manquantes, installez :

```bash
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

Puis relancez :
```bash
cd /home/quizapp/quiz-musical/backend
npm install puppeteer
npm run build
pm2 restart quiz-backend
```

## Commandes de dépannage

### Vérifier l'état du backend
```bash
pm2 status
pm2 logs quiz-backend --lines 50
```

### Vérifier si Chromium est installé
```bash
ls -la /home/quizapp/quiz-musical/backend/node_modules/puppeteer/.local-chromium/
```

### Tester puppeteer manuellement
```bash
cd /home/quizapp/quiz-musical/backend
node -e "const puppeteer = require('puppeteer'); (async () => { const browser = await puppeteer.launch(); console.log('✓ Puppeteer OK'); await browser.close(); })()"
```

### Nettoyer et réinstaller si nécessaire
```bash
cd /home/quizapp/quiz-musical/backend
rm -rf node_modules/puppeteer
npm install puppeteer
```

## Variables d'environnement

Aucune variable d'environnement supplémentaire n'est requise pour la Phase 9.

Le fichier `.env` existant suffit.

## Déploiement terminé ✅

Une fois toutes ces étapes effectuées :
- ✅ Les exports PDF, Excel et CSV sont disponibles
- ✅ Les boutons apparaissent sur la page de résultats
- ✅ Les téléchargements fonctionnent avec authentification

## Prochaine étape

**Phase 10** : Tests & Polish
- Tests unitaires backend
- Tests E2E frontend
- Optimisations de performance
- Corrections de bugs
- Documentation finale

Commande : `lance phase 10`
