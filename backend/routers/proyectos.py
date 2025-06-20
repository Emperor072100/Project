from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.proyecto import ProyectoCreate, ProyectoUpdate, ProyectoOut
from app.models import proyecto as modelo
from app.dependencies import get_db
from core.security import get_current_user, UserInDB
from typing import List

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])

@router.post("/", response_model=ProyectoOut)
def crear_proyecto(
    proyecto: ProyectoCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    # Crear diccionario con los datos del proyecto
    proyecto_data = proyecto.dict(exclude_unset=True)
    
    # Si no se proporciona responsable_id, usar el ID del usuario actual
    if 'responsable_id' not in proyecto_data or not proyecto_data['responsable_id']:
        proyecto_data['responsable_id'] = usuario.id
    
    # Verificar que el usuario tenga permisos para asignar a otro responsable
    if proyecto_data['responsable_id'] != usuario.id and usuario.rol != 'admin':
        raise HTTPException(status_code=403, detail="No tienes permisos para asignar proyectos a otros usuarios")
    
    # Crear el nuevo proyecto
    nuevo = modelo.Proyecto(**proyecto_data)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/", response_model=List[ProyectoOut])
def listar_proyectos(
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    from app.models.usuario import Usuario
    
    # Consulta con join para obtener el nombre del responsable
    query = db.query(modelo.Proyecto, Usuario.nombre.label("responsable_nombre")).\
            join(Usuario, modelo.Proyecto.responsable_id == Usuario.id)
    
    # Filtrar por rol
    if usuario.rol != "admin":
        query = query.filter(modelo.Proyecto.responsable_id == usuario.id)
    
    # Ejecutar consulta y formatear resultados
    resultados = query.all()
    proyectos = []
    
    for proyecto, responsable_nombre in resultados:
        # Crear un diccionario con los datos del proyecto
        proyecto_dict = {
            "id": proyecto.id,
            "nombre": proyecto.nombre,
            "estado": proyecto.estado,
            "prioridad": proyecto.prioridad,
            "objetivo": proyecto.objetivo,
            "enlace": proyecto.enlace,
            "observaciones": proyecto.observaciones,
            "fecha_inicio": proyecto.fecha_inicio,
            "fecha_fin": proyecto.fecha_fin,
            "progreso": proyecto.progreso,
            "responsable_id": proyecto.responsable_id,
            "responsable_nombre": responsable_nombre
        }
        proyectos.append(proyecto_dict)
    
    return proyectos

@router.put("/{proyecto_id}", response_model=ProyectoOut)
def actualizar_proyecto(
    proyecto_id: int,
    datos: ProyectoUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    proyecto = db.query(modelo.Proyecto).filter_by(id=proyecto_id).first()
    if not proyecto or (usuario.rol != "admin" and proyecto.responsable_id != usuario.id):
        raise HTTPException(status_code=403, detail="No autorizado")
    for campo, valor in datos.dict(exclude_unset=True).items():
        setattr(proyecto, campo, valor)
    db.commit()
    db.refresh(proyecto)
    return proyecto

@router.delete("/{proyecto_id}")
def eliminar_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    proyecto = db.query(modelo.Proyecto).filter_by(id=proyecto_id).first()
    if not proyecto or (usuario.rol != "admin" and proyecto.responsable_id != usuario.id):
        raise HTTPException(status_code=403, detail="No autorizado")
    db.delete(proyecto)
    db.commit()
    return {"ok": True}