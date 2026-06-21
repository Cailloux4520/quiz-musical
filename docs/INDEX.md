# 📚 Index de la Documentation

Bienvenue dans la documentation complète de **Quiz Musical** ! Cette page vous guide vers les bonnes ressources selon vos besoins.

## 🚀 Démarrage Rapide

| Document | Description | Durée |
|----------|-------------|-------|
| [QUICKSTART.md](../QUICKSTART.md) | Installation en 1 minute sur VPS | ⚡ 1 min |
| [AUTO_INSTALL.md](../AUTO_INSTALL.md) | Guide d'installation automatique complète | 📖 5 min |
| [INSTALL.md](../INSTALL.md) | Installation pour développement local | 💻 10 min |

## 🌐 Déploiement Production

| Document | Description | Public |
|----------|-------------|--------|
| [DEPLOYMENT_UBUNTU.md](DEPLOYMENT_UBUNTU.md) | Guide complet pour Ubuntu 20.04 LTS | 🎯 Avancé |
| [DEPLOYMENT_QUICK.md](../DEPLOYMENT_QUICK.md) | Résumé des commandes de déploiement | ⚡ Intermédiaire |
| [DOCKER.md](DOCKER.md) | Configuration Docker pour production | 🐳 Avancé |

## 📖 Documentation Technique

| Document | Description |
|----------|-------------|
| [API.md](API.md) | Documentation des endpoints REST |
| [SOCKET_EVENTS.md](SOCKET_EVENTS.md) | Événements WebSocket (Socket.io) |
| [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) | Structure du projet |
| [PLAN.md](../PLAN.md) | Plan de développement et architecture |

## 🛠️ Maintenance & Support

| Document | Description |
|----------|-------------|
| [FAQ.md](FAQ.md) | Questions fréquentes et solutions |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Guide de contribution |
| [TODO.md](../TODO.md) | Tâches en cours et à venir |

## 🎯 Par Cas d'Usage

### Je veux installer l'application sur mon VPS

1. ✨ **Le plus simple** : [QUICKSTART.md](../QUICKSTART.md) - Une seule commande
2. 📖 **Détaillé** : [AUTO_INSTALL.md](../AUTO_INSTALL.md) - Comprendre chaque étape
3. 🔧 **Manuel** : [DEPLOYMENT_UBUNTU.md](DEPLOYMENT_UBUNTU.md) - Contrôle total

### Je veux développer en local

1. [INSTALL.md](../INSTALL.md) - Installation complète
2. [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Structure du code
3. [PLAN.md](../PLAN.md) - Architecture et design

### Je veux comprendre l'API

1. [API.md](API.md) - Tous les endpoints REST
2. [SOCKET_EVENTS.md](SOCKET_EVENTS.md) - Événements temps réel
3. [PLAN.md](../PLAN.md) - Architecture globale

### J'ai un problème

1. [FAQ.md](FAQ.md) - Vérifiez les problèmes courants
2. Logs : `pm2 logs quiz-backend`
3. [Issues GitHub](https://github.com/votre-user/quiz-musical/issues)

### Je veux contribuer

1. [CONTRIBUTING.md](../CONTRIBUTING.md) - Guide de contribution
2. [TODO.md](../TODO.md) - Tâches disponibles
3. [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Structure du code

## 📋 Scripts Disponibles

### Installation

| Script | Description | Usage |
|--------|-------------|-------|
| `install-full-auto.sh` | Installation complète automatique | `sudo ./scripts/install-full-auto.sh` |
| `install-ubuntu.sh` | Installation de base uniquement | `sudo ./scripts/install-ubuntu.sh` |

### Maintenance

| Script | Description | Usage |
|--------|-------------|-------|
| `deploy.sh` | Déploiement de l'application | `./scripts/deploy.sh` |
| `update.sh` | Mise à jour de l'application | `./scripts/update.sh` |
| `backup.sh` | Sauvegarde complète | `./scripts/backup.sh` |

### Développement

| Script | Description | Usage |
|--------|-------------|-------|
| `start.ps1` | Démarrage Windows (PowerShell) | `.\start.ps1` |

## 🔗 Liens Rapides

- **Repository GitHub** : https://github.com/Cailloux4520/quiz-musical
- **Demo Live** : https://demo-quiz.votresite.com
- **Issues** : https://github.com/Cailloux4520/quiz-musical/issues
- **Discussions** : https://github.com/Cailloux4520/quiz-musical/discussions

## 📊 État du Projet

- ✅ Backend API REST complet
- ✅ WebSocket temps réel (Socket.io)
- ✅ Frontend React fonctionnel
- ✅ Authentification JWT
- ✅ Gestion de sessions
- ✅ Scoring dynamique
- ✅ Scripts de déploiement
- ⚠️ Upload de fichiers (à implémenter)
- ⚠️ Mode équipes (partiel)
- ⚠️ Tests automatisés (à faire)

## 💡 Conseils

### Pour les débutants

1. Commencez par [QUICKSTART.md](../QUICKSTART.md)
2. Testez en local avec [INSTALL.md](../INSTALL.md)
3. Consultez la [FAQ.md](FAQ.md) si vous avez des questions

### Pour les développeurs

1. Lisez [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)
2. Consultez [API.md](API.md) et [SOCKET_EVENTS.md](SOCKET_EVENTS.md)
3. Vérifiez [TODO.md](../TODO.md) pour contribuer

### Pour la production

1. Utilisez [AUTO_INSTALL.md](../AUTO_INSTALL.md)
2. Configurez les sauvegardes (inclus dans le script)
3. Surveillez les logs : `pm2 logs`
4. Consultez [FAQ.md](FAQ.md) pour le dépannage

## 🆘 Besoin d'Aide ?

1. **Question générale** → [FAQ.md](FAQ.md)
2. **Problème technique** → [Issues GitHub](https://github.com/votre-user/quiz-musical/issues)
3. **Contribution** → [CONTRIBUTING.md](../CONTRIBUTING.md)
4. **Discussion** → [GitHub Discussions](https://github.com/votre-user/quiz-musical/discussions)

## 📝 Note sur la Documentation

Cette documentation est maintenue activement. Si vous trouvez une erreur ou une information manquante, n'hésitez pas à :
- Ouvrir une issue
- Proposer une Pull Request
- Démarrer une discussion

---

**Bon développement ! 🎵**
