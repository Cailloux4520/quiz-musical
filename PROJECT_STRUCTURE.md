# Structure du Projet - Quiz Musical

Arborescence complète du projet avec explications.

---

## 📁 Vue d'Ensemble

```
quiz-musical/
├── 📄 README.md                    # Présentation du projet
├── 📋 PLAN.md                      # Plan détaillé (architecture, design, features)
├── ✅ TODO.md                      # Liste des tâches de développement
├── 🚀 GETTING_STARTED.md           # Guide de démarrage rapide
├── 🤝 CONTRIBUTING.md              # Guide de contribution
├── 📜 LICENSE                      # Licence MIT
├── 🔧 .env.example                 # Template variables d'environnement
├── 🙈 .gitignore                   # Fichiers ignorés par Git
├── 🐳 docker-compose.yml           # Services Docker (PostgreSQL, MinIO, Redis)
│
├── 📁 frontend/                    # Application React (Vite + Tailwind)
│   ├── public/                     # Assets statiques
│   ├── src/
│   │   ├── components/             # Composants réutilisables
│   │   │   ├── common/             # Boutons, cartes, modals
│   │   │   ├── admin/              # Composants dashboard admin
│   │   │   ├── master/             # Composants écran maître
│   │   │   └── player/             # Composants interface joueur
│   │   ├── pages/                  # Pages principales
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── QuizEditor.tsx
│   │   │   ├── MasterScreen.tsx
│   │   │   ├── PlayerJoin.tsx
│   │   │   └── PlayerGame.tsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useSocket.ts        # Gestion Socket.io
│   │   │   ├── useAuth.ts          # Gestion authentification
│   │   │   └── useAudio.ts         # Gestion lecture audio
│   │   ├── store/                  # État global (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── quizStore.ts
│   │   │   └── sessionStore.ts
│   │   ├── services/               # Appels API
│   │   │   ├── api.ts              # Client REST
│   │   │   └── socket.ts           # Client Socket.io
│   │   ├── utils/                  # Utilitaires
│   │   │   ├── scoreCalculator.ts
│   │   │   └── theme.ts
│   │   ├── styles/                 # Styles globaux
│   │   │   ├── globals.css
│   │   │   └── themes.css          # Définitions des 3 thèmes
│   │   ├── App.tsx                 # Composant racine
│   │   └── main.tsx                # Point d'entrée
│   ├── package.json                # Dépendances frontend
│   ├── vite.config.ts              # Configuration Vite
│   ├── tailwind.config.js          # Configuration Tailwind
│   ├── tsconfig.json               # Configuration TypeScript
│   └── .env.example                # Variables d'env frontend
│
├── 📁 backend/                     # API Node.js (Express + Socket.io)
│   ├── src/
│   │   ├── controllers/            # Logique des routes
│   │   │   ├── authController.ts   # Login, vérification token
│   │   │   ├── quizController.ts   # CRUD quiz
│   │   │   ├── sessionController.ts# Gestion sessions
│   │   │   └── uploadController.ts # Upload S3
│   │   ├── services/               # Logique métier
│   │   │   ├── sessionService.ts   # Gestion état session
│   │   │   ├── scoreService.ts     # Calcul scores
│   │   │   └── storageService.ts   # Upload S3
│   │   ├── socket/                 # Gestion temps réel
│   │   │   ├── handlers/
│   │   │   │   ├── playerHandlers.ts   # player:join, answer:submit
│   │   │   │   ├── masterHandlers.ts   # session:start, question:next
│   │   │   │   └── sessionHandlers.ts  # Lifecycle session
│   │   │   └── socketServer.ts         # Configuration Socket.io
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.ts             # Vérification JWT
│   │   │   ├── errorHandler.ts     # Gestion erreurs
│   │   │   └── validation.ts       # Validation données
│   │   ├── routes/                 # Routes API REST
│   │   │   ├── auth.ts             # POST /api/auth/login
│   │   │   ├── quiz.ts             # CRUD /api/quiz
│   │   │   ├── session.ts          # /api/session
│   │   │   └── upload.ts           # POST /api/upload/sign-url
│   │   ├── prisma/                 # ORM Base de données
│   │   │   ├── schema.prisma       # Schéma BDD (User, Quiz, Question, Session...)
│   │   │   └── migrations/         # Migrations SQL
│   │   ├── utils/                  # Utilitaires
│   │   │   ├── jwt.ts              # Génération/validation JWT
│   │   │   └── inviteCode.ts       # Génération codes session
│   │   ├── config/                 # Configuration
│   │   │   └── env.ts              # Variables d'environnement
│   │   └── server.ts               # Point d'entrée (Express + Socket.io)
│   ├── package.json                # Dépendances backend
│   ├── tsconfig.json               # Configuration TypeScript
│   └── .env.example                # Variables d'env backend
│
└── 📁 docs/                        # Documentation
    ├── 📖 API.md                   # Documentation endpoints REST
    ├── 🔌 SOCKET_EVENTS.md         # Documentation événements Socket.io
    └── 🚀 DEPLOYMENT.md            # Guide de déploiement (Vercel + Railway)
```

