from main import app

print("🚀 Verificando aplicación después de la corrección...")
print("=" * 50)

# Verificar todas las rutas registradas
all_routes = []
clientes_corp_routes = []

for route in app.routes:
    if hasattr(route, "path"):
        all_routes.append(route.path)
        if "clientes-corporativos" in route.path:
            clientes_corp_routes.append(route.path)

print("📋 Todas las rutas registradas:")
for route_path in sorted(all_routes):
    print(f"   - {route_path}")

print(f"\n🎯 Rutas de clientes-corporativos encontradas: {len(clientes_corp_routes)}")
for route_path in clientes_corp_routes:
    print(f"   - {route_path}")

# Verificar prefixes de los routers
from routers.contactos import router as contactos_router
from routers.campañas import router as campañas_router
from routers.clientes_corporativos import router as clientes_corporativos_router

print(f"\n📝 Prefixes de routers:")
print(f"   - Contactos: {contactos_router.prefix}")
print(f"   - Campañas: {campañas_router.prefix}")
print(f"   - Clientes Corporativos: {clientes_corporativos_router.prefix}")

print(f"\n🔍 Tags de routers:")
print(f"   - Contactos: {contactos_router.tags}")
print(f"   - Campañas: {campañas_router.tags}")
print(f"   - Clientes Corporativos: {clientes_corporativos_router.tags}")
