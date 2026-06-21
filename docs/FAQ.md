# ❓ FAQ - Questions Fréquentes

## Installation

### Quels sont les prérequis pour installer l'application ?

**Pour le développement local :**
- Node.js 18+
- Docker Desktop
- npm ou yarn

**Pour le déploiement sur VPS :**
- VPS Ubuntu 20.04 LTS (2 GB RAM minimum)
- Accès root SSH
- Nom de domaine

### L'installation automatique est-elle sûre ?

Oui. Le script :
- Génère des clés de sécurité aléatoires
- Configure un pare-feu
- Installe SSL/HTTPS automatiquement
- N'expose que les ports nécessaires (22, 80, 443)

### Combien de temps prend l'installation ?

- **Installation automatique sur VPS** : 15-20 minutes
- **Installation manuelle** : 30-45 minutes
- **Développement local** : 5-10 minutes

### Puis-je utiliser un autre système que Ubuntu 20.04 ?

Le script est optimisé pour Ubuntu 20.04 LTS, mais devrait fonctionner sur :
- Ubuntu 22.04 LTS
- Debian 11+
- Linux Mint 20+

Pour d'autres systèmes, une adaptation peut être nécessaire.

## Configuration

### Comment changer le port du backend ?

Éditez `backend/.env` :
```env
PORT=3001
```

Puis dans `nginx.conf`, changez :
```nginx
proxy_pass http://localhost:3001;
```

Redémarrez : `pm2 restart quiz-backend && sudo systemctl reload nginx`

### Comment configurer un sous-domaine différent ?

1. Faites pointer votre sous-domaine vers le VPS
2. Lors de l'installation, entrez le bon domaine
3. Ou modifiez après dans `/etc/nginx/sites-available/quiz-musical`

### Où sont stockés les fichiers uploadés ?

Les fichiers (audio, images) sont stockés dans **MinIO** :
- Conteneur Docker : `quiz-musical-storage`
- Volume : `minio_data`
- Bucket : `quiz-media`

### Comment augmenter la taille maximale des uploads ?

Dans `nginx.conf` :
```nginx
client_max_body_size 100M;  # Augmenter à 100 MB
```

Dans `backend/src/server.ts` :
```typescript
app.use(express.json({ limit: '100mb' }));
```

## Utilisation

### Comment créer un nouveau compte admin ?

Actuellement, seul le compte créé via seed est disponible. Pour ajouter un admin :

```bash
# Connectez-vous à la base de données
docker exec -it quiz-musical-db psql -U quizuser quizmusical

# Créez un nouvel utilisateur (hashé avec bcrypt)
INSERT INTO users (id, email, password, name) 
VALUES (gen_random_uuid(), 'nouvel@admin.com', '$2a$10$...', 'Nouvel Admin');
```

Ou modifiez le fichier `backend/prisma/seed.ts` et relancez : `npm run prisma:seed`

### Comment supprimer le compte admin par défaut ?

**Après avoir créé un nouvel admin** :

```sql
DELETE FROM users WHERE email = 'admin@quiz.com';
```

### Les joueurs doivent-ils créer un compte ?

Non ! Les joueurs rejoignent simplement avec un pseudo. Aucune inscription requise.

### Combien de joueurs peuvent participer simultanément ?

Dépend de votre VPS :
- **2 GB RAM** : ~50 joueurs
- **4 GB RAM** : ~100-150 joueurs
- **8 GB RAM** : ~300+ joueurs

### Comment uploader des fichiers audio ?

L'upload de fichiers n'est pas encore implémenté dans l'interface. Pour l'instant, vous devez :
1. Uploader manuellement dans MinIO
2. Ou implémenter l'endpoint d'upload (voir `backend/src/routes/upload.ts`)

## Maintenance

### Comment faire une sauvegarde ?

**Automatique :** Configurée tous les jours à 2h du matin

**Manuelle :**
```bash
/home/quizapp/quiz-musical/scripts/backup.sh
```

Les backups sont dans `/home/quizapp/backups/`

### Comment restaurer une sauvegarde ?

```bash
# Extraire le backup
cd /home/quizapp/backups
tar xzf full_backup_YYYYMMDD_HHMMSS.tar.gz

# Restaurer la base de données
docker exec -i quiz-musical-db psql -U quizuser quizmusical < db_backup.sql
```

### Comment mettre à jour l'application ?

```bash
cd /home/quizapp/quiz-musical
./scripts/update.sh
```

Ou manuellement :
```bash
git pull
cd backend && npm install && npm run build && pm2 restart quiz-backend
cd ../frontend && npm install && npm run build
```

### Comment voir les logs ?

```bash
# Backend
pm2 logs quiz-backend

# Nginx
sudo tail -f /var/log/nginx/quiz-musical-error.log

# Docker
docker-compose logs -f

# PostgreSQL
docker logs quiz-musical-db

# MinIO
docker logs quiz-musical-storage
```

### L'application consomme trop de RAM, que faire ?

1. **Redémarrer PM2** : `pm2 restart quiz-backend`
2. **Limiter la mémoire** :
   ```bash
   pm2 start dist/server.js --name quiz-backend --max-memory-restart 500M
   ```
3. **Optimiser PostgreSQL** : Réduire les connexions dans `docker-compose.yml`
4. **Upgrader le VPS** : Plus de RAM

