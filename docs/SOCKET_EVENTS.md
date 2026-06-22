# Événements Socket.io - MyQuiz

Documentation complète des événements WebSocket pour la communication temps réel entre le serveur, l'écran maître (admin) et les joueurs.

## Table des matières
- [Configuration](#configuration)
- [Événements Session](#événements-session)
- [Événements Joueur](#événements-joueur)
- [Événements Question](#événements-question)
- [Événements Réponse](#événements-réponse)
- [Événements Classement](#événements-classement)
- [Événements Fin de partie](#événements-fin-de-partie)

## Configuration

### Connexion

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt_token' // Pour l'admin
  }
});
```

### Namespaces

- `/` : Namespace par défaut pour tous les événements

## Événements Session

### `session:join` (Client → Server)
Rejoindre une session en tant que joueur.

**Émis par:** Joueur  
**Reçu par:** Serveur

**Payload:**
```typescript
{
  code: string;        // Code de session (ex: "ABCD1234")
  playerName: string;  // Nom du joueur
  teamName?: string;   // Nom de l'équipe (optionnel)
}
```

**Réponse:** `session:joined` ou `error`

---

### `session:joined` (Server → Client)
Confirmation de l'entrée dans la session.

**Émis par:** Serveur  
**Reçu par:** Joueur qui vient de rejoindre

**Payload:**
```typescript
{
  playerId: string;
  playerName: string;
  teamName?: string;
  sessionId: string;
  sessionCode: string;
  quizTitle: string;
}
```

---

### `session:player-joined` (Server → Clients)
Notifie tous les participants qu'un nouveau joueur a rejoint.

**Émis par:** Serveur  
**Reçu par:** Tous les participants de la session

**Payload:**
```typescript
{
  playerId: string;
  playerName: string;
  teamName?: string;
  playerCount: number;
}
```

---

### `session:start` (Client → Server)
Démarrer la session (admin uniquement).

**Émis par:** Écran maître  
**Reçu par:** Serveur

**Payload:**
```typescript
{
  sessionId: string;
}
```

**Réponse:** `session:started` à tous les participants

---

### `session:started` (Server → Clients)
Notifie le démarrage de la session.

**Émis par:** Serveur  
**Reçu par:** Tous les participants

**Payload:**
```typescript
{
  sessionId: string;
  totalQuestions: number;
  startTime: Date;
}
```

---

### `session:leave` (Client → Server)
Quitter la session.

**Émis par:** Joueur ou Admin  
**Reçu par:** Serveur

**Payload:**
```typescript
{
  sessionId: string;
  playerId?: string;
}
```

---

### `session:player-left` (Server → Clients)
Notifie qu'un joueur a quitté.

**Émis par:** Serveur  
**Reçu par:** Tous les participants restants

**Payload:**
```typescript
{
  playerId: string;
  playerName: string;
  playerCount: number;
}
```

## Événements Question

### `question:next` (Client → Server)
Passer à la question suivante (admin uniquement).

**Émis par:** Écran maître  
**Reçu par:** Serveur

**Payload:**
```typescript
{
  sessionId: string;
}
```

**Réponse:** `question:show` à tous les participants

---

### `question:show` (Server → Clients)
Affiche une nouvelle question.

**Émis par:** Serveur  
**Reçu par:** Tous les participants

**Payload:**
```typescript
{
  questionId: string;
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  type: 'text' | 'audio' | 'image' | 'video';
  mediaUrl?: string;
  answers: Array<{
    id: string;
    text: string;
    imageUrl?: string;
  }>;
  timeLimit: number; // en secondes
  points: number;
  startTime: Date;
}
```

---

### `question:time-update` (Server → Clients)
Met à jour le temps restant.

**Émis par:** Serveur (toutes les secondes)  
**Reçu par:** Tous les participants

**Payload:**
```typescript
{
  questionId: string;
  timeRemaining: number; // en secondes
}
```

---

### `question:reveal` (Client → Server)
Révéler la bonne réponse (admin uniquement).

**Émis par:** Écran maître  
**Reçu par:** Serveur

**Payload:**
```typescript
{
  sessionId: string;
  questionId: string;
}
```

**Réponse:** `question:revealed` à tous les participants

---

### `question:revealed` (Server → Clients)
Affiche la bonne réponse et les statistiques.

**Émis par:** Serveur  
**Reçu par:** Tous les participants

**Payload:**
```typescript
{
  questionId: string;
  correctAnswerId: string;
  statistics: {
    totalAnswers: number;
    answerDistribution: {
      [answerId: string]: number;
    };
    percentages: {
      [answerId: string]: number;
    };
  };
}
```

## Événements Réponse

### `answer:submit` (Client → Server)
Soumettre une réponse.

**Émis par:** Joueur  
**Reçu par:** Serveur

**Payload:**
```typescript
{
  sessionId: string;
  questionId: string;
  playerId: string;
  answerId: string;
  responseTime: number; // en millisecondes depuis le début de la question
}
```

**Réponse:** `answer:submitted`

---

### `answer:submitted` (Server → Client)
Confirmation de la réception de la réponse.

**Émis par:** Serveur  
**Reçu par:** Joueur qui a répondu

**Payload:**
```typescript
{
  questionId: string;
  answerId: string;
  responseTime: number;
}
```

---

### `answer:stats-update` (Server → Clients)
Met à jour les statistiques de réponses en temps réel.

**Émis par:** Serveur (après chaque réponse)  
**Reçu par:** Écran maître uniquement

**Payload:**
```typescript
{
  questionId: string;
  totalAnswers: number;
  answerDistribution: {
    [answerId: string]: number;
  };
}
```

---

### `answer:result` (Server → Client)
Indique si la réponse était correcte (après révélation).

**Émis par:** Serveur  
**Reçu par:** Joueur concerné

**Payload:**
```typescript
{
  questionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswerId: string;
}
```

## Événements Classement

### `leaderboard:update` (Server → Clients)
Met à jour le classement.

**Émis par:** Serveur (après chaque question)  
**Reçu par:** Tous les participants

**Payload:**
```typescript
{
  players: Array<{
    playerId: string;
    playerName: string;
    teamName?: string;
    score: number;
    correctAnswers: number;
    rank: number;
    evolution: number; // +2, 0, -1 etc.
  }>;
  teams?: Array<{
    teamName: string;
    score: number;
    playerCount: number;
    rank: number;
  }>;
}
```

## Événements Fin de partie

### `session:complete` (Server → Clients)
Notifie la fin de la session.

**Émis par:** Serveur (après la dernière question)  
**Reçu par:** Tous les participants

**Payload:**
```typescript
{
  sessionId: string;
  finalResults: {
    topPlayers: Array<{
      rank: number;
      playerId: string;
      playerName: string;
      teamName?: string;
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      accuracy: number; // %
    }>;
    topTeams?: Array<{
      rank: number;
      teamName: string;
      score: number;
      playerCount: number;
      averageScore: number;
    }>;
    statistics: {
      totalPlayers: number;
      totalTeams?: number;
      averageScore: number;
      highestScore: number;
      lowestScore: number;
    };
  };
}
```

## Événements d'Erreur

### `error` (Server → Client)
Erreur générique.

**Émis par:** Serveur  
**Reçu par:** Client concerné

**Payload:**
```typescript
{
  code: string;        // 'SESSION_NOT_FOUND', 'INVALID_ANSWER', etc.
  message: string;     // Message d'erreur
  details?: any;       // Détails supplémentaires
}
```

### Codes d'erreur courants

- `SESSION_NOT_FOUND`: Session inexistante
- `SESSION_FULL`: Session complète
- `SESSION_STARTED`: Session déjà démarrée (impossible de rejoindre)
- `INVALID_ANSWER`: Réponse invalide
- `ANSWER_TOO_LATE`: Réponse soumise après la fin du temps
- `ALREADY_ANSWERED`: Joueur a déjà répondu à cette question
- `NOT_AUTHORIZED`: Action non autorisée
- `PLAYER_NOT_FOUND`: Joueur inexistant

## Exemple d'implémentation

### Écran Maître (Admin)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: adminToken }
});

// Démarrer la session
socket.emit('session:start', { sessionId });

// Écouter les nouveaux joueurs
socket.on('session:player-joined', (data) => {
  console.log(`${data.playerName} a rejoint (${data.playerCount} joueurs)`);
});

// Passer à la question suivante
socket.emit('question:next', { sessionId });

// Révéler la réponse
socket.emit('question:reveal', { sessionId, questionId });

// Recevoir les stats de réponses
socket.on('answer:stats-update', (data) => {
  console.log('Réponses:', data.answerDistribution);
});
```

### Joueur

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Rejoindre une session
socket.emit('session:join', {
  code: 'ABCD1234',
  playerName: 'John Doe',
  teamName: 'Team A'
});

// Confirmation
socket.on('session:joined', (data) => {
  console.log('Connecté à:', data.quizTitle);
});

// Recevoir une question
socket.on('question:show', (question) => {
  console.log('Question:', question.questionText);
  // Afficher les réponses possibles
});

// Soumettre une réponse
socket.emit('answer:submit', {
  sessionId,
  questionId,
  playerId,
  answerId,
  responseTime: Date.now() - questionStartTime
});

// Recevoir le résultat
socket.on('answer:result', (result) => {
  console.log('Correct:', result.isCorrect, 'Points:', result.pointsEarned);
});

// Recevoir le classement
socket.on('leaderboard:update', (leaderboard) => {
  console.log('Mon rang:', leaderboard.players.find(p => p.playerId === playerId).rank);
});
```

## Bonnes pratiques

1. **Toujours gérer les déconnexions:**
   ```typescript
   socket.on('disconnect', () => {
     console.log('Déconnecté');
     // Réessayer la connexion ou informer l'utilisateur
   });
   ```

2. **Valider les données côté serveur:** Ne jamais faire confiance aux données du client

3. **Gérer les erreurs:**
   ```typescript
   socket.on('error', (error) => {
     console.error(error.message);
     // Afficher un message à l'utilisateur
   });
   ```

4. **Nettoyer les listeners:** Utiliser `socket.off()` pour éviter les fuites mémoire

5. **Limiter les émissions:** Ne pas spam le serveur avec trop d'événements

6. **Anti-triche:** Le serveur valide toujours les timestamps et refuse les réponses < 200ms
