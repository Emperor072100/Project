from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.tipo_equipo import Tipo
from schemas.EquipoTipo import TipoCreate, Tipo as TipoSchema
from fastapi import HTTPException


router = APIRouter(prefix="/tipos", tags=["Tipos"])


@router.get("/")
def listar_tipos(db: Session = Depends(get_db)):
    return db.query(Tipo).all()


@router.post("/tipos/", response_model=TipoSchema)
def crear_tipo(tipo: TipoCreate, db: Session = Depends(get_db)):
    existente = db.query(Tipo).filter(Tipo.nombre == tipo.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un tipo con ese nombre")
    nuevo_tipo = Tipo(**tipo.dict())
    db.add(nuevo_tipo)
    db.commit()
    db.refresh(nuevo_tipo)
    return nuevo_tipo
