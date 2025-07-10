from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.proyecto import ProyectoCreate, ProyectoUpdate, ProyectoOut
from app.models import proyecto as modelo
from app.dependencies import get_db
from core.security import get_current_user, UserInDB
from typing import List
from app.models.usuario import Usuario
from app.models.usuario import RolUsuario
from app.models.tipo_equipo import proyecto_tipos, proyecto_equipos 
import traceback
from sqlalchemy.orm import contains_eager, joinedload

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])

# @router.post("/", response_model=ProyectoOut)
# def crear_proyecto(
#     proyecto: ProyectoCreate,
#     db: Session = Depends(get_db),
#     usuario: UserInDB = Depends(get_current_user)
# ):
#     proyecto_data = proyecto.dict(exclude_unset=True)
#     if 'responsable_id' not in proyecto_data or not proyecto_data['responsable_id']:
#         proyecto_data['responsable_id'] = usuario.id
#     if proyecto_data['responsable_id'] != usuario.id and usuario.rol != 'admin':
#         raise HTTPException(status_code=403, detail="No tienes permisos para asignar proyectos a otros usuarios")
#     nuevo = modelo.Proyecto(**proyecto_data)
#     db.add(nuevo)
#     db.commit()
#     db.refresh(nuevo)
#     return nuevo

@router.post("/", response_model=ProyectoOut)
def crear_proyecto(
    proyecto: ProyectoCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    # Prepare data excluding relationships
    proyecto_data = proyecto.dict(exclude={"tipos", "equipos"})
    
    # Handle responsible assignment
    if not proyecto_data.get('responsable_id'):
        proyecto_data['responsable_id'] = usuario.id

    # Permission check
    if usuario.rol != 'admin' and proyecto_data['responsable_id'] != usuario.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para asignar proyectos a otros usuarios")

    # Create proyecto instance
    nuevo_proyecto = modelo.Proyecto(**proyecto_data)
    db.add(nuevo_proyecto)
    db.flush()  # Get the ID without committing yet
    
    # Handle tipos relationship
    if proyecto.tipos:
        tipos_objs = db.query(modelo.Tipo).filter(modelo.Tipo.id.in_(proyecto.tipos)).all()
        nuevo_proyecto.tipos.extend(tipos_objs)
    
    # Handle equipos relationship
    if proyecto.equipos:
        equipos_objs = db.query(modelo.Equipo).filter(modelo.Equipo.id.in_(proyecto.equipos)).all()
        nuevo_proyecto.equipos.extend(equipos_objs)
    
    db.commit()
    db.refresh(nuevo_proyecto)
    return nuevo_proyecto
from sqlalchemy.orm import joinedload

@router.get("/")
def listar_proyectos(
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    try:
        rol = usuario.rol
        admin = RolUsuario.admin
        user_rol = RolUsuario.usuario

        if str(rol) == str(admin):
            proyectos = db.query(modelo.Proyecto).options(
                joinedload(modelo.Proyecto.tipos),
                joinedload(modelo.Proyecto.equipos),
                joinedload(modelo.Proyecto.estado),
                joinedload(modelo.Proyecto.prioridad),
                joinedload(modelo.Proyecto.responsable)
            ).all()
        elif str(rol) == str(user_rol):
            proyectos = db.query(modelo.Proyecto).options(
                joinedload(modelo.Proyecto.tipos),
                joinedload(modelo.Proyecto.equipos),
                joinedload(modelo.Proyecto.estado),
                joinedload(modelo.Proyecto.prioridad),
                joinedload(modelo.Proyecto.responsable)
            ).filter(modelo.Proyecto.responsable_id == usuario.id).all()
        else:
            raise HTTPException(
                status_code=403,
                detail=f"Rol no válido para acceder a los proyectos: {rol}"
            )

        return [
            {
                "id": proyecto.id,
                "nombre": proyecto.nombre,
                "responsable_id": proyecto.responsable_id,
                "responsable_nombre": proyecto.responsable.nombre,
                "estado": proyecto.estado.nombre,
                "tipos": [tipo.nombre for tipo in proyecto.tipos],
                "equipos": [equipo.nombre for equipo in proyecto.equipos],
                "prioridad": proyecto.prioridad.nivel,
                "objetivo": proyecto.objetivo,
                "fecha_inicio": proyecto.fecha_inicio,
                "fecha_fin": proyecto.fecha_fin
            }
            for proyecto in proyectos
        ]
    except Exception as e:
        print(f"[ERROR] Error al listar proyectos: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

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
    if 'responsable_id' in datos.dict(exclude_unset=True) and datos.responsable_id != proyecto.responsable_id:
        if usuario.rol != "admin":
            raise HTTPException(status_code=403, detail="Solo los administradores pueden cambiar el responsable de un proyecto")

    print("🔍 datos.dict():", datos.dict())
    update_data = datos.dict(exclude_unset=True)
    print("🔍 Campos procesados (exclude_unset):", update_data)

    if 'tipo' in update_data:
        if update_data['tipo']:
            tipos_objs = db.query(modelo.Tipo).filter(modelo.Tipo.nombre.in_(update_data['tipo'])).all()
            proyecto.tipos = tipos_objs
        update_data.pop('tipo', None)

    if 'equipo' in update_data:
        if update_data['equipo']:
            equipos_objs = db.query(modelo.Equipo).filter(modelo.Equipo.nombre.in_(update_data['equipo'])).all()
            proyecto.equipos = equipos_objs
        update_data.pop('equipo', None)

    if 'estado' in update_data and update_data['estado'] not in [
        'Conceptual', 'Análisis', 'Sin Empezar', 'En diseño', 'En desarrollo', 'En curso', 'Etapa pruebas', 'Cancelado', 'Pausado', 'En producción', 'Desarrollado']:
        raise HTTPException(status_code=422, detail="Estado no válido")

    if 'prioridad' in update_data and update_data['prioridad'] not in ['Alta', 'Media', 'Baja']:
        raise HTTPException(status_code=422, detail="Prioridad no válida")

    for campo, valor in update_data.items():
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
    query = db.query(modelo.Proyecto, Usuario.nombre.label("responsable_nombre")).\
            join(Usuario, modelo.Proyecto.responsable_id == Usuario.id).\
            filter(modelo.Proyecto.id == proyecto_id)

    if usuario.rol != "admin":
        query = query.filter(modelo.Proyecto.responsable_id == usuario.id)

    resultado = query.first()
    if not resultado:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no tienes permisos para verlo")

    proyecto, responsable_nombre = resultado
    tipos = [tipo.nombre for tipo in proyecto.tipos]
    equipos = [equipo.nombre for equipo in proyecto.equipos]

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
