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
    
    app.include_router(clientes_router)
    app.include_router(campañas_router)
except ImportError as e:
    print(f"Error importando routers: {e}")
