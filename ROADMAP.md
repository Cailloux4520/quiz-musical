# 🗺️ Roadmap - Quiz Musical V2

## Vue d'Ensemble

Implémentation complète des spécifications V2 en **10 phases** sur environ **10 semaines**.

---

## 📋 Phase 1 : Fondations (Semaine 1-2)

### 🎯 Objectif
Mettre à jour l'architecture pour supporter les nouvelles fonctionnalités.

### ✅ Tâches Backend

#### 1.1 Schéma Base de Données
- [ ] Mettre à jour `User` model (rôles: admin, creator, animator)
- [ ] Ajouter `defaultTimePerQuestion` à `Quiz`
- [ ] Étendre `Question` model :
  - [ ] Nouveaux types (text_free, blind_test, album_cover, youtube)
  - [ ] Champs audio (startTime, endTime, duration)
  - [ ] Champs réponse libre (correctAnswer, acceptedAnswers, caseSensitive)
  - [ ] customTheme optionnel
- [ ] Ajouter `qrCodeUrl` à `Session`
- [ ] Créer model `Team`
- [ ] Ajouter `teamId` à `Player`
- [ ] Étendre `Answer` (responseTime, scoreEarned)
- [ ] Créer model `Media`
- [ ] Lancer migration Prisma

#### 1.2 Médiathèque API
- [ ] Endpoint `POST /api/media/upload` (multer + MinIO)
- [ ] Endpoint `GET /api/media` (liste avec filtres)
- [ ] Endpoint `GET /api/media/:id` (détails)
- [ ] Endpoint `DELETE /api/media/:id`
- [ ] Validation formats (MP3, WAV, OGG, JPG, PNG, WEBP)
- [ ] Extraction métadonnées audio (durée)
- [ ] Limitation taille fichiers
- [ ] Tests API médiathèque

#### 1.3 Gestion des Rôles
- [ ] Middleware `requireRole(['admin', 'creator'])`
- [ ] Mise à jour routes protégées
- [ ] Seed avec utilisateurs de test (admin, creator, animator)

#### 1.4 Génération QR Code
- [ ] Installer `qrcode` npm
- [ ] Service `generateQRCode(url)`
- [ ] Upload QR vers MinIO
- [ ] Retourner URL dans création session

### ✅ Tâches Frontend

#### 1.5 Page Médiathèque
- [ ] Route `/admin/media`
- [ ] Composant `MediaLibrary`
- [ ] Upload drag & drop
- [ ] Liste médias avec preview
- [ ] Player audio intégré
- [ ] Visionneuse image
- [ ] Recherche et filtres
- [ ] Pagination

#### 1.6 Mise à Jour QuizForm
- [ ] Champ `defaultTimePerQuestion`
- [ ] Interface améliorée

---

## 📝 Phase 2 : Éditeur de Questions Avancé (Semaine 3-4)

### 🎯 Objectif
Permettre la création de tous les types de questions avec médias.

### ✅ Tâches Backend

#### 2.1 API Questions Étendues
- [ ] Endpoint `POST /api/quiz/:id/questions` (création)
- [ ] Endpoint `PUT /api/quiz/:id/questions/:qId` (modification)
- [ ] Endpoint `DELETE /api/quiz/:id/questions/:qId`
- [ ] Endpoint `PUT /api/quiz/:id/questions/reorder` (réorganiser ordre)
- [ ] Validation par type de question
- [ ] Tests API questions

### ✅ Tâches Frontend

#### 2.2 Composant QuestionEditor
- [ ] Composant `QuestionEditor.tsx`
- [ ] Sélecteur type de question (cards visuelles)
- [ ] Formulaire dynamique selon type
- [ ] Intégration sélecteur média (médiathèque)
- [ ] Preview question en temps réel
- [ ] Drag & drop pour réorganiser questions

#### 2.3 Types de Questions - UI

**Question Texte QCM :**
- [ ] 4 inputs pour choix A, B, C, D
- [ ] Radio buttons pour bonne réponse
- [ ] Input timeLimit

**Question Texte Libre :**
- [ ] Input réponse correcte
- [ ] Textarea variantes acceptées
- [ ] Checkbox case sensitive

**Question Image :**
- [ ] Bouton "Choisir image" (modal médiathèque)
- [ ] Preview image sélectionnée
- [ ] 4 choix + réponse correcte

**Question Audio :**
- [ ] Bouton "Choisir audio"
- [ ] Waveform audio avec sélection start/end
- [ ] Preview extrait
- [ ] 4 choix

