@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%generate-galleries.ps1" -RootPath "%ROOT_DIR%"
set "EXITCODE=%ERRORLEVEL%"

echo.
if %EXITCODE% neq 0 (
  echo Erreur pendant la generation des galeries.
) else (
  echo Generation terminee.
)

pause
exit /b %EXITCODE%