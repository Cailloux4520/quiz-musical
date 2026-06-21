# 📝 TODO - Quiz Musical

## Phase 1 : Setup Initial (Semaine 1)

### Infrastructure
- [ ] Initialiser repository Git
- [ ] Configurer structure monorepo (frontend + backend)
- [ ] Setup Docker Compose (PostgreSQL + MinIO)
- [ ] Configurer ESLint + Prettier
- [ ] Setup Husky pre-commit hooks

### Backend
- [ ] Initialiser projet Node.js + TypeScript + Express
- [ ] Configurer Prisma ORM
- [ ] Créer schéma de base de données (schema.prisma)
- [ ] Setup middleware de base (CORS, body-parser, error handler)
- [ ] Configurer Socket.io server
- [ ] Implémenter système JWT pour auth

### Frontend
- [ ] Initialiser projet React + Vite + TypeScript
- [ ] Configurer Tailwind CSS
- [ ] Setup React Router
- [ ] Configurer Zustand pour état global
- [ ] Créer composants de base (Button, Card, Modal)
- [ ] Setup socket.io-client

---

## Phase 2 : Authentification & Dashboard (Semaine 2)

### Backend
- [ ] Créer endpoint `POST /api/auth/login`
- [ ] Middleware de protection des routes admin
- [ ] Endpoint `GET /api/quiz` (liste des quiz)
- [ ] Tests unitaires auth

### Frontend
- [ ] Page de login admin
- [ ] Composant ProtectedRoute
- [ ] Dashboard admin avec liste des quiz
- [ ] Hook `useAuth` pour gestion auth
- [ ] Système de notification toast

---

## Phase 3 : Création de Quiz (Semaines 3-4)

### Backend
- [ ] Endpoint `POST /api/quiz` (créer quiz)
- [ ] Endpoint `PUT /api/quiz/:id` (éditer quiz)
- [ ] Endpoint `DELETE /api/quiz/:id` (supprimer quiz)
- [ ] Endpoint `POST /api/quiz/:quizId/question` (ajouter question)
- [ ] Endpoint `PUT /api/quiz/:quizId/question/:id` (éditer question)
- [ ] Endpoint `DELETE /api/quiz/:quizId/question/:id` (supprimer question)
- [ ] Endpoint `POST /api/upload/sign-url` (génération URL S3 présignée)
- [ ] Service de compression audio/image
- [ ] Validation des fichiers (MIME type, taille)

### Frontend
- [ ] Page éditeur de quiz
- [ ] Formulaire informations générales (titre, thème)
- [ ] Composant sélecteur de thème visuel (3 options)
- [ ] Liste de questions avec drag-and-drop (react-beautiful-dnd)
- [ ] Modal/page éditeur de question
- [ ] Upload audio avec visualisation waveform
- [ ] Upload image avec preview
- [ ] Composant QCM (4 choix)
- [ ] Composant réponse texte libre
- [ ] Slider de timer (20-60s)
- [ ] Prévisualisation question
- [ ] Hook `useQuiz` pour gestion état quiz

---

## Phase 4 : Système de Session (Semaine 5)

### Backend
- [ ] Endpoint `POST /api/session` (créer session)
- [ ] Endpoint `GET /api/session/:inviteCode` (récupérer session)
- [ ] Endpoint `DELETE /api/session/:id` (terminer session)
- [ ] Génération de inviteCode unique (6 caractères)
- [ ] Génération QR code
- [ ] Service de gestion des sessions (statuts)
- [ ] Nettoyage auto des sessions expirées (cron)

### Frontend
- [ ] Affichage lien d'invitation + QR code
- [ ] Bouton "Copier le lien"
- [ ] Bouton "Lancer la session" → redirection écran maître

---

## Phase 5 : Temps Réel avec Socket.io (Semaine 6)

### Backend Socket Events
- [ ] Handler `player:join` (joueur rejoint)
- [ ] Handler `session:start` (animateur lance)
- [ ] Handler `question:next` (passer question suivante)
- [ ] Handler `answer:submit` (joueur répond)
- [ ] Broadcast `session:started`
- [ ] Broadcast `question:show`
- [ ] Broadcast `question:end` (timer écoulé)
- [ ] Broadcast `leaderboard:update`
- [ ] Broadcast `session:finished`
- [ ] Emit individuel `answer:feedback`
- [ ] Emit écran maître `answer:stats`
- [ ] Gestion des déconnexions/reconnexions
- [ ] Service de calcul de score (formule rapidité)
- [ ] Service de classement (joueurs + équipes)

### Frontend Hooks & Services
- [ ] Hook `useSocket` avec reconnexion auto
- [ ] Hook `useSession` pour état session
- [ ] Fonction `calculateScore` côté client (vérif)
- [ ] Gestion des événements Socket entrants

---

## Phase 6 : Écran Maître (Semaine 6)

### Frontend Écran Maître
- [ ] Page écran maître (`/play/:sessionId/master`)
- [ ] Phase Lobby : liste joueurs en attente
- [ ] Affichage QR code + lien invitation
- [ ] Bouton "Lancer la partie"
- [ ] Affichage question courante (thème appliqué)
- [ ] Lecture audio synchronisée (Howler.js)
- [ ] Barre de timer animée
- [ ] Statistiques réponses temps réel (graphique barres)
- [ ] Classement intermédiaire (entre chaque question)
- [ ] Bouton "Question suivante"
- [ ] Podium final animé (Framer Motion)
- [ ] Boutons "Rejouer" / "Retour dashboard"

