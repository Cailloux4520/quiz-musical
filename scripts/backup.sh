#!/bin/bash

# Script de sauvegarde automatique
# À configurer dans le cron

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
PROJECT_DIR="$HOME/quiz-musical"

mkdir -p $BACKUP_DIR

echo "🔒 Backup Quiz Musical - $DATE"

# 1. Backup de la base de données PostgreSQL
echo "Backup de la base de données..."
docker exec quiz-musical-db pg_dump -U quizuser quizmusical > $BACKUP_DIR/db_$DATE.sql

# 2. Backup des fichiers uploadés (MinIO)
echo "Backup des fichiers MinIO..."
docker exec quiz-musical-storage tar czf /tmp/minio_backup.tar.gz /data
docker cp quiz-musical-storage:/tmp/minio_backup.tar.gz $BACKUP_DIR/minio_$DATE.tar.gz
docker exec quiz-musical-storage rm /tmp/minio_backup.tar.gz

# 3. Backup des fichiers de configuration
echo "Backup de la configuration..."
tar czf $BACKUP_DIR/config_$DATE.tar.gz \
    $PROJECT_DIR/backend/.env \
    $PROJECT_DIR/frontend/.env \
    $PROJECT_DIR/docker-compose.yml

# 4. Compression globale
echo "Création de l'archive complète..."
tar czf $BACKUP_DIR/full_backup_$DATE.tar.gz \
    $BACKUP_DIR/db_$DATE.sql \
    $BACKUP_DIR/minio_$DATE.tar.gz \
    $BACKUP_DIR/config_$DATE.tar.gz

# 5. Nettoyage des fichiers temporaires
rm $BACKUP_DIR/db_$DATE.sql
rm $BACKUP_DIR/minio_$DATE.tar.gz
rm $BACKUP_DIR/config_$DATE.tar.gz

# 6. Garder seulement les 7 derniers backups
echo "Nettoyage des anciens backups..."
find $BACKUP_DIR -name "full_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup terminé : $BACKUP_DIR/full_backup_$DATE.tar.gz"

# Afficher la taille du backup
du -h $BACKUP_DIR/full_backup_$DATE.tar.gz
