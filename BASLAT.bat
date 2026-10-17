@echo off
chcp 65001 >nul
cd /d "%~dp0"
title JARVIS 5046 - Kurulum ve Başlatma
if not exist node_modules (
  echo [1/2] Gerekli paketler kuruluyor. Bu işlem internet bağlantısı ister...
  call npm install
  if errorlevel 1 (echo Paket kurulumu basarisiz. Node.js LTS kurulu mu kontrol et.& pause & exit /b 1)
)
echo [2/2] JARVIS 5046 baslatiliyor...
call npm start
if errorlevel 1 pause
