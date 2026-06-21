# 🚀 Instructions d'Installation et de Démarrage

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **Docker Desktop** ([télécharger](https://www.docker.com/products/docker-desktop/))
- **npm** (inclus avec Node.js)

## Installation

### 1. Démarrer les services Docker

Les services PostgreSQL, MinIO et Redis sont nécessaires pour le backend.

```bash
# À la racine du projet
docker-compose up -d
```

Vérifiez que les services sont démarrés :
```bash
docker-compose ps
```

Vous devriez voir :
- ✅ `quiz-musical-db` (PostgreSQL) sur port 5432
- ✅ `quiz-musical-storage` (MinIO) sur ports 9000 et 9001
- ✅ `quiz-musical-redis` (Redis) sur port 6379

### 2. Configuration du Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Générer le client Prisma
npm run prisma:generate

# Lancer les migrations de base de données
npm run prisma:migrate

# (Optionnel) Remplir la base avec des données de test
npm run prisma:seed
```

### 3. Configuration du Frontend

```bash
# Aller dans le dossier frontend (depuis la racine)
cd frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

## Démarrage

### Option 1 : Démarrage manuel (2 terminaux)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

Le backend démarre sur http://localhost:3000

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

Le frontend démarre sur http://localhost:5173

### Option 2 : Script de démarrage rapide

```bash
# Depuis la racine du projet (Windows PowerShell)
.\start.ps1
```

## Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000/api
- **MinIO Console** : http://localhost:9001 (minioadmin / minioadmin123)

## Compte de test

Utilisez ces identifiants pour vous connecter :
- **Email** : admin@quiz.com
- **Mot de passe** : admin123

## Arrêter l'application

### Arrêter les services
```bash
# Arrêter le backend et frontend (Ctrl+C dans les terminaux)

# Arrêter Docker
docker-compose down
```

## Problèmes courants

### Les migrations Prisma échouent

```bash
cd backend
npx prisma migrate reset
npm run prisma:migrate
npm run prisma:seed
```

### Le port 5173 ou 3000 est déjà utilisé

Modifiez les ports dans :
- Backend : `backend/.env` → PORT=3001
- Frontend : `frontend/vite.config.ts` → server.port

### Docker ne démarre pas

Assurez-vous que Docker Desktop est lancé et que les ports ne sont pas utilisés par d'autres services.

## Développement

### Backend

- **Tests** : Pas encore implémentés
- **Linter** : Utiliser ESLint dans votre IDE
- **Base de données** : `npm run prisma:studio` pour l'interface Prisma Studio

### Frontend

- **Build** : `npm run build`
- **Preview** : `npm run preview`
- **Linter** : `npm run lint`

## Prochaines étapes

1. Créez votre premier quiz depuis le dashboard admin
2. Lancez une session de jeu
3. Rejoignez la partie depuis un autre appareil avec le code d'invitation

Bon quiz musical ! 🎵
