# Guide de Démarrage - Quiz Musical

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **Docker Desktop** ([télécharger](https://www.docker.com/products/docker-desktop/))
- **Git** ([télécharger](https://git-scm.com/))
- Un éditeur de code (VS Code recommandé)

## Installation pas à pas

### 1. Cloner le projet

```bash
git clone https://github.com/votre-user/quiz-musical.git
cd quiz-musical
```

### 2. Démarrer les services Docker

Lancer PostgreSQL, MinIO et Redis :

```bash
docker-compose up -d
```

Vérifier que les services sont démarrés :

```bash
docker-compose ps
```

Vous devriez voir :
- ✅ `quiz-musical-db` (PostgreSQL) sur port 5432
- ✅ `quiz-musical-storage` (MinIO) sur ports 9000 et 9001
- ✅ `quiz-musical-redis` (Redis) sur port 6379

**Accès MinIO Console** : http://localhost:9001
- User: `minioadmin`
- Password: `minioadmin123`

### 3. Configurer le Backend

```bash
cd backend
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Éditer `.env` et vérifier ces variables :

```env
DATABASE_URL="postgresql://quiz_user:quiz_password@localhost:5432/quiz_musical?schema=public"
JWT_SECRET=votre_secret_a_changer
AWS_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
```

Lancer les migrations Prisma :

```bash
npx prisma migrate dev --name init
```

Générer le client Prisma :

```bash
npx prisma generate
```

(Optionnel) Créer un utilisateur admin :

```bash
npx prisma db seed
```

### 4. Configurer le Frontend

```bash
cd ../frontend
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Éditer `.env` :

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### 5. Lancer l'application

**Terminal 1** - Backend :

```bash
cd backend
npm run dev
```

Le serveur démarre sur http://localhost:3000

**Terminal 2** - Frontend :

```bash
cd frontend
npm run dev
```

L'application est accessible sur http://localhost:5173

## Premiers pas

### Accéder à l'interface admin

1. Ouvrir http://localhost:5173
2. Se connecter avec (si seed effectué) :
   - Email : `admin@quiz.com`
   - Password : `admin123`

### Créer votre premier quiz

1. Cliquer sur **"Nouveau Quiz"**
2. Donner un titre (ex: "Quiz Années 80")
3. Choisir un thème visuel (ex: Rétro/Néon)
4. Ajouter des questions :
   - Type audio : uploader un extrait MP3
   - Type texte : saisir une question
   - Type image : uploader une pochette d'album
5. Définir les réponses et le timer
6. Publier le quiz

### Lancer une session

1. Cliquer sur **"Jouer"** sur votre quiz
2. Copier le lien d'invitation généré
3. Ouvrir l'écran maître (sur votre ordinateur)
4. Ouvrir le lien d'invitation sur votre mobile
5. Saisir un pseudo et une équipe
6. Depuis l'écran maître, cliquer **"Lancer la partie"**

## Commandes utiles

### Backend

```bash
# Démarrer en mode développement
npm run dev

# Lancer les tests
npm run test

# Linter
npm run lint

# Build production
npm run build

# Lancer les migrations Prisma
npx prisma migrate dev

# Ouvrir Prisma Studio (BDD visuelle)
npx prisma studio
```

### Frontend

```bash
# Démarrer en mode développement
npm run dev

# Lancer les tests
npm run test

# Linter
npm run lint

# Build production
npm run build

# Preview du build production
npm run preview
```

### Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f postgres

# Reconstruire les images
docker-compose up -d --build

# Supprimer les volumes (ATTENTION : perte de données)
docker-compose down -v
```

## Résolution de problèmes

### Erreur "Port already in use"

Si un port est déjà utilisé :

```bash
# Vérifier quel processus utilise le port 5432 (PostgreSQL)
netstat -ano | findstr :5432

# Arrêter le service Docker et changer le port dans docker-compose.yml
```

### Erreur de connexion à la BDD

Vérifier que PostgreSQL est bien démarré :

```bash
docker-compose ps postgres
```

Si le service est "Unhealthy", redémarrer :

```bash
docker-compose restart postgres
```

### Erreur d'upload de fichiers

Vérifier que MinIO est accessible :
- Console : http://localhost:9001
- Vérifier que le bucket `quiz-musical-files` existe
- Vérifier la configuration AWS dans `.env`

### Socket.io ne se connecte pas

- Vérifier que le backend est bien démarré
- Vérifier la variable `VITE_SOCKET_URL` dans `.env` frontend
- Ouvrir la console navigateur (F12) pour voir les erreurs

## Structure du projet

```
quiz-musical/
├── backend/          # API Node.js + Socket.io
├── frontend/         # Application React
├── docs/             # Documentation
├── docker-compose.yml
├── PLAN.md           # Plan détaillé du projet
├── TODO.md           # Liste des tâches
└── README.md         # Ce fichier
```

## Prochaines étapes

1. ✅ Lire le [PLAN.md](./PLAN.md) pour comprendre l'architecture complète
2. ✅ Consulter le [TODO.md](./TODO.md) pour voir les tâches de développement
3. ✅ Explorer la [documentation API](./docs/API.md)
4. ✅ Tester l'application en local
5. ✅ Contribuer ! (voir [CONTRIBUTING.md](./CONTRIBUTING.md))

## Besoin d'aide ?

- 📖 [Documentation complète](./docs/)
- 💬 [Discord Community](https://discord.gg/quiz-musical)
- 🐛 [Signaler un bug](https://github.com/votre-user/quiz-musical/issues)
- 📧 Email : support@quiz-app.com

Bon développement ! 🎵
