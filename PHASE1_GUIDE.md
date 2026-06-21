# 🚀 Phase 1 - Guide d'Exécution

## ✅ Modifications Effectuées

### 1. Schéma Prisma Mis à Jour

**Fichier:** `backend/prisma/schema.prisma`

**Changements:**
- ✅ **User:** Nouveaux rôles (`admin`, `creator`, `animator`), relation `media`
- ✅ **Quiz:** Champ `defaultTimePerQuestion`, thèmes mis à jour
- ✅ **Question:** Types étendus (7 types), champs audio/YouTube, réponses libres
- ✅ **Session:** Champ `qrCodeUrl` pour QR Code
- ✅ **Answer:** Champs `responseTime` et `scoreEarned`
- ✅ **Media:** Nouveau model complet

---

## 📋 Étapes à Suivre

### Étape 1: Créer la Migration Prisma

Ouvrez un **nouveau terminal** (avec Node.js dans le PATH) et exécutez:

```bash
cd backend
npx prisma migrate dev --name add_media_extended_questions_and_roles
```

**Cette commande va:**
1. Créer une nouvelle migration SQL
2. Appliquer les changements à la base de données
3. Générer le client Prisma avec les nouveaux types

**Note:** Si des données existent dans la BDD, Prisma vous demandera comment gérer les changements. Vous pouvez accepter les valeurs par défaut ou réinitialiser la base.

---

### Étape 2: Vérifier la Migration

Après la migration, vérifiez:

```bash
npx prisma studio
```

Cela ouvrira une interface web pour visualiser votre base de données mise à jour.

---

## 🎯 Prochaines Étapes (Après Migration)

### Backend - API Médiathèque

Je vais créer:

1. **Routes médias** (`/api/media`)
   - `POST /upload` - Upload audio/image vers MinIO
   - `GET /` - Liste médias avec filtres
   - `GET /:id` - Détails média
   - `DELETE /:id` - Supprimer média

2. **Controller médiathèque**
   - Validation formats (MP3, WAV, OGG, JPG, PNG, WEBP)
   - Extraction métadonnées (durée audio)
   - Upload vers MinIO
   - Limitation taille (20MB audio, 5MB images)

3. **Service MinIO étendu**
   - Génération URLs signées
   - Gestion buckets séparés (audio, images, qr-codes)

### Frontend - Page Médiathèque

1. **Route** `/admin/media`
2. **Composants:**
   - Upload drag & drop
   - Liste médias avec preview
   - Player audio
   - Visionneuse image
   - Recherche et filtres

---

## 🐛 En Cas de Problème

### Erreur: "Environment variable not found: DATABASE_URL"

**Solution:** Vérifiez que `backend/.env` contient:
```env
DATABASE_URL="postgresql://quiz:quizpass@localhost:5432/quiz_musical"
```

### Erreur: "Can't reach database server"

**Solution:** Démarrez Docker Compose:
```bash
docker-compose up -d
```

### Erreur: Migration conflicts

**Solution:** Reset complet (⚠️ perd les données):
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

---

## ✅ Validation

Après migration réussie, vous devriez voir:

```
✔ Generated Prisma Client
✔ The migration has been created successfully
```

**Fichier créé:** `backend/prisma/migrations/XXXXXX_add_media_extended_questions_and_roles/migration.sql`

---

## 📞 Support

Si vous rencontrez des problèmes, partagez:
1. Message d'erreur complet
2. Contenu de `backend/.env`
3. Sortie de `docker ps` (pour vérifier PostgreSQL)

Je suis prêt à continuer dès que la migration est appliquée ! 🚀
