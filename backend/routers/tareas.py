from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.tarea import TareaCreate, TareaUpdate, TareaOut
from app.models import tarea as models, proyecto as modelos_proyecto
from app.dependencies import get_db
from core.security import get_current_user, UserInDB

router = APIRouter(prefix="/tareas", tags=["Tareas"])


@router.post("/", response_model=TareaOut)
def crear_tarea(
    tarea: TareaCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    proyecto = (
        db.query(modelos_proyecto.Proyecto).filter_by(id=tarea.proyecto_id).first()
    )
    if not proyecto or (
        usuario.rol != "admin" and proyecto.responsable_id != usuario.id
    ):
        raise HTTPException(
            status_code=403, detail="No autorizado para agregar tareas a este proyecto"
        )

    db_tarea = models.Tarea(**tarea.dict())
    db.add(db_tarea)
    db.commit()
    db.refresh(db_tarea)
    return db_tarea


@router.get("/", response_model=List[TareaOut])
def listar_tareas(
    proyecto_id: Optional[int] = None,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    query = db.query(models.Tarea).join(modelos_proyecto.Proyecto)

    if usuario.rol != "admin":
        query = query.filter(modelos_proyecto.Proyecto.responsable_id == usuario.id)

    if proyecto_id:
        query = query.filter(models.Tarea.proyecto_id == proyecto_id)

    return query.all()


@router.put("/{tarea_id}", response_model=TareaOut)
def actualizar_tarea(
    tarea_id: int,
    tarea: TareaUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    db_tarea = db.query(models.Tarea).filter_by(id=tarea_id).first()
    if not db_tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    proyecto = (
        db.query(modelos_proyecto.Proyecto).filter_by(id=db_tarea.proyecto_id).first()
    )
    if usuario.rol != "admin" and proyecto.responsable_id != usuario.id:
        raise HTTPException(
            status_code=403, detail="No autorizado para modificar esta tarea"
        )

    for key, value in tarea.dict(exclude_unset=True).items():
        setattr(db_tarea, key, value)

    db.commit()
    db.refresh(db_tarea)
    return db_tarea


@router.delete("/{tarea_id}")
def eliminar_tarea(
    tarea_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    db_tarea = db.query(models.Tarea).filter_by(id=tarea_id).first()
    if not db_tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    proyecto = (
        db.query(modelos_proyecto.Proyecto).filter_by(id=db_tarea.proyecto_id).first()
    )
    if usuario.rol != "admin" and proyecto.responsable_id != usuario.id:
        raise HTTPException(
            status_code=403, detail="No autorizado para eliminar esta tarea"
        )

    db.delete(db_tarea)
    db.commit()
    return {"ok": True}
