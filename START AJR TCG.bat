@echo off
cd /d "%~dp0"
py -3 server\server.py
if errorlevel 1 python server\server.py
pause
