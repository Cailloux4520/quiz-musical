# Documentation API REST - Quiz Musical

Base URL : `http://localhost:3000/api` (dev) | `https://api.quiz-app.com` (prod)

## Authentification

Tous les endpoints admin nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

---

## 🔐 Auth

### Login Admin

```http
POST /api/auth/login
```

**Body**
```json
{
  "email": "admin@quiz.com",
  "password": "password123"
}
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@quiz.com",
    "name": "Admin User"
  }
}
```

**Response 401**
```json
{
  "error": "Invalid credentials"
}
```

### Vérifier Token

```http
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

**Response 200**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@quiz.com",
    "name": "Admin User"
  }
}
```

---

## 🎵 Quiz

### Lister les quiz

```http
GET /api/quiz
Headers: Authorization: Bearer <token>
```

**Query Parameters**
- `search` (string, optionnel) : recherche par titre
- `theme` (string, optionnel) : filtrer par thème (retro, pop, elegant)
- `sortBy` (string, optionnel) : tri (createdAt, title) - défaut: createdAt
- `order` (string, optionnel) : ordre (asc, desc) - défaut: desc

**Response 200**
```json
{
  "quizzes": [
    {
      "id": "uuid",
      "title": "Quiz Années 80",
      "description": "Les plus grands hits des années 80",
      "theme": "retro",
      "questionsCount": 15,
      "createdAt": "2026-06-20T10:30:00Z",
      "updatedAt": "2026-06-21T08:15:00Z"
    }
  ],
  "total": 1
}
```

### Récupérer un quiz

```http
GET /api/quiz/:id
```

**Response 200**
```json
{
  "quiz": {
    "id": "uuid",
    "title": "Quiz Années 80",
    "description": "Les plus grands hits des années 80",
    "theme": "retro",
    "createdAt": "2026-06-20T10:30:00Z",
    "updatedAt": "2026-06-21T08:15:00Z",
    "questions": [
      {
        "id": "uuid",
        "order": 1,
        "type": "audio",
        "content": "https://cdn.quiz-app.com/audio/song1.mp3",
        "backgroundImage": "https://cdn.quiz-app.com/bg/retro1.jpg",
        "theme": "retro",
        "answerMode": "mcq",
        "choices": [
          "Queen",
          "The Beatles",
          "Pink Floyd",
          "Led Zeppelin"
        ],
        "correctAnswer": "Queen",
        "timerSeconds": 30,
        "points": 1000
      }
    ]
  }
}
```

**Response 404**
```json
{
  "error": "Quiz not found"
}
```

### Créer un quiz

```http
POST /api/quiz
Headers: Authorization: Bearer <token>
```

**Body**
```json
{
  "title": "Quiz Années 80",
  "description": "Les plus grands hits des années 80",
  "theme": "retro"
}
```

**Response 201**
```json
{
  "quiz": {
    "id": "uuid",
    "title": "Quiz Années 80",
    "description": "Les plus grands hits des années 80",
    "theme": "retro",
    "createdAt": "2026-06-21T10:00:00Z",
    "updatedAt": "2026-06-21T10:00:00Z"
  }
}
```

**Response 400**
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Mettre à jour un quiz

```http
PUT /api/quiz/:id
Headers: Authorization: Bearer <token>
```

**Body** (tous les champs optionnels)
```json
{
  "title": "Quiz Années 80 - Edition 2026",
  "description": "Nouveau contenu",
  "theme": "pop"
}
```

**Response 200**
```json
{
  "quiz": {
    "id": "uuid",
    "title": "Quiz Années 80 - Edition 2026",
    "description": "Nouveau contenu",
    "theme": "pop",
    "createdAt": "2026-06-20T10:30:00Z",
    "updatedAt": "2026-06-21T10:15:00Z"
  }
}
```

### Supprimer un quiz

```http
DELETE /api/quiz/:id
Headers: Authorization: Bearer <token>
```

**Response 200**
```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

**Response 404**
```json
{
  "error": "Quiz not found"
}
```

---

## ❓ Questions

### Ajouter une question

```http
POST /api/quiz/:quizId/question
Headers: Authorization: Bearer <token>
```

**Body**
```json
{
  "type": "audio",
  "content": "https://cdn.quiz-app.com/audio/song1.mp3",
  "backgroundImage": "https://cdn.quiz-app.com/bg/retro1.jpg",
  "theme": "retro",
  "answerMode": "mcq",
  "choices": [
    "Queen",
    "The Beatles",
    "Pink Floyd",
    "Led Zeppelin"
  ],
  "correctAnswer": "Queen",
  "timerSeconds": 30
}
```

**Champs**
- `type` (requis) : "audio" | "text" | "image"
- `content` (requis) : URL du fichier audio/image ou texte de la question
- `backgroundImage` (optionnel) : URL de l'image de fond
- `theme` (optionnel) : "retro" | "pop" | "elegant" (surcharge thème quiz)
- `answerMode` (requis) : "mcq" | "freetext"
- `choices` (requis si mcq) : tableau de 4 choix
- `correctAnswer` (requis) : string (1 choix) ou array de strings (plusieurs acceptées)
- `timerSeconds` (requis) : 20-60

**Response 201**
```json
{
  "question": {
    "id": "uuid",
    "quizId": "uuid",
    "order": 1,
    "type": "audio",
    "content": "https://cdn.quiz-app.com/audio/song1.mp3",
    "backgroundImage": "https://cdn.quiz-app.com/bg/retro1.jpg",
    "theme": "retro",
    "answerMode": "mcq",
    "choices": ["Queen", "The Beatles", "Pink Floyd", "Led Zeppelin"],
    "correctAnswer": "Queen",
    "timerSeconds": 30,
    "points": 1000
  }
}
```

### Mettre à jour une question

```http
PUT /api/quiz/:quizId/question/:id
Headers: Authorization: Bearer <token>
```

**Body** (mêmes champs que POST, tous optionnels)

**Response 200**
```json
{
  "question": { ... }
}
```

### Supprimer une question

```http
DELETE /api/quiz/:quizId/question/:id
Headers: Authorization: Bearer <token>
```

**Response 200**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

### Réordonner une question

```http
POST /api/quiz/:quizId/question/:id/reorder
Headers: Authorization: Bearer <token>
```

**Body**
```json
{
  "newOrder": 3
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Question reordered successfully"
}
```

---

## 🎮 Session

### Créer une session

```http
POST /api/session
Headers: Authorization: Bearer <token>
```

**Body**
```json
{
  "quizId": "uuid"
}
```

**Response 201**
```json
{
  "session": {
    "id": "uuid",
    "quizId": "uuid",
    "inviteCode": "ABC123",
    "status": "waiting",
    "currentQuestionIndex": 0,
    "createdAt": "2026-06-21T10:30:00Z"
  },
  "inviteLink": "https://quiz-app.com/play/ABC123",
  "qrCodeUrl": "https://api.quiz-app.com/qr/ABC123.png"
}
```

**Response 400**
```json
{
  "error": "Quiz not found"
}
```

**Response 409**
```json
{
  "error": "A session for this quiz is already active"
}
```

### Récupérer une session

```http
GET /api/session/:inviteCode
```

**Response 200**
```json
{
  "session": {
    "id": "uuid",
    "inviteCode": "ABC123",
    "status": "waiting",
    "currentQuestionIndex": 0,
    "quiz": {
      "id": "uuid",
      "title": "Quiz Années 80",
      "theme": "retro"
    },
    "playersCount": 5
  }
}
```

**Response 404**
```json
{
  "error": "Session not found"
}
```

### Terminer une session

```http
DELETE /api/session/:id
Headers: Authorization: Bearer <token>
```

**Response 200**
```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

### Récupérer le classement final

```http
GET /api/session/:id/leaderboard
```

**Response 200**
```json
{
  "players": [
    {
      "id": "uuid",
      "pseudo": "Alice",
      "team": "Équipe A",
      "score": 8500,
      "rank": 1
    },
    {
      "id": "uuid",
      "pseudo": "Bob",
      "team": "Équipe B",
      "score": 7200,
      "rank": 2
    }
  ],
  "teams": [
    {
      "team": "Équipe A",
      "averageScore": 8200,
      "playersCount": 3,
      "rank": 1
    },
    {
      "team": "Équipe B",
      "averageScore": 7000,
      "playersCount": 2,
      "rank": 2
    }
  ]
}
```

---

## 📤 Upload

### Générer URL de upload signée

```http
POST /api/upload/sign-url
Headers: Authorization: Bearer <token>
```

**Body**
```json
{
  "fileType": "audio",
  "fileName": "my-song.mp3",
  "contentType": "audio/mpeg"
}
```

**Champs**
- `fileType` (requis) : "audio" | "image"
- `fileName` (requis) : nom du fichier
- `contentType` (requis) : MIME type (audio/mpeg, image/jpeg, image/png)

**Response 200**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/quiz-musical-files/...",
  "fileUrl": "https://cdn.quiz-app.com/audio/uuid.mp3",
  "expiresIn": 600
}
```

**Utilisation**
1. Faire une requête `PUT` vers `uploadUrl` avec le fichier en body
2. Utiliser `fileUrl` pour sauvegarder dans la question

**Response 400**
```json
{
  "error": "Invalid file type or size"
}
```

---

## 📊 Statistiques (v1.1+)

### Statistiques d'un quiz

```http
GET /api/quiz/:id/stats
Headers: Authorization: Bearer <token>
```

**Response 200**
```json
{
  "totalSessions": 12,
  "totalPlayers": 156,
  "averagePlayersPerSession": 13,
  "averageScore": 6800,
  "questionsStats": [
    {
      "questionId": "uuid",
      "averageResponseTime": 5200,
      "correctAnswersRate": 0.85
    }
  ]
}
```

---

## ⚠️ Codes d'Erreur

| Code | Description |
|------|-------------|
| 200  | Succès |
| 201  | Créé avec succès |
| 400  | Requête invalide (validation échouée) |
| 401  | Non authentifié |
| 403  | Non autorisé |
| 404  | Ressource non trouvée |
| 409  | Conflit (ex: session déjà active) |
| 422  | Entité non traitable (données invalides) |
| 429  | Trop de requêtes (rate limiting) |
| 500  | Erreur serveur interne |

---

## 🔒 Rate Limiting

Pour éviter les abus, l'API applique un rate limiting :

- **Auth** : 5 tentatives / 15 minutes
- **Upload** : 20 uploads / heure
- **Général** : 100 requêtes / minute

Header de réponse :
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1624281600
```

---

## 🧪 Environnement de Test

Base URL test : `https://api-staging.quiz-app.com`

Compte de test :
- Email : `test@quiz.com`
- Password : `test123`

---

**Dernière mise à jour** : 21 juin 2026
