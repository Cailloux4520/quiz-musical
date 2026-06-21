# Guide de Déploiement - Quiz Musical

Ce guide détaille le déploiement de l'application en production.

---

## 📋 Prérequis

- Compte **Vercel** (frontend)
- Compte **Railway** (backend + PostgreSQL) ou VPS
- Compte **AWS S3** (stockage fichiers) ou service équivalent
- Nom de domaine configuré
- GitHub repository

---

## 🏗️ Architecture de Production

```
┌─────────────────────────────────────────────┐
│   quiz-app.com (Frontend)                   │
│   ↓ Vercel                                  │
│   - React Build                             │
│   - CDN Global                              │
│   - SSL automatique                         │
└─────────────────┬───────────────────────────┘
                  │
                  │ HTTPS + WebSocket
                  ↓
┌─────────────────────────────────────────────┐
│   api.quiz-app.com (Backend)                │
│   ↓ Railway                                 │
│   - Node.js + Express                       │
│   - Socket.io Server                        │
│   - PostgreSQL (managed)                    │
└─────────────────┬───────────────────────────┘
                  │
                  │
┌─────────────────▼───────────────────────────┐
│   S3 + CloudFront CDN                       │
│   - Fichiers audio/image                    │
│   - Distribution globale                    │
└─────────────────────────────────────────────┘
```

---

## 🚀 Déploiement Frontend (Vercel)

### Étape 1 : Préparer le projet

```bash
cd frontend

# Vérifier que le build fonctionne localement
npm run build
npm run preview
```

### Étape 2 : Configuration Vercel

Créer `vercel.json` à la racine du dossier frontend :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_SOCKET_URL": "@socket-url"
  }
}
```

### Étape 3 : Déployer sur Vercel

**Méthode 1 : Via l'interface web**

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer "New Project"
3. Importer le repository GitHub
4. Sélectionner le dossier `frontend`
5. Configurer les variables d'environnement :
   - `VITE_API_URL` → `https://api.quiz-app.com`
   - `VITE_SOCKET_URL` → `https://api.quiz-app.com`
6. Cliquer "Deploy"

**Méthode 2 : Via CLI**

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Déployer (première fois)
cd frontend
vercel

# Déployer en production
vercel --prod
```

### Étape 4 : Configurer le domaine

1. Dans le dashboard Vercel, aller dans "Settings" → "Domains"
2. Ajouter votre domaine : `quiz-app.com`
3. Configurer les DNS selon les instructions Vercel
4. Attendre la propagation (~10-30 min)

**Configuration DNS typique** (chez votre registrar) :

```
Type  | Name | Value                        | TTL
------|------|------------------------------|------
A     | @    | 76.76.19.19                  | 3600
CNAME | www  | cname.vercel-dns.com         | 3600
```

---

## ⚙️ Déploiement Backend (Railway)

### Étape 1 : Préparer le projet

```bash
cd backend

# Vérifier que le build fonctionne
npm run build

# Tester le build
node dist/server.js
```

### Étape 2 : Configuration Railway

Créer `railway.json` à la racine du dossier backend (optionnel) :

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Créer un endpoint de healthcheck dans `server.ts` :

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### Étape 3 : Déployer sur Railway

**Via l'interface web**

1. Aller sur [railway.app](https://railway.app)
2. Cliquer "New Project"
3. Sélectionner "Deploy from GitHub repo"
4. Choisir le repository
5. Configurer :
   - **Root Directory** : `backend`
   - **Build Command** : `npm run build`
   - **Start Command** : `npm start`

### Étape 4 : Ajouter PostgreSQL

1. Dans le projet Railway, cliquer "New" → "Database" → "Add PostgreSQL"
2. Railway crée automatiquement la variable `DATABASE_URL`

### Étape 5 : Configurer les variables d'environnement

Dans Railway, aller dans "Variables" et ajouter :

```
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-configuré
JWT_SECRET=<générer un secret sécurisé>
AWS_S3_BUCKET=quiz-musical-files
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=<votre clé AWS>
AWS_SECRET_ACCESS_KEY=<votre secret AWS>
FRONTEND_URL=https://quiz-app.com
SOCKET_CORS_ORIGIN=https://quiz-app.com
```

**Générer un JWT secret sécurisé** :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Étape 6 : Lancer les migrations Prisma

Railway peut exécuter les migrations automatiquement au déploiement.

Ajouter un script dans `package.json` :

```json
{
  "scripts": {
    "build": "tsc && npm run migrate",
    "migrate": "prisma migrate deploy"
  }
}
```

**Ou manuellement via Railway CLI** :

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Lier au projet
railway link

# Exécuter les migrations
railway run npx prisma migrate deploy
```

