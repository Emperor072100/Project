from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import proyectos, tareas, auth, usuarios
from core.config import DATABASE_URL
from routers import tipos, equipos, prioridades, estados, contactos, campañas, clientes_corporativos
from backend.routers.clienteimple import router as clienteimple_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O restringe a ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(proyectos.router)
app.include_router(tareas.router)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(tipos.router)
app.include_router(equipos.router)
app.include_router(prioridades.router)
app.include_router(estados.router)
app.include_router(contactos.router)
app.include_router(campañas.router)
app.include_router(clientes_corporativos.router)
app.include_router(clienteimple_router)

@app.get("/")
def root():
    return {"message": "API funcionando"}