@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not found in PATH.
  exit /b 1
)

node scripts\reset-db.mjs %*
exit /b %errorlevel%
