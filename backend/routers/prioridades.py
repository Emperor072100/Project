from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.prioridad import PrioridadOut
from app.models.prioridad import Prioridad
from core.database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/prioridades", tags=["Prioridades"])

class PrioridadCreate(BaseModel):
    nivel: str

@router.get("/", response_model=list[PrioridadOut])
def listar_prioridades(db: Session = Depends(get_db)):
    return db.query(Prioridad).all()

@router.post("/", response_model=PrioridadOut)
def crear_prioridad(prioridad: PrioridadCreate, db: Session = Depends(get_db)):
    nueva_prioridad = Prioridad(**prioridad.dict())
    db.add(nueva_prioridad)
    db.commit()
    db.refresh(nueva_prioridad)
    return nueva_prioridad