### Étape 7 : Configurer le domaine personnalisé

1. Dans Railway, aller dans "Settings" → "Networking"
2. Cliquer "Custom Domain"
3. Ajouter : `api.quiz-app.com`
4. Configurer le DNS :

```
Type  | Name | Value                        | TTL
------|------|------------------------------|------
CNAME | api  | <votre-projet>.up.railway.app| 3600
```

5. Railway génère automatiquement un certificat SSL

---

## ☁️ Configuration AWS S3 + CloudFront

### Étape 1 : Créer le bucket S3

```bash
# Via AWS CLI
aws s3 mb s3://quiz-musical-files --region eu-west-3
```

**Ou via Console AWS** :
1. S3 → "Create bucket"
2. Nom : `quiz-musical-files`
3. Région : `Europe (Paris) eu-west-3`
4. Décocher "Block all public access" (pour CDN)

### Étape 2 : Configurer les CORS

Dans le bucket, aller dans "Permissions" → "CORS configuration" :

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://quiz-app.com", "https://api.quiz-app.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Étape 3 : Créer un utilisateur IAM

1. IAM → "Users" → "Add user"
2. Nom : `quiz-musical-uploader`
3. Attacher la politique :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::quiz-musical-files/*"
    }
  ]
}
```

4. Récupérer les clés `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY`
5. Ajouter ces clés dans les variables Railway

### Étape 4 : Configurer CloudFront (CDN)

1. CloudFront → "Create distribution"
2. Origin domain : `quiz-musical-files.s3.eu-west-3.amazonaws.com`
3. Origin access : "Origin access control settings (recommended)"
4. Viewer protocol policy : "Redirect HTTP to HTTPS"
5. Allowed HTTP methods : "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE"
6. Cache policy : "CachingOptimized"
7. Custom domain (optionnel) : `cdn.quiz-app.com`

8. Copier l'URL CloudFront : `https://d111111abcdef8.cloudfront.net`
9. Utiliser cette URL pour servir les fichiers

**Mise à jour du backend** :

```typescript
// Dans storageService.ts
const fileUrl = `https://d111111abcdef8.cloudfront.net/${key}`;
```

---

## 🔐 Sécurité & Monitoring

### Certificats SSL

- **Vercel** : SSL automatique via Let's Encrypt
- **Railway** : SSL automatique via Let's Encrypt
- **CloudFront** : Certificat AWS gratuit

### Variables d'environnement sécurisées

❌ **Ne jamais commit** :
- `.env`
- Clés API
- Secrets JWT
- Credentials BDD

✅ **Utiliser** :
- Variables d'environnement Railway/Vercel
- Secrets Manager (AWS, Railway)

### Monitoring

**Sentry (Erreurs)**

```bash
npm install @sentry/node @sentry/react
```

**Backend (server.ts)** :

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

**Frontend (main.tsx)** :

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

**Datadog (Performances)** - Optionnel

1. Créer compte sur [datadoghq.com](https://www.datadoghq.com/)
2. Installer l'agent :

```bash
npm install dd-trace
```

3. Configurer dans `server.ts` :

```typescript
import tracer from 'dd-trace';
tracer.init();
```

### Backup Base de Données

**Railway** :
- Backup automatique quotidien (inclus)
- Rétention : 7 jours (plan Pro : 30 jours)

**Backup manuel** :

```bash
# Exporter la BDD
railway run pg_dump $DATABASE_URL > backup.sql

# Importer
railway run psql $DATABASE_URL < backup.sql
```

**Automatiser avec GitHub Actions** :

```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Tous les jours à 2h

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
      
      - name: Upload to S3
        run: |
          aws s3 cp backup-*.sql s3://quiz-musical-backups/
```

---

## 🔄 CI/CD avec GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches:
      - main      # Production
      - develop   # Staging

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies (Backend)
        working-directory: ./backend
        run: npm ci
      
      - name: Install dependencies (Frontend)
        working-directory: ./frontend
        run: npm ci
      
      - name: Lint Backend
        working-directory: ./backend
        run: npm run lint
      
      - name: Lint Frontend
        working-directory: ./frontend
        run: npm run lint
      
      - name: Test Backend
        working-directory: ./backend
        run: npm test
      
      - name: Test Frontend
        working-directory: ./frontend
        run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
```

**Configurer les secrets GitHub** :
1. GitHub → Repository → "Settings" → "Secrets and variables" → "Actions"
2. Ajouter :
   - `RAILWAY_TOKEN` (depuis Railway dashboard)
   - `RAILWAY_PROJECT_ID` (depuis Railway)
   - `VERCEL_TOKEN` (depuis Vercel settings)

---

## 📊 Post-Déploiement

### Vérifications

✅ **Frontend**
- [ ] Site accessible sur `https://quiz-app.com`
- [ ] SSL actif (cadenas vert)
- [ ] Connexion API fonctionne
- [ ] Socket.io se connecte

✅ **Backend**
- [ ] API accessible sur `https://api.quiz-app.com`
- [ ] Healthcheck `/health` retourne 200
- [ ] BDD connectée (test avec endpoint)
- [ ] Upload S3 fonctionne

✅ **Fonctionnel**
- [ ] Login admin fonctionne
- [ ] Créer un quiz
- [ ] Upload audio/image
- [ ] Lancer une session
- [ ] Rejoindre depuis mobile
- [ ] Jouer une partie complète
- [ ] Podium s'affiche

### Tests de charge

**Tester avec Artillery** :

```bash
npm install -g artillery

# Créer artillery.yml
artillery quick --count 50 --num 10 https://api.quiz-app.com/health
```

**Surveiller** :
- CPU Railway < 80%
- RAM Railway < 80%
- Latency Socket.io < 200ms
- Temps réponse API < 500ms

---

## 🐛 Rollback

### Vercel

```bash
# Lister les déploiements
vercel ls

# Promouvoir un ancien déploiement
vercel promote <deployment-url>
```

### Railway

1. Dashboard → "Deployments"
2. Cliquer sur un ancien déploiement
3. "Rollback to this deployment"

### Base de données

```bash
# Restaurer depuis backup
railway run psql $DATABASE_URL < backup-20260620.sql
```

---

## 💰 Coûts Estimés (Mensuel)

| Service       | Plan          | Coût      |
|---------------|---------------|-----------|
| Vercel        | Hobby (Free)  | 0€        |
| Railway       | Hobby         | ~5-15€    |
| AWS S3        | Pay-as-you-go | ~2-10€    |
| CloudFront    | Pay-as-you-go | ~5-20€    |
| Nom de domaine| Annuel        | ~10€/an   |
| **Total**     |               | **12-45€/mois** |

**Optimisations** :
- Railway Hobby gratuit jusqu'à 5$ de crédit/mois
- S3 Lifecycle : supprimer fichiers anciens (>90 jours)
- CloudFront : cache agressif pour réduire origin requests

---

## 📞 Support

En cas de problème :

- **Vercel** : [vercel.com/support](https://vercel.com/support)
- **Railway** : [help.railway.app](https://help.railway.app)
- **AWS** : [aws.amazon.com/support](https://aws.amazon.com/support)

Documentation interne :
- [API.md](./API.md)
- [SOCKET_EVENTS.md](./SOCKET_EVENTS.md)

---

**Dernière mise à jour** : 21 juin 2026
