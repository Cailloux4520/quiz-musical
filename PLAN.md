# Plan de Développement - Application de Quiz Musical

## 📋 Vue d'Ensemble

Application web de quiz musical en temps réel, inspirée de Kahoot, permettant des sessions de jeu en équipe avec un animateur pilotant la partie depuis un écran maître.

### Version
**v1.0 - Juin 2026**

---

## 🎯 Objectifs & Vision

### Objectif Principal
Créer une expérience de quiz musical immersive et festive pour des soirées, où un animateur orchestre la partie pendant que les joueurs répondent en temps réel depuis leurs appareils personnels.

### Points Clés
- **Sans friction** : pas de compte requis pour les joueurs
- **Temps réel** : synchronisation instantanée entre tous les participants
- **Visuel immersif** : thèmes visuels personnalisables par quiz et par question
- **Multi-support** : fonctionne sur smartphone, tablette et desktop
- **Spécialisé musique** : questions audio, pochettes d'albums, culture musicale

---

## 👥 Rôles & Personas

### 1. Admin/Créateur
**Qui :** Organisateur de soirée, DJ, animateur culturel  
**Besoins :**
- Créer des quiz rapidement
- Importer des extraits audio et images
- Personnaliser l'ambiance visuelle
- Générer des liens d'invitation
- Gérer sa bibliothèque de quiz

**Parcours typique :**
1. Se connecte au dashboard
2. Clique sur "Nouveau Quiz"
3. Choisit un thème visuel global
4. Ajoute 10-20 questions avec médias
5. Publie et partage le lien

### 2. Animateur (peut être le même que l'Admin)
**Qui :** Personne qui pilote la session en direct  
**Besoins :**
- Vue d'ensemble des participants
- Contrôle manuel du rythme
- Visibilité sur les réponses en temps réel
- Écran immersif pour projection
- Classement en direct

**Parcours typique :**
1. Ouvre l'écran maître
2. Partage le lien d'invitation
3. Attend les connexions
4. Lance la partie
5. Passe d'une question à l'autre manuellement
6. Affiche le podium final

### 3. Joueur
**Qui :** Participant à la soirée  
**Besoins :**
- Rejoindre rapidement (un clic)
- Interface simple sur mobile
- Feedback immédiat
- Voir son score évoluer
- Ambiance visuelle cohérente

**Parcours typique :**
1. Clique sur le lien d'invitation
2. Saisit pseudo et équipe
3. Attend le début
4. Répond aux questions
5. Voit son score et classement

---

## 🔄 Flows Critiques

### Flow 1 : Création de Quiz

```
[Admin Dashboard] 
    ↓
[Nouveau Quiz] → Titre + Thème global
    ↓
[Ajout Questions] → Pour chaque question :
    - Type : Audio / Texte / Image
    - Contenu : Upload fichier ou URL
    - Fond d'écran : Upload ou thème hérité
    - Mode réponse : QCM (4 choix) ou Texte libre
    - Timer : 20-60 secondes
    - Bonne(s) réponse(s)
    ↓
[Prévisualisation] → Tester l'affichage
    ↓
[Publication] → Génération lien unique
    ↓
[Partage] → QR code + URL
```

### Flow 2 : Session de Jeu

```
[Animateur] Ouvre écran maître
    ↓
[Joueurs] Rejoignent via lien → Saisie pseudo/équipe
    ↓
[Lobby] Attente visible sur écran maître + mobiles
    ↓
[Animateur] Lance la partie
    ↓
POUR CHAQUE QUESTION :
    [Écran maître] Affiche question
    [Mobiles joueurs] Affichent même question + choix
        ↓
    [Joueurs] Répondent (timer actif)
        ↓
    [Serveur] Calcule scores (rapidité)
        ↓
    [Mobiles] Feedback bonne/mauvaise réponse
        ↓
    [Écran maître] Affiche stats réponses + classement provisoire
        ↓
    [Animateur] Passe à la question suivante (manuelle)
    ↓
[Fin] Podium animé : Top 3 joueurs + Top 3 équipes
    ↓
[Options] Rejouer / Retour dashboard
```

### Flow 3 : Calcul de Score

```
Joueur répond correctement :
    Score = 1000 - (temps_réponse_ms × facteur_dégressif)
    
Exemple :
    - Réponse à 1s → 1000 - (1000 × 0.5) = 500 pts
    - Réponse à 5s → 1000 - (5000 × 0.5) = 0 pts (min)
    - Réponse instantanée → 1000 pts (max)
    
Mauvaise réponse : 0 pts

Classement :
    - Par joueur : somme des scores individuels
    - Par équipe : moyenne des scores des membres
```

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Frontend
- **Framework** : React 18+ avec TypeScript
- **Styling** : Tailwind CSS 3+ pour les thèmes visuels
- **État global** : Zustand ou Context API
- **Routing** : React Router v6
- **Audio** : Howler.js pour lecture audio cross-browser
- **Animations** : Framer Motion pour podium et transitions
- **Build** : Vite

#### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **Temps réel** : Socket.io (WebSocket)
- **Base de données** : PostgreSQL (quiz, sessions, scores)
- **Stockage fichiers** : S3-compatible (AWS S3 ou MinIO local)
- **Auth** : JWT pour admin/animateur
- **ORM** : Prisma

#### Infrastructure
- **Hébergement** : Vercel (frontend) + Railway (backend) ou VPS
- **CDN** : Cloudflare pour assets audio/image
- **Monitoring** : Sentry (erreurs) + Plausible (analytics)

### Architecture Système

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (React + Tailwind)           │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Admin Panel  │  │ Écran Maître │            │
│  └──────────────┘  └──────────────┘            │
│  ┌──────────────────────────────────────┐      │
│  │       Interface Joueur Mobile        │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
                       ↕ 
            REST API + WebSocket (Socket.io)
                       ↕ 
┌─────────────────────────────────────────────────┐
│          BACKEND (Node.js + Express)            │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Auth Service│  │  Quiz Service│            │
│  └──────────────┘  └──────────────┘            │
│  ┌──────────────┐  ┌──────────────┐            │
│  │Session Mgmt  │  │ Score Engine │            │
│  └──────────────┘  └──────────────┘            │
│  ┌──────────────────────────────────────┐      │
│  │     Socket.io Server (Temps Réel)    │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
                       ↕ 
┌─────────────────┐  ┌──────────────┐
│   PostgreSQL    │  │  S3 Storage  │
│  (Quiz, Users,  │  │ (Audio/Image)│
│   Sessions)     │  │              │
└─────────────────┘  └──────────────┘
```

---

## 💾 Modèle de Données

### Entités Principales

#### User (Admin/Animateur)
```typescript
{
  id: string (UUID)
  email: string (unique)
  passwordHash: string
  name: string
  createdAt: DateTime
}
```

#### Quiz
```typescript
{
  id: string (UUID)
  creatorId: string (FK → User)
  title: string
  description?: string
  theme: 'retro' | 'pop' | 'elegant' (thème par défaut)
  createdAt: DateTime
  updatedAt: DateTime
  questions: Question[] (relation)
}
```

#### Question
```typescript
{
  id: string (UUID)
  quizId: string (FK → Quiz)
  order: number (position dans le quiz)
  type: 'audio' | 'text' | 'image'
  content: string (URL audio/image ou texte)
  backgroundImage?: string (URL)
  theme?: 'retro' | 'pop' | 'elegant' (surcharge thème quiz)
  answerMode: 'mcq' | 'freetext'
  choices?: string[] (pour MCQ, 4 choix)
  correctAnswer: string | string[] (réponse(s) correcte(s))
  timerSeconds: number (20-60)
  points: number (1000 par défaut)
}
```

#### Session
```typescript
{
  id: string (UUID)
  quizId: string (FK → Quiz)
  inviteCode: string (unique, 6 caractères)
  status: 'waiting' | 'active' | 'finished'
  currentQuestionIndex: number
  createdAt: DateTime
  startedAt?: DateTime
  finishedAt?: DateTime
  players: Player[] (relation)
  responses: Response[] (relation)
}
```

#### Player
```typescript
{
  id: string (UUID)
  sessionId: string (FK → Session)
  pseudo: string
  team: string
  socketId: string (pour Socket.io)
  score: number (total cumulé)
  joinedAt: DateTime
}
```

#### Response
```typescript
{
  id: string (UUID)
  sessionId: string (FK → Session)
  playerId: string (FK → Player)
  questionId: string (FK → Question)
  answer: string
  isCorrect: boolean
  responseTimeMs: number (temps écoulé depuis affichage)
  points: number (score attribué)
  answeredAt: DateTime
}
```

---

## 🎨 Design System & Thèmes

### Thème 1 : Rétro/Néon

**Identité** : Années 80, ambiance néon, cassettes audio, vinyles

**Palette**
- Fond principal : `#1A0533` (violet très sombre) ou `#0A0A0A` (noir)
- Néon rose : `#FF006E`
- Néon cyan : `#00F5FF`
- Texte : `#FFFFFF` (blanc pur)
- Accents : `#FF6B00` (orange néon)

**Typographie**
- Titres : "Teko" ou "Orbitron" (Google Fonts) - Bold, majuscules
- Corps : "Roboto" - Regular

**Éléments visuels**
- Bordures néon avec `box-shadow` lumineux
- Grilles de fond style synthwave
- Icônes cassettes, vinyles, micros vintage

**CSS Exemple**
```css
.retro-button {
  background: linear-gradient(135deg, #FF006E, #FF6B00);
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.6);
  border: 2px solid #00F5FF;
}
```

### Thème 2 : Pop Coloré

