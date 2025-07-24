#!/usr/bin/env python3

print("🔍 Probando importaciones individuales...")

routers_to_test = [
    ("routers.clientes", "clientes_router"),
    ("routers.contactos", "contactos_router"), 
    ("routers.campañas", "campañas_router"),
    ("routers.clientes_corporativos", "clientes_corporativos_router")
]

for module_name, router_name in routers_to_test:
    try:
        print(f"\n📦 Probando {module_name}...")
        module = __import__(module_name, fromlist=['router'])
        router = getattr(module, 'router')
        print(f"   ✅ {router_name} importado correctamente")
        print(f"   📝 Prefix: {router.prefix}")
        print(f"   📝 Tags: {router.tags}")
        print(f"   📝 Rutas: {len(router.routes)}")
    except Exception as e:
        print(f"   ❌ Error importando {router_name}: {e}")
        import traceback
        traceback.print_exc()
