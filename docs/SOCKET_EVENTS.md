# Événements Socket.io - Quiz Musical

Documentation complète des événements Socket.io pour la communication temps réel.

**URL Socket** : `http://localhost:3000` (dev) | `https://api.quiz-app.com` (prod)

---

## 🔌 Connexion

### Client → Serveur

#### Connexion initiale

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### Serveur → Client

#### `connect`

Émis automatiquement lors de la connexion.

```javascript
socket.on('connect', () => {
  console.log('Connected with ID:', socket.id);
});
```

#### `disconnect`

Émis lors de la déconnexion.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

---

## 👤 Joueur

### Client → Serveur

#### `player:join`

Joueur rejoint une session.

**Payload**
```javascript
{
  inviteCode: 'ABC123',     // Code d'invitation (6 caractères)
  pseudo: 'Alice',          // Pseudo du joueur (max 30 caractères)
  team: 'Équipe A'          // Nom de l'équipe (max 30 caractères)
}
```

**Émission**
```javascript
socket.emit('player:join', {
  inviteCode: 'ABC123',
  pseudo: 'Alice',
  team: 'Équipe A'
});
```

### Serveur → Client

#### `player:joined`

Confirmation que le joueur a rejoint la session.

**Payload**
```javascript
{
  playerId: 'uuid',         // ID unique du joueur
  sessionId: 'uuid',        // ID de la session
  pseudo: 'Alice',
  team: 'Équipe A'
}
```

**Écoute**
```javascript
socket.on('player:joined', (data) => {
  console.log('Joined as:', data.pseudo);
  // Sauvegarder playerId en local
});
```

#### `player:joined:error`

Erreur lors de la tentative de rejoindre.

**Payload**
```javascript
{
  error: 'Session not found' | 'Session already started' | 'Pseudo already taken' | 'Session full'
}
```

**Écoute**
```javascript
socket.on('player:joined:error', (data) => {
  alert(data.error);
});
```

---

## 🎮 Session

### Client (Animateur) → Serveur

#### `session:start`

L'animateur lance la session.

**Payload**
```javascript
{
  sessionId: 'uuid'
}
```

**Émission**
```javascript
socket.emit('session:start', {
  sessionId: sessionId
});
```

#### `question:next`

L'animateur passe à la question suivante.

**Payload**
```javascript
{
  sessionId: 'uuid'
}
```

**Émission**
```javascript
socket.emit('question:next', {
  sessionId: sessionId
});
```

#### `session:finish`

L'animateur termine la session.

**Payload**
```javascript
{
  sessionId: 'uuid'
}
```

**Émission**
```javascript
socket.emit('session:finish', {
  sessionId: sessionId
});
```

### Serveur → Tous les Clients

#### `player:connected`

Broadcast quand un nouveau joueur rejoint.

**Payload**
```javascript
{
  player: {
    id: 'uuid',
    pseudo: 'Alice',
    team: 'Équipe A',
    joinedAt: '2026-06-21T10:30:00Z'
  },
  playersCount: 5
}
```

**Écoute (Écran Maître)**
```javascript
socket.on('player:connected', (data) => {
  // Ajouter le joueur à la liste du lobby
  updatePlayersList(data.player);
});
```

#### `player:disconnected`

Broadcast quand un joueur se déconnecte.

**Payload**
```javascript
{
  playerId: 'uuid',
  pseudo: 'Alice',
  playersCount: 4
}
```

**Écoute**
```javascript
socket.on('player:disconnected', (data) => {
  // Retirer le joueur de la liste
  removePlayer(data.playerId);
});
```

#### `session:started`

La session a été lancée par l'animateur.

**Payload**
```javascript
{
  sessionId: 'uuid',
  quizTitle: 'Quiz Années 80',
  questionsCount: 15,
  startedAt: '2026-06-21T10:30:00Z'
}
```

**Écoute (Joueurs)**
```javascript
socket.on('session:started', (data) => {
  // Rediriger vers l'interface de jeu
  navigate('/play/' + data.sessionId + '/game');
});
```

---

## ❓ Questions

### Serveur → Tous les Clients

#### `question:show`

Une nouvelle question est affichée.

**Payload**
```javascript
{
  questionIndex: 0,          // Index de la question (0-based)
  totalQuestions: 15,        // Nombre total de questions
  question: {
    id: 'uuid',
    type: 'audio',           // 'audio' | 'text' | 'image'
    content: 'https://...',  // URL audio/image ou texte
    backgroundImage: 'https://...',
    theme: 'retro',
    answerMode: 'mcq',       // 'mcq' | 'freetext'
    choices: ['A', 'B', 'C', 'D'],  // Si MCQ
    timerSeconds: 30
  },
  startTime: 1624281600000   // Timestamp serveur (ms)
}
```

**Écoute (Joueurs)**
```javascript
socket.on('question:show', (data) => {
  // Afficher la question
  displayQuestion(data.question);
  
  // Démarrer le timer
  startTimer(data.timerSeconds, data.startTime);
  
  // Pré-charger l'audio si type audio
  if (data.question.type === 'audio') {
    preloadAudio(data.question.content);
  }
});
```

