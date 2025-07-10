from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.tipo_equipo import Equipo


router = APIRouter(prefix="/equipos", tags=["Equipos"])

@router.get("/")
def listar_equipos(db: Session = Depends(get_db)):
    return db.query(Equipo).all()
