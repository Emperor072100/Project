from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.proyecto import ProyectoCreate, ProyectoUpdate, ProyectoOut
from app.models import proyecto as modelo
from app.dependencies import get_db
from core.security import get_current_user, UserInDB
from typing import List
from app.models.usuario import Usuario
from app.models.usuario import RolUsuario

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
    
    print(f"[DEBUG] Usuario: {usuario.nombre} | ID: {usuario.id} | Rol: {usuario.rol}")

    # Consulta con join para obtener el nombre del responsable
    query = db.query(modelo.Proyecto, Usuario.nombre.label("responsable_nombre")).\
            join(Usuario, modelo.Proyecto.responsable_id == Usuario.id)
    
    # Filtrar por rol
    if str(usuario.rol).lower() != "admin":
        query = query.filter(modelo.Proyecto.responsable_id == usuario.id)
    
    # Ejecutar consulta y formatear resultados
    resultados = query.all()
    proyectos = []
    
    for proyecto, responsable_nombre in resultados:
        # Obtener tipos y equipos asociados al proyecto
        tipos = [tipo.nombre for tipo in proyecto.tipos]
        equipos = [equipo.nombre for equipo in proyecto.equipos]
        
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
            "responsable_nombre": responsable_nombre,
            "tipos": tipos,
            "equipos": equipos
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
    
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    if usuario.rol != "admin" and proyecto.responsable_id != usuario.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar este proyecto")
        
    # Si el usuario intenta cambiar el responsable, verificar permisos
    if 'responsable_id' in datos.dict(exclude_unset=True) and datos.responsable_id != proyecto.responsable_id:
        if usuario.rol != "admin":
            raise HTTPException(status_code=403, detail="Solo los administradores pueden cambiar el responsable de un proyecto")
    
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


@router.get("/{proyecto_id}", response_model=ProyectoOut)
def obtener_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    from app.models.usuario import Usuario
    
    # Consulta con join para obtener el nombre del responsable
    query = db.query(modelo.Proyecto, Usuario.nombre.label("responsable_nombre")).\
            join(Usuario, modelo.Proyecto.responsable_id == Usuario.id).\
            filter(modelo.Proyecto.id == proyecto_id)
    
    # Verificar permisos según rol
    if usuario.rol != "admin":
        query = query.filter(modelo.Proyecto.responsable_id == usuario.id)
    
    resultado = query.first()
    
    if not resultado:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no tienes permisos para verlo")
    
    proyecto, responsable_nombre = resultado
    
    # Obtener tipos y equipos asociados al proyecto
    tipos = [tipo.nombre for tipo in proyecto.tipos]
    equipos = [equipo.nombre for equipo in proyecto.equipos]
    
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
        "responsable_nombre": responsable_nombre,
        "tipos": tipos,
        "equipos": equipos
    }
    
    return proyecto_dict