## Sécurité

### Comment changer les mots de passe générés ?

Éditez les fichiers `.env` :
- `backend/.env` : JWT_SECRET, mots de passe
- `.env.docker` : Mots de passe Docker

Puis redémarrez tout :
```bash
docker-compose down
docker-compose up -d
pm2 restart quiz-backend
```

### Comment activer le HTTPS ?

HTTPS est activé automatiquement avec Certbot si vous utilisez le script d'installation.

Manuellement :
```bash
sudo certbot --nginx -d votredomaine.com
```

### Comment bloquer une IP ?

**Avec UFW (pare-feu) :**
```bash
sudo ufw deny from IP_A_BLOQUER
```

**Avec Nginx :**
```nginx
# Dans /etc/nginx/sites-available/quiz-musical
deny IP_A_BLOQUER;
```

### Comment limiter les requêtes (rate limiting) ?

Dans `/etc/nginx/sites-available/quiz-musical` :

```nginx
limit_req_zone $binary_remote_addr zone=quiz_limit:10m rate=10r/s;

server {
    location /api {
        limit_req zone=quiz_limit burst=20 nodelay;
        # ... reste de la config
    }
}
```

### Fail2Ban est-il configuré ?

Oui, si vous utilisez le script automatique. Sinon :

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Performance

### Comment optimiser les performances ?

1. **Activer la compression** (déjà fait dans nginx.conf)
2. **Utiliser un CDN** pour les assets statiques
3. **Augmenter les ressources VPS**
4. **Activer Redis** pour le cache
5. **Optimiser les requêtes SQL** avec des index

### L'application est lente, que faire ?

1. Vérifiez les ressources : `htop`
2. Vérifiez les logs : `pm2 logs`
3. Redémarrez les services :
   ```bash
   pm2 restart quiz-backend
   docker-compose restart
   sudo systemctl restart nginx
   ```

### Puis-je utiliser un CDN ?

Oui ! Configurez un CDN (Cloudflare, AWS CloudFront) pour :
- Les assets statiques du frontend
- Les fichiers uploadés dans MinIO

### Comment scaler horizontalement ?

Pour gérer plus de joueurs :
1. Utilisez Redis Adapter pour Socket.io
2. Déployez plusieurs instances backend
3. Utilisez un load balancer (Nginx, HAProxy)
4. Déployez PostgreSQL en mode réplication

## Problèmes Courants

### "Cannot connect to database"

1. Vérifiez que PostgreSQL fonctionne : `docker ps`
2. Vérifiez le `DATABASE_URL` dans `backend/.env`
3. Redémarrez PostgreSQL : `docker-compose restart postgres`

### "Port 3000 already in use"

Un autre processus utilise le port 3000 :
```bash
# Trouver le processus
sudo lsof -i :3000

# Tuer le processus
sudo kill -9 PID
```

Ou changez le port dans `backend/.env`

### "SSL certificate error"

1. Vérifiez que votre domaine pointe bien vers le VPS
2. Attendez la propagation DNS (jusqu'à 24h)
3. Relancez Certbot : `sudo certbot --nginx -d votredomaine.com`

### "502 Bad Gateway"

Le backend n'est pas démarré :
```bash
pm2 status
pm2 restart quiz-backend
pm2 logs quiz-backend
```

### "WebSocket connection failed"

1. Vérifiez la configuration Nginx pour `/socket.io`
2. Vérifiez que le backend supporte WebSocket
3. Vérifiez les CORS dans `backend/.env`

### Les fichiers uploadés ne s'affichent pas

1. Vérifiez MinIO : `docker logs quiz-musical-storage`
2. Vérifiez que le bucket existe :
   ```bash
   docker exec quiz-musical-storage mc ls myminio/
   ```
3. Vérifiez les permissions du bucket

## Développement

### Comment contribuer au projet ?

1. Forkez le repository
2. Créez une branche : `git checkout -b feature/ma-feature`
3. Commitez : `git commit -m "Ajout de ma feature"`
4. Pushez : `git push origin feature/ma-feature`
5. Ouvrez une Pull Request

### Comment lancer les tests ?

Les tests ne sont pas encore implémentés. Pour les ajouter :
```bash
npm install --save-dev jest @types/jest
```

### Comment déboguer le backend ?

Dans VS Code, ajoutez dans `.vscode/launch.json` :
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/server.ts",
  "runtimeExecutable": "tsx",
  "restart": true
}
```

### Puis-je utiliser TypeScript strict mode ?

Oui ! C'est déjà activé dans `tsconfig.json` :
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Support

### Où obtenir de l'aide ?

1. Consultez cette FAQ
2. Lisez la [documentation](docs/DEPLOYMENT_UBUNTU.md)
3. Vérifiez les [issues GitHub](https://github.com/Cailloux4520/quiz-musical/issues)
4. Ouvrez une nouvelle issue

### Comment signaler un bug ?

Ouvrez une issue GitHub avec :
- Description du problème
- Étapes pour reproduire
- Logs pertinents
- Environnement (OS, Node version, etc.)

### Comment demander une feature ?

Ouvrez une issue GitHub avec le label "enhancement" :
- Description de la fonctionnalité
- Cas d'usage
- Bénéfices attendus

---

**Votre question n'est pas listée ?** Ouvrez une issue sur GitHub !
