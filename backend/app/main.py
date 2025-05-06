from fastapi import FastAPI
from routers import proyectos, tareas, auth
from core.config import DATABASE_URL


app = FastAPI()

# Rutas
app.include_router(proyectos.router)
app.include_router(tareas.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "API funcionando"}