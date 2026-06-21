# Script de démarrage rapide pour Quiz Musical
# Démarre le backend et le frontend en parallèle

Write-Host "🎵 Démarrage de Quiz Musical..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est démarré
Write-Host "Vérification de Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if (-not $?) {
    Write-Host "❌ Docker n'est pas démarré. Veuillez lancer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Démarrer les services Docker
Write-Host "Démarrage des services Docker (PostgreSQL, MinIO, Redis)..." -ForegroundColor Yellow
docker-compose up -d

Start-Sleep -Seconds 3

# Vérifier que les fichiers .env existent
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Fichier backend\.env manquant. Copie depuis .env.example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠️  Fichier frontend\.env manquant. Copie depuis .env.example..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
}

Write-Host ""
Write-Host "🚀 Démarrage du backend et du frontend..." -ForegroundColor Cyan
Write-Host ""

# Fonction pour démarrer le backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm run dev
}

# Fonction pour démarrer le frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev
}

Write-Host "✅ Backend démarré (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "✅ Frontend démarré (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend API : http://localhost:3000" -ForegroundColor Cyan
Write-Host "🌐 Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter..." -ForegroundColor Yellow

# Garder le script actif et afficher les logs
try {
    while ($true) {
        Receive-Job -Job $backendJob
        Receive-Job -Job $frontendJob
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "Arrêt des services..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob
    Stop-Job -Job $frontendJob
    Remove-Job -Job $backendJob
    Remove-Job -Job $frontendJob
    Write-Host "✅ Arrêté" -ForegroundColor Green
}