**Blind Test :**
- [ ] Sélecteur audio
- [ ] Radio: Titre / Artiste / Année / Album
- [ ] 4 choix

**Pochette Album :**
- [ ] Sélecteur image pochette
- [ ] Radio: Album / Artiste
- [ ] 4 choix

**YouTube :**
- [ ] Input URL YouTube
- [ ] Preview (avec avertissement pas de vidéo pendant jeu)
- [ ] Input start/end time
- [ ] Checkbox "Afficher vidéo après réponse"
- [ ] 4 choix

#### 2.4 Page Questions
- [ ] Route `/admin/quiz/:id/questions`
- [ ] Liste questions avec drag & drop
- [ ] Bouton "Ajouter question"
- [ ] Modal QuestionEditor
- [ ] Suppression question
- [ ] Duplication question

---

## 📊 Phase 3 : Import/Export Excel (Semaine 4)

### 🎯 Objectif
Permettre import/export en masse de questions.

### ✅ Tâches Backend

#### 3.1 Import Excel
- [ ] Installer `xlsx` ou `exceljs`
- [ ] Endpoint `POST /api/quiz/:id/import-excel`
- [ ] Parser fichier XLSX
- [ ] Validation colonnes
- [ ] Créer questions en batch
- [ ] Associer médias (match par filename)
- [ ] Retourner rapport (réussis, erreurs)
- [ ] Tests import

#### 3.2 Export Excel
- [ ] Endpoint `GET /api/quiz/:id/export-excel`
- [ ] Générer XLSX avec questions
- [ ] Inclure toutes colonnes spec
- [ ] Tests export

### ✅ Tâches Frontend

#### 3.3 UI Import/Export
- [ ] Bouton "Importer Excel" sur page questions
- [ ] Upload fichier XLSX
- [ ] Afficher rapport import
- [ ] Bouton "Exporter Excel"
- [ ] Download fichier généré
- [ ] Télécharger template vide

---

## 👥 Phase 4 : Gestion d'Équipes (Semaine 5)

### 🎯 Objectif
Permettre jeu en équipe avec classement.

### ✅ Tâches Backend

#### 4.1 API Équipes
- [ ] Événement Socket `team:create`
- [ ] Événement Socket `team:join`
- [ ] Calcul score équipe (somme joueurs)
- [ ] Classement équipes
- [ ] Tests Socket équipes

### ✅ Tâches Frontend

#### 4.2 Flux Connexion Joueur
- [ ] Page `/join/:code` améliorée
- [ ] Input pseudo
- [ ] Radio buttons: "Seul" / "Créer équipe" / "Rejoindre équipe"
- [ ] Si "Créer équipe": modal input nom équipe
- [ ] Si "Rejoindre équipe": liste équipes existantes
- [ ] Connexion Socket avec teamId

#### 4.3 Salle d'Attente Équipes
- [ ] Afficher liste équipes
- [ ] Compteur joueurs par équipe
- [ ] Permettre changer d'équipe avant début

---

## 🖥️ Phase 5 : Écrans Optimisés (Semaine 6-7)

### 🎯 Objectif
Créer interfaces optimisées pour écran géant (animateur) et smartphone (joueur).

### ✅ Tâches Backend

#### 5.1 Socket Events Détaillés
- [ ] `question:started` avec données complètes
- [ ] `question:ended` avec stats
- [ ] `answer:stats` broadcast temps réel
- [ ] `leaderboard:update` après chaque réponse

### ✅ Tâches Frontend

#### 5.2 Écran Joueur Mobile
- [ ] Route `/play/:code` responsive mobile
- [ ] Timer circulaire animé
- [ ] Grille 2x2 boutons réponse (A, B, C, D)
- [ ] Couleurs Kahoot-style
- [ ] Audio player intégré
- [ ] Image full-width
- [ ] Écran "Réponse enregistrée"
- [ ] Affichage score gagné
- [ ] Tests responsive (320px → 428px)

#### 5.3 Écran Animateur (Master)
- [ ] Route `/master/:sessionId`
- [ ] Layout 3 colonnes
- [ ] Sidebar gauche: Contrôles
  - [ ] Bouton Démarrer
  - [ ] Bouton Pause
  - [ ] Bouton Question Suivante
  - [ ] Bouton Terminer
- [ ] Zone centrale: Question + Médias
  - [ ] Affichage question actuelle
  - [ ] Audio player
  - [ ] Image viewer
  - [ ] Vidéo YouTube (après révélation)
