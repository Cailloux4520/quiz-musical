# Guide de Contribution - MyQuiz

Merci de votre intérêt pour contribuer à MyQuiz ! Ce document explique comment participer au développement du projet.

## Code de Conduite

En participant à ce projet, vous vous engagez à maintenir un environnement respectueux et inclusif pour tous.

## Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/Cailloux4520/quiz-musical/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Fournissez un maximum de détails:
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs obtenu
   - Captures d'écran si pertinent
   - Environnement (OS, navigateur, versions)

### Suggérer une Fonctionnalité

1. Vérifiez la [Roadmap](README.md#roadmap) et les issues existantes
2. Créez une issue avec le template "Feature Request"
3. Expliquez:
   - Le problème que cela résoudrait
   - La solution proposée
   - Des alternatives envisagées

### Soumettre une Pull Request

#### 1. Fork et Clone

```bash
# Fork le repo sur GitHub
git clone https://github.com/VOTRE_USERNAME/quiz-musical.git
cd quiz-musical
git remote add upstream https://github.com/Cailloux4520/quiz-musical.git
```

#### 2. Créer une Branche

```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/mon-bug
```

**Conventions de nommage:**
- `feature/` - Nouvelle fonctionnalité
- `fix/` - Correction de bug
- `docs/` - Documentation
- `refactor/` - Refactoring
- `test/` - Tests
- `chore/` - Tâches diverses

#### 3. Développer

Installez et configurez l'environnement (voir [INSTALL.md](INSTALL.md))

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

#### 4. Respecter les Standards

**Code Style:**
- Utilisez ESLint et Prettier
- TypeScript strict mode
- Commentez le code complexe

```bash
# Linter
npm run lint

# Auto-fix
npm run lint:fix
```

**Commits:**

Suivez [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: ajoute export PDF des résultats"
git commit -m "fix: corrige calcul du score en mode équipe"
git commit -m "docs: met à jour guide installation"
```

**Types de commits:**
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage (sans changement de logique)
- `refactor:` - Refactoring
- `test:` - Tests
- `chore:` - Tâches de maintenance

#### 5. Tester

```bash
# Backend
cd backend
npm test
npm run lint

# Frontend
cd frontend
npm test
npm run lint

# Build
npm run build
```

Vérifiez que:
- ✅ Tous les tests passent
- ✅ Pas d'erreurs de linting
- ✅ Le build fonctionne
- ✅ Pas de régression

#### 6. Push et PR

```bash
# Sync avec upstream
git fetch upstream
git rebase upstream/main

# Push votre branche
git push origin feature/ma-fonctionnalite
```

Créez la Pull Request sur GitHub avec:
- **Titre clair** : Ex: "feat: ajoute export PDF des résultats"
- **Description détaillée**:
  - Quoi: Ce qui a été changé
  - Pourquoi: Motivation du changement
  - Comment: Approche technique
- **Screenshots** (si UI)
- **Tests** effectués
- **Breaking changes** si applicable

#### 7. Review

- Répondez aux commentaires
- Effectuez les changements demandés
- Push les modifications (la PR se met à jour automatiquement)

## Structure du Code

### Backend

```
backend/
├── src/
│   ├── routes/          # Routes Express (API endpoints)
│   ├── services/        # Logique métier
│   ├── middlewares/     # Auth, validation, error handling
│   ├── utils/           # Fonctions utilitaires
│   ├── types/           # Types TypeScript
│   └── index.ts         # Point d'entrée
├── prisma/
│   └── schema.prisma    # Schéma de base de données
└── tests/               # Tests unitaires et d'intégration
```

### Frontend

```
frontend/
├── src/
│   ├── pages/           # Pages React Router
│   ├── components/
│   │   ├── common/      # Composants réutilisables (Button, Card)
│   │   ├── admin/       # Composants admin
│   │   ├── game/        # Composants de jeu
│   │   └── player/      # Composants joueur
│   ├── store/           # State management (Zustand)
│   ├── services/        # API calls, Socket.io
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Fonctions utilitaires
│   ├── types/           # Types TypeScript
│   └── constants/       # Constantes
└── tests/               # Tests unitaires et d'intégration
```

## Standards de Code

### TypeScript

```typescript
// ✅ BON
interface UserProps {
  id: string;
  name: string;
  email: string;
}

export const UserCard: React.FC<UserProps> = ({ id, name, email }) => {
  return <div>{name}</div>;
};

// ❌ MAUVAIS
export const UserCard = (props: any) => {
  return <div>{props.name}</div>;
};
```

### React

```typescript
// ✅ BON - Composant fonctionnel avec types
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
};

// ❌ MAUVAIS - Pas de types
export const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

### API Routes

```typescript
// ✅ BON
router.get('/quiz/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    res.json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ❌ MAUVAIS
router.get('/quiz/:id', async (req, res) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  res.json(quiz);
});
```

### Gestion d'Erreur

```typescript
// ✅ BON
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestError(error.message);
  }
  console.error('Unexpected error:', error);
  throw new InternalServerError('Une erreur est survenue');
}

// ❌ MAUVAIS
try {
  return await riskyOperation();
} catch (error) {
  console.log(error);
}
```

## Tests

### Tests Unitaires

```typescript
// Backend (Jest)
describe('QuizService', () => {
  it('should create a quiz with valid data', async () => {
    const quizData = {
      title: 'Test Quiz',
      questions: [...]
    };
    
    const quiz = await quizService.create(quizData);
    
    expect(quiz.title).toBe('Test Quiz');
    expect(quiz.questions).toHaveLength(10);
  });
});

// Frontend (Vitest + React Testing Library)
describe('QuizCard', () => {
  it('renders quiz title', () => {
    render(<QuizCard quiz={mockQuiz} />);
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
  });
});
```

### Tests d'Intégration

```typescript
describe('Quiz API', () => {
  it('POST /api/quiz creates a quiz', async () => {
    const response = await request(app)
      .post('/api/quiz')
      .set('Authorization', `Bearer ${token}`)
      .send(quizData)
      .expect(201);
    
    expect(response.body.quiz).toBeDefined();
    expect(response.body.quiz.title).toBe(quizData.title);
  });
});
```

## Documentation

### Code

```typescript
/**
 * Calcule le score d'un joueur basé sur le temps de réponse
 * @param isCorrect - Si la réponse est correcte
 * @param responseTime - Temps de réponse en ms
 * @param basePoints - Points de base de la question
 * @returns Score calculé
 */
export function calculateScore(
  isCorrect: boolean,
  responseTime: number,
  basePoints: number
): number {
  if (!isCorrect) return 0;
  
  // Anti-triche: réponses < 200ms invalides
  if (responseTime < 200) return 0;
  
  // Bonus rapidité: max 50% des points
  const timeBonus = Math.max(0, 1 - (responseTime / 30000)) * 0.5;
  return Math.round(basePoints * (1 + timeBonus));
}
```

### README

Mettez à jour le README si vous ajoutez:
- Une nouvelle fonctionnalité majeure
- Un nouveau prérequis
- Une nouvelle commande

## Processus de Review

### Critères d'Acceptation

- ✅ Code propre et lisible
- ✅ Tests passent
- ✅ Documentation à jour
- ✅ Pas de régression
- ✅ Respect des conventions
- ✅ Performance acceptable

### Timeline

- Première review: sous 48h
- Feedback: dans les 24h
- Merge: après approbation de 2+ reviewers

## Priorités

### High Priority
- Bugs critiques
- Sécurité
- Performance
- Accessibilité

### Medium Priority
- Nouvelles fonctionnalités
- Améliorations UX
- Refactoring

### Low Priority
- Optimisations mineures
- Cosmétique
- Documentation

## Outils Recommandés

### Développement
- **VS Code** avec extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Prisma
  - GitLens

### Testing
- Backend: Jest, Supertest
- Frontend: Vitest, React Testing Library, Playwright

### Debugging
- **Backend**: VS Code Debugger, Postman
- **Frontend**: React DevTools, Chrome DevTools

## Questions ?

- 💬 [Discussions GitHub](https://github.com/Cailloux4520/quiz-musical/discussions)
- 📧 Email: support@quiz-app.com
- 🐛 [Issues](https://github.com/Cailloux4520/quiz-musical/issues)

## Remerciements

Merci de contribuer à MyQuiz ! Chaque contribution, petite ou grande, est appréciée. 🙏