**Identité** : Moderne, festif, énergique type Kahoot

**Palette**
- Fond principal : `#FFE600` (jaune vif)
- Violet : `#6C2EE3`
- Rose : `#FF2882`
- Bleu : `#1368CE`
- Vert : `#26890D`
- Texte : `#333333` (gris foncé)

**Typographie**
- Titres : "Montserrat" - ExtraBold
- Corps : "Open Sans" - Regular

**Éléments visuels**
- Formes géométriques rondes
- Ombres portées douces
- Icônes flat design colorées

**CSS Exemple**
```css
.pop-card {
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(108, 46, 227, 0.15);
  border: 4px solid #6C2EE3;
}
```

### Thème 3 : Élégant Sombre

**Identité** : Soirée VIP, chic, raffiné

**Palette**
- Fond principal : `#000000` (noir mat)
- Doré : `#C9A84C`
- Argent : `#D4D4D4`
- Texte : `#FFFFFF`
- Accents : `#8B7355` (bronze)

**Typographie**
- Titres : "Playfair Display" - Bold (serif)
- Corps : "Lato" - Regular

**Éléments visuels**
- Textures subtiles (velours, marbre)
- Effets de brillance métallique
- Lignes fines dorées

**CSS Exemple**
```css
.elegant-container {
  background: linear-gradient(180deg, #000000, #1A1A1A);
  border: 1px solid #C9A84C;
  box-shadow: inset 0 1px 0 rgba(201, 168, 76, 0.3);
}
```

### Application des Thèmes

**Hiérarchie**
1. Thème global du quiz (défini à la création)
2. Surcharge par question (optionnelle)
3. Fond d'écran personnalisé par question (optionnel)

**Composants affectés**
- Écran d'attente (lobby)
- Affichage des questions (écran maître + mobile)
- Feedback de réponse
- Classement intermédiaire
- Podium final

---

## 📱 Interfaces Utilisateur

### 1. Dashboard Admin

**URL** : `/admin/dashboard`

**Layout**
```
┌────────────────────────────────────────┐
│  [Logo] Quiz Musical    [Profil] ▼    │
├────────────────────────────────────────┤
│                                        │
│  Mes Quiz                    [+ Créer]│
│                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ Quiz │  │ Quiz │  │ Quiz │        │
│  │  #1  │  │  #2  │  │  #3  │        │
│  │ 15 Q │  │ 20 Q │  │ 12 Q │        │
│  │[Jouer│  │[Jouer│  │[Jouer│        │
│  │ Éditer]│ Éditer]│ Éditer]│        │
│  └──────┘  └──────┘  └──────┘        │
│                                        │
└────────────────────────────────────────┘
```

**Fonctionnalités**
- Liste des quiz créés (grille ou liste)
- Actions rapides : Jouer / Éditer / Dupliquer / Supprimer
- Filtres : Date / Thème / Nombre de questions
- Recherche par titre

### 2. Éditeur de Quiz

**URL** : `/admin/quiz/:id/edit`

**Sections**
1. **Informations générales**
   - Titre (requis)
   - Description (optionnelle)
   - Thème visuel global (sélecteur 3 choix)
   - Image de couverture (upload)

2. **Liste des questions** (réordonnables par drag & drop)
   - Aperçu miniature
   - Type + timer
   - Actions : Éditer / Dupliquer / Supprimer

