# 🔧 Guide de Dépannage - Connexion Admin

## ❌ Problème : Impossible de se connecter avec admin@quiz.com

### 🔍 Diagnostics

#### 1. Vérifier que la base de données est accessible

**Sur le VPS** :
```bash
docker ps | grep postgres
docker exec -it quiz-musical-db psql -U quizuser -d quizmusical
```

Dans PostgreSQL :
```sql
-- Vérifier si l'utilisateur admin existe
SELECT id, email, name FROM "User" WHERE email = 'admin@quiz.com';

-- Quitter
\q
```

#### 2. Vérifier les logs du backend

```bash
pm2 logs quiz-backend --lines 50
```

Cherchez des erreurs liées à :
- Connexion base de données
- Erreurs d'authentification
- Erreurs JWT

---

## 🔑 Solution 1 : Réinitialiser le mot de passe admin

### Sur le VPS

```bash
cd /home/quizapp/quiz-musical/backend
npm run reset-admin
```

Cela va :
1. ✅ Vérifier si l'utilisateur admin existe
2. ✅ Créer l'utilisateur si absent
3. ✅ Réinitialiser le mot de passe à `admin123`

Résultat attendu :
```
🔑 Réinitialisation du mot de passe admin...
✅ Mot de passe admin réinitialisé avec succès !

📧 Email: admin@quiz.com
🔒 Mot de passe: admin123

⚠️  IMPORTANT: Changez ce mot de passe après connexion !
```

### En local (développement)

```bash
cd backend
npm run reset-admin
```

---

## 🌱 Solution 2 : Re-seeder la base de données

Si la base de données est vide ou corrompue :

```bash
cd /home/quizapp/quiz-musical/backend
npm run seed
```

Cela va créer :
- ✅ Utilisateur admin (admin@quiz.com / admin123)
- ✅ Quiz de démonstration "Quiz Années 80"
- ✅ 3 questions de test

---

## 🔄 Solution 3 : Réinitialiser complètement la base

**⚠️ ATTENTION** : Ceci supprimera toutes les données !

```bash
cd /home/quizapp/quiz-musical/backend

# Supprimer et recréer la base
npx prisma migrate reset --force

# Re-seeder
npm run seed
```

---

## 🐛 Solution 4 : Vérifier la configuration JWT

Vérifier que `JWT_SECRET` est bien défini :

```bash
cat /home/quizapp/quiz-musical/backend/.env | grep JWT_SECRET
```

Si absent ou vide, générer une nouvelle clé :

```bash
cd /home/quizapp/quiz-musical/backend
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env
pm2 restart quiz-backend
```

---

## 🔒 Solution 5 : Créer un nouvel utilisateur manuellement

Avec Prisma Studio (développement local) :

```bash
cd backend
npm run prisma:studio
```

Puis créer un utilisateur avec :
- Email: votre@email.com
- Password: (hash bcrypt de votre mot de passe)
- Name: Votre Nom

Pour générer un hash bcrypt :
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('votre_mot_de_passe', 10));"
```

Sur le VPS, via PostgreSQL :

```bash
docker exec -it quiz-musical-db psql -U quizuser -d quizmusical
```

```sql
-- Générer un hash bcrypt pour "admin123" :
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO "User" (id, email, password, name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@quiz.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Admin Quiz Musical',
  NOW(),
  NOW()
);
```

---

## 📊 Vérification après réinitialisation

1. **Tester la connexion** :
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@quiz.com","password":"admin123"}'
   ```

   Résultat attendu :
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "uuid",
       "email": "admin@quiz.com",
       "name": "Admin Quiz Musical"
     }
   }
   ```

2. **Se connecter via l'interface** :
   - Allez sur https://recalbox.live/login
   - Email: `admin@quiz.com`
   - Mot de passe: `admin123`

3. **Changer le mot de passe** :
   - Allez dans les paramètres (si disponible)
   - Ou modifiez manuellement via Prisma Studio

---

## 🆘 Problèmes Persistants

### Erreur : "Email ou mot de passe incorrect"

1. Vérifier que l'email est exact (pas d'espaces)
2. Vérifier que le mot de passe est exact (sensible à la casse)
3. Vérifier les logs backend pour plus de détails

### Erreur : "Non authentifié" après connexion

1. Vérifier que le JWT_SECRET est défini
2. Vérifier que le token est bien stocké dans localStorage
3. Vider le cache du navigateur et les cookies

### Erreur : "Utilisateur non trouvé"

1. L'utilisateur a peut-être été supprimé
2. Exécuter `npm run reset-admin` pour le recréer

---

## 📞 Support

Si le problème persiste :

1. Vérifier les logs : `pm2 logs quiz-backend`
2. Vérifier PostgreSQL : `docker logs quiz-musical-db`
3. Consulter [AUTO_INSTALL.md](../AUTO_INSTALL.md) pour réinstaller
4. Consulter [DEPLOYMENT_UBUNTU.md](docs/DEPLOYMENT_UBUNTU.md)

---

## ✅ Checklist de dépannage

- [ ] Base de données accessible (docker ps)
- [ ] Backend démarré (pm2 status)
- [ ] JWT_SECRET défini (.env)
- [ ] Utilisateur admin existe (SQL SELECT)
- [ ] Mot de passe réinitialisé (npm run reset-admin)
- [ ] Logs sans erreurs (pm2 logs)
- [ ] Test API login réussi (curl)
- [ ] Connexion interface web réussie

**Une fois connecté, changez immédiatement le mot de passe par défaut !** 🔒
