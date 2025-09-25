@echo off
set DATESTAMP=%date:~-4%-%date:~3,2%-%date:~0,2%
set BACKUP_DIR=%~dp0backup\%DATESTAMP%

echo ================================
echo  Backup MongoDB (meditatii)
echo  Data: %DATESTAMP%
echo ================================

mkdir "%BACKUP_DIR%"
mongodump --uri="mongodb://localhost:27017/meditatii" --out="%BACKUP_DIR%"

echo.
echo ✅ Backup terminat!
echo Salvare in folder: %BACKUP_DIR%
pause