- [ ] Sidebar droite: Stats
  - [ ] Nombre réponses reçues
  - [ ] Graphique répartition (A, B, C, D)
  - [ ] Top 10 classement live
- [ ] Tests écran 1920x1080

#### 5.4 Salle d'Attente Animée
- [ ] Afficher QR Code (grande taille)
- [ ] Code session (très gros)
- [ ] Animations thématiques :
  - [ ] Années 80: néons clignotants
  - [ ] Années 90: CD qui tournent
  - [ ] Jeux Vidéo: pixels animés
  - [ ] Cinéma: pellicule qui défile
- [ ] Liste joueurs connectés (mise à jour live)
- [ ] Compteur total

---

## 🏆 Phase 6 : Scores & Classements (Semaine 7-8)

### 🎯 Objectif
Implémenter calcul de score basé sur temps de réponse et classements.

### ✅ Tâches Backend

#### 6.1 Calcul de Score
- [ ] Fonction `calculateScore(isCorrect, responseTime, totalTime, maxPoints)`
- [ ] Validation temps réponse (anti-triche)
- [ ] Mise à jour Player.score
- [ ] Sauvegarde Answer avec scoreEarned et responseTime
- [ ] Tests calcul score

#### 6.2 Classements
- [ ] Fonction `getPlayerRanking(sessionId)`
- [ ] Fonction `getTeamRanking(sessionId)`
- [ ] Calcul évolution positions
- [ ] Tests classements

### ✅ Tâches Frontend

#### 6.2 Affichage Classements
- [ ] Composant `Leaderboard.tsx`
- [ ] Classement individuel (avatar, pseudo, score)
- [ ] Classement équipes
- [ ] Indicateur évolution (↑ ↓ →)
- [ ] Highlight top 3
- [ ] Animation transitions

---

## 🎉 Phase 7 : Podium Final (Semaine 8)

### 🎯 Objectif
Écran de célébration avec animations.

### ✅ Tâches Backend

#### 7.1 API Résultats Finaux
- [ ] Endpoint `GET /api/session/:id/final-results`
- [ ] Retourner top 3 joueurs
- [ ] Retourner top 3 équipes
- [ ] Statistiques session complètes

### ✅ Tâches Frontend

#### 7.2 Page Podium
- [ ] Route `/podium/:sessionId`
- [ ] Podium 3D (1er au centre, 2e et 3e côtés)
- [ ] Affichage joueurs + scores
- [ ] Affichage équipes + scores
- [ ] Animations :
  - [ ] Installer `canvas-confetti`
  - [ ] Confettis animés
  - [ ] Paillettes dorées
  - [ ] Sons de victoire (trompette)
- [ ] Bouton "Télécharger résultats"
- [ ] Bouton "Nouvelle session"

---

## 📊 Phase 8 : Dashboard & Statistiques (Semaine 9)

### 🎯 Objectif
Tableau de bord admin avec statistiques.

### ✅ Tâches Backend

#### 8.1 API Dashboard
- [ ] Endpoint `GET /api/dashboard/stats`
  - [ ] Total quiz
  - [ ] Total sessions
  - [ ] Total joueurs uniques
  - [ ] Total questions
  - [ ] Top quiz (plus joués)
  - [ ] Sessions récentes
  - [ ] Stockage utilisé
- [ ] Tests API dashboard

### ✅ Tâches Frontend

#### 8.2 Page Dashboard
- [ ] Route `/admin/dashboard`
- [ ] Cards statistiques (4 KPI en haut)
- [ ] Graphique sessions par jour (Chart.js ou Recharts)
- [ ] Pie chart types de questions
- [ ] Liste top quiz
- [ ] Liste sessions récentes
- [ ] Indicateur stockage (barre progression)

---

## 📥 Phase 9 : Exports (Semaine 9)

### 🎯 Objectif
Export résultats en PDF, Excel, CSV.

### ✅ Tâches Backend

#### 9.1 Export PDF
- [ ] Installer `pdfkit` ou `puppeteer`
- [ ] Endpoint `GET /api/session/:id/export/pdf`
- [ ] Générer PDF :
  - [ ] En-tête (titre quiz, date)
  - [ ] Classement final
  - [ ] Détail par question
  - [ ] Statistiques globales
- [ ] Tests export PDF

