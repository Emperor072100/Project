#!/usr/bin/env python3
"""
Script para verificar que las rutas del router de campañas estén registradas correctamente
"""

try:
    from routers.campañas import router as campanias_router
    print('✓ Router de campañas importado exitosamente')
    
    print('\nRutas registradas en router:')
    for route in campanias_router.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            print(f'   - {route.methods} {route.path}')
        
    product_routes = [r for r in campanias_router.routes if 'productos' in r.path]
    print(f'\nEncontradas {len(product_routes)} rutas de productos:')
    for route in product_routes:
        print(f'   - {route.methods} {route.path}')
        
    billing_routes = [r for r in campanias_router.routes if 'facturacion' in r.path]
    print(f'\nEncontradas {len(billing_routes)} rutas de facturación:')
    for route in billing_routes:
        print(f'   - {route.methods} {route.path}')
        
except Exception as e:
    print(f'❌ Error importando router: {e}')
    import traceback
    traceback.print_exc()
