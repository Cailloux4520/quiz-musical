# Guide de Contribution - Quiz Musical

Merci de votre intérêt pour contribuer au projet Quiz Musical ! 🎵

---

## 📋 Comment Contribuer

### Types de Contributions

Nous acceptons plusieurs types de contributions :

- 🐛 **Corrections de bugs**
- ✨ **Nouvelles fonctionnalités**
- 📝 **Améliorations de documentation**
- 🎨 **Améliorations UI/UX**
- ⚡ **Optimisations de performance**
- 🧪 **Tests supplémentaires**

---

## 🚀 Pour Commencer

### 1. Fork & Clone

```bash
# Fork le repository sur GitHub
# Puis cloner votre fork
git clone https://github.com/votre-username/quiz-musical.git
cd quiz-musical
```

### 2. Créer une branche

```bash
# Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/ma-fonctionnalite
```

**Convention de nommage des branches** :

- `feature/` → Nouvelles fonctionnalités
- `fix/` → Corrections de bugs
- `docs/` → Documentation
- `refactor/` → Refactoring
- `test/` → Ajout de tests

**Exemples** :
- `feature/spotify-integration`
- `fix/audio-sync-issue`
- `docs/api-examples`

### 3. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Configurer l'environnement local

Suivre le guide [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 💻 Standards de Code

### Style Guide

#### JavaScript/TypeScript

Nous utilisons **ESLint** et **Prettier** pour garantir un code cohérent.

```bash
# Vérifier le linting
npm run lint

# Corriger automatiquement
npm run lint:fix

# Formatter avec Prettier
npm run format
```

**Règles principales** :
- Indentation : 2 espaces
- Guillemets : simples `'`
- Point-virgule : obligatoire
- Trailing comma : oui

#### Conventions de nommage

**Variables & Fonctions** : camelCase
```typescript
const userName = 'Alice';
function calculateScore() {}
```

**Classes & Types** : PascalCase
```typescript
class QuizService {}
interface SessionData {}
type ThemeType = 'retro' | 'pop' | 'elegant';
```

**Constantes** : UPPER_SNAKE_CASE
```typescript
const MAX_PLAYERS = 100;
const DEFAULT_TIMER = 30;
```

**Composants React** : PascalCase
```typescript
function PlayerCard() {}
export default MasterScreen;
```

### Structure des Fichiers

**Backend**
```
backend/src/
├── controllers/    # Logique des routes
├── services/       # Logique métier
├── models/         # Types & interfaces
├── middleware/     # Express middleware
├── utils/          # Utilitaires
└── config/         # Configuration
```

**Frontend**
```
frontend/src/
├── components/     # Composants réutilisables
├── pages/          # Pages principales
├── hooks/          # Custom hooks
├── services/       # API calls
├── store/          # État global
├── utils/          # Utilitaires
└── styles/         # CSS global
```

---

## 🧪 Tests

### Écrire des Tests

Tous les nouveaux code doivent inclure des tests.

#### Tests Backend (Jest)

```typescript
// backend/src/services/__tests__/scoreService.test.ts
import { calculateScore } from '../scoreService';

describe('scoreService', () => {
  describe('calculateScore', () => {
    it('should return max points for instant answer', () => {
      const score = calculateScore(true, 100, 30000, 1000);
      expect(score).toBeGreaterThan(900);
    });

    it('should return 0 for incorrect answer', () => {
      const score = calculateScore(false, 5000, 30000, 1000);
      expect(score).toBe(0);
    });

    it('should return less points for slower answer', () => {
      const fastScore = calculateScore(true, 1000, 30000, 1000);
      const slowScore = calculateScore(true, 10000, 30000, 1000);
      expect(fastScore).toBeGreaterThan(slowScore);
    });
  });
});
```

#### Tests Frontend (Vitest + Testing Library)

```typescript
// frontend/src/components/__tests__/PlayerCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerCard from '../PlayerCard';

describe('PlayerCard', () => {
  it('renders player info correctly', () => {
    render(<PlayerCard pseudo="Alice" team="Équipe A" score={1500} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Équipe A')).toBeInTheDocument();
    expect(screen.getByText('1500 pts')).toBeInTheDocument();
  });
});
```

### Lancer les Tests

```bash
# Backend
cd backend
npm test

# Avec coverage
npm run test:coverage

# Frontend
cd frontend
npm test
```

---

## 📝 Commits & Pull Requests

### Convention de Commit

Nous utilisons **Conventional Commits** :

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types** :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage (pas de changement de code)
- `refactor` : Refactoring
- `test` : Ajout de tests
- `chore` : Tâches de maintenance

**Exemples** :

```bash
git commit -m "feat(quiz): add audio question type"
git commit -m "fix(socket): resolve player reconnection issue"
git commit -m "docs(api): add session endpoints examples"
git commit -m "test(score): add scoreService unit tests"
```

### Pull Request

#### 1. Pousser votre branche

```bash
git push origin feature/ma-fonctionnalite
```

#### 2. Ouvrir une PR sur GitHub

- Base : `develop` (pas `main`)
- Titre : résumé clair (ex: "Add Spotify integration")
- Description : utiliser le template

**Template de PR** :

```markdown
## Description
Brève description de ce que fait cette PR.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment tester
1. Étapes pour reproduire/tester
2. ...

## Checklist
- [ ] Le code suit le style guide du projet
- [ ] J'ai testé localement
- [ ] J'ai ajouté des tests
- [ ] J'ai mis à jour la documentation
- [ ] Tous les tests passent
- [ ] Pas de warnings ESLint
```

#### 3. Review Process

- Au moins 1 approbation requise
- Tous les tests CI doivent passer
- Pas de conflits avec `develop`

---

## 🐛 Signaler un Bug

### Avant de signaler

1. Vérifier que le bug n'est pas déjà signalé dans [Issues](https://github.com/votre-user/quiz-musical/issues)
2. Tester sur la dernière version
3. Vérifier la console navigateur (F12) pour les erreurs

### Créer une Issue

Utiliser le template "Bug Report" :

```markdown
## Description du bug
Description claire et concise.

## Reproduction
1. Aller sur '...'
2. Cliquer sur '...'
3. Observer l'erreur

## Comportement attendu
Ce qui devrait se passer.

## Screenshots
Si applicable, ajouter des captures.

## Environnement
- OS: [Windows 11]
- Navigateur: [Chrome 126]
- Version: [1.0.0]

## Logs
```
Coller les logs d'erreur ici
```
```

---

## ✨ Proposer une Fonctionnalité

### Créer une Feature Request

Utiliser le template "Feature Request" :

```markdown
## Fonctionnalité souhaitée
Description claire de la fonctionnalité.

## Problème résolu
Quel problème cette fonctionnalité résout-elle ?

## Solution proposée
Comment voyez-vous l'implémentation ?

## Alternatives considérées
Autres approches envisagées.

## Contexte supplémentaire
Screenshots, mockups, exemples.
```

### Discussion

Les feature requests sont discutées dans les Issues avant implémentation.

---

## 🎨 Contribution UI/UX

### Design System

Respecter les thèmes existants :
- **Rétro/Néon** : #1A0533, #FF006E, #00F5FF
- **Pop Coloré** : #FFE600, #6C2EE3, #FF2882
- **Élégant Sombre** : #000000, #C9A84C, #D4D4D4

### Accessibilité

- Ratio de contraste : minimum 4.5:1 (WCAG AA)
- Navigation clavier
- Labels ARIA
- Support screen readers

### Responsive

Tester sur :
- Mobile : 375px (iPhone SE)
- Tablet : 768px (iPad)
- Desktop : 1920px

---

## 📚 Contribution Documentation

### Où contribuer

- `README.md` : Vue d'ensemble du projet
- `docs/API.md` : Documentation API REST
- `docs/SOCKET_EVENTS.md` : Événements Socket.io
- `docs/DEPLOYMENT.md` : Guide de déploiement
- `PLAN.md` : Plan détaillé du projet
- `TODO.md` : Tâches à faire

### Style

- Français pour la documentation principale
- Anglais accepté pour code/commentaires
- Utiliser des exemples concrets
- Ajouter des diagrammes si pertinent (Mermaid)

---

## 🏆 Reconnaissance des Contributeurs

Les contributeurs sont listés dans :
- `CONTRIBUTORS.md`
- Section "Contributors" du README
- Release notes

---

## ❓ Questions

### Où poser des questions ?

- **Général** : [GitHub Discussions](https://github.com/votre-user/quiz-musical/discussions)
- **Bug** : [GitHub Issues](https://github.com/votre-user/quiz-musical/issues)
- **Chat** : [Discord](https://discord.gg/quiz-musical)

### Besoin d'aide ?

Taguer `@maintainers` dans votre PR ou issue.

---

## 📜 Code de Conduite

### Notre Engagement

Nous nous engageons à créer un environnement accueillant et inclusif.

### Standards

✅ **Comportements attendus** :
- Langage respectueux et inclusif
- Accepter les critiques constructives
- Se concentrer sur ce qui est meilleur pour la communauté
- Faire preuve d'empathie

❌ **Comportements inacceptables** :
- Harcèlement sous toutes ses formes
- Langage offensant ou déplacé
- Attaques personnelles
- Trolling

### Application

Les mainteneurs peuvent :
- Supprimer des commentaires inappropriés
- Bannir temporairement ou définitivement

Signaler un comportement : **report@quiz-app.com**

---

## 🔄 Workflow Git

```
main (production)
  ↑
  └─ develop (staging)
       ↑
       ├─ feature/spotify-integration
       ├─ fix/audio-sync
       └─ docs/api-examples
```

**Branches principales** :
- `main` : Production (déploiement auto)
- `develop` : Staging (déploiement auto)

**Workflow** :
1. Feature branch depuis `develop`
2. PR vers `develop`
3. Review + merge
4. PR `develop` → `main` pour release

---

## 📦 Release Process

### Versioning

Nous suivons [Semantic Versioning](https://semver.org/) :

- `MAJOR`.`MINOR`.`PATCH`
- Ex : `1.2.3`

**Incrémentation** :
- `MAJOR` : Breaking changes
- `MINOR` : Nouvelles fonctionnalités (rétrocompatible)
- `PATCH` : Corrections de bugs

### Créer une Release

1. Finaliser tous les changements sur `develop`
2. Créer PR `develop` → `main`
3. Update `CHANGELOG.md`
4. Merge la PR
5. Tag la release :

```bash
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

6. Créer release notes sur GitHub

---

## 🙏 Merci !

Merci de contribuer à Quiz Musical ! Chaque contribution compte, qu'elle soit grande ou petite.

**Maintainers actuels** :
- [@votre-username](https://github.com/votre-username)

**Contributors** :
Voir [CONTRIBUTORS.md](./CONTRIBUTORS.md)

---

**Dernière mise à jour** : 21 juin 2026