---

## 🎯 Points d'Entrée

### Frontend
- **Développement** : `frontend/src/main.tsx`
- **Routing** : `frontend/src/App.tsx`
- **Build** : `npm run build` → `frontend/dist/`

### Backend
- **Développement** : `backend/src/server.ts`
- **Build** : `npm run build` → `backend/dist/`
- **Base de données** : `backend/prisma/schema.prisma`

---

## 🔧 Fichiers de Configuration

### Frontend
| Fichier | Description |
|---------|-------------|
| `vite.config.ts` | Configuration Vite (build, dev server) |
| `tailwind.config.js` | Configuration Tailwind CSS (thèmes) |
| `tsconfig.json` | Configuration TypeScript |
| `.env` | Variables d'environnement (VITE_API_URL, etc.) |

### Backend
| Fichier | Description |
|---------|-------------|
| `tsconfig.json` | Configuration TypeScript |
| `schema.prisma` | Schéma de base de données Prisma |
| `.env` | Variables d'environnement (DATABASE_URL, JWT_SECRET, etc.) |

### Docker
| Fichier | Description |
|---------|-------------|
| `docker-compose.yml` | PostgreSQL, MinIO, Redis |

---

## 📦 Dépendances Principales

### Frontend

#### Production
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.14.0",
  "socket.io-client": "^4.7.0",
  "zustand": "^4.3.0",
  "howler": "^2.2.3",
  "framer-motion": "^10.12.0",
  "tailwindcss": "^3.3.0"
}
```

#### Développement
```json
{
  "vite": "^4.4.0",
  "@types/react": "^18.2.0",
  "typescript": "^5.1.0",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0",
  "vitest": "^0.34.0",
  "@testing-library/react": "^14.0.0"
}
```

### Backend

#### Production
```json
{
  "express": "^4.18.0",
  "socket.io": "^4.7.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "aws-sdk": "^2.1400.0",
  "cors": "^2.8.5"
}
```

#### Développement
```json
{
  "typescript": "^5.1.0",
  "prisma": "^5.0.0",
  "ts-node": "^10.9.0",
  "jest": "^29.6.0",
  "supertest": "^6.3.0",
  "eslint": "^8.45.0",
  "nodemon": "^3.0.0"
}
```

---

## 🗂️ Organisation des Composants Frontend

### Structure recommandée

```
components/
├── common/                 # Composants UI génériques
│   ├── Button.tsx         # Bouton réutilisable
│   ├── Card.tsx           # Carte de contenu
│   ├── Modal.tsx          # Modal générique
│   ├── Input.tsx          # Input formulaire
│   ├── Loader.tsx         # Indicateur de chargement
│   └── Toast.tsx          # Notification toast
│
├── admin/                  # Composants dashboard admin
│   ├── QuizList.tsx       # Liste des quiz
│   ├── QuizCard.tsx       # Carte d'un quiz
│   ├── QuizForm.tsx       # Formulaire création/édition
│   ├── QuestionEditor.tsx # Éditeur de question
│   ├── ThemeSelector.tsx  # Sélecteur de thème visuel
│   └── FileUploader.tsx   # Upload audio/image
│
├── master/                 # Composants écran maître
│   ├── Lobby.tsx          # Écran d'attente joueurs
│   ├── QuestionDisplay.tsx# Affichage question
│   ├── AnswerStats.tsx    # Statistiques réponses temps réel
│   ├── Leaderboard.tsx    # Classement intermédiaire
│   └── Podium.tsx         # Podium final animé
│
└── player/                 # Composants interface joueur
    ├── JoinForm.tsx       # Formulaire rejoindre session
    ├── WaitingRoom.tsx    # Salle d'attente
    ├── QuestionView.tsx   # Vue question joueur
    ├── AnswerButtons.tsx  # Boutons de réponse QCM
    ├── FeedbackScreen.tsx # Feedback réponse (✅/❌)
    └── ScoreDisplay.tsx   # Affichage score personnel
