# 🎯 MyQuiz - Application de Quiz en Temps Réel

Application web de quiz interactif en mode soirée, inspirée de Kahoot. Créez des quiz immersifs avec thèmes variés (musique, histoire, géographie, culture générale, cinéma, séries TV, animés/mangas, et plus). Animez des sessions en direct avec classement en temps réel et exports professionnels !

## ✨ Fonctionnalités Principales

### 🎨 Création de Quiz
- **8 Thèmes de Quiz** : Musique 🎵, Histoire 📜, Géographie 🌍, Culture Générale 📚, Cinéma 🎬, Séries TV 📺, Animé/Manga 🎌, Divers 🎭
- **Thèmes Visuels Personnalisables** : Créez vos propres palettes de couleurs et typographies
- **Types de Questions Variés** : QCM texte, audio, images, vidéos YouTube
- **Import/Export Excel** : Importez 50+ questions en quelques secondes
- **Médiathèque Intégrée** : Gérez vos fichiers audio, images, vidéos

### 🎮 Animation en Direct
- ⚡ **Temps Réel** : Synchronisation instantanée via Socket.io WebSocket
- 📱 **Multi-Appareils** : Interface joueur optimisée mobile (320px+)
- 🏆 **Scoring Intelligent** : Points basés sur rapidité + validation anti-triche (<200ms)
- 👥 **Mode Équipes** : Classement individuel et par équipe avec couleurs
- 🎭 **Sans Compte Joueur** : Rejoignez avec un simple pseudo
- 📊 **Stats en Direct** : Distribution des réponses en temps réel
- 🎉 **Podium 3D** : Animations confettis et sons de victoire

### 📈 Statistiques & Exports
- 📊 **Dashboard Admin** : KPI, graphiques sessions/jour, top quiz
- 📄 **Export PDF** : Rapport complet avec podium, classements, statistiques
- 📊 **Export Excel** : 5 feuilles (résumé, joueurs, équipes, questions, matrice)
- 📋 **Export CSV** : Classement simple pour import externe
- 🔒 **Sécurisé** : Exports protégés par authentification JWT

## 🚀 Démarrage Rapide

### Développement Local

Voir le guide complet : [INSTALL.md](INSTALL.md)

**Résumé rapide :**

```bash
# 1. Démarrer Docker
docker-compose up -d

# 2. Backend
cd backend
npm install
npm run prisma:migrate
npm run dev

# 3. Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

### 🌐 Déploiement sur VPS

Pour déployer sur un VPS (Ubuntu 20.04/22.04), consultez nos guides complets:

- **[📘 Guide Hostinger](docs/DEPLOYMENT.md)** - Guide spécifique Hostinger VPS avec DNS et SSL
- **[🚀 Guide Complet Ubuntu](docs/DEPLOYMENT.md)** - Installation détaillée sur Ubuntu
- **[⚡ Installation Rapide](INSTALL.md)** - Guide d'installation développement local

```bash
# Installation automatique sur Ubuntu
wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh
chmod +x install-full-auto.sh
sudo ./install-full-auto.sh
```

### Accès

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Admin par défaut** : admin@quiz.com / admin123 (à changer !)

## 📖 Documentation

- [Plan Complet du Projet](./PLAN.md) - Architecture, fonctionnalités, design
- [Documentation API](./docs/API.md) - Endpoints REST
- [Événements Socket.io](./docs/SOCKET_EVENTS.md) - Communication temps réel
- [Guide de Déploiement](./docs/DEPLOYMENT.md) - Mise en production

## 🏗️ Architecture

```
┌─────────────┐
│   React     │ ← Interface Admin, Écran Maître, Joueurs
│  + Tailwind │
└──────┬──────┘
       │ REST + WebSocket
┌──────▼──────┐
│   Node.js   │ ← API + Socket.io
│   Express   │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │ ← Base de données
└─────────────┘
```

**Stack Technique:**
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Socket.io Client
- **Backend**: Node.js 18, Express, TypeScript, Prisma ORM, Socket.io Server
- **Base de données**: PostgreSQL 15
- **Déploiement**: Nginx, PM2, Docker, Let's Encrypt SSL

## 🎯 Roadmap

### ✅ Version 1.0 (Actuel)
- [x] 8 thèmes de quiz variés
- [x] Création de quiz avec médias
- [x] Thèmes visuels personnalisables (couleurs, typographies)
- [x] Sessions temps réel avec Socket.io
- [x] Scoring basé sur rapidité
- [x] Écran maître + interface joueur mobile
- [x] Mode individuel et par équipes
- [x] Exports PDF, Excel, CSV
- [x] Statistiques détaillées post-partie

### 🚀 Version 1.1 (En cours)
- [ ] Marketplace de quiz publics
- [ ] Mode solo (entraînement)
- [ ] Intégration Spotify
- [ ] Support multilingue

### 🌟 Version 2.0 (Futur)
- [ ] Application mobile native
- [ ] API publique
- [ ] Tournois et compétitions
- [ ] IA pour génération de questions

## 🛠️ Scripts de Maintenance

Scripts disponibles pour gérer l'application en production :

### Mise à jour de l'application
```bash
sudo /home/quizapp/quiz-musical/scripts/update-app.sh
```
Pull les dernières modifications depuis GitHub, installe les dépendances, rebuild le frontend et redémarre le backend.

### Génération du fichier de configuration
```bash
sudo /home/quizapp/quiz-musical/scripts/generate-config.sh
```
Crée `/home/quizapp/quiz-musical-config.txt` avec toutes les informations de configuration, credentials et commandes utiles.

### Sauvegarde
```bash
/home/quizapp/quiz-musical/scripts/backup.sh
```
Sauvegarde complète de la base de données, fichiers MinIO et configuration.

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

### Développement

```bash
# Lancer les tests
npm run test

# Linter
npm run lint

# Build production
npm run build
```

## 📄 Licence

MIT License - voir [LICENSE](./LICENSE)

## 👥 Équipe

Développé avec ❤️ pour les amateurs de musique et de quiz

## 📞 Support

- **Email** : support@quiz-app.com
- **GitHub Issues** : [Créer un ticket](https://github.com/Cailloux4520/quiz-musical/issues)
- **Discord** : [Rejoindre la communauté](https://discord.gg/quiz-musical)

---

**Fait avec** : React • Node.js • Socket.io • Tailwind CSS • PostgreSQL
ar Cailloux - 2026

---

**Créé avec** : React • Node.js • Socket.io • Tailwind CSS • PostgreSQL • TypeScript