#### 9.2 Export Excel
- [ ] Endpoint `GET /api/session/:id/export/excel`
- [ ] Feuilles multiples :
  - [ ] Résumé
  - [ ] Classement joueurs
  - [ ] Classement équipes
  - [ ] Détail questions
  - [ ] Réponses individuelles (matrice)
- [ ] Tests export Excel

#### 9.3 Export CSV
- [ ] Endpoint `GET /api/session/:id/export/csv`
- [ ] Format simple (classement)
- [ ] Tests export CSV

### ✅ Tâches Frontend

#### 9.4 UI Exports
- [ ] Boutons export sur page podium
- [ ] Boutons export sur liste sessions admin
- [ ] Download automatique fichier
- [ ] Indicateur chargement

---

## 🧪 Phase 10 : Tests & Polish (Semaine 10)

### 🎯 Objectif
Tests complets et optimisations.

### ✅ Tâches Backend

#### 10.1 Tests Unitaires
- [ ] Tests calcul score
- [ ] Tests génération code session
- [ ] Tests validation import Excel
- [ ] Tests JWT auth
- [ ] Tests helpers/utils
- [ ] Coverage > 80%

#### 10.2 Tests API
- [ ] Tests endpoints auth
- [ ] Tests CRUD quiz
- [ ] Tests CRUD questions
- [ ] Tests médiathèque
- [ ] Tests sessions
- [ ] Tests exports

#### 10.3 Tests Socket.io
- [ ] Tests connexion joueur
- [ ] Tests émission réponse
- [ ] Tests broadcast classement
- [ ] Tests multi-clients
- [ ] Tests déconnexions

### ✅ Tâches Frontend

#### 10.4 Tests Frontend
- [ ] Tests composants UI
- [ ] Tests hooks personnalisés
- [ ] Tests stores Zustand
- [ ] Tests responsive (Cypress ou Playwright)

#### 10.5 Optimisations
- [ ] Lazy loading routes
- [ ] Optimisation images (WebP)
- [ ] Compression audio (codec optimal)
- [ ] Code splitting
- [ ] Caching API
- [ ] Debounce recherches

#### 10.6 Documentation
- [ ] Mettre à jour README.md
- [ ] Documenter API (Swagger ou Postman)
- [ ] Guide utilisateur
- [ ] Guide déploiement

---

## 📈 Métriques de Succès

### Phase 1
- ✅ Schéma Prisma mis à jour
- ✅ Médiathèque fonctionnelle
- ✅ 3 utilisateurs test créés

### Phase 2
- ✅ Tous types de questions créables
- ✅ 10 questions test créées

### Phase 3
- ✅ Import Excel 50 questions en < 5s
- ✅ Export fonctionnel

### Phase 4
- ✅ Création d'équipe fluide
- ✅ Score équipe correct

### Phase 5
- ✅ Mobile responsive (320-428px)
- ✅ Écran animateur sur 1920x1080
- ✅ Latence Socket < 100ms

### Phase 6
- ✅ Calcul score précis
- ✅ Classement mis à jour en < 500ms

### Phase 7
- ✅ Animations fluides
- ✅ Confettis fonctionnels

### Phase 8
- ✅ Dashboard chargé en < 2s
- ✅ Graphiques lisibles

### Phase 9
- ✅ PDF généré en < 3s
- ✅ Excel exporté en < 2s

### Phase 10
- ✅ Coverage tests > 80%
- ✅ Lighthouse score > 90

---

## 🚀 Ordre de Priorité Recommandé

### 🔥 Critique (Semaine 1-4)
1. **Phase 1** - Fondations
2. **Phase 2** - Éditeur questions
3. **Phase 3** - Import/Export

### ⚡ Important (Semaine 5-7)
4. **Phase 4** - Équipes
5. **Phase 5** - Écrans optimisés
6. **Phase 6** - Scores

### 📊 Essentiel (Semaine 8-9)
7. **Phase 7** - Podium
8. **Phase 8** - Dashboard
9. **Phase 9** - Exports

### ✨ Polish (Semaine 10)
10. **Phase 10** - Tests & Optimisations

---

## 📝 Prochaines Actions

**Recommandation : Commencer par Phase 1**

**Tâche immédiate :**
1. Mettre à jour `backend/prisma/schema.prisma`
2. Créer migration `npx prisma migrate dev`
3. Créer model `Media` et endpoints upload
4. Tester upload fichier

**Commande pour démarrer :**
```bash
cd backend
npx prisma migrate dev --name add_media_and_extended_types
npm run dev
```

**Prêt à commencer la Phase 1 ? 🚀**