---

## Phase 7 : Interface Joueur (Semaine 7)

### Frontend Interface Joueur
- [ ] Page rejoindre (`/play/:inviteCode/join`)
- [ ] Formulaire pseudo + équipe
- [ ] Validation pseudo unique dans session
- [ ] Page attente lobby (`/play/:sessionId/player`)
- [ ] Affichage question avec thème appliqué
- [ ] Boutons QCM (4 choix) avec feedback visuel
- [ ] Input texte libre pour réponses texte
- [ ] Lecture audio locale (Howler.js)
- [ ] Timer visuel dégressif
- [ ] Écran feedback réponse (✅ bonne / ❌ mauvaise)
- [ ] Affichage score cumulé + position
- [ ] Écran classement intermédiaire
- [ ] Podium final (affichage simple)
- [ ] Gestion des erreurs de connexion

---

## Phase 8 : Thèmes Visuels (Semaine 7)

### Design System
- [ ] Configuration Tailwind avec couleurs personnalisées
- [ ] Thème Rétro/Néon : classes CSS + composants
- [ ] Thème Pop Coloré : classes CSS + composants
- [ ] Thème Élégant Sombre : classes CSS + composants
- [ ] Composant `ThemeProvider` avec Context
- [ ] Système de fonts (Google Fonts CDN)
- [ ] Animations de transition entre thèmes
- [ ] Tests visuels des 3 thèmes

### Intégration
- [ ] Application thème quiz sur écran maître
- [ ] Application thème quiz sur interface joueur
- [ ] Surcharge thème par question (si défini)
- [ ] Fond d'écran personnalisé par question (overlay)

---

## Phase 9 : Tests & Optimisation (Semaine 8)

### Tests Unitaires
- [ ] Tests backend : authController
- [ ] Tests backend : quizController
- [ ] Tests backend : sessionService
- [ ] Tests backend : scoreService
- [ ] Tests frontend : utilitaires
- [ ] Tests frontend : hooks (useSocket, useAuth)

### Tests d'Intégration
- [ ] Tests API : endpoints auth
- [ ] Tests API : endpoints quiz
- [ ] Tests API : endpoints session
- [ ] Tests Socket.io : player:join
- [ ] Tests Socket.io : session flow complet
- [ ] Tests composants React avec Testing Library

### Tests E2E (Playwright)
- [ ] Parcours admin : login → créer quiz → publier
- [ ] Parcours animateur : lancer session → piloter questions
- [ ] Parcours joueur : rejoindre → répondre → voir podium
- [ ] Test multi-fenêtres : 1 animateur + 3 joueurs

### Performance
- [ ] Optimisation bundle size (code splitting)
- [ ] Lazy loading des routes
- [ ] Compression images/audio côté serveur
- [ ] CDN pour assets statiques
- [ ] Tests de charge Socket.io (Artillery)
- [ ] Monitoring Sentry configuré

---

## Phase 10 : Documentation & Déploiement (Semaine 8)

### Documentation
- [ ] Documenter API REST (Swagger/OpenAPI)
- [ ] Documenter événements Socket.io
- [ ] Guide de déploiement (DEPLOYMENT.md)
- [ ] Guide de contribution (CONTRIBUTING.md)
- [ ] Screenshots pour README
- [ ] Vidéo démo (optionnelle)

### Déploiement
- [ ] Configurer GitHub Actions CI/CD
- [ ] Setup environnement staging
- [ ] Tests staging complets
- [ ] Configurer Vercel (frontend)
- [ ] Configurer Railway (backend + PostgreSQL)
- [ ] Configurer AWS S3 + CloudFront
- [ ] SSL/HTTPS configuré
- [ ] Variables d'environnement production
- [ ] Backup automatique BDD
- [ ] Monitoring production (Datadog/Sentry)

### Juridique & RGPD
- [ ] Page Conditions d'utilisation
- [ ] Page Politique de confidentialité
- [ ] Bannière cookies (si applicable)
- [ ] Clause responsabilité contenus

---

## Bugs Connus à Corriger

_Aucun pour le moment - projet en phase de planification_

---

## Améliorations Futures (Post-MVP)

### Priorité Haute
- [ ] Statistiques détaillées post-partie
- [ ] Export résultats CSV/PDF
- [ ] Historique sessions admin

### Priorité Moyenne
- [ ] Mode solo (entraînement)
- [ ] Templates de questions pré-remplies
- [ ] Duplication de quiz existant

### Priorité Basse
- [ ] Intégration Spotify
- [ ] Mode tournoi
- [ ] Personnalisation thèmes avancée

---

## Notes & Décisions Techniques

### Choix Architecture
- **Monorepo** : Frontend et Backend dans le même repository pour simplifier
- **Socket.io vs WebSocket natif** : Socket.io pour reconnexion auto et fallback
- **Zustand vs Redux** : Zustand plus léger et simple pour ce projet
- **Prisma vs TypeORM** : Prisma pour meilleure DX et typage TypeScript

### Contraintes Identifiées
- Limite 100 joueurs/session → scaling horizontal avec Redis Adapter si dépassement
- Synchro audio délicate → timestamp serveur de référence obligatoire
- RGPD : pas de données perso, pseudos temporaires uniquement

### Questions en Suspens
- [ ] Choisir provider d'hébergement final (Railway vs VPS)
- [ ] Décider si compression audio côté client ou serveur
- [ ] Définir stratégie de backup BDD (fréquence, rétention)

---

**Dernière mise à jour** : 21 juin 2026
