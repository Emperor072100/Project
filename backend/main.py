from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar routers al inicio del módulo
from routers.contactos import router as contactos_router
from routers.campañas import router as campañas_router
from routers.clientes_corporativos import router as clientes_corporativos_router
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

# Crear aplicación FastAPI
app = FastAPI(
    title="API Campañas",
    version="1.0.0",
    description="Sistema de Gestión de Campañas, Proyectos e Implementaciones"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://campaignmanagement.andesbpo.com",
        "https://campaignmanagement.backend.andesbpo.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/", tags=["Health"])
def root():
    return {"message": "API Campañas funcionando correctamente"}

# Registrar routers
app.include_router(auth_router)  # Autenticación (debe ir primero)
app.include_router(usuarios_router)
app.include_router(contactos_router)
app.include_router(campañas_router)
app.include_router(clientes_corporativos_router)
app.include_router(proyectos_router)
app.include_router(tareas_router)
app.include_router(equipos_router)
app.include_router(tipos_router)
app.include_router(estados_router)
app.include_router(prioridades_router)
app.include_router(implementaciones_router)
app.include_router(entregas_router)


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
