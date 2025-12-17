@echo off
REM 🧪 Script de diagnóstico para Windows
REM Uso: diagnostic.bat
REM O: npm run diagnostic

echo.
echo ════════════════════════════════════════════════════════════════════
echo 🔍 DIAGNÓSTICO DEL SISTEMA - Estudiemos
echo ════════════════════════════════════════════════════════════════════
echo.

echo 📋 Paso 1: Verificar que Node.js está instalado...
node --version
if errorlevel 1 (
    echo ❌ Node.js no está instalado o no está en PATH
    pause
    exit /b 1
)
echo ✅ Node.js está disponible
echo.

echo 📋 Paso 2: Verificar que npm está instalado...
npm --version
if errorlevel 1 (
    echo ❌ npm no está instalado
    pause
    exit /b 1
)
echo ✅ npm está disponible
echo.

echo 📋 Paso 3: Ejecutar diagnóstico en Node...
node diagnostic.js
set DIAG_EXIT=%errorlevel%

echo.
if %DIAG_EXIT% equ 0 (
    echo ════════════════════════════════════════════════════════════════════
    echo ✅ DIAGNÓSTICO COMPLETADO EXITOSAMENTE
    echo ════════════════════════════════════════════════════════════════════
    echo.
    echo Próximo paso:
    echo   1. En otra terminal: npm run dev
    echo   2. En otra terminal: node test-join.js
    echo   3. En otra terminal: cd Frontend && ng serve
    echo.
) else (
    echo ════════════════════════════════════════════════════════════════════
    echo ❌ DIAGNÓSTICO ENCONTRÓ PROBLEMAS
    echo ════════════════════════════════════════════════════════════════════
    echo.
    echo Intenta estos comandos:
    echo   npm install
    echo   npm run dev
    echo   npm run dev:seed
    echo.
)

pause
exit /b %DIAG_EXIT%
