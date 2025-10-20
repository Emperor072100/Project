from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from schemas.estado import EstadoCreate, EstadoOut
from app.dependencies import (
    get_db,
)  # Asume que tienes un archivo app/dependencies.py con get_db
from app.models.estado import Estado  # Importa tu modelo Estado

# Si usas esquemas Pydantic, impórtalos también
# from schemas.estado import EstadoOut # Ejemplo si tienes un esquema de salida

router = APIRouter(prefix="/estados", tags=["Estados"])


@router.get("/")
# Si tienes un esquema Pydantic para Estado, úsalo en response_model:
# def listar_estados(db: Session = Depends(get_db)) -> List[EstadoOut]:
def listar_estados(db: Session = Depends(get_db)):
    """
    Lista todos los estados disponibles.
    """
    estados = db.query(Estado).all()
    if not estados:
        # Puedes optar por devolver una lista vacía en lugar de 404 si es un recurso que puede estar vacío
        raise HTTPException(status_code=404, detail="No se encontraron estados")

    # Si no usas Pydantic Schemas para la respuesta, mapea a un diccionario si es necesario
    # para asegurar que los campos sean serializables (especialmente con relaciones)
    return [
        {"id": estado.id, "nombre": estado.nombre, "categoria": estado.categoria}
        for estado in estados
    ]


@router.post("/", response_model=EstadoOut)
def crear_estado(estado: EstadoCreate, db: Session = Depends(get_db)):
    nuevo_estado = Estado(**estado.dict())
    db.add(nuevo_estado)
    db.commit()
    db.refresh(nuevo_estado)
    return nuevo_estado
