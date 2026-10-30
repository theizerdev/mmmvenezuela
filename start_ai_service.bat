@echo off
title MMM Venezuela AI Photo Engine API
echo ========================================================
echo  Iniciando API Local de Inteligencia Artificial (FastAPI)
echo  Puerto: http://127.0.0.1:8001
echo ========================================================
cd /d "%~dp0\app\Scripts"
"C:\laragon\bin\python\python-3.13\python.exe" -m uvicorn ai_server:app --host 127.0.0.1 --port 8001
pause

