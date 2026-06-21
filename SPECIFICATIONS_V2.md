# Spécifications Techniques - Quiz Musical V2

## 📋 Vue d'Ensemble

Application de quiz musical en temps réel avec gestion d'équipes, médiathèque, et types de questions variés (audio, image, blind test, YouTube).

---

## 👥 Système de Rôles

### Administrateur
**Permissions :**
- ✅ Créer/modifier/supprimer des utilisateurs
- ✅ Gérer tous les quiz (tous créateurs)
- ✅ Gérer les thèmes globaux
- ✅ Gérer la médiathèque globale
- ✅ Accès aux statistiques globales
- ✅ Exporter données système

**Base de données :**
```prisma
role: "admin"
```

---

### Créateur
**Permissions :**
- ✅ Créer des quiz illimités
- ✅ Modifier/supprimer ses propres quiz
- ✅ Importer questions via Excel
- ✅ Uploader médias (audio, images)
- ✅ Accès à sa médiathèque personnelle

**Base de données :**
```prisma
role: "creator"
```

---

### Animateur
**Permissions :**
- ✅ Lancer des sessions de jeu
- ✅ Piloter une partie (play/pause/next)
- ✅ Afficher résultats intermédiaires
- ✅ Terminer une session
- ✅ Exporter résultats de session
- ❌ Créer/modifier quiz

**Base de données :**
```prisma
role: "animator"
```

---

### Joueur
**Permissions :**
- ✅ Rejoindre session via lien/QR/code
- ✅ Créer ou rejoindre équipe
- ✅ Répondre aux questions
- ✅ Voir son score en temps réel

**Note :** Pas de compte requis - connexion anonyme avec pseudo

---

## 🎮 Création de Quiz

