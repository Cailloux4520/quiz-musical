Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Installation Quiz Musical sur Hostinger" -ForegroundColor Cyan  
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$ip = "82.29.169.117"
$password = "P@ssw0rd6238261169"

Write-Host "📋 ÉTAPE 1: Connexion SSH au VPS..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Je vais ouvrir une connexion SSH." -ForegroundColor White
Write-Host "Quand demandé, entrez ce mot de passe:" -ForegroundColor White
Write-Host ""
Write-Host "   $password" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur Entrée pour continuer..." -ForegroundColor Yellow
$null = Read-Host

# Lancer SSH
ssh root@$ip

Write-Host ""
Write-Host "Si la connexion SSH s'est terminée, voici les commandes à exécuter:" -ForegroundColor Yellow
Write-Host ""
Write-Host "wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh" -ForegroundColor Green
Write-Host "chmod +x install-full-auto.sh" -ForegroundColor Green  
Write-Host "sudo ./install-full-auto.sh" -ForegroundColor Green
Write-Host ""
