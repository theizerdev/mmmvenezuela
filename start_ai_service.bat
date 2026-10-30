@echo off
title MMM Studio AI - Agente Disenador Fotografico v2.0
echo ========================================================
echo  Iniciando MMM Studio AI - Agente Disenador Fotografico
echo  Redes Locales: YuNet + RMBG-1.4 + MODNet + GFPGAN + ESRGAN
echo  Endpoint Local: http://127.0.0.1:8001
echo ========================================================
cd /d "%~dp0\app\Scripts"
"C:\laragon\bin\python\python-3.13\python.exe" -m uvicorn ai_server:app --host 127.0.0.1 --port 8001 --log-level info
pause
