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
    from routers.clientes import router as clientes_router
    from routers.campañas import router as campañas_router
    from routers.usuarios import router as usuarios_router
    from routers.proyectos import router as proyectos_router
    from routers.prioridades import router as prioridades_router
    from routers.estados import router as estados_router
    from routers.tipos import router as tipos_router
    from routers.equipos import router as equipos_router
    from routers.auth import router as auth_router
    
    app.include_router(clientes_router)
    app.include_router(campañas_router)
    app.include_router(usuarios_router)
    app.include_router(proyectos_router)
    app.include_router(prioridades_router)
    app.include_router(estados_router)
    app.include_router(tipos_router)
    app.include_router(equipos_router)
    app.include_router(auth_router)
except ImportError as e:
    print(f"Error importando routers: {e}")