3. **Éditeur de question** (modal ou page dédiée)
   - Type de question (radio : Audio / Texte / Image)
   - Contenu selon type :
     - Audio : Upload MP3 (max 30s) + visualisation waveform
     - Texte : Champ texte riche (markdown light)
     - Image : Upload JPG/PNG (pochette d'album)
   - Fond d'écran (optionnel) : Upload ou thème hérité
   - Thème visuel (optionnel) : Surcharge du thème global
   - Mode de réponse :
     - QCM : 4 champs de choix + sélection bonne réponse
     - Texte libre : Bonne(s) réponse(s) acceptée(s) (insensible à la casse)
   - Timer : Slider 20-60 secondes
   - Points max : 1000 (fixe pour v1)

4. **Prévisualisation**
   - Simuler l'affichage joueur
   - Tester l'audio/image
   - Vérifier le thème

5. **Publication**
   - Bouton "Publier" → génère le lien d'invitation
   - QR code + URL copiable
   - Bouton "Lancer la session" → redirige vers écran maître

### 3. Écran Maître (Animateur)

**URL** : `/play/:sessionId/master`

**Phases**

#### Phase 1 : Lobby (attente des joueurs)
```
┌────────────────────────────────────────┐
│         [Thème visuel du quiz]         │
│                                        │
│         🎵 Nom du Quiz                 │
│                                        │
│  Rejoignez sur : quiz-app.com/abc123  │
│         [QR Code]                      │
│                                        │
│  Joueurs connectés : 12                │
│  ┌────────────────────────────────┐   │
│  │ • Alice (Équipe A)             │   │
│  │ • Bob (Équipe B)               │   │
│  │ • Charlie (Équipe A)           │   │
│  │ ...                            │   │
│  └────────────────────────────────┘   │
│                                        │
│         [LANCER LA PARTIE]             │
│                                        │
└────────────────────────────────────────┘
```

#### Phase 2 : Question Active
```
┌────────────────────────────────────────┐
│  Q3/15                    ⏱ 18s        │
├────────────────────────────────────────┤
│                                        │
│  [Fond d'écran personnalisé]           │
│                                        │
│  Quel artiste a chanté "Bohemian      │
│  Rhapsody" ?                           │
│                                        │
│  🔊 [Lecture audio si type audio]      │
│                                        │
│  Réponses en temps réel :              │
│  ▓▓▓▓▓▓▓▓▓▓ A. Queen (8)              │
│  ▓▓▓ B. The Beatles (3)               │
│  ▓ C. Pink Floyd (1)                  │
│  D. Led Zeppelin (0)                  │
│                                        │
│         [QUESTION SUIVANTE]            │
│                                        │
└────────────────────────────────────────┘
```

#### Phase 3 : Classement Intermédiaire (entre chaque question)
```
┌────────────────────────────────────────┐
│           Classement                   │
├────────────────────────────────────────┤
│  Joueurs                    Équipes    │
│  1. Alice      4500 pts   1. Éq. A 4200│
│  2. Charlie    4200 pts   2. Éq. B 3800│
│  3. Bob        3800 pts   3. Éq. C 3500│
│  ...                                   │
│                                        │
│         [CONTINUER]                    │
└────────────────────────────────────────┘
```

#### Phase 4 : Podium Final
```
┌────────────────────────────────────────┐
│         🏆 PODIUM 🏆                   │
│                                        │
│      2nd        1er        3ème        │
│     Charlie    Alice       Bob         │
│     8500 pts  9200 pts   7800 pts     │
│                                        │
│  Classement Équipes :                  │
│  🥇 Équipe A - 8500 pts                │
│  🥈 Équipe B - 7200 pts                │
│  🥉 Équipe C - 6800 pts                │
│                                        │
│  [REJOUER]  [RETOUR DASHBOARD]         │
│                                        │
└────────────────────────────────────────┘
```

### 4. Interface Joueur (Mobile)

**URL** : `/play/:sessionId/join` (puis `/play/:sessionId/player`)

#### Étape 1 : Rejoindre
```
┌──────────────────────────┐
│   [Thème du quiz]        │
│                          │
│   🎵 Nom du Quiz         │
│                          │
│   Ton pseudo :           │
│   [____________]         │
│                          │
│   Ton équipe :           │
│   [____________]         │
│                          │
│   [REJOINDRE]            │
│                          │
└──────────────────────────┘
```

#### Étape 2 : Attente
```
┌──────────────────────────┐
│                          │
│   En attente...          │
│                          │
│   Joueurs : 12           │
│                          │
│   [Animation de loader]  │
│                          │
└──────────────────────────┘
```

#### Étape 3 : Question
```
┌──────────────────────────┐
│ Q3/15          ⏱ 18s     │
├──────────────────────────┤
│  [Fond personnalisé]     │
│                          │
│  Quel artiste a chanté   │
│  "Bohemian Rhapsody" ?   │
│                          │
│  🔊 [Lecture audio]      │
│                          │
│  ┌────────────────────┐  │
│  │  A. Queen          │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  B. The Beatles    │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  C. Pink Floyd     │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  D. Led Zeppelin   │  │
│  └────────────────────┘  │
│                          │
└──────────────────────────┘
```

#### Étape 4 : Feedback
```
┌──────────────────────────┐
│                          │
│   ✅ BONNE RÉPONSE !     │
│                          │
│   +850 points            │
│                          │
│   Ton score : 2450 pts   │
│   Position : 3ème        │
│                          │
│   Prochaine question...  │
│                          │
└──────────────────────────┘
```

---

## 🚀 Fonctionnalités Détaillées

### F1 : Authentification Admin

**Périmètre** : Seuls les admins/créateurs ont besoin d'un compte

**Implémentation**
- Page de login : email + mot de passe
- JWT stocké en localStorage
- Middleware de protection des routes `/admin/*`
- Pas d'inscription publique (admin créé manuellement en BDD pour v1)

### F2 : Création de Quiz

**Contraintes**
- Titre : max 100 caractères
- Description : max 500 caractères
- Questions : min 5, max 50
- Durée totale estimée affichée (somme des timers)

**Validation**
- Au moins une bonne réponse par question
- Fichiers audio < 5 MB (MP3 uniquement)
- Images < 2 MB (JPG/PNG)
- Timer entre 20 et 60 secondes

**UX**
- Sauvegarde automatique (brouillon)
- Prévisualisation en temps réel
- Duplication de questions
- Import depuis un autre quiz (v2)

### F3 : Gestion de Session

**Création de session**
- Génération de `inviteCode` unique (6 caractères alphanumériques)
- Lien format : `https://quiz-app.com/play/:inviteCode`
- QR code généré côté serveur (librarie `qrcode`)

**Statuts de session**
- `waiting` : lobby, joueurs rejoignent
- `active` : partie en cours
- `finished` : podium affiché

**Contraintes**
- Une session par quiz max en simultané
- Session expirée après 2h d'inactivité
- Max 100 joueurs par session (configurable)

### F4 : Temps Réel avec Socket.io

**Événements Socket**

**Serveur → Tous**
- `session:started` : partie lancée
- `question:show` : nouvelle question affichée
- `question:end` : temps écoulé
- `leaderboard:update` : classement actualisé
- `session:finished` : partie terminée

**Serveur → Joueur spécifique**
- `player:joined` : confirmation de connexion
- `answer:feedback` : résultat de la réponse

**Joueur → Serveur**
- `player:join` : rejoindre session avec pseudo/équipe
- `answer:submit` : envoyer une réponse

**Animateur → Serveur**
- `session:start` : lancer la partie
- `question:next` : passer à la question suivante
- `session:finish` : terminer et afficher podium

### F5 : Calcul de Score

**Formule**
```javascript
function calculateScore(isCorrect, responseTimeMs, maxTimeMs, maxPoints = 1000) {
  if (!isCorrect) return 0;
  
  // Score dégressif linéaire
  const timeRatio = responseTimeMs / maxTimeMs;
  const score = Math.round(maxPoints * (1 - timeRatio * 0.5));
  
  return Math.max(score, 0);
}
```

**Exemple**
- Question avec timer 30s (30000ms)
- Réponse correcte à 5s (5000ms) :
  - `timeRatio = 5000 / 30000 = 0.167`
  - `score = 1000 × (1 - 0.167 × 0.5) = 1000 × 0.917 = 917 pts`

**Classement**
- Tri par score décroissant
- En cas d'égalité : ordre d'arrivée (timestamp)

**Classement équipes**
- Moyenne des scores des membres de l'équipe
- Min 2 joueurs par équipe pour apparaître

### F6 : Lecture Audio

**Contraintes**
- Format : MP3 uniquement (v1)
- Durée max : 30 secondes
- Lecture synchronisée entre tous les appareils

**Implémentation**
- Librarie : **Howler.js** (cross-browser)
- Pré-chargement côté joueur dès affichage question
- Lancement via événement Socket `audio:play` (timestamp serveur)
- Barre de progression visuelle

**Gestion des erreurs**
- Fallback si échec de lecture : affichage texte "Extrait audio indisponible"
- Bouton "Rejouer" côté joueur

### F7 : Upload de Fichiers

**Stratégie**
- Upload direct depuis frontend vers S3 via signed URL
- Serveur génère URL présignée (expiration 10 min)
- Fichier stocké avec clé : `quizzes/:quizId/questions/:questionId/:filename`

**Sécurité**
- Validation MIME type côté serveur
- Scan antivirus (optionnel pour production)
- Limite de taille stricte

**Optimisation**
- Compression images côté serveur (Sharp)
- Conversion audio en MP3 128kbps si format différent (FFmpeg)

### F8 : Thèmes Visuels

**Implémentation CSS**
- Classes Tailwind personnalisées via `tailwind.config.js`
- Thèmes définis en CSS variables

**Exemple configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#1A0533',
          neonPink: '#FF006E',
          neonCyan: '#00F5FF',
        },
        pop: {
          bg: '#FFE600',
          purple: '#6C2EE3',
          pink: '#FF2882',
        },
        elegant: {
          bg: '#000000',
          gold: '#C9A84C',
          silver: '#D4D4D4',
        }
      }
    }
  }
}
```

**Application dynamique**
```jsx
<div className={`theme-${quiz.theme}`}>
  {/* Contenu avec thème appliqué */}
