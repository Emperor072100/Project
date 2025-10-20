from fastapi import APIRouter, HTTPException
from crud.clienteimple import create_clienteimple

router = APIRouter()


@router.post("/clienteimple")
def crear_clienteimple(data: dict):
    cliente = data.get("cliente")
    proceso = data.get("proceso")
    if not cliente or not proceso:
        raise HTTPException(status_code=400, detail="Faltan datos")
    return create_clienteimple(cliente, proceso)