```

---

## 🔌 Routes API Backend

### Authentification
```
POST   /api/auth/login      # Login admin
GET    /api/auth/me         # Vérifier token
```

### Quiz
```
GET    /api/quiz            # Lister quiz
GET    /api/quiz/:id        # Récupérer un quiz
POST   /api/quiz            # Créer un quiz
PUT    /api/quiz/:id        # Modifier un quiz
DELETE /api/quiz/:id        # Supprimer un quiz
```

### Questions
```
POST   /api/quiz/:quizId/question        # Ajouter question
PUT    /api/quiz/:quizId/question/:id    # Modifier question
DELETE /api/quiz/:quizId/question/:id    # Supprimer question
POST   /api/quiz/:quizId/question/:id/reorder  # Réordonner
```

### Sessions
```
POST   /api/session             # Créer session
GET    /api/session/:inviteCode # Récupérer session
DELETE /api/session/:id         # Terminer session
GET    /api/session/:id/leaderboard  # Classement final
```

### Upload
```
POST   /api/upload/sign-url    # Générer URL S3 présignée
```

---

## 🔄 Événements Socket.io

### Joueur → Serveur
- `player:join` : Rejoindre session
- `answer:submit` : Envoyer réponse

### Animateur → Serveur
- `session:start` : Lancer session
- `question:next` : Question suivante
- `session:finish` : Terminer session

### Serveur → Tous
- `session:started` : Partie lancée
- `question:show` : Nouvelle question
- `question:end` : Temps écoulé
- `leaderboard:update` : Classement mis à jour
- `session:finished` : Partie terminée

### Serveur → Joueur
- `player:joined` : Confirmation connexion
- `answer:feedback` : Résultat réponse

### Serveur → Écran Maître
- `answer:stats` : Stats réponses temps réel

---

## 🎨 Thèmes Visuels

### Configuration Tailwind

Les thèmes sont définis dans `tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#1A0533',
          neonPink: '#FF006E',
          neonCyan: '#00F5FF',
          accent: '#FF6B00'
        },
        pop: {
          bg: '#FFE600',
          purple: '#6C2EE3',
          pink: '#FF2882',
          blue: '#1368CE'
        },
        elegant: {
          bg: '#000000',
          gold: '#C9A84C',
          silver: '#D4D4D4',
          bronze: '#8B7355'
        }
      }
    }
  }
}
```

### Application des Thèmes

```tsx
// Composant avec thème
<div className={`theme-${quiz.theme}`}>
  <h1 className="text-retro-neonPink">Titre</h1>