### Champs Quiz
```typescript
interface Quiz {
  id: string;
  title: string;
  description?: string;
  theme: ThemeId; // annees80, annees90, jeuxvideo, cinema, etc.
  defaultTimePerQuestion: number; // En secondes (ex: 30)
  userId: string; // Créateur
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Nombre de Questions
- **Illimité** - pas de limite technique
- Recommandation UX : 10-30 questions pour une session de 20-40 minutes

---

## 📝 Types de Questions

### 1. Question Texte (QCM)
**Description :** Question textuelle avec 4 choix de réponse

**Champs :**
```typescript
{
  type: "text_qcm",
  content: string, // Texte de la question
  choices: string[], // 4 options (A, B, C, D)
  correctIndex: number, // 0-3
  timeLimit: number, // Secondes
  points: number, // Points max
  customTheme?: string // Optionnel
}
```

**Exemple :**
```json
{
  "type": "text_qcm",
  "content": "Quel artiste a sorti l'album 'Thriller' en 1982 ?",
  "choices": ["Prince", "Michael Jackson", "Madonna", "David Bowie"],
  "correctIndex": 1,
  "timeLimit": 20,
  "points": 1000
}
```

---

### 2. Question Texte (Libre)
**Description :** Réponse textuelle libre

**Champs :**
```typescript
{
  type: "text_free",
  content: string,
  correctAnswer: string, // Réponse attendue
  acceptedAnswers?: string[], // Variantes acceptées
  caseSensitive: boolean,
  timeLimit: number,
  points: number
}
```

**Exemple :**
```json
{
  "type": "text_free",
  "content": "Quelle chanteuse française est surnommée 'la Môme' ?",
  "correctAnswer": "Édith Piaf",
  "acceptedAnswers": ["Piaf", "Edith Piaf"],
  "caseSensitive": false
}
```

---

### 3. Question Image
**Description :** Question avec image d'illustration

**Champs :**
```typescript
{
  type: "image_qcm",
  content: string,
  imageUrl: string, // URL MinIO
  choices: string[],
  correctIndex: number,
  timeLimit: number,
  points: number
}
```

**Formats supportés :** JPG, PNG, WEBP  
**Taille max :** 5 MB  
**Dimensions recommandées :** 1920x1080

---

### 4. Question Audio
**Description :** Extrait audio à écouter

**Champs :**
```typescript
{
  type: "audio_qcm",
  content: string,
  audioUrl: string, // URL MinIO
  startTime: number, // Secondes (début extrait)
  endTime: number, // Secondes (fin extrait)
  duration: number, // Durée totale audio
  choices: string[],
  correctIndex: number,
  timeLimit: number,
  points: number
}
```

**Formats supportés :** MP3, WAV, OGG  
**Taille max :** 20 MB  
**Durée recommandée :** 10-30 secondes

**Flux de jeu :**
1. Afficher question + timer pause
2. Lancer audio automatiquement
3. Fin audio → démarrer timer réponse
4. Joueurs répondent pendant timeLimit

---

### 5. Blind Test
**Description :** Identifier titre/artiste d'un extrait musical

**Champs :**
```typescript
{
  type: "blind_test",
  audioUrl: string,
  startTime: number,
  endTime: number,
  question: "title" | "artist" | "year" | "album",
  correctAnswer: string,
  choices: string[], // 4 options
  correctIndex: number,
  timeLimit: number,
  points: number
}
```

**Exemples de questions :**
- Quel est le **titre** de cette chanson ?
- Qui est l'**artiste** ?
- En quelle **année** est sortie cette chanson ?
- Sur quel **album** figure ce titre ?

---

### 6. Pochette d'Album
**Description :** Identifier album/artiste depuis pochette

**Champs :**
```typescript
{
  type: "album_cover",
  imageUrl: string, // Pochette d'album
  question: "album" | "artist",
  correctAnswer: string,
  choices: string[],
  correctIndex: number,
  timeLimit: number,
  points: number
}
```

**Exemples :**
- Quel est le nom de cet **album** ?
- Quel **artiste** a sorti cet album ?

---

### 7. Question YouTube
**Description :** Vidéo YouTube (audio uniquement pendant la question)

**Champs :**
```typescript
{
  type: "youtube",
  youtubeUrl: string, // https://youtube.com/watch?v=xxxxx
  startTime: number, // Début extrait (secondes)
  endTime: number, // Fin extrait
  showVideoDuringQuestion: false, // TOUJOURS false
  showVideoAfterAnswer: boolean, // Afficher après réponse
  content: string,
  choices: string[],
  correctIndex: number,
  timeLimit: number,
  points: number
}
```

**⚠️ IMPORTANT - Gestion YouTube :**
- Vidéo **jamais** affichée pendant la phase de réponse
- Audio uniquement (lecteur masqué ou iframe audio-only)
- Vidéo affichable après révélation réponse (optionnel)
- **Avertissement légal :** L'organisateur doit posséder les droits sur les médias utilisés

---

## 📦 Médiathèque

### Fonctionnalités
1. **Upload de fichiers**
   - Drag & drop
   - Multi-upload
   - Preview immédiat
   
2. **Gestion**
   - Recherche par nom/type/date
   - Filtres (audio, image)
   - Tri (date, taille, nom)
   - Suppression
   
3. **Aperçu**
   - Player audio intégré
   - Visionneuse image
   - Métadonnées (taille, format, durée)

### Structure Base de Données
```prisma
model Media {
  id          String   @id @default(uuid())
  filename    String   // Nom original
  filepath    String   // Chemin MinIO
  url         String   // URL publique
  type        String   // "audio" | "image"
  format      String   // "mp3", "jpg", etc.
  size        Int      // Bytes
  duration    Int?     // Secondes (audio uniquement)
  userId      String   // Propriétaire
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@map("media")
}
```

### Formats Supportés

**Audio :**
- MP3 (recommandé)
- WAV
- OGG

**Images :**
- JPG/JPEG
- PNG
- WEBP

### Limites
- **Audio :** 20 MB max
- **Image :** 5 MB max
- **Total par utilisateur :** 1 GB (configurable)

---

## 📊 Import/Export Excel

### Import XLSX

**Colonnes :**
| Colonne | Type | Requis | Description |
|---------|------|--------|-------------|
| Question | Texte | ✅ | Texte de la question |
| Type | Texte | ✅ | text_qcm, audio_qcm, blind_test, etc. |
| RéponseA | Texte | ✅ | Choix A |
| RéponseB | Texte | ✅ | Choix B |
| RéponseC | Texte | ✅ | Choix C |
| RéponseD | Texte | ✅ | Choix D |
| BonneRéponse | Nombre | ✅ | 0-3 (index correct) |
| TexteRéponse | Texte | ❌ | Réponse textuelle libre |
| Temps | Nombre | ✅ | Secondes |
| Audio | Texte | ❌ | Nom fichier audio (doit exister en médiathèque) |
| Image | Texte | ❌ | Nom fichier image |
| ThemeQuestion | Texte | ❌ | Thème personnalisé |

**Exemple de fichier :**
```
Question                                      | Type       | RéponseA         | RéponseB        | RéponseC      | RéponseD       | BonneRéponse | Temps | Audio           | Image
Qui a chanté "Bohemian Rhapsody" ?            | text_qcm   | Queen            | The Beatles     | Led Zeppelin  | Pink Floyd     | 0            | 20    |                 |
Identifiez cette chanson                      | blind_test | Imagine          | Hey Jude        | Yesterday     | Let It Be      | 0            | 30    | imagine.mp3     |
Quel est cet album ?                          | album_cover| Abbey Road       | Sgt Pepper      | White Album   | Revolver       | 0            | 25    |                 | abbey_road.jpg
```

**Endpoint API :**
```
POST /api/quiz/:quizId/import-excel
Content-Type: multipart/form-data

