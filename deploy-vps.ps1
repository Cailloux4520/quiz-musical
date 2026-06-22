# Script PowerShell pour déployer automatiquement sur le VPS
# Configuration
$VPS_IP = "82.29.169.117"
$VPS_USER = "root"
$VPS_PASSWORD = "P@ssw0rd6238261169"
$APP_PATH = "/home/quizapp/quiz-musical"

Write-Host "`n=========================================="
Write-Host "  Déploiement MyQuiz sur VPS"
Write-Host "  VPS: $VPS_IP"
Write-Host "==========================================" -ForegroundColor Cyan

# Créer un script de commandes à exécuter
$commands = @"
cd $APP_PATH
git pull origin main
cd backend
npx prisma db push
pm2 restart quiz-backend
cd ../frontend
npm install
npm run build
echo '=== DEPLOIEMENT TERMINE ==='
"@

# Sauvegarder les commandes dans un fichier temporaire
$tempScript = "$env:TEMP\deploy-commands.sh"
$commands | Out-File -FilePath $tempScript -Encoding ASCII

Write-Host "`nConnexion au VPS..." -ForegroundColor Yellow

# Utiliser plink si disponible (PuTTY), sinon utiliser ssh avec interaction
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "Utilisation de plink..." -ForegroundColor Green
    echo y | plink -ssh -pw $VPS_PASSWORD $VPS_USER@$VPS_IP "bash -s" < $tempScript
} else {
    Write-Host "plink non disponible. Utilisation de ssh..." -ForegroundColor Yellow
    Write-Host "Veuillez entrer le mot de passe quand demande: $VPS_PASSWORD" -ForegroundColor Cyan
    
    # Exécuter avec ssh bash standard
    bash -c "ssh root@$VPS_IP 'cd $APP_PATH && git pull origin main && cd backend && npx prisma db push && pm2 restart quiz-backend && cd ../frontend && npm install && npm run build && echo ""=== DEPLOIEMENT TERMINE ===""'"
}

# Nettoyer
Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host "`nScript termine!" -ForegroundColor Green
