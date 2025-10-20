from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.tipo_equipo import Equipo
from schemas.EquipoTipo import EquipoCreate, Equipo as EquipoSchema
from fastapi import HTTPException


router = APIRouter(prefix="/equipos", tags=["Equipos"])


@router.get("/")
def listar_equipos(db: Session = Depends(get_db)):
    return db.query(Equipo).all()


@router.post("/equipos/", response_model=EquipoSchema)
def crear_equipo(equipo: EquipoCreate, db: Session = Depends(get_db)):
    existente = db.query(Equipo).filter(Equipo.nombre == equipo.nombre).first()
    if existente:
        raise HTTPException(
            status_code=400, detail="Ya existe un equipo con ese nombre"
        )
    nuevo_equipo = Equipo(**equipo.dict())
    db.add(nuevo_equipo)
    db.commit()
    db.refresh(nuevo_equipo)
    return nuevo_equipo
