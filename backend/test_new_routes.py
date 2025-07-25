#!/usr/bin/env python3
"""
Script para verificar que las nuevas rutas sin ñ funcionen correctamente
"""

try:
    from routers.campañas import router as campanias_router
    print('✓ Router de campañas importado exitosamente')
    
    print('\nRutas registradas en router:')
    for route in campanias_router.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            print(f'   - {route.methods} {route.path}')
        
    # Filtrar rutas de productos
    product_routes = [r for r in campanias_router.routes if 'productos' in r.path]
    print(f'\n✓ Encontradas {len(product_routes)} rutas de productos:')
    for route in product_routes:
        print(f'   - {route.methods} {route.path}')
        
    # Filtrar rutas de facturación
    billing_routes = [r for r in campanias_router.routes if 'facturacion' in r.path]
    print(f'\n✓ Encontradas {len(billing_routes)} rutas de facturación:')
    for route in billing_routes:
        print(f'   - {route.methods} {route.path}')
        
    # Verificar que las rutas usen campana_id en lugar de campaña_id
    campana_routes = [r for r in campanias_router.routes if '{campana_id}' in r.path]
    print(f'\n✓ Encontradas {len(campana_routes)} rutas usando campana_id (sin ñ):')
    for route in campana_routes:
        print(f'   - {route.methods} {route.path}')
        
    # Verificar que NO haya rutas con ñ
    campana_old_routes = [r for r in campanias_router.routes if '{campaña_id}' in r.path]
    if campana_old_routes:
        print(f'\n❌ ATENCIÓN: Encontradas {len(campana_old_routes)} rutas usando campaña_id (con ñ):')
        for route in campana_old_routes:
            print(f'   - {route.methods} {route.path}')
    else:
        print('\n✓ No se encontraron rutas con ñ (campaña_id) - ¡Perfecto!')
        
except Exception as e:
    print(f'❌ Error importando router: {e}')
    import traceback
    traceback.print_exc()
