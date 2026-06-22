@echo off
echo ==========================================
echo   Deploiement MyQuiz sur VPS
echo   IP: 82.29.169.117
echo ==========================================

set PLINK="C:\Program Files\PuTTY\plink.exe"
set HOST=root@82.29.169.117
set PASSWORD=P@ssw0rd6238261169

echo.
echo Connexion au VPS...
echo.

REM Essayer avec plink si disponible
if exist %PLINK% (
    echo y | %PLINK% -ssh -pw %PASSWORD% %HOST% "cd /home/quizapp/quiz-musical && git pull origin main && cd backend && npx prisma db push && pm2 restart quiz-backend && cd ../frontend && npm install && npm run build && echo '=== DEPLOIEMENT TERMINE ==='"
) else (
    echo ATTENTION: PuTTY plink non trouve.
    echo.
    echo Entrez le mot de passe SSH quand demande: %PASSWORD%
    echo.
    bash -c "ssh root@82.29.169.117 'cd /home/quizapp/quiz-musical && git pull origin main && cd backend && npx prisma db push && pm2 restart quiz-backend && cd ../frontend && npm install && npm run build && echo \"=== DEPLOIEMENT TERMINE ===\"'"
)

echo.
echo ==========================================
echo   Deploiement termine!
echo ==========================================
pause
