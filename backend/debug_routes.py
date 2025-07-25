#!/usr/bin/env python3

print("🔍 Diagnóstico de rutas de clientes corporativos")
print("=" * 50)

try:
    # Importar el router directamente
    print("1. Probando importación del router...")
    from routers.clientes_corporativos import router
    print(f"   ✅ Router importado correctamente")
    print(f"   📝 Prefix: {router.prefix}")
    print(f"   📝 Tags: {router.tags}")
    print(f"   📝 Número de rutas: {len(router.routes)}")
    
    print("\n2. Rutas en el router:")
    for route in router.routes:
        if hasattr(route, 'path'):
            print(f"   - {route.path} [{getattr(route, 'methods', 'N/A')}]")
    
    # Importar la aplicación principal
    print("\n3. Probando importación de la app principal...")
    from main import app
    print("   ✅ App principal importada")
    
    # Buscar rutas relacionadas con clientes-corporativos
    print("\n4. Buscando rutas de clientes-corporativos en la app:")
    clientes_corp_routes = []
    for route in app.routes:
        if hasattr(route, 'path') and 'clientes-corporativos' in route.path:
            clientes_corp_routes.append(route.path)
    
    if clientes_corp_routes:
        print("   ✅ Rutas encontradas:")
        for route_path in clientes_corp_routes:
            print(f"   - {route_path}")
    else:
        print("   ❌ No se encontraron rutas de clientes-corporativos")
    
    # Verificar si el router está incluido en main.py
    print("\n5. Verificando inclusión del router en main.py...")
    import inspect
    import main
    
    # Buscar en el código fuente
    source = inspect.getsource(main)
    if "clientes_corporativos" in source:
        print("   ✅ Router mencionado en main.py")
    else:
        print("   ❌ Router NO mencionado en main.py")
    
    # Mostrar todas las rutas registradas
    print("\n6. Todas las rutas registradas:")
    all_routes = []
    for route in app.routes:
        if hasattr(route, 'path'):
            all_routes.append(route.path)
    
    for route_path in sorted(all_routes):
        print(f"   - {route_path}")

except Exception as e:
    print(f"❌ Error durante el diagnóstico: {e}")
    import traceback
    traceback.print_exc()