#### `audio:play`

Signal pour démarrer la lecture audio (synchronisation).

**Payload**
```javascript
{
  questionId: 'uuid',
  audioUrl: 'https://...',
  playAt: 1624281602000    // Timestamp serveur (ms)
}
```

**Écoute**
```javascript
socket.on('audio:play', (data) => {
  const delay = data.playAt - Date.now();
  setTimeout(() => {
    playAudio(data.audioUrl);
  }, Math.max(0, delay));
});
```

#### `question:end`

Le temps de la question est écoulé.

**Payload**
```javascript
{
  questionId: 'uuid'
}
```

**Écoute (Joueurs)**
```javascript
socket.on('question:end', (data) => {
  // Bloquer les réponses
  disableAnswerInputs();
  
  // Afficher message d'attente
  showWaitingMessage();
});
```

---

## 💬 Réponses

### Client (Joueur) → Serveur

#### `answer:submit`

Joueur envoie sa réponse.

**Payload**
```javascript
{
  sessionId: 'uuid',
  playerId: 'uuid',
  questionId: 'uuid',
  answer: 'Queen',          // String (choix ou texte libre)
  responseTimeMs: 5200      // Temps écoulé depuis affichage (ms)
}
```

**Émission**
```javascript
const responseTime = Date.now() - questionStartTime;

socket.emit('answer:submit', {
  sessionId: sessionId,
  playerId: playerId,
  questionId: questionId,
  answer: selectedAnswer,
  responseTimeMs: responseTime
});
```

### Serveur → Client (Joueur)

#### `answer:feedback`

Feedback sur la réponse du joueur.

**Payload**
```javascript
{
  isCorrect: true,          // La réponse est-elle correcte ?
  correctAnswer: 'Queen',   // La bonne réponse
  points: 850,              // Points gagnés pour cette question
  totalScore: 3450,         // Score total du joueur
  currentRank: 3            // Position actuelle dans le classement
}
```

**Écoute**
```javascript
socket.on('answer:feedback', (data) => {
  if (data.isCorrect) {
    showSuccessAnimation(data.points);
  } else {
    showErrorAnimation(data.correctAnswer);
  }
  
  updateScore(data.totalScore);
  updateRank(data.currentRank);
});
```

### Serveur → Écran Maître

#### `answer:stats`

Statistiques des réponses en temps réel.

**Payload**
```javascript
{
  questionId: 'uuid',
  answersCount: 12,         // Nombre de réponses reçues
  playersCount: 15,         // Nombre total de joueurs
  choicesStats: {           // Distribution des réponses (si MCQ)
    'Queen': 8,
    'The Beatles': 3,
    'Pink Floyd': 1,
    'Led Zeppelin': 0
  }
}
```

**Écoute (Écran Maître)**
```javascript
socket.on('answer:stats', (data) => {
  // Mettre à jour le graphique en temps réel
  updateStatsChart(data.choicesStats);
  
  // Afficher la progression
  updateProgressBar(data.answersCount, data.playersCount);
});
```

---

## 🏆 Classement

### Serveur → Tous les Clients

#### `leaderboard:update`

Classement mis à jour après chaque question.

**Payload**
```javascript
{
  players: [
    {
      id: 'uuid',
      pseudo: 'Alice',
      team: 'Équipe A',
      score: 8500,
      rank: 1,
      lastQuestionPoints: 850
    },
    {
      id: 'uuid',
      pseudo: 'Bob',
      team: 'Équipe B',
      score: 7200,
      rank: 2,
      lastQuestionPoints: 0
    }
  ],
  teams: [
    {
      team: 'Équipe A',
      averageScore: 8200,
      playersCount: 3,
      rank: 1
    },
    {
      team: 'Équipe B',
      averageScore: 7000,
      playersCount: 2,
      rank: 2
    }
  ]
}
```

**Écoute (Joueurs)**
```javascript
socket.on('leaderboard:update', (data) => {
  // Afficher le classement intermédiaire
  displayLeaderboard(data.players, data.teams);
  
  // Mettre en évidence la position du joueur
  highlightPlayerRank(currentPlayerId);
});
```

---

## 🏁 Fin de Session

### Serveur → Tous les Clients

#### `session:finished`

La session est terminée, affichage du podium.

**Payload**
```javascript
{
  sessionId: 'uuid',
  finalLeaderboard: {
    players: [
      {
        id: 'uuid',
        pseudo: 'Alice',
        team: 'Équipe A',
        score: 9200,
        rank: 1
      },
      {
        id: 'uuid',
        pseudo: 'Charlie',
        team: 'Équipe A',
        score: 8500,
        rank: 2
      },
      {
        id: 'uuid',
        pseudo: 'Bob',
        team: 'Équipe B',
        score: 7800,
        rank: 3
      }
    ],
    teams: [
      {
        team: 'Équipe A',
        averageScore: 8500,
        playersCount: 3,
        rank: 1
      },
      {
        team: 'Équipe B',
        averageScore: 7200,
        playersCount: 2,
        rank: 2
      }
    ]
  },
  finishedAt: '2026-06-21T11:00:00Z'
}
```