</div>
```

---

## 📦 Structure de Projet

```
quiz-musical/
├── frontend/                  # Application React
│   ├── public/
│   │   ├── index.html
│   │   └── assets/           # Images statiques
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── common/       # Boutons, cartes, modals
│   │   │   ├── admin/        # Composants dashboard admin
│   │   │   ├── master/       # Composants écran maître
│   │   │   └── player/       # Composants interface joueur
│   │   ├── pages/            # Pages principales
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── QuizEditor.tsx
│   │   │   ├── MasterScreen.tsx
│   │   │   ├── PlayerJoin.tsx
│   │   │   └── PlayerGame.tsx
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── useSocket.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useAudio.ts
│   │   ├── store/            # État global (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── quizStore.ts
│   │   │   └── sessionStore.ts
│   │   ├── services/         # API calls
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── utils/            # Utilitaires
│   │   │   ├── scoreCalculator.ts
│   │   │   └── theme.ts
│   │   ├── styles/           # CSS global + thèmes
│   │   │   ├── globals.css
│   │   │   └── themes.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                   # API Node.js
│   ├── src/
│   │   ├── controllers/      # Logique métier
│   │   │   ├── authController.ts
│   │   │   ├── quizController.ts
│   │   │   ├── sessionController.ts
│   │   │   └── uploadController.ts
│   │   ├── services/         # Services métier
│   │   │   ├── sessionService.ts
│   │   │   ├── scoreService.ts
│   │   │   └── storageService.ts
│   │   ├── socket/           # Gestion Socket.io
│   │   │   ├── handlers/
│   │   │   │   ├── playerHandlers.ts
│   │   │   │   ├── masterHandlers.ts
│   │   │   │   └── sessionHandlers.ts
│   │   │   └── socketServer.ts
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── routes/           # Routes API
│   │   │   ├── auth.ts
│   │   │   ├── quiz.ts
│   │   │   ├── session.ts
│   │   │   └── upload.ts
│   │   ├── prisma/           # Schéma BDD
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── utils/            # Utilitaires
│   │   │   ├── jwt.ts
│   │   │   └── inviteCode.ts
│   │   ├── config/           # Configuration
│   │   │   └── env.ts
│   │   └── server.ts         # Point d'entrée
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                      # Documentation
│   ├── API.md                # Documentation API REST
│   ├── SOCKET_EVENTS.md      # Liste événements Socket.io
│   └── DEPLOYMENT.md         # Guide de déploiement
│
├── .env.example              # Variables d'environnement
├── docker-compose.yml        # PostgreSQL local
├── README.md
└── PLAN.md                   # Ce fichier
```

---

## 🔌 API REST

### Endpoints Principaux

#### Authentification

```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Quiz