Body: {
  file: <xlsx file>
}
```

### Export XLSX

**Fonctionnalité :** Exporter toutes les questions d'un quiz au format Excel

**Endpoint :**
```
GET /api/quiz/:quizId/export-excel
```

**Génération :** Utiliser librairie `exceljs` côté backend

---

## 🎯 Session de Jeu

### Création Session

**Générer automatiquement :**
1. **Code aléatoire** : 6 caractères alphanumériques (ex: `ABC123`, `XY7Z4M`)
2. **QR Code** : Image PNG du lien de session
3. **URL unique** : `https://recalbox.live/join/ABC123`

**Librairies :**
- Génération code : crypto.randomBytes
- QR Code : `qrcode` (npm)

**Endpoint :**
```typescript
POST /api/session/create
{
  quizId: string
}

Response:
{
  sessionId: string,
  inviteCode: string,
  joinUrl: string,
  qrCodeUrl: string // URL image QR
}
```

### QR Code Stockage
- Générer image PNG
- Upload vers MinIO
- Retourner URL publique
- Afficher sur écran animateur

---

## 👥 Salle d'Attente

### Affichage

**Écran Animateur :**
- Logo du quiz
- Titre du quiz
- Code de session (gros caractères)
- QR Code
- Liste joueurs connectés en temps réel
- Nombre d'équipes
- Compteur joueurs
- Bouton "Démarrer"

**Écran Joueur :**
- Logo quiz
- Message "En attente du début..."
- Liste des joueurs dans mon équipe
- Total joueurs connectés

**Animations thématiques :**
- Années 80 : néons, cassettes qui défilent
- Années 90 : CD qui tournent
- Jeux Vidéo : pixels, power-ups
- Cinéma : pellicule qui défile

---

## 🧑‍🤝‍🧑 Gestion des Équipes

### Fonctionnalités

**Joueur peut :**
1. **Créer une équipe** : choisir nom d'équipe
2. **Rejoindre équipe existante** : sélectionner dans liste

**Structure :**
```prisma
model Team {
  id        String   @id @default(uuid())
  name      String   // Nom choisi
  score     Int      @default(0)
  sessionId String
  session   Session  @relation(...)
  players   Player[]
  createdAt DateTime @default(now())
  
  @@map("teams")
}

model Player {
  // ... champs existants
  teamId    String?
  team      Team?    @relation(...)
}
```

### Flux Connexion Joueur

1. **Arrivée sur /join/:code**
2. **Entrer pseudo**
3. **Choix :**
   - "Jouer seul" → pas d'équipe (teamId null)
   - "Créer équipe" → modal création
   - "Rejoindre équipe" → sélection liste
4. **Connexion Socket.io**
5. **Redirection salle d'attente**

---

## 📱 Écran Joueur (Mobile)

### Design Responsive

**Contraintes :**
- Optimisé smartphone (320px → 428px)
- Une main utilisable
- Boutons tactiles larges (min 44px)
- Lisibilité maximale

### Affichage Pendant Question

**Top :**
- Thème du quiz (badge)
- Timer circulaire (compte à rebours)

**Centre :**
- Texte de la question (gros)
- Image OU player audio si applicable
- **⚠️ Jamais de vidéo YouTube pendant question**

**Bas :**
- 4 boutons réponse (grille 2x2)
- Couleurs : bleu, rouge, vert, jaune (style Kahoot)

