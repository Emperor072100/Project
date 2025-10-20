from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Agregar el directorio actual al PATH de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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


@app.get("/test")
def test():
    return {"status": "ok", "message": "Servidor funcionando"}


# Estadísticas simples para probar
@app.get("/campañas/estadisticas")
def estadisticas_test():
    return {
        "total_clientes": 0,
        "total_campañas": 0,
        "por_servicio": {"SAC": 0, "TMC": 0, "TVT": 0, "CBZ": 0},
    }


@app.get("/clientes/")
def listar_clientes():
    return []


@app.post("/clientes/")
def crear_cliente():
    return {"id": 1, "message": "Cliente creado"}


@app.get("/campañas/")
def listar_campañas():
    return []


@app.post("/campañas/")
def crear_campaña():
    return {"id": 1, "message": "Campaña creada"}
