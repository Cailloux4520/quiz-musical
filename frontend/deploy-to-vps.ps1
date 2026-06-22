# Script de déploiement frontend vers VPS
# Usage: .\deploy-to-vps.ps1

$VPS_HOST = "82.29.169.117"
$VPS_USER = "root"
$VPS_PATH = "/home/quizapp/quiz-musical/frontend/dist"
$LOCAL_DIST = "dist"

Write-Host "🚀 Déploiement du frontend Quiz Musical..." -ForegroundColor Cyan

# Vérifier que dist/ existe
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ Erreur: Le dossier dist/ n'existe pas. Exécutez 'npm run build' d'abord." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Création de l'archive..." -ForegroundColor Yellow
tar -czf dist.tar.gz $LOCAL_DIST

Write-Host "📤 Envoi vers le VPS..." -ForegroundColor Yellow
Write-Host "Mot de passe VPS requis..." -ForegroundColor Gray

# Envoi de l'archive
scp dist.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/

# Extraction sur le VPS
Write-Host "📂 Extraction sur le VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_HOST} "cd /tmp && rm -rf dist && tar -xzf dist.tar.gz && rm -rf $VPS_PATH/* && cp -r dist/* $VPS_PATH/ && rm -rf dist dist.tar.gz && echo 'Deploiement termine' && ls -lh $VPS_PATH/ | head -10"

# Nettoyage local
Remove-Item dist.tar.gz -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host "🌐 Application accessible sur: https://recalbox.live" -ForegroundColor Cyan
Write-Host "🎨 Gestion des thèmes: https://recalbox.live/admin/themes" -ForegroundColor Cyan