### Après Réponse

**Affichage :**
- ✅ Confirmation "Réponse enregistrée !"
- Temps de réponse : "Tu as répondu en 3.2s"
- Points gagnés : "+847 points"
- Message : "Attente de la question suivante..."
- Loader animé

---

## 🖥️ Écran Animateur (Écran Géant)

### Layout Principal

**Sidebar gauche (20%) :**
- Question actuelle (numéro)
- Temps restant (gros timer)
- Nombre réponses reçues
- Boutons contrôle

**Zone centrale (60%) :**
- Question affichée
- Médias (audio player, image, vidéo YouTube)
- Réponses possibles
- Statistiques temps réel

**Sidebar droite (20%) :**
- Classement live (Top 10)
- Évolution scores
- Graphiques réponses

### Boutons de Contrôle

**Phase Attente :**
- ▶️ **Démarrer session**

**Pendant Question :**
- ⏸️ **Pause** (fige timer)
- ⏭️ **Passer** (question suivante)

**Après Question :**
- 📊 **Afficher stats** (graphique réponses)
- 🏆 **Classement actuel**
- ⏭️ **Question suivante**

**Fin Quiz :**
- 🎉 **Podium final**
- 📥 **Exporter résultats**
- 🔚 **Terminer session**

### Statistiques Temps Réel

**Pendant Question :**
- Barre progression réponses (ex: "24/30 ont répondu")
- Graphique répartition choix (A: 8, B: 12, C: 3, D: 1)

**Après Question :**
- Révéler bonne réponse (animation)
- Graphique final
- Qui a gagné le plus de points
- Temps moyen de réponse

---

## ⚡ Temps Réel (Socket.io)

### Événements Socket

**Client → Serveur :**
```typescript
// Joueur rejoint session
socket.emit('player:join', {
  sessionId: string,
  nickname: string,
  teamId?: string
});

// Joueur répond
socket.emit('answer:submit', {
  sessionId: string,
  questionId: string,
  answerIndex: number,
  timestamp: number // ms depuis début question
});

// Animateur démarre partie
socket.emit('session:start', { sessionId });

// Animateur lance question
socket.emit('question:start', { sessionId, questionIndex });

// Animateur passe question suivante
socket.emit('question:next', { sessionId });

// Animateur termine session
socket.emit('session:end', { sessionId });
```

**Serveur → Clients :**
```typescript
// Nouveau joueur connecté
socket.on('player:joined', (data: {
  player: Player,
  totalPlayers: number,
  teams: Team[]
}));

// Session démarrée
socket.on('session:started', (data: {
  quiz: Quiz,
  totalQuestions: number
}));

// Nouvelle question
socket.on('question:started', (data: {
  question: Question,
  questionNumber: number,
  totalQuestions: number
}));

// Question terminée
socket.on('question:ended', (data: {
  correctAnswer: number,
  statistics: {
    totalAnswers: number,
    distribution: number[] // Répartition par choix
  },
  leaderboard: Player[]
}));

// Mise à jour classement
socket.on('leaderboard:update', (data: {
  players: Player[],
  teams: Team[]
}));

// Session terminée
socket.on('session:finished', (data: {
  finalLeaderboard: Player[],
  topTeams: Team[],
  statistics: SessionStats
}));
```

### Rooms Socket.io

**Organisation :**
```typescript
// Chaque session = une room
socket.join(`session:${sessionId}`);

// Animateur dans room spéciale
socket.join(`master:${sessionId}`);

// Broadcast à tous les joueurs d'une session
io.to(`session:${sessionId}`).emit('question:started', data);

// Broadcast uniquement à l'animateur
io.to(`master:${sessionId}`).emit('stats:update', stats);
```

---

## 🏆 Calcul du Score

### Formule de Score

**Principe :** Plus on répond vite, plus on gagne de points.

**Formule :**
```typescript
function calculateScore(
  isCorrect: boolean,
  responseTime: number, // ms depuis début question
  totalTime: number, // ms total (timeLimit)
  maxPoints: number = 1000
): number {
  if (!isCorrect) return 0;
  
  const remainingTime = totalTime - responseTime;
  const timeRatio = remainingTime / totalTime;
  const score = Math.round(maxPoints * timeRatio);
  
  return Math.max(score, 100); // Minimum 100 points
}
```

