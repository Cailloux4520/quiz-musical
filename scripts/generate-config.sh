#!/bin/bash

#####################################################
# Script de Génération du Fichier de Configuration
# Pour VPS Ubuntu 20.04 LTS
# Crée /home/quizapp/quiz-musical-config.txt
#####################################################

set -e

USER="quizapp"
CONFIG_FILE="/home/$USER/quiz-musical-config.txt"
ENV_BACKEND="/home/$USER/quiz-musical/backend/.env"
ENV_FRONTEND="/home/$USER/quiz-musical/frontend/.env"

echo "==================================="
echo "📝 Génération fichier de configuration"
echo "==================================="

# Vérifier que les fichiers .env existent
if [ ! -f "$ENV_BACKEND" ]; then
    echo "❌ Erreur: $ENV_BACKEND n'existe pas"
    exit 1
fi

if [ ! -f "$ENV_FRONTEND" ]; then
    echo "❌ Erreur: $ENV_FRONTEND n'existe pas"
    exit 1
fi

# Créer le fichier de configuration
cat > "$CONFIG_FILE" << 'HEADER'
#####################################################
# CONFIGURATION QUIZ MUSICAL
# ⚠️  FICHIER CONFIDENTIEL - À CONSERVER EN SÉCURITÉ
#####################################################

Date de génération: $(date '+%Y-%m-%d %H:%M:%S')

HEADER

echo "" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "📍 INFORMATIONS SERVEUR" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "Domaine: recalbox.live" >> "$CONFIG_FILE"
echo "URL Application: https://recalbox.live" >> "$CONFIG_FILE"
echo "Utilisateur système: $USER" >> "$CONFIG_FILE"
echo "Répertoire application: /home/$USER/quiz-musical" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

echo "==================================" >> "$CONFIG_FILE"
echo "🔐 BACKEND - Variables d'environnement" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
cat "$ENV_BACKEND" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

echo "==================================" >> "$CONFIG_FILE"
echo "🎨 FRONTEND - Variables d'environnement" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
cat "$ENV_FRONTEND" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

echo "==================================" >> "$CONFIG_FILE"
echo "👤 COMPTE ADMINISTRATEUR PAR DÉFAUT" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "Email: admin@quiz.com" >> "$CONFIG_FILE"
echo "Mot de passe: admin123" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "⚠️  IMPORTANT: Changez ce mot de passe dès la première connexion !" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

echo "==================================" >> "$CONFIG_FILE"
echo "🐳 SERVICES DOCKER" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "PostgreSQL:" >> "$CONFIG_FILE"
echo "  - Container: quiz-musical-db" >> "$CONFIG_FILE"
echo "  - Port interne: 5432" >> "$CONFIG_FILE"
echo "  - Database: quizmusical" >> "$CONFIG_FILE"
echo "  - User: quizuser" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "Redis:" >> "$CONFIG_FILE"
echo "  - Container: quiz-musical-redis" >> "$CONFIG_FILE"
echo "  - Port interne: 6379" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "MinIO:" >> "$CONFIG_FILE"
echo "  - Container: quiz-musical-minio" >> "$CONFIG_FILE"
echo "  - Port API: 9000" >> "$CONFIG_FILE"
echo "  - Port Console: 9001" >> "$CONFIG_FILE"
echo "  - Console URL: http://VOTRE_IP:9001" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

echo "==================================" >> "$CONFIG_FILE"
echo "🔧 COMMANDES UTILES" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "# Voir les logs du backend:" >> "$CONFIG_FILE"
echo "pm2 logs quiz-backend" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "# Redémarrer le backend:" >> "$CONFIG_FILE"
echo "pm2 restart quiz-backend" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "# Voir l'état des services:" >> "$CONFIG_FILE"
echo "pm2 status" >> "$CONFIG_FILE"
echo "docker ps" >> "$CONFIG_FILE"
echo "systemctl status nginx" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "# Mettre à jour l'application:" >> "$CONFIG_FILE"
echo "sudo /home/$USER/quiz-musical/scripts/update-app.sh" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "# Faire une sauvegarde manuelle:" >> "$CONFIG_FILE"
echo "/home/$USER/quiz-musical/scripts/backup.sh" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

echo "==================================" >> "$CONFIG_FILE"
echo "📊 SURVEILLANCE ET LOGS" >> "$CONFIG_FILE"
echo "==================================" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"
echo "Logs Backend (PM2): pm2 logs quiz-backend" >> "$CONFIG_FILE"
echo "Logs PostgreSQL: docker logs quiz-musical-db" >> "$CONFIG_FILE"
echo "Logs Redis: docker logs quiz-musical-redis" >> "$CONFIG_FILE"
echo "Logs MinIO: docker logs quiz-musical-minio" >> "$CONFIG_FILE"
echo "Logs Nginx: /var/log/nginx/error.log" >> "$CONFIG_FILE"
echo "" >> "$CONFIG_FILE"

# Définir les permissions
chown "$USER:$USER" "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"

echo ""
echo "✅ Fichier de configuration créé avec succès !"
echo ""
echo "📄 Emplacement: $CONFIG_FILE"
echo "🔐 Permissions: 600 (lecture/écriture utilisateur uniquement)"
echo ""
echo "Pour voir le contenu:"
echo "  cat $CONFIG_FILE"
echo ""
echo "⚠️  IMPORTANT: Conservez ce fichier en lieu sûr !"
echo ""