```
GET /api/quiz
Headers: Authorization: Bearer <token>
Response: { quizzes: [...] }

POST /api/quiz
Headers: Authorization: Bearer <token>
Body: { title, description, theme }
Response: { quiz }

PUT /api/quiz/:id
Headers: Authorization: Bearer <token>
Body: { title?, description?, theme? }
Response: { quiz }

DELETE /api/quiz/:id
Headers: Authorization: Bearer <token>
Response: { success: true }

GET /api/quiz/:id
Response: { quiz (avec questions) }
```

#### Questions

```
POST /api/quiz/:quizId/question
Headers: Authorization: Bearer <token>
Body: { 
  type, content, backgroundImage?, theme?,
  answerMode, choices?, correctAnswer, timerSeconds
}
Response: { question }

PUT /api/quiz/:quizId/question/:id
Headers: Authorization: Bearer <token>
Body: { ... }
Response: { question }

DELETE /api/quiz/:quizId/question/:id
Headers: Authorization: Bearer <token>
Response: { success: true }

POST /api/quiz/:quizId/question/:id/reorder
Headers: Authorization: Bearer <token>
Body: { newOrder }
Response: { success: true }
```

#### Session

```
POST /api/session
Headers: Authorization: Bearer <token>
Body: { quizId }
Response: { 
  session: { id, inviteCode, qrCodeUrl },
  inviteLink
}

GET /api/session/:inviteCode
Response: { session (avec quiz) }

DELETE /api/session/:id
Headers: Authorization: Bearer <token>
Response: { success: true }
```

#### Upload

```
POST /api/upload/sign-url
Headers: Authorization: Bearer <token>
Body: { 
  fileType: 'audio' | 'image',
  fileName,
  contentType
}
Response: { 
  uploadUrl (presigned S3),
  fileUrl (URL publique)
}
```

---

## 🔁 Événements Socket.io

### Connexion

```javascript
// Joueur se connecte
socket.emit('player:join', { 
  inviteCode, 
  pseudo, 
  team 
});

// Serveur confirme
socket.emit('player:joined', { 
  playerId,
  sessionId 
});

// Broadcast à tous (écran maître inclus)
io.to(sessionId).emit('player:connected', { 
  player: { pseudo, team }
});
```

### Session

```javascript
// Animateur lance la partie
socket.emit('session:start', { sessionId });

// Broadcast à tous
io.to(sessionId).emit('session:started', {});

// Animateur passe à la question suivante
socket.emit('question:next', { sessionId });

// Broadcast question
io.to(sessionId).emit('question:show', {
  question: { id, type, content, ... },
  questionIndex,
  totalQuestions,
  timerSeconds
});

// Serveur déclenche fin de question (timer écoulé)
io.to(sessionId).emit('question:end', {});
```

### Réponses