**Exemples :**
- Réponse en 1s sur 30s → `1000 * (29/30)` = **967 points**
- Réponse en 15s sur 30s → `1000 * (15/30)` = **500 points**
- Réponse en 29s sur 30s → `1000 * (1/30)` = **100 points** (minimum)
- Réponse incorrecte → **0 points**

### Stockage

**Table Answer :**
```prisma
model Answer {
  id            String   @id @default(uuid())
  questionId    String
  playerId      String
  chosenIndex   Int      // Index choisi
  isCorrect     Boolean
  responseTime  Int      // Millisecondes
  scoreEarned   Int      // Points calculés
  createdAt     DateTime @default(now())
  
  question      Question @relation(...)
  player        Player   @relation(...)
  
  @@map("answers")
}
```

### Calcul Côté Serveur

**⚠️ IMPORTANT :** Calcul **toujours** côté serveur pour éviter triche.

**Flux :**
1. Client envoie `answer:submit` avec timestamp
2. Serveur valide temps (pas de triche)
3. Serveur calcule score
4. Serveur met à jour Player.score
5. Serveur broadcast nouveau classement

---

## 📊 Classements

### Classement Individuel

**Affichage :**
```typescript
interface PlayerRanking {
  rank: number;
  nickname: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  averageResponseTime: number; // ms
  evolution: number; // Positions gagnées/perdues depuis dernière question
}
```

**Tri :** Par score décroissant, puis par temps de réponse moyen si égalité.

### Classement Équipes

**Calcul :** Score = somme des scores de tous les joueurs de l'équipe

```typescript
interface TeamRanking {
  rank: number;
  teamName: string;
  totalScore: number;
  playerCount: number;
  averageScore: number; // totalScore / playerCount
  topPlayer: string; // Meilleur joueur de l'équipe
}
```

### Mise à Jour Temps Réel

**Après chaque question :**
1. Recalculer classements
2. Calculer évolution positions
3. Broadcast `leaderboard:update` à tous

**Animation :**
- Transition douce des positions
- Highlight changements top 3
- Effet visuel sur nouveau leader

---

## 🎉 Podium Final

### Affichage

**Top 3 Joueurs :**
```
       🥇 1er - Alice - 8450 pts
    🥈 2e - Bob - 7890 pts       🥉 3e - Charlie - 7120 pts
```

**Top 3 Équipes :**
```
       🥇 1er - Les Rockeurs - 24500 pts
    🥈 2e - Team Pop - 22100 pts       🥉 3e - Jazz Masters - 19800 pts
```

### Animations

**Effets visuels :**
- 🎊 Confettis animés (canvas ou CSS)
- ✨ Paillettes dorées
- 🎆 Feux d'artifice
- 📸 Flash appareil photo

**Musique :**
- Son de trompette victorieuse
- Musique épique (configurée par thème)

**Librairies :**
- `canvas-confetti` pour confettis
- `react-rewards` pour célébrations
- Audio HTML5 pour musique

---

## 📚 Médiathèque - API

### Endpoints

**Upload fichier :**
```
POST /api/media/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: {
  file: <audio/image file>
  type: "audio" | "image"
}

Response: {
  id: string,
  filename: string,
  url: string,
  type: string,
  format: string,
  size: number,
  duration?: number
}
```

**Liste médias :**
```
GET /api/media?type=audio&search=thriller&sort=date&order=desc

Response: {
  media: Media[],
  total: number,
  page: number,
  limit: number
}
```

**Supprimer média :**
```
DELETE /api/media/:id
```

**Détails média :**
```
GET /api/media/:id
```

---

## 📈 Tableau de Bord

### Statistiques Globales

**Admin Dashboard :**
```typescript
interface DashboardStats {
  totalQuizzes: number;
  totalSessions: number;
  totalPlayers: number; // Unique
  totalQuestionsCreated: number;
  
  topQuizzes: Array<{
    quizId: string;
    title: string;
    timesPlayed: number;
    averageScore: number;
  }>;
  
  recentSessions: Session[];
  
  storageUsed: number; // MB
  storageLimit: number; // MB
}
```

**Graphiques :**
- Sessions par jour (7 derniers jours)
- Top thèmes utilisés
- Questions par type (pie chart)
- Taux participation moyen

---

## 📥 Exports

### Export PDF

