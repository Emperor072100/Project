from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import proyectos, tareas, auth, usuarios # Se añade usuarios
from core.config import DATABASE_URL


app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Añade todos los orígenes necesarios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(proyectos.router)
app.include_router(tareas.router)
app.include_router(auth.router)
app.include_router(usuarios.router)  # Se añade usuarios

@app.get("/")
def root():
    return {"message": "API funcionando"}