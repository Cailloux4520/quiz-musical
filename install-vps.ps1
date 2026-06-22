$password = "P@ssw0rd6238261169"
$ip = "82.29.169.117"
$user = "root"

Write-Host "=========================================="  -ForegroundColor Cyan
Write-Host "  Installation Quiz Musical sur Hostinger" -ForegroundColor Cyan
Write-Host "  VPS: $ip" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📥 Connexion au VPS..." -ForegroundColor Yellow

# Commandes à exécuter sur le VPS
$commands = @'
wget -q https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh && \
chmod +x install-full-auto.sh && \
echo "Script téléchargé!" && \
sudo ./install-full-auto.sh
'@

# Utilisation de plink si disponible (PuTTY), sinon instructions manuelles
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "✅ Utilisation de plink pour la connexion automatique..." -ForegroundColor Green
    echo y | plink.exe -ssh $user@$ip -pw $password $commands
} else {
    Write-Host "⚠️  plink (PuTTY) n'est pas installé." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 INSTRUCTIONS MANUELLES:" -ForegroundColor Cyan
    Write-Host "──────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  Ouvrez un nouveau terminal PowerShell ou Git Bash" -ForegroundColor White
    Write-Host ""
    Write-Host "2️⃣  Connectez-vous au VPS avec cette commande:" -ForegroundColor White
    Write-Host "    ssh root@$ip" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3️⃣  Entrez le mot de passe quand demandé:" -ForegroundColor White
    Write-Host "    $password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4️⃣  Une fois connecté, copiez-collez ces commandes:" -ForegroundColor White
    Write-Host ""
    Write-Host "wget https://raw.githubusercontent.com/Cailloux4520/quiz-musical/main/scripts/install-full-auto.sh" -ForegroundColor Green
    Write-Host "chmod +x install-full-auto.sh" -ForegroundColor Green
    Write-Host "sudo ./install-full-auto.sh" -ForegroundColor Green
    Write-Host ""
    Write-Host "──────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏱️  L'installation prendra 10-15 minutes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🌐 Une fois terminé, accédez à:" -ForegroundColor Green
    Write-Host "   https://recalbox.live" -ForegroundColor Cyan
    Write-Host "   http://$ip" -ForegroundColor Cyan
    Write-Host ""
}