```javascript
// Joueur envoie réponse
socket.emit('answer:submit', {
  sessionId,
  playerId,
  questionId,
  answer,
  responseTimeMs
});

// Serveur calcule score et renvoie feedback
socket.emit('answer:feedback', {
  isCorrect,
  points,
  totalScore,
  currentRank
});

// Broadcast stats écran maître (temps réel)
io.to(`${sessionId}-master`).emit('answer:stats', {
  questionId,
  answersCount,
  choicesStats: { A: 5, B: 12, C: 3, D: 2 }
});
```

### Classement

```javascript
// Serveur envoie classement après chaque question
io.to(sessionId).emit('leaderboard:update', {
  players: [
    { playerId, pseudo, team, score, rank },
    ...
  ],
  teams: [
    { team, averageScore, rank },
    ...
  ]
});
```

### Fin de Session

```javascript
// Animateur termine la session
socket.emit('session:finish', { sessionId });

// Broadcast podium
io.to(sessionId).emit('session:finished', {
  finalLeaderboard: {
    players: [...], // top 3
    teams: [...]    // top 3
  }
});
```

---

## 🧪 Tests & Qualité

### Stratégie de Tests

#### Tests Unitaires
- **Outils** : Vitest (frontend), Jest (backend)
- **Périmètre** :
  - Fonctions de calcul de score
  - Utilitaires (génération inviteCode, validation)
  - Services métier (isolation avec mocks)

#### Tests d'Intégration
- **Outils** : Supertest (API), Vitest + Testing Library (composants React)
- **Périmètre** :
  - Endpoints API complets
  - Flux Socket.io (avec socket.io-client mock)
  - Composants React avec état

#### Tests E2E
- **Outils** : Playwright
- **Périmètre** :
  - Parcours admin : créer quiz → lancer session
  - Parcours joueur : rejoindre → répondre → voir podium
  - Multi-fenêtres : animateur + 3 joueurs simultanés

### Linting & Formatting
- **ESLint** : règles Airbnb + TypeScript
- **Prettier** : formatage auto
- **Husky** : pre-commit hooks (lint + tests)

### Couverture Cible
- **Critique** : >80% (scoreService, sessionService)
- **Global** : >60%

---

## 🚢 Déploiement

### Environnements

#### Développement Local
- Frontend : `http://localhost:5173` (Vite)
- Backend : `http://localhost:3000` (Express)
- PostgreSQL : Docker Compose sur port 5432
- S3 : MinIO local sur port 9000

#### Staging
- Frontend : Vercel preview deployment
- Backend : Railway staging
- PostgreSQL : Railway managed database
- S3 : AWS S3 bucket dédié

#### Production
- Frontend : Vercel (`quiz-app.com`)
- Backend : Railway production (`api.quiz-app.com`)
- PostgreSQL : Railway production (backup quotidien)
- S3 : AWS S3 + CloudFront CDN

### CI/CD

#### Pipeline GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install deps
        run: npm install
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm run test
      - name: Build
        run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend
        run: vercel deploy --prod
      - name: Deploy Backend
        run: railway up

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend
        run: vercel deploy --prod
      - name: Deploy Backend
        run: railway up
```

### Variables d'Environnement

#### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
AWS_S3_BUCKET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
FRONTEND_URL=https://quiz-app.com
```

#### Frontend (.env)
```
VITE_API_URL=https://api.quiz-app.com
VITE_SOCKET_URL=https://api.quiz-app.com
```

---

## 📈 Roadmap & Évolutions Futures

### Version 1.0 (MVP) - Juillet 2026
✅ Création de quiz avec 3 types de questions  
✅ Thèmes visuels (3 présets)  
✅ Session en temps réel avec Socket.io  
✅ Calcul de score basé sur rapidité  
✅ Écran maître + interface joueur mobile  
✅ Podium final  

### Version 1.1 - Août 2026
- **Statistiques détaillées** : graphiques de performance par joueur/équipe
- **Export de résultats** : CSV/PDF téléchargeable après partie
- **Historique de sessions** : replay des parties passées
- **Mode solo** : jouer seul à un quiz (entraînement)

### Version 1.2 - Septembre 2026
- **Spotify Integration** : importer extraits audio depuis Spotify
- **Bibliothèque de quiz publics** : marketplace de quiz partagés
- **Templates de questions** : banque de questions pré-remplies
- **Mode tournoi** : élimination progressive

### Version 2.0 - Q4 2026
- **Application mobile native** : iOS/Android (React Native)
- **Mode hors ligne** : jouer sans connexion (BDD locale)
- **Gamification** : badges, niveaux, succès
- **Personnalisation avancée** : éditeur de thème visuel custom
- **API publique** : permettre intégrations tierces

### Idées Futures (Backlog)
- Mode "Battle Royal" (élimination après chaque question)
- Questions vidéo (clips YouTube)
- IA génératrice de questions (via API musicale)
- Multi-langues (anglais, espagnol)
- Accessibilité renforcée (screen readers, contraste élevé)

---

## ⚠️ Risques & Limitations

### Techniques