**Contenu :**
- En-tête : Titre quiz, date, nombre participants
- Classement final (joueurs + équipes)
- Détail par question :
  - Question
  - Répartition réponses
  - Temps moyen réponse
  - Meilleur joueur sur cette question

**Librairie :** `pdfkit` ou `puppeteer`

**Endpoint :**
```
GET /api/session/:id/export/pdf
```

---

### Export Excel

**Feuilles :**
1. **Résumé** : Infos session, statistiques globales
2. **Classement Joueurs** : Rang, nom, score, statistiques
3. **Classement Équipes** : Rang, nom équipe, score
4. **Détail Questions** : Chaque question avec stats
5. **Réponses Individuelles** : Matrice joueur x question

**Librairie :** `exceljs`

**Endpoint :**
```
GET /api/session/:id/export/excel
```

---

### Export CSV

**Format simple :**
```csv
Rang,Joueur,Équipe,Score,Bonnes Réponses,Mauvaises Réponses,Temps Moyen
1,Alice,Les Rockeurs,8450,15,5,4.2
2,Bob,Team Pop,7890,14,6,5.1
```

**Endpoint :**
```
GET /api/session/:id/export/csv
```

---

## 🧪 Tests

### Tests Unitaires

**Backend :**
- Calcul de score
- Génération code session
- Validation import Excel
- JWT auth

**Frontend :**
- Composants UI
- Hooks personnalisés
- Utilitaires

**Framework :** Jest + React Testing Library

---

### Tests API

**Endpoints testés :**
- Authentification
- CRUD Quiz
- CRUD Questions
- Upload média
- Import Excel
- Création session

**Framework :** Supertest + Jest

**Exemple :**
```typescript
describe('POST /api/quiz', () => {
  it('should create a new quiz', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Quiz Test',
        theme: 'annees80'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.quiz.title).toBe('Quiz Test');
  });
});
```

---

### Tests Socket.io

**Scénarios :**
- Connexion joueur
- Émission réponse
- Mise à jour classement
- Synchronisation multi-clients

**Framework :** `socket.io-client` pour tests

**Exemple :**
```typescript
it('should broadcast new player to all clients', (done) => {
  const client1 = io(SERVER_URL);
  const client2 = io(SERVER_URL);
  
  client2.on('player:joined', (data) => {
    expect(data.player.nickname).toBe('Alice');
    done();
  });
  
  client1.emit('player:join', {
    sessionId: 'test123',
    nickname: 'Alice'
  });
});
```

---

## 🔐 Sécurité & Droits

### Gestion des Droits Médias

**⚠️ IMPORTANT - Clause Légale :**

L'application **ne fournit aucun contenu musical**. L'organisateur doit :
- Posséder les droits sur tous médias uploadés
- Respecter droits d'auteur (SACEM, etc.)
- Utiliser médias libres de droits ou avec licence

**Disclaimer à afficher :**
```
⚠️ Vous vous engagez à n'utiliser que des médias pour lesquels 
vous disposez des droits nécessaires. L'utilisation d'œuvres 
protégées sans autorisation est illégale.
```

**Affichage :**
- Lors upload média
- Lors création quiz
- Dans CGU application

---

## 🗄️ Schéma Base de Données Complet

```prisma
// User avec rôles étendus
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("creator") // "admin" | "creator" | "animator"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  quizzes   Quiz[]
  media     Media[]
  
  @@map("users")
}

// Quiz avec timeLimit par défaut
model Quiz {
  id                      String   @id @default(uuid())
  title                   String
  description             String?
  theme                   String   // annees80, annees90, jeuxvideo, etc.
  defaultTimePerQuestion  Int      @default(30) // Secondes
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  userId    String
  user      User       @relation(fields: [userId], references: [id])
  questions Question[]
  sessions  Session[]
  
  @@map("quizzes")
}

// Question avec types variés
model Question {
  id              String   @id @default(uuid())
  order           Int
  type            String   // "text_qcm", "text_free", "image_qcm", "audio_qcm", "blind_test", "album_cover", "youtube"
  content         String
  
  // Médias
  audioUrl        String?
  imageUrl        String?
  youtubeUrl      String?
  
  // Audio params
  startTime       Int?     // Secondes
  endTime         Int?
  duration        Int?
  
  // Réponses
  choices         String[] // 4 choix
  correctIndex    Int      // 0-3
  correctAnswer   String?  // Pour texte libre
  acceptedAnswers String[] @default([])
  caseSensitive   Boolean  @default(false)
  
  // Config
  timeLimit       Int      @default(30)
  points          Int      @default(1000)
  customTheme     String?  // Optionnel
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  quizId  String
  quiz    Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers Answer[]
  
  @@map("questions")
}

// Session avec QR Code
model Session {
  id         String    @id @default(uuid())
  inviteCode String    @unique
  qrCodeUrl  String?   // URL image QR Code
  status     String    @default("waiting")
  currentQ   Int       @default(0)
  startedAt  DateTime?
  finishedAt DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  quizId  String
  quiz    Quiz     @relation(fields: [quizId], references: [id])
  players Player[]
  teams   Team[]
  
  @@map("sessions")
}

// Team pour jeu en équipe
model Team {
  id        String   @id @default(uuid())
  name      String
  score     Int      @default(0)
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id])
  players   Player[]
  createdAt DateTime @default(now())
  
  @@map("teams")
}

// Player avec équipe optionnelle
model Player {
  id            String   @id @default(uuid())
  nickname      String
  socketId      String?
  score         Int      @default(0)
  correctCount  Int      @default(0)
  wrongCount    Int      @default(0)
  isConnected   Boolean  @default(true)
  joinedAt      DateTime @default(now())
  
  sessionId String
  session   Session @relation(fields: [sessionId], references: [id])
  
  teamId    String?
  team      Team?   @relation(fields: [teamId], references: [id])
  
  answers   Answer[]
  
  @@map("players")
}

// Answer avec temps de réponse et score
model Answer {
  id           String   @id @default(uuid())
  chosenIndex  Int
  isCorrect    Boolean
  responseTime Int      // Millisecondes
  scoreEarned  Int      // Points calculés
  createdAt    DateTime @default(now())
  
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  
  playerId String
  player   Player @relation(fields: [playerId], references: [id])
  
  @@map("answers")
}

// Media pour médiathèque
model Media {
  id        String   @id @default(uuid())
  filename  String
  filepath  String   // Chemin MinIO
  url       String   // URL publique
  type      String   // "audio" | "image"
  format    String   // "mp3", "jpg", etc.
  size      Int      // Bytes
  duration  Int?     // Secondes (audio)
  createdAt DateTime @default(now())
  
  userId String
  user   User   @relation(fields: [userId], references: [id])
  
  @@map("media")
}
```

---

## 🚀 Roadmap de Développement

### Phase 1 : Fondations (Semaine 1-2)
- ✅ Mise à jour schéma Prisma
- ✅ Migration base de données
- ✅ Système de rôles (admin, creator, animator)
- ✅ Médiathèque backend (upload, liste, suppression)
- ✅ Types de questions étendus

### Phase 2 : Interface Création (Semaine 3-4)
- 📝 Éditeur de questions (tous types)
- 📝 Interface médiathèque frontend
- 📝 Import/Export Excel
- 📝 Prévisualisation question

### Phase 3 : Jeu en Équipe (Semaine 5)
- 📝 Création/rejoindre équipe
- 📝 Calcul scores équipes
- 📝 Classement équipes temps réel

### Phase 4 : Écrans Optimisés (Semaine 6-7)
- 📝 Écran joueur mobile responsive
- 📝 Écran animateur écran géant
- 📝 Salle d'attente avec animations
- 📝 QR Code génération

### Phase 5 : Podium & Exports (Semaine 8)
- 📝 Podium final avec animations
- 📝 Export PDF
- 📝 Export Excel
- 📝 Export CSV

### Phase 6 : Dashboard & Stats (Semaine 9)
- 📝 Tableau de bord admin
- 📝 Statistiques globales
- 📝 Graphiques

### Phase 7 : Tests & Polish (Semaine 10)
- 📝 Tests unitaires
- 📝 Tests API
- 📝 Tests Socket.io
- 📝 Optimisations performances

---

## ✅ Prêt à Démarrer ?

Cette spécification couvre l'intégralité des fonctionnalités demandées.

**Prochaine étape recommandée :** Commencer par la **Phase 1 - Fondations**
1. Mettre à jour le schéma Prisma
2. Créer la médiathèque backend
3. Implémenter les nouveaux types de questions
