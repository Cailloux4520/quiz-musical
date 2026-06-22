# Guide d'Installation Détaillé - MyQuiz

Guide complet pour installer et démarrer MyQuiz en développement local.

## Prérequis

- **Node.js** 18.x ou supérieur ([Télécharger](https://nodejs.org/))
- **Docker Desktop** ([Télécharger](https://www.docker.com/products/docker-desktop))
- **Git** ([Télécharger](https://git-scm.com/))
- **Éditeur de code** (VS Code recommandé)

## Installation Complète

### 1. Cloner le Repository

```bash
git clone https://github.com/Cailloux4520/quiz-musical.git
cd quiz-musical
```

### 2. Démarrer PostgreSQL avec Docker

```bash
docker-compose up -d
```

Cela démarre PostgreSQL sur le port 5432.

### 3. Configurer le Backend

```bash
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env si nécessaire (les valeurs par défaut fonctionnent)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quiz_musical
```

### 4. Initialiser la Base de Données

```bash
# Créer les tables
npx prisma db push

# (Optionnel) Générer des données de test
npm run seed
```

### 5. Démarrer le Backend

```bash
npm run dev
```

Le backend démarre sur http://localhost:5000

### 6. Configurer le Frontend (Nouveau Terminal)

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
# Par défaut: VITE_API_URL=http://localhost:5000
```

### 7. Démarrer le Frontend

```bash
npm run dev
```

Le frontend démarre sur http://localhost:5173

## Accès à l'Application

### Frontend
http://localhost:5173

### Backend API
http://localhost:5000

### Compte Admin par Défaut

**IMPORTANT**: À changer immédiatement en production !

- **Email**: admin@quiz.com
- **Password**: admin123

## Structure du Projet

```
quiz-musical/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── routes/      # Routes API
│   │   ├── services/    # Logique métier
│   │   ├── middlewares/ # Auth, validation
│   │   └── index.ts     # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma # Schéma de base de données
│   └── package.json
│
├── frontend/            # Application React
│   ├── src/
│   │   ├── pages/       # Pages React
│   │   ├── components/  # Composants réutilisables
│   │   ├── store/       # State management (Zustand)
│   │   └── services/    # API calls
│   └── package.json
│
├── docker-compose.yml   # PostgreSQL pour dev
└── README.md
```

## Commandes Utiles

### Backend

```bash
# Développement avec hot reload
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name ma_migration

# Ouvrir Prisma Studio (GUI base de données)
npx prisma studio
```

### Frontend

```bash
# Développement
npm run dev

# Build pour production
npm run build

# Preview du build de production
npm run preview

# Linter
npm run lint

# Tests (si configurés)
npm test
```

### Docker

```bash
# Démarrer PostgreSQL
docker-compose up -d

# Arrêter PostgreSQL
docker-compose down

# Voir les logs
docker-compose logs -f

# Recréer les containers
docker-compose up -d --force-recreate

# Supprimer volumes et données
docker-compose down -v
```

## Configuration des Variables d'Environnement

### Backend (.env)

```env
# Port du serveur
PORT=5000

# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quiz_musical"

# JWT pour l'authentification
JWT_SECRET=votre_secret_jwt_changez_moi_en_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Upload de fichiers
MAX_FILE_SIZE=52428800

# Environment
NODE_ENV=development
```

### Frontend (.env)

```env
# URL de l'API backend
VITE_API_URL=http://localhost:5000

# URL WebSocket
VITE_SOCKET_URL=http://localhost:5000
```

## Résolution des Problèmes

### Le backend ne démarre pas

**Erreur**: "Port 5000 already in use"

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Erreur**: "Can't reach database server"

```bash
# Vérifier que Docker tourne
docker ps

# Redémarrer PostgreSQL
docker-compose restart

# Vérifier les logs
docker-compose logs postgres
```

### Le frontend ne compile pas

**Erreur**: "Module not found"

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

**Erreur**: Build très lent

```bash
# Augmenter la mémoire allouée à Node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Erreurs de connexion API

**Erreur**: "Network Error" ou CORS

1. Vérifier que le backend tourne sur http://localhost:5000
2. Vérifier VITE_API_URL dans frontend/.env
3. Vérifier CORS_ORIGIN dans backend/.env

### Base de données

**Réinitialiser complètement la DB:**

```bash
# Supprimer et recréer
docker-compose down -v
docker-compose up -d
cd backend
npx prisma db push
npm run seed  # Si vous avez un script seed
```

**Accéder à PostgreSQL:**

```bash
# Via Docker
docker exec -it quiz-musical-postgres-1 psql -U postgres quiz_musical

# Via psql local (si installé)
psql -U postgres -h localhost -d quiz_musical
```

## Développement

### Hot Reload

Les deux applications supportent le hot reload:
- **Backend**: Nodemon redémarre automatiquement le serveur
- **Frontend**: Vite recharge automatiquement le navigateur

### Prisma Studio

Interface graphique pour visualiser et éditer la base de données:

```bash
cd backend
npx prisma studio
```

Accès: http://localhost:5555

### Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint
npm run lint:fix

# Frontend
cd frontend
npm run lint
```

## Prochaines Étapes

1. **Créer votre premier quiz**: Connectez-vous à http://localhost:5173/login
2. **Tester une session**: Créez une session et rejoignez-la depuis plusieurs onglets
3. **Explorer l'API**: Consultez [docs/API.md](docs/API.md)
4. **Comprendre Socket.io**: Consultez [docs/SOCKET_EVENTS.md](docs/SOCKET_EVENTS.md)

## Ressources

- [Documentation API](docs/API.md)
- [Événements Socket.io](docs/SOCKET_EVENTS.md)
- [Guide de Déploiement](docs/DEPLOYMENT.md)
- [Plan du Projet](PLAN.md)

## Support

Des questions ? 
- [Créer une issue](https://github.com/Cailloux4520/quiz-musical/issues)
- Email: support@quiz-app.com