#### Charge serveur temps réel
**Risque** : Trop de sessions simultanées → latence Socket.io  
**Mitigation** : 
- Horizontal scaling avec Redis Adapter pour Socket.io
- Limiter à 100 joueurs/session
- Monitoring en temps réel (Datadog)

#### Synchronisation audio multi-appareils
**Risque** : Décalage entre lecture écran maître et mobiles  
**Mitigation** :
- Timestamp serveur de référence
- Tolérance de 200ms
- Pré-chargement obligatoire côté client

#### Taille des fichiers audio/image
**Risque** : Upload lent, stockage coûteux  
**Mitigation** :
- Compression automatique (Sharp, FFmpeg)
- Limites strictes (5 MB audio, 2 MB image)
- CDN pour delivery rapide

### Fonctionnelles

#### Triche entre joueurs
**Risque** : Joueurs se communiquent les réponses  
**Mitigation** :
- Partie "soirée" → surveillance physique par animateur
- (v2) Mode questions aléatoires par joueur

#### Abandon en cours de partie
**Risque** : Joueur perd connexion → session bloquée  
**Mitigation** :
- Détection de déconnexion automatique
- Joueur peut rejoindre avec même pseudo
- Session continue sans attendre les absents

### Juridiques

#### Droits d'auteur audio
**Risque** : Utilisation d'extraits musicaux protégés  
**Mitigation** :
- Clause de responsabilité : créateur du quiz responsable des contenus
- Encourager utilisation de Creative Commons / royalty-free
- (v2) Intégration Spotify légale

#### RGPD
**Risque** : Collecte de pseudos sans consentement  
**Mitigation** :
- Pas de données personnelles collectées (juste pseudo temporaire)
- Sessions anonymes, pas de compte joueur
- Suppression auto des données après 7 jours

---

## 📚 Ressources & Références

### Technologies
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Prisma ORM](https://www.prisma.io/docs)
- [Howler.js Audio Library](https://howlerjs.com/)

### Inspiration Design
- [Kahoot](https://kahoot.com/) - UX référence
- [Synthwave CSS](https://nostalgic-css.github.io/NES.css/) - Thème rétro
- [Dribble - Quiz App](https://dribbble.com/search/quiz-app) - Inspirations visuelles

### APIs Musicales (v2)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API)
- [Last.fm API](https://www.last.fm/api)

---

## 👥 Équipe & Rôles (Recommandé)

### Pour le Développement

**Full-Stack Developer** (1-2 personnes)
- Architecture complète
- Frontend React + Backend Node.js
- Intégration Socket.io

**UI/UX Designer** (1 personne)
- Mockups des 3 thèmes visuels
- Prototypes Figma interactifs
- Tests utilisateurs

**QA Tester** (0.5 ETP)
- Tests E2E avec Playwright
- Tests multi-appareils (iOS/Android)
- Validation accessibilité

### Estimations

**MVP v1.0** : 6-8 semaines à 2 développeurs  
- Semaine 1-2 : Setup + Auth + BDD
- Semaine 3-4 : Éditeur de quiz + Upload
- Semaine 5-6 : Session temps réel + Socket.io
- Semaine 7-8 : Interface joueur + Thèmes + Tests

**Budget estimé** (freelance) : 15 000€ - 25 000€

---

## ✅ Checklist de Lancement

### Avant le Développement
- [ ] Valider les mockups UI/UX
- [ ] Choisir hébergement (Vercel + Railway)
- [ ] Créer compte AWS S3
- [ ] Acheter nom de domaine
- [ ] Setup environnement de dev (Docker Compose)

### Pendant le Développement
- [ ] Configurer CI/CD (GitHub Actions)
- [ ] Setup environnement staging
- [ ] Tests utilisateurs sur prototypes
- [ ] Documentation API complète
- [ ] Tests de charge (JMeter / Artillery)

### Avant la Production
- [ ] Audit sécurité (OWASP checklist)
- [ ] Tests E2E sur tous navigateurs
- [ ] Tests multi-appareils (BrowserStack)
- [ ] Monitoring configuré (Sentry, Datadog)
- [ ] Backup BDD automatisé
- [ ] SSL/HTTPS configuré
- [ ] Conditions d'utilisation + RGPD
- [ ] Plan de communication (teaser, landing page)

### Lancement
- [ ] Déploiement production
- [ ] Smoke tests post-déploiement
- [ ] Annonce sur réseaux sociaux
- [ ] Support utilisateur (email/chat)
- [ ] Collecte feedback

---

## 📞 Support & Contribution

### Contact
- **Email** : support@quiz-app.com
- **Discord** : [Communauté Quiz Musical]
- **GitHub** : Issues & Pull Requests bienvenues

### Contribution
Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

---

**Document créé le** : 21 juin 2026  
**Dernière mise à jour** : 21 juin 2026  
**Version du plan** : 1.0  
**Auteur** : Équipe Quiz Musical
