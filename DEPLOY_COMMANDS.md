# 🚀 Commandes de Déploiement Frontend

## Dans le terminal déjà connecté au VPS, exécutez :

```bash
# 1. Aller dans le dossier frontend
cd /home/quizapp/quiz-musical/frontend

# 2. Vérifier les dernières modifications (optionnel)
git status

# 3. Récupérer les derniers changements depuis Git
git pull origin main

# 4. Installer les dépendances (si nouvelles)
npm install

# 5. Compiler le frontend avec les nouveaux composants de thèmes
npm run build

# 6. Vérifier que le build est réussi
ls -lh dist/

# 7. Vérifier les fichiers JS générés (devrait inclure ThemeManager)
ls -lh dist/assets/ | grep -i theme

# 8. Test rapide Nginx (optionnel)
sudo nginx -t

# 9. Recharger Nginx si nécessaire (optionnel)
sudo systemctl reload nginx
```

## Commandes une par une (copier-coller) :

```bash
cd /home/quizapp/quiz-musical/frontend
```

```bash
git pull origin main
```

```bash
npm install
```

```bash
npm run build
```

```bash
ls -lh dist/assets/ | tail -20
```

## Vérification finale

Une fois terminé, visitez :
- 🌐 https://recalbox.live
- 🎨 https://recalbox.live/admin/themes

Le système de thèmes devrait être opérationnel !
