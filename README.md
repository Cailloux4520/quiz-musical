# 🎵 Quiz Musical - Application de Quiz en Temps Réel

Application web de quiz musical en mode soirée, inspirée de Kahoot. Créez des quiz musicaux immersifs avec extraits audio, questions visuelles et thèmes personnalisables. Animez des sessions en direct avec classement en temps réel !

## 🚀 Installation Rapide

### Option 1 : Installation Automatique sur VPS (Recommandé)

```bash
wget -qO- https://raw.githubusercontent.com/votre-user/quiz-musical/main/scripts/install-full-auto.sh | sudo bash
```

⏱️ **15-20 minutes** - Tout est configuré automatiquement ! Voir [QUICKSTART.md](QUICKSTART.md)

### Option 2 : Développement Local

```bash
docker-compose up -d
cd backend && npm install && npm run prisma:migrate && npm run dev
cd ../frontend && npm install && npm run dev
```

Voir [INSTALL.md](INSTALL.md) pour plus de détails.

## ✨ Fonctionnalités Principales

- 🎨 **3 Thèmes Visuels** : Rétro/Néon, Pop Coloré, Élégant Sombre
- 🎵 **Questions Multimédia** : Audio, textes, images (pochettes d'albums)
- ⚡ **Temps Réel** : Synchronisation instantanée via WebSocket
- 📱 **Multi-Appareils** : Interface joueur optimisée mobile
- 🏆 **Scoring Dynamique** : Points basés sur la rapidité de réponse
- 👥 **Mode Équipes** : Classement individuel et par équipe
- 🎭 **Sans Compte Joueur** : Rejoignez avec un simple pseudo

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

### Déploiement sur VPS Ubuntu

#### 🚀 Installation Automatique (Recommandé)

Une seule commande pour tout installer :

```bash
# Sur votre VPS Ubuntu 20.04
wget https://raw.githubusercontent.com/votre-user/quiz-musical/main/scripts/install-full-auto.sh
chmod +x install-full-auto.sh
sudo ./install-full-auto.sh
```

Suivez les instructions : [AUTO_INSTALL.md](AUTO_INSTALL.md)

#### 📖 Installation Manuelle

Guides détaillés :
- [Guide complet](docs/DEPLOYMENT_UBUNTU.md) - Toutes les étapes détaillées
- [Guide rapide](DEPLOYMENT_QUICK.md) - Installation pas à pas
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
┌──────▼──────┐   ┌────────┐
│ PostgreSQL  │   │   S3   │ ← Fichiers audio/image
└─────────────┘   └────────┘
```

## 🎯 Roadmap

### ✅ Version 1.0 (MVP)
- [x] Création de quiz avec 3 types de questions
- [x] Thèmes visuels personnalisables
- [x] Sessions temps réel avec Socket.io
- [x] Scoring basé sur rapidité
- [x] Écran maître + interface joueur

### 🔜 Version 1.1
- [ ] Statistiques détaillées post-partie
- [ ] Export de résultats (CSV/PDF)
- [ ] Historique des sessions
- [ ] Mode solo (entraînement)

### 🚀 Version 2.0
- [ ] Intégration Spotify
- [ ] Application mobile native
- [ ] Marketplace de quiz publics
- [ ] API publique

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
- **GitHub Issues** : [Créer un ticket](https://github.com/votre-user/quiz-musical/issues)
- **Discord** : [Rejoindre la communauté](https://discord.gg/quiz-musical)

---

**Fait avec** : React • Node.js • Socket.io • Tailwind CSS • PostgreSQL
