# Documentation API - MyQuiz

## Table des matières
- [Authentification](#authentification)
- [Quiz](#quiz)
- [Sessions](#sessions)
- [Thèmes](#thèmes)
- [Médiathèque](#médiathèque)
- [Statistiques](#statistiques)

## Base URL

- **Développement**: `http://localhost:5000`
- **Production**: `https://recalbox.live`

## Authentification

### POST /api/auth/register
Créer un nouveau compte administrateur.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin Name"
  },
  "token": "jwt_token"
}
```

### POST /api/auth/login
Connexion administrateur.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin Name"
  },
  "token": "jwt_token"
}
```

## Quiz

### GET /api/quiz
Récupérer tous les quiz de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "quizzes": [
    {
      "id": "uuid",
      "title": "Quiz de Musique",
      "description": "Un quiz sur la musique",
      "theme": "musique",
      "questions": [...],
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ]
}
```

### POST /api/quiz
Créer un nouveau quiz.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Quiz de Musique",
  "description": "Un quiz sur la musique",
  "theme": "musique",
  "questions": [
    {
      "questionText": "Qui a chanté Bohemian Rhapsody?",
      "type": "text",
      "answers": [
        {"text": "Queen", "isCorrect": true},
        {"text": "Beatles", "isCorrect": false},
        {"text": "Pink Floyd", "isCorrect": false},
        {"text": "Led Zeppelin", "isCorrect": false}
      ],
      "timeLimit": 30,
      "points": 1000
    }
  ]
}
```

**Response 201:**
```json
{
  "quiz": {
    "id": "uuid",
    "title": "Quiz de Musique",
    "description": "Un quiz sur la musique",
    "theme": "musique",
    "questions": [...],
    "createdAt": "2026-06-22T10:00:00Z"
  }
}
```

### GET /api/quiz/:id
Récupérer un quiz spécifique.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "quiz": {
    "id": "uuid",
    "title": "Quiz de Musique",
    "description": "Un quiz sur la musique",
    "theme": "musique",
    "questions": [...],
    "createdAt": "2026-06-22T10:00:00Z"
  }
}
```

### PUT /api/quiz/:id
Mettre à jour un quiz.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** Même format que POST /api/quiz

**Response 200:**
```json
{
  "quiz": {...}
}
```

### DELETE /api/quiz/:id
Supprimer un quiz.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Quiz supprimé avec succès"
}
```

## Sessions

### POST /api/sessions
Créer une nouvelle session de quiz.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "quizId": "uuid",
  "mode": "individual",
  "settings": {
    "showAnswers": true,
    "allowLateJoin": true
  }
}
```

**Response 201:**
```json
{
  "session": {
    "id": "uuid",
    "code": "ABCD1234",
    "quizId": "uuid",
    "status": "waiting",
    "mode": "individual",
    "createdAt": "2026-06-22T10:00:00Z"
  }
}
```

### GET /api/sessions/:code
Récupérer une session par code.

**Response 200:**
```json
{
  "session": {
    "id": "uuid",
    "code": "ABCD1234",
    "quizId": "uuid",
    "status": "waiting",
    "mode": "individual"
  }
}
```

### POST /api/sessions/:code/join
Rejoindre une session (joueur).

**Body:**
```json
{
  "playerName": "John Doe",
  "teamName": "Team A"
}
```

**Response 200:**
```json
{
  "player": {
    "id": "uuid",
    "name": "John Doe",
    "teamName": "Team A",
    "sessionId": "uuid"
  }
}
```

### GET /api/sessions/:sessionId/results
Récupérer les résultats d'une session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "results": {
    "players": [...],
    "teams": [...],
    "questions": [...]
  }
}
```

### GET /api/sessions/:sessionId/export/pdf
Exporter les résultats en PDF.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Fichier PDF

### GET /api/sessions/:sessionId/export/excel
Exporter les résultats en Excel.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Fichier Excel (.xlsx)

### GET /api/sessions/:sessionId/export/csv
Exporter les résultats en CSV.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Fichier CSV

## Thèmes

### GET /api/themes/templates
Récupérer les templates de thèmes par défaut (public).

**Response 200:**
```json
{
  "templates": [
    {
      "id": "retro",
      "name": "Rétro Néon",
      "colors": {
        "primary": "#ff6b6b",
        "secondary": "#4ecdc4",
        ...
      },
      "typography": {
        "fontFamily": "Poppins",
        "fontSize": "base"
      }
    }
  ]
}
```

### GET /api/themes
Récupérer tous les thèmes personnalisés.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "themes": [...]
}
```

### POST /api/themes
Créer un nouveau thème personnalisé.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Mon Thème",
  "colors": {
    "primary": "#ff6b6b",
    "secondary": "#4ecdc4",
    "background": "#1a1a2e",
    "text": "#ffffff",
    "accent": "#ffd93d",
    "success": "#6bcf7f",
    "error": "#ff6b6b"
  },
  "typography": {
    "fontFamily": "Poppins",
    "fontSize": "base"
  },
  "isPublic": false
}
```

**Response 201:**
```json
{
  "theme": {...}
}
```

### PUT /api/themes/:id
Mettre à jour un thème.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "theme": {...}
}
```

### DELETE /api/themes/:id
Supprimer un thème.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Thème supprimé avec succès"
}
```

### POST /api/themes/:id/duplicate
Dupliquer un thème.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 201:**
```json
{
  "theme": {...}
}
```

## Médiathèque

### GET /api/media
Récupérer tous les fichiers média.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "files": [
    {
      "id": "uuid",
      "filename": "song.mp3",
      "mimetype": "audio/mpeg",
      "size": 5242880,
      "url": "https://cdn.example.com/song.mp3",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ]
}
```

### POST /api/media/upload
Upload un fichier média.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
file: <binary>
```

**Response 201:**
```json
{
  "file": {
    "id": "uuid",
    "filename": "song.mp3",
    "mimetype": "audio/mpeg",
    "size": 5242880,
    "url": "https://cdn.example.com/song.mp3"
  }
}
```

### DELETE /api/media/:id
Supprimer un fichier média.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Fichier supprimé avec succès"
}
```

## Statistiques

### GET /api/stats/dashboard
Récupérer les statistiques du dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "stats": {
    "totalQuizzes": 10,
    "totalSessions": 50,
    "totalPlayers": 250,
    "averagePlayersPerSession": 5,
    "topQuizzes": [...],
    "sessionsPerDay": [...]
  }
}
```

## Codes d'erreur

- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Non authentifié ou token invalide
- **403 Forbidden**: Accès interdit (pas propriétaire de la ressource)
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

## Limites

- **Taille max upload**: 50 MB
- **Rate limiting**: 100 requêtes/minute par IP
- **Token expiration**: 7 jours
