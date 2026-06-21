# 🎵 Quiz Musical - Application de Quiz en Temps Réel

Application web de quiz musical en mode soirée, inspirée de Kahoot. Créez des quiz musicaux immersifs avec extraits audio, questions visuelles et thèmes personnalisables. Animez des sessions en direct avec classement en temps réel et exports professionnels !

## ✨ Fonctionnalités Principales

### 🎨 Création de Quiz
- **3 Thèmes Visuels** : Rétro/Néon, Pop Coloré, Élégant Sombre
- **9 Types de Questions** : QCM audio, blind test, pochettes d'albums, vidéos YouTube, texte libre
- **Import/Export Excel** : Importez 50+ questions en 5 secondes
- **Médiathèque** : Gérez vos fichiers audio, images, vidéos avec MinIO

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

### Déploiement sur VPS Ubuntu

#### 🚀 Installation Automatique (Recommandé)

Une seule commande pour tout installer :

```bash
# Sur votre VPS Ubuntu 20.04
wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh
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