**Écoute (Tous)**
```javascript
socket.on('session:finished', (data) => {
  // Afficher le podium avec animations
  showPodium(data.finalLeaderboard);
  
  // Confettis pour le top 3
  if (isTopThree(currentPlayerId, data.finalLeaderboard.players)) {
    launchConfetti();
  }
});
```

---

## 🔄 Reconnexion

### Serveur → Client

#### `session:sync`

Synchroniser l'état après une reconnexion.

**Payload**
```javascript
{
  sessionId: 'uuid',
  status: 'active',         // 'waiting' | 'active' | 'finished'
  currentQuestionIndex: 5,
  player: {
    id: 'uuid',
    pseudo: 'Alice',
    team: 'Équipe A',
    score: 4500,
    rank: 3
  },
  currentQuestion: {        // Si session active
    // ... (même structure que question:show)
  },
  timeRemaining: 15         // Secondes restantes sur la question actuelle
}
```

**Écoute**
```javascript
socket.on('session:sync', (data) => {
  // Restaurer l'état de la session
  restoreSessionState(data);
  
  // Reprendre depuis la question courante
  if (data.status === 'active') {
    displayQuestion(data.currentQuestion);
    startTimer(data.timeRemaining);
  }
});
```

---

## 🔐 Salles (Rooms)

Le serveur utilise des salles Socket.io pour cibler les événements :

### Salles disponibles

- `session:{sessionId}` : Tous les participants (joueurs + écran maître)
- `session:{sessionId}:players` : Uniquement les joueurs
- `session:{sessionId}:master` : Uniquement l'écran maître

### Rejoindre une salle

```javascript
// Backend
socket.join(`session:${sessionId}`);
socket.join(`session:${sessionId}:players`);

// Quitter une salle
socket.leave(`session:${sessionId}`);
```

### Émettre vers une salle

```javascript
// Backend
io.to(`session:${sessionId}`).emit('event', data);
io.to(`session:${sessionId}:master`).emit('answer:stats', stats);
```

---

## ⚠️ Gestion des Erreurs

### Serveur → Client

#### `error`

Erreur générique.

**Payload**
```javascript
{
  code: 'SESSION_NOT_FOUND' | 'UNAUTHORIZED' | 'INVALID_DATA',
  message: 'Session not found',
  details: { ... }          // Optionnel
}
```

**Écoute**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  
  if (error.code === 'SESSION_NOT_FOUND') {
    // Rediriger vers la page d'accueil
    navigate('/');
  }
});
```

---

## 📊 Exemples de Flux Complets

### Flux : Rejoindre et Jouer

**Joueur**
```javascript
// 1. Connexion
const socket = io('http://localhost:3000');

// 2. Rejoindre la session
socket.emit('player:join', {
  inviteCode: 'ABC123',
  pseudo: 'Alice',
  team: 'Équipe A'
});

// 3. Confirmation
socket.on('player:joined', (data) => {
  playerId = data.playerId;
  sessionId = data.sessionId;
});

// 4. Attente du début
socket.on('session:started', () => {
  console.log('La partie commence !');
});

// 5. Question affichée
socket.on('question:show', (data) => {
  displayQuestion(data.question);
  questionStartTime = data.startTime;
});

// 6. Répondre
function submitAnswer(answer) {
  const responseTime = Date.now() - questionStartTime;
  
  socket.emit('answer:submit', {
    sessionId,
    playerId,
    questionId: currentQuestionId,
    answer,
    responseTimeMs: responseTime
  });
}

// 7. Feedback
socket.on('answer:feedback', (data) => {
  showFeedback(data.isCorrect, data.points);
});

// 8. Classement
socket.on('leaderboard:update', (data) => {
  displayLeaderboard(data.players);
});

// 9. Fin
socket.on('session:finished', (data) => {
  showPodium(data.finalLeaderboard);
});
```

### Flux : Animer une Session

**Écran Maître**
```javascript
// 1. Connexion
const socket = io('http://localhost:3000');

// 2. Rejoindre en tant qu'animateur
socket.emit('master:join', { sessionId });

// 3. Voir les joueurs arriver
socket.on('player:connected', (data) => {
  addPlayerToLobby(data.player);
});

// 4. Lancer la partie
document.getElementById('start-btn').addEventListener('click', () => {
  socket.emit('session:start', { sessionId });
});

// 5. Session démarrée
socket.on('session:started', () => {
  console.log('Partie lancée !');
});

// 6. Afficher la question
socket.on('question:show', (data) => {
  displayQuestionOnMasterScreen(data.question);
});

// 7. Voir les stats en temps réel
socket.on('answer:stats', (data) => {
  updateStatsChart(data.choicesStats);
});

// 8. Passer à la question suivante
document.getElementById('next-btn').addEventListener('click', () => {
  socket.emit('question:next', { sessionId });
});

// 9. Terminer
document.getElementById('finish-btn').addEventListener('click', () => {
  socket.emit('session:finish', { sessionId });
});

socket.on('session:finished', (data) => {
  showFinalPodium(data.finalLeaderboard);
});
```

---

**Dernière mise à jour** : 21 juin 2026
