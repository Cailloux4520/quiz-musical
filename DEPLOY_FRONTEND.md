# 🚀 Guide de Déploiement Frontend sur VPS

## Option 1 : Déploiement Manuel via SSH (Recommandé)

### Étape 1 : Se connecter au VPS
```bash
ssh root@82.29.169.117
# Entrer le mot de passe
```

### Étape 2 : Sur le VPS, compiler le frontend
```bash
cd /home/quizapp/quiz-musical/frontend

# Installer les dépendances si nécessaire
npm install

# Compiler le frontend
npm run build

# Vérifier que dist/ contient les fichiers
ls -la dist/
```

## Option 2 : Transfert depuis votre PC

### Méthode A : Via SCP (nécessite le mot de passe)
```bash
cd frontend
tar -czf dist.tar.gz dist/
scp dist.tar.gz root@82.29.169.117:/tmp/
ssh root@82.29.169.117
cd /tmp
tar -xzf dist.tar.gz
rm -rf /home/quizapp/quiz-musical/frontend/dist/*
cp -r dist/* /home/quizapp/quiz-musical/frontend/dist/
rm -rf dist dist.tar.gz
```

### Méthode B : Via WinSCP ou FileZilla (Interface graphique)
1. Télécharger WinSCP : https://winscp.net/
2. Connexion :
   - Protocole : SFTP
   - Hôte : 82.29.169.117
   - Port : 22
   - Utilisateur : root
   - Mot de passe : [votre mot de passe]
3. Naviguer vers `/home/quizapp/quiz-musical/frontend/dist/`
4. Supprimer le contenu actuel de `dist/`
5. Uploader le contenu de votre dossier local `frontend/dist/`

## Option 3 : Déploiement via Git (Plus simple)

### Sur votre PC :
```bash
cd /c/Users/Fred/Projects/quiz-musical
git add .
git commit -m "feat: Add theme customization system"
git push origin main
```

### Sur le VPS :
```bash
ssh root@82.29.169.117
cd /home/quizapp/quiz-musical
git pull origin main
cd frontend
npm install
npm run build
```

## Vérification du déploiement

Une fois déployé, tester :
```bash
# Sur le VPS
ls -lh /home/quizapp/quiz-musical/frontend/dist/

# Devrait afficher :
# index.html
# assets/
# vite.svg
```

Puis visiter :
- 🌐 https://recalbox.live
- 🎨 https://recalbox.live/admin/themes

## Nginx Configuration

Le Nginx est déjà configuré pour servir depuis `/home/quizapp/quiz-musical/frontend/dist/`. Aucune modification nécessaire.

Si besoin de recharger Nginx :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Erreur 404 sur les routes
Si les routes React ne fonctionnent pas, vérifier la config Nginx :
```nginx
location / {
    root /home/quizapp/quiz-musical/frontend/dist;
    try_files $uri $uri/ /index.html;
}
```

### Fichiers statiques non trouvés
Vérifier les permissions :
```bash
chmod -R 755 /home/quizapp/quiz-musical/frontend/dist
```

### Cache navigateur
Forcer le refresh : Ctrl + Shift + R (ou Cmd + Shift + R sur Mac)
