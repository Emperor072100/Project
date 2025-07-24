#!/usr/bin/env python3
"""
Script para iniciar el servidor backend FastAPI
"""
import os
import sys

# Cambiar al directorio del backend
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
os.chdir(backend_dir)

# Agregar el directorio backend al path
sys.path.insert(0, backend_dir)

try:
    import uvicorn
    print("✅ Uvicorn encontrado")
except ImportError:
    print("❌ Uvicorn no encontrado. Instalando...")
    os.system("pip install uvicorn")
    import uvicorn

try:
    from main import app
    print("✅ Aplicación FastAPI cargada correctamente")
    print("🚀 Iniciando servidor en http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
except Exception as e:
    print(f"❌ Error al cargar la aplicación: {e}")
    print("\nVerificando rutas disponibles...")
    try:
        from main import app
        for route in app.routes:
            print(f"  - {route.path}")
    except:
        pass
