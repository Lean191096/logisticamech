@echo off
echo ===================================================
echo    Reiniciando Servidor y Base de Datos Mech...
echo ===================================================
echo.
echo 1. Cerrando servidores anteriores...
call npx kill-port 8080

echo 2. Actualizando base de datos...
call npx prisma generate
call npx prisma db push

echo.
echo ===================================================
echo ¡Todo listo! Iniciando el sistema de nuevo...
echo ===================================================
call npm run dev
pause
