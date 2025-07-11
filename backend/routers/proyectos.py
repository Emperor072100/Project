from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from schemas.proyecto import ProyectoCreate, ProyectoUpdate, ProyectoOut
from app.models import proyecto as modelo
from app.models.tipo_equipo import Tipo, Equipo  # 👈 Import directo aquí
from app.dependencies import get_db
from core.security import get_current_user, UserInDB
from typing import List, Optional
from app.models.usuario import Usuario
from app.models.usuario import RolUsuario
import traceback
from sqlalchemy.orm import joinedload
from datetime import date


router = APIRouter(prefix="/proyectos", tags=["Proyectos"])

@router.post("/", response_model=ProyectoOut)
def crear_proyecto(
    proyecto: ProyectoCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    proyecto_data = proyecto.dict(exclude={"tipos", "equipos"})

    if not proyecto_data.get('responsable_id'):
        proyecto_data['responsable_id'] = usuario.id

    if usuario.rol != 'admin' and proyecto_data['responsable_id'] != usuario.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para asignar proyectos a otros usuarios")

    nuevo_proyecto = modelo.Proyecto(**proyecto_data)
    db.add(nuevo_proyecto)
    db.flush()  # Para obtener el ID sin hacer commit aún

    if proyecto.tipos:
        tipos_objs = db.query(Tipo).filter(Tipo.id.in_(proyecto.tipos)).all()  # 👈 Cambio aquí
        nuevo_proyecto.tipos.extend(tipos_objs)

    if proyecto.equipos:
        equipos_objs = db.query(Equipo).filter(Equipo.id.in_(proyecto.equipos)).all()  # 👈 Cambio aquí
        nuevo_proyecto.equipos.extend(equipos_objs)

    db.commit()
    db.refresh(nuevo_proyecto)
    return nuevo_proyecto


from fastapi import Query
from typing import Optional
from datetime import date

@router.get("/")
def listar_proyectos(
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
    estado_id: int = Query(None),
    prioridad_id: int = Query(None),
    desde: date = Query(None),
    hasta: date = Query(None),
    nombre: str = Query(None),
    responsable_id: int = Query(None)
):
    try:
        query = db.query(modelo.Proyecto).options(
            joinedload(modelo.Proyecto.tipos),
            joinedload(modelo.Proyecto.equipos),
            joinedload(modelo.Proyecto.estado),
            joinedload(modelo.Proyecto.prioridad),
            joinedload(modelo.Proyecto.responsable)
        )

        # Filtrado por rol
        if usuario.rol != RolUsuario.admin:
            query = query.filter(modelo.Proyecto.responsable_id == usuario.id)
        elif responsable_id:
            query = query.filter(modelo.Proyecto.responsable_id == responsable_id)

        # Filtros opcionales
        if estado_id:
            query = query.filter(modelo.Proyecto.estado_id == estado_id)
        if prioridad_id:
            query = query.filter(modelo.Proyecto.prioridad_id == prioridad_id)
        if desde:
            query = query.filter(modelo.Proyecto.fecha_inicio >= desde)
        if hasta:
            query = query.filter(modelo.Proyecto.fecha_inicio <= hasta)
        if nombre:
            query = query.filter(modelo.Proyecto.nombre.ilike(f"%{nombre}%"))

        proyectos = query.all()

        return [
            {
                "id": proyecto.id,
                "nombre": proyecto.nombre,
                "responsable_id": proyecto.responsable_id,
                "responsable_nombre": proyecto.responsable.nombre if proyecto.responsable else None,
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

    update_data = datos.dict(exclude_unset=True)

    if 'tipo' in update_data:
        if update_data['tipo']:
            tipos_objs = db.query(Tipo).filter(Tipo.nombre.in_(update_data['tipo'])).all()
            proyecto.tipos = tipos_objs
        update_data.pop('tipo', None)

    if 'equipo' in update_data:
        if update_data['equipo']:
            equipos_objs = db.query(Equipo).filter(Equipo.nombre.in_(update_data['equipo'])).all()
            proyecto.equipos = equipos_objs
        update_data.pop('equipo', None)

    if 'estado' in update_data and update_data['estado'] not in [
        'Conceptual', 'Análisis', 'Sin Empezar', 'En diseño', 'En desarrollo', 'En curso',
        'Etapa pruebas', 'Cancelado', 'Pausado', 'En producción', 'Desarrollado']:
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

    return {
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
