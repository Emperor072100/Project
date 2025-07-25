import sys
print("Python path:", sys.path)

try:
    print("Importando FastAPI...")
    from fastapi import FastAPI
    print("✅ FastAPI importado")
    
    print("Creando app...")
    app = FastAPI()
    print("✅ App creada")
    
    print("Importando routers...")
    from routers.contactos import router as contactos_router
    print("✅ Router contactos importado")
    
    from routers.campañas import router as campañas_router  
    print("✅ Router campañas importado")
    
    from routers.clientes_corporativos import router as clientes_corporativos_router
    print("✅ Router clientes_corporativos importado")
    
    print("Registrando routers...")
    app.include_router(contactos_router)
    app.include_router(campañas_router)
    app.include_router(clientes_corporativos_router)
    print("✅ Routers registrados")
    
    print("\n📋 Rutas registradas:")
    clientes_corp_count = 0
    for route in app.routes:
        if hasattr(route, 'path'):
            print(f"   - {route.path}")
            if 'clientes-corporativos' in route.path:
                clientes_corp_count += 1
    
    print(f"\n🎯 Rutas de clientes-corporativos: {clientes_corp_count}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
