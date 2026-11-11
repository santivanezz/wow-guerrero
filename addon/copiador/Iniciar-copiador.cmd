@echo off
rem Arranca el copiador de GuerreroSync en segundo plano (sin ventana).
start "" powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0GuerreroSync-copiador.ps1"
