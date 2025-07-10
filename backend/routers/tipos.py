from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.tipo_equipo import Tipo


router = APIRouter(prefix="/tipos", tags=["Tipos"])

@router.get("/")
def listar_tipos(db: Session = Depends(get_db)):
    return db.query(Tipo).all()
