from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.prioridad import Prioridad

router = APIRouter(prefix="/prioridades", tags=["Prioridades"])

@router.get("/")
def listar_prioridades(db: Session = Depends(get_db)):
    return db.query(Prioridad).all()
