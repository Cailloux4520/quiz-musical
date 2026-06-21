# 📦 Configuration Docker pour Production

## Fichiers Docker

- `docker-compose.yml` : Configuration de base pour le développement
- `docker-compose.prod.yml` : Configuration optimisée pour la production
- `.env.docker.example` : Template des variables d'environnement Docker

## Utilisation en développement

```bash
# Utiliser la configuration par défaut
docker-compose up -d
```

## Utilisation en production

### 1. Configuration

```bash
# Copier le template
cp .env.docker.example .env.docker

# Éditer avec des valeurs sécurisées
nano .env.docker
```

**⚠️ Important** : Changez TOUS les mots de passe par des valeurs sécurisées !

Générez des mots de passe forts :
```bash
# Générer un mot de passe aléatoire
openssl rand -base64 32
```

### 2. Démarrage

```bash
# Utiliser la configuration production
docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d
```

### 3. Vérification

```bash
# Vérifier l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Services disponibles

### PostgreSQL
- **Port** : 5432 (configurable)
- **Base de données** : quizmusical
- **Utilisateur** : quizuser (configurable)

### MinIO (Stockage S3)
- **API** : http://localhost:9000
- **Console Web** : http://localhost:9001
- **Bucket** : quiz-media

### Redis
- **Port** : 6379 (configurable)
- **Utilisation** : Cache et adapter Socket.io pour scaling

## Commandes utiles

```bash
# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose -f docker-compose.prod.yml down -v

# Voir les logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f postgres

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart postgres

# Entrer dans un conteneur
docker exec -it quiz-musical-db psql -U quizuser -d quizmusical
```

## Sauvegardes

### Base de données PostgreSQL

```bash
# Backup
docker exec quiz-musical-db pg_dump -U quizuser quizmusical > backup.sql

# Restore
docker exec -i quiz-musical-db psql -U quizuser quizmusical < backup.sql
```

### Fichiers MinIO

```bash
# Backup
docker exec quiz-musical-storage tar czf /tmp/backup.tar.gz /data
docker cp quiz-musical-storage:/tmp/backup.tar.gz ./minio-backup.tar.gz

# Restore
docker cp ./minio-backup.tar.gz quiz-musical-storage:/tmp/backup.tar.gz
docker exec quiz-musical-storage tar xzf /tmp/backup.tar.gz -C /
```

## Volumes persistants

Les données sont stockées dans des volumes Docker :
- `postgres_data` : Base de données PostgreSQL
- `minio_data` : Fichiers uploadés (audio, images)
- `redis_data` : Cache Redis

Liste des volumes :
```bash
docker volume ls | grep quiz
```

## Réseau

Les services communiquent via le réseau `quiz-network`.

Pour voir les conteneurs sur le réseau :
```bash
docker network inspect quiz-network
```

## Healthchecks

Tous les services ont des healthchecks configurés pour vérifier leur état :

```bash
# Voir l'état de santé
docker-compose -f docker-compose.prod.yml ps
```

## Sécurité en production

1. **Changez tous les mots de passe par défaut**
2. **N'exposez pas les ports directement** (utilisez Nginx comme reverse proxy)
3. **Limitez l'accès MinIO Console** (port 9001) à votre IP
4. **Activez SSL/TLS** pour toutes les connexions
5. **Sauvegardes régulières** des volumes

## Mise à jour des images

```bash
# Télécharger les dernières versions
docker-compose -f docker-compose.prod.yml pull

# Redémarrer avec les nouvelles images
docker-compose -f docker-compose.prod.yml up -d
```

## Dépannage

### Les conteneurs ne démarrent pas

```bash
# Voir les logs détaillés
docker-compose -f docker-compose.prod.yml logs

# Vérifier l'état
docker-compose -f docker-compose.prod.yml ps -a
```

### PostgreSQL ne se connecte pas

```bash
# Vérifier que le conteneur est en cours d'exécution
docker ps | grep quiz-musical-db

# Tester la connexion
docker exec -it quiz-musical-db psql -U quizuser -d quizmusical
```

### MinIO n'est pas accessible

```bash
# Vérifier les logs
docker logs quiz-musical-storage

# Vérifier que le bucket existe
docker exec quiz-musical-storage mc ls myminio/
```

## Performance

### Limiter les ressources

Ajoutez dans `docker-compose.prod.yml` :

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          memory: 512M
```

### Monitoring

Utilisez `docker stats` pour voir l'utilisation des ressources :

```bash
docker stats quiz-musical-db quiz-musical-storage quiz-musical-redis
```
