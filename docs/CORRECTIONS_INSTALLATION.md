# Corrections appliquées au script d'installation automatique

## Vue d'ensemble

Ce document liste toutes les corrections qui ont été intégrées dans le script `install-full-auto.sh` suite aux problèmes rencontrés lors de l'installation manuelle sur recalbox.live.

## Corrections implémentées

### 1. Script `seed` manquant dans backend/package.json

**Problème** : Le package.json du backend ne contenait pas toujours le script "seed", causant une erreur lors de `npm run seed`.

**Solution** : Le script vérifie maintenant si le script existe et l'ajoute automatiquement :

```bash
if ! su - $APP_USER -c "cd $INSTALL_DIR/backend && npm run seed --silent 2>&1" | grep -q "Missing script"; then
    print_success "Script seed disponible"
else
    print_warning "Ajout du script seed manquant..."
    su - $APP_USER -c "cd $INSTALL_DIR/backend && npm pkg set scripts.seed='tsx prisma/seed.ts'"
fi
```

### 2. Erreur TypeScript rootDir avec prisma/

**Problème** : Le fichier `seed.ts` dans `prisma/` causait une erreur car il n'était pas sous `src/` (rootDir).

**Solution** : Modification automatique de `backend/tsconfig.json` pour exclure le dossier `prisma/` :

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "prisma"]
}
```

### 3. Types TypeScript manquants pour Vite

**Problème** : Erreur TS2339 sur `import.meta.env.VITE_API_URL` et `VITE_WS_URL` dans le frontend.

**Solution** : Création automatique de `frontend/src/vite-env.d.ts` :

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4. PostCSS en CommonJS dans un projet ES module

**Problème** : Le fichier `postcss.config.js` utilisait `module.exports` dans un projet avec `"type": "module"`, causant une erreur lors du build.

**Solution** : Conversion automatique en syntaxe ES module :

```javascript
// Avant (CommonJS)
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// Après (ES module)
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 5. Erreur 403 Nginx - Permissions incorrectes

**Problème** : Nginx ne pouvait pas accéder aux fichiers du frontend (erreur 403 Permission denied).

**Solution** : Configuration automatique des permissions 755 sur tous les dossiers parents :

```bash
chmod 755 /home/$APP_USER
chmod 755 "$INSTALL_DIR"
chmod 755 "$INSTALL_DIR/frontend"
chmod 755 "$INSTALL_DIR/frontend/dist"
find "$INSTALL_DIR/frontend/dist" -type d -exec chmod 755 {} \;
find "$INSTALL_DIR/frontend/dist" -type f -exec chmod 644 {} \;
```

### 6. Erreur Git "dubious ownership"

**Problème** : Lors d'un `git pull` en tant que root, Git refusait d'opérer à cause de problèmes de propriété.

**Solution** : Configuration de `safe.directory` pour root et l'utilisateur app :

```bash
git config --global --add safe.directory "$INSTALL_DIR"
su - $APP_USER -c "git config --global --add safe.directory $INSTALL_DIR"
```

### 7. Service PM2 non activé automatiquement

**Problème** : Le service systemd PM2 n'était pas activé, donc le backend ne redémarrait pas au reboot du serveur.

**Solution** : Activation explicite du service après sa création :

```bash
env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
su - $APP_USER -c "pm2 save"
systemctl enable pm2-$APP_USER
```

### 8. Fichier de configuration amélioré

**Amélioration** : Le fichier `/home/quizapp/quiz-musical-config.txt` généré est maintenant plus complet et mieux formaté avec :

- Toutes les informations de connexion
- Commandes utiles organisées par catégorie
- Avertissements de sécurité
- Format lisible et structuré

## Impact

Avec ces corrections, le script `install-full-auto.sh` :

- ✅ Fonctionne sans aucune intervention manuelle
- ✅ Évite tous les pièges rencontrés lors de l'installation initiale
- ✅ Génère une configuration complète et correcte
- ✅ Configure tous les services pour démarrer automatiquement
- ✅ Peut être réexécuté en cas de besoin

## Vérification

Pour vérifier que votre installation a bénéficié de toutes ces corrections :

```bash
# 1. Vérifier le script seed
cd /home/quizapp/quiz-musical/backend
npm run seed --help

# 2. Vérifier tsconfig.json
grep -A 1 '"exclude"' tsconfig.json
# Doit afficher : ["node_modules", "dist", "prisma"]

# 3. Vérifier vite-env.d.ts
ls -l /home/quizapp/quiz-musical/frontend/src/vite-env.d.ts

# 4. Vérifier postcss.config.js
grep "export default" /home/quizapp/quiz-musical/frontend/postcss.config.js

# 5. Vérifier permissions
ls -ld /home/quizapp /home/quizapp/quiz-musical /home/quizapp/quiz-musical/frontend/dist
# Tous doivent avoir drwxr-xr-x (755)

# 6. Vérifier Git safe.directory
git config --get-all safe.directory

# 7. Vérifier PM2 service
systemctl status pm2-quizapp

# 8. Vérifier le fichier de configuration
ls -l /home/quizapp/quiz-musical-config.txt
cat /home/quizapp/quiz-musical-config.txt
```

## Historique

- **2026-06-21** : Installation initiale sur recalbox.live avec corrections manuelles
- **2026-06-21** : Intégration de toutes les corrections dans le script automatique (commit 7e425ea)

## Références

- Installation testée avec succès sur : https://recalbox.live
- Commit GitHub : https://github.com/Cailloux4520/quiz-musical/commit/7e425ea
- Documentation complète : [AUTO_INSTALL.md](../AUTO_INSTALL.md)
