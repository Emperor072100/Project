#!/usr/bin/env python3

print("🚀 Iniciando servidor FastAPI...")
print("=" * 50)

try:
    # Importar la aplicación
    print("📦 Importando aplicación...")
    from main import app
    print("✅ Aplicación importada correctamente")
    
    # Mostrar información de rutas
    print("\n📋 Rutas registradas:")
    clientes_corp_count = 0
    total_routes = 0
    
    for route in app.routes:
        if hasattr(route, 'path'):
            print(f"   - {route.path}")
            total_routes += 1
            if 'clientes-corporativos' in route.path:
                clientes_corp_count += 1
    
    print(f"\n📊 Total de rutas: {total_routes}")
    print(f"🎯 Rutas de clientes-corporativos: {clientes_corp_count}")
    
    if clientes_corp_count == 0:
        print("⚠️  ADVERTENCIA: No se encontraron rutas de clientes-corporativos")
    else:
        print("✅ Rutas de clientes-corporativos registradas correctamente")
    
    # Iniciar servidor
    print("\n⚡ Iniciando servidor uvicorn...")
    print("📍 URL: http://127.0.0.1:8000")
    print("📚 Documentación: http://127.0.0.1:8000/docs")
    print("🔧 Para detener: Ctrl+C")
    print("-" * 50)
    
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
    
except ImportError as e:
    print(f"❌ Error de importación: {e}")
    print("\n🔍 Verificando dependencias...")
    
    try:
        import fastapi
        print("✅ FastAPI disponible")
    except ImportError:
        print("❌ FastAPI no está instalado")
        print("💡 Ejecuta: pip install fastapi")
    
    try:
        import uvicorn
        print("✅ Uvicorn disponible")
    except ImportError:
        print("❌ Uvicorn no está instalado")
        print("💡 Ejecuta: pip install uvicorn")
    
except Exception as e:
    print(f"❌ Error inesperado: {e}")
    import traceback
    traceback.print_exc()

print("\n👋 Servidor detenido")
