print("🔍 Diagnóstico paso a paso...")

# 1. Verificar FastAPI
try:
    import fastapi
    print("✅ FastAPI importado")
except Exception as e:
    print(f"❌ Error FastAPI: {e}")
    exit(1)

# 2. Crear app básica
try:
    from fastapi import FastAPI
    app = FastAPI()
    print("✅ App básica creada")
except Exception as e:
    print(f"❌ Error creando app: {e}")
    exit(1)

# 3. Probar importación de routers uno por uno
routers = [
    ("routers.contactos", "contactos"),
    ("routers.campañas", "campañas"),
    ("routers.clientes_corporativos", "clientes_corporativos")
]

for module_name, router_name in routers:
    try:
        print(f"📦 Probando {module_name}...")
        exec(f"from {module_name} import router as {router_name}_router")
        print(f"✅ {router_name} importado")
    except Exception as e:
        print(f"❌ Error en {router_name}: {e}")
        import traceback
        traceback.print_exc()
        print("-" * 40)

print("🏁 Diagnóstico completado")
