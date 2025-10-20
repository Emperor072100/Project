from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="API Campañas", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "API Campañas funcionando correctamente"}


# Importar y registrar routers después de crear la app
try:
    # Routers principales del sistema de campañas
    from routers.contactos import router as contactos_router
    from routers.campañas import router as campañas_router
    from routers.clientes_corporativos import router as clientes_corporativos_router

    # Routers adicionales del sistema
    from routers.auth import router as auth_router
    from routers.usuarios import router as usuarios_router
    from routers.proyectos import router as proyectos_router
    from routers.tareas import router as tareas_router
    from routers.equipos import router as equipos_router
    from routers.tipos import router as tipos_router
    from routers.estados import router as estados_router
    from routers.prioridades import router as prioridades_router
    from routers.implementaciones import router as implementaciones_router
    from routers.entregas import router as entregas_router

    # Registrar todos los routers
    app.include_router(contactos_router)  # Endpoint para contactos
    app.include_router(campañas_router)  # Endpoint para campañas
    app.include_router(
        clientes_corporativos_router
    )  # Endpoint para clientes corporativos

    app.include_router(auth_router)  # Autenticación
    app.include_router(usuarios_router)  # Usuarios
    app.include_router(proyectos_router)  # Proyectos
    app.include_router(tareas_router)  # Tareas
    app.include_router(equipos_router)  # Equipos
    app.include_router(tipos_router)  # Tipos
    app.include_router(estados_router)  # Estados
    app.include_router(prioridades_router)  # Prioridades
    app.include_router(implementaciones_router)  # Implementaciones
    app.include_router(entregas_router)  # Entregas

    print("✅ Todos los routers registrados correctamente")
    print(f"   - Contactos: {contactos_router.prefix}")
    print(f"   - Campañas: {campañas_router.prefix}")
    print(f"   - Clientes Corporativos: {clientes_corporativos_router.prefix}")
    print(f"   - Auth: {auth_router.prefix}")
    print(f"   - Usuarios: {usuarios_router.prefix}")
    print(f"   - Proyectos: {proyectos_router.prefix}")
    print(f"   - Tareas: {tareas_router.prefix}")
    print(f"   - Equipos: {equipos_router.prefix}")
    print(f"   - Tipos: {tipos_router.prefix}")
    print(f"   - Estados: {estados_router.prefix}")
    print(f"   - Prioridades: {prioridades_router.prefix}")
    print(f"   - Implementaciones: {implementaciones_router.prefix}")
    print(f"   - Entregas: {entregas_router.prefix}")

except ImportError as e:
    print(f"❌ Error importando routers: {e}")
    import traceback

    traceback.print_exc()


if __name__ == "__main__":
    try:
        import uvicorn

        print("🚀 Iniciando servidor FastAPI...")
        print("📍 URL: http://localhost:8000")
        print("📚 Documentación: http://localhost:8000/docs")

        # Mostrar todas las rutas registradas
        print("\n📋 Rutas registradas:")
        for route in app.routes:
            if hasattr(route, "path"):
                print(f"   - {route.path}")

        print("\n⚡ Iniciando servidor...")
        uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
    except Exception as e:
        print(f"❌ Error iniciando servidor: {e}")
        import traceback

        traceback.print_exc()
