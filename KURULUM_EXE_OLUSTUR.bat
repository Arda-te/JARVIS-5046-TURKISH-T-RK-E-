@echo off
chcp 65001 >nul
cd /d "%~dp0"
title JARVIS 5046 - Windows Kurulum Paketi
if not exist node_modules (
  echo Gerekli paketler kuruluyor...
  call npm install
  if errorlevel 1 (pause & exit /b 1)
)
echo Windows installer hazirlaniyor. Ilk seferde internet gerekir...
call npm run dist
if errorlevel 1 (echo Derleme basarisiz oldu. Yukaridaki hatayi kontrol et.& pause & exit /b 1)
echo.
echo Installer release klasorunde olusturuldu.
explorer "%~dp0release"
pause