</div>
```

---

## 📊 Base de Données (Prisma)

### Schéma Principal

```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  password String
  quizzes  Quiz[]
}

model Quiz {
  id          String     @id @default(uuid())
  title       String
  theme       String     // 'retro' | 'pop' | 'elegant'
  creatorId   String
  creator     User       @relation(fields: [creatorId], references: [id])
  questions   Question[]
  sessions    Session[]
}

model Question {
  id         String  @id @default(uuid())
  quizId     String
  quiz       Quiz    @relation(fields: [quizId], references: [id])
  type       String  // 'audio' | 'text' | 'image'
  content    String
  answerMode String  // 'mcq' | 'freetext'
  // ... autres champs
}

model Session {
  id          String   @id @default(uuid())
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id])
  inviteCode  String   @unique
  status      String   // 'waiting' | 'active' | 'finished'
  players     Player[]
  responses   Response[]
}

model Player {
  id        String     @id @default(uuid())
  sessionId String
  session   Session    @relation(fields: [sessionId], references: [id])
  pseudo    String
  team      String
  score     Int        @default(0)
  responses Response[]
}

model Response {
  id             String   @id @default(uuid())
  playerId       String
  player         Player   @relation(fields: [playerId], references: [id])
  sessionId      String
  session        Session  @relation(fields: [sessionId], references: [id])
  questionId     String
  answer         String
  isCorrect      Boolean
  responseTimeMs Int
  points         Int
}
```

---

## 🧪 Tests

### Structure des Tests

```
backend/src/
├── controllers/
│   └── __tests__/
│       ├── authController.test.ts
│       └── quizController.test.ts
├── services/
│   └── __tests__/
│       ├── sessionService.test.ts
│       └── scoreService.test.ts

frontend/src/
├── components/
│   └── __tests__/
│       ├── Button.test.tsx
│       └── PlayerCard.test.tsx
├── hooks/
│   └── __tests__/
│       └── useSocket.test.ts
```

---

## 📈 Métriques & Monitoring

### Sentry (Erreurs)
- Frontend : `@sentry/react`
- Backend : `@sentry/node`

### Datadog (Performances)
- APM : `dd-trace`
- Logs : `winston` + Datadog integration

### Analytics (Optionnel)
- Plausible Analytics
- Google Analytics (GA4)

---

## 🚀 Commandes Utiles

### Développement

```bash
# Démarrer tous les services
docker-compose up -d

# Frontend
cd frontend
npm run dev          # Démarrer dev server (port 5173)
npm run build        # Build production
npm run preview      # Preview du build
npm test             # Lancer tests
npm run lint         # Vérifier le code

# Backend
cd backend
npm run dev          # Démarrer avec nodemon (port 3000)
npm run build        # Compiler TypeScript
npm start            # Lancer version compilée
npm test             # Lancer tests
npx prisma studio    # Interface BDD visuelle
npx prisma migrate dev  # Créer migration
```

### Production

```bash
# Déployer frontend (Vercel)
cd frontend
vercel --prod

# Déployer backend (Railway)
cd backend
railway up

# Migrations BDD
railway run npx prisma migrate deploy
```

---

## 📚 Documentation Complète

- [README.md](../README.md) : Vue d'ensemble
- [PLAN.md](../PLAN.md) : Plan détaillé (160+ pages)
- [TODO.md](../TODO.md) : Tâches de développement
- [GETTING_STARTED.md](../GETTING_STARTED.md) : Démarrage rapide
- [CONTRIBUTING.md](../CONTRIBUTING.md) : Guide de contribution
- [docs/API.md](./API.md) : Documentation API REST
- [docs/SOCKET_EVENTS.md](./SOCKET_EVENTS.md) : Événements Socket.io
- [docs/DEPLOYMENT.md](./DEPLOYMENT.md) : Guide de déploiement

---

**Dernière mise à jour** : 21 juin 2026
