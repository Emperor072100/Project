@echo off
echo 🚀 Iniciando servidor FastAPI...
echo.

cd /d "c:\Users\1193086193\Documents\GitHub\Project\backend"

echo 📍 Directorio actual: %cd%
echo.

echo 🔍 Verificando main.py...
if exist main.py (
    echo ✅ main.py encontrado
) else (
    echo ❌ main.py no encontrado
    pause
    exit /b 1
)

echo.
echo ⚡ Ejecutando servidor...
echo 📚 La documentación estará disponible en: http://localhost:8000/docs
echo.

python main.py

pause
