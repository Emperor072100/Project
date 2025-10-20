from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from schemas.proyecto import ProyectoCreate, ProyectoUpdate, ProyectoOut, ProyectoPatch
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
from app.models.estado import Estado  # Importar el modelo Estado
from app.models.prioridad import Prioridad  # Importar el modelo Prioridad


router = APIRouter(prefix="/proyectos", tags=["Proyectos"])


@router.post("/", response_model=ProyectoOut)
def crear_proyecto(
    proyecto: ProyectoCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    proyecto_data = proyecto.dict(exclude={"tipos", "equipos"})

    if not proyecto_data.get("responsable_id"):
        proyecto_data["responsable_id"] = usuario.id

    if usuario.rol != "admin" and proyecto_data["responsable_id"] != usuario.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para asignar proyectos a otros usuarios",
        )

    nuevo_proyecto = modelo.Proyecto(**proyecto_data)
    db.add(nuevo_proyecto)
    db.flush()  # Para obtener el ID sin hacer commit aún

    if proyecto.tipos:
        tipos_objs = (
            db.query(Tipo).filter(Tipo.id.in_(proyecto.tipos)).all()
        )  # 👈 Cambio aquí
        nuevo_proyecto.tipos.extend(tipos_objs)

    if proyecto.equipos:
        equipos_objs = (
            db.query(Equipo).filter(Equipo.id.in_(proyecto.equipos)).all()
        )  # 👈 Cambio aquí
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
    responsable_id: int = Query(None),
):
    try:
        query = db.query(modelo.Proyecto).options(
            joinedload(modelo.Proyecto.tipos),
            joinedload(modelo.Proyecto.equipos),
            joinedload(modelo.Proyecto.estado),
            joinedload(modelo.Proyecto.prioridad),
            joinedload(modelo.Proyecto.responsable),
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
                "responsable_nombre": (
                    proyecto.responsable.nombre if proyecto.responsable else None
                ),
                "estado": proyecto.estado.nombre,
                "tipos": [tipo.nombre for tipo in proyecto.tipos],
                "equipos": [equipo.nombre for equipo in proyecto.equipos],
                "prioridad": proyecto.prioridad.nivel,
                "objetivo": proyecto.objetivo,
                "fecha_inicio": proyecto.fecha_inicio,
                "fecha_fin": proyecto.fecha_fin,
                "progreso": proyecto.progreso or 0,  # ✨ Agregamos el progreso aquí
                "enlace": proyecto.enlace,
                "observaciones": proyecto.observaciones,
            }
            for proyecto in proyectos
        ]
    except Exception as e:
        print(f"[ERROR] Error al listar proyectos: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


from pydantic import BaseModel
from typing import Optional


class EstadoUpdate(BaseModel):
    estado: str
    progreso: Optional[int] = None  # Campo opcional para el progreso


@router.patch("/{proyecto_id}/estado")
def actualizar_estado_proyecto(
    proyecto_id: int,
    datos: EstadoUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Endpoint específico para actualizar solo el estado de un proyecto desde Kanban"""
    from app.models.estado import Estado

    proyecto = db.query(modelo.Proyecto).filter_by(id=proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if usuario.rol != "admin" and proyecto.responsable_id != usuario.id:
        raise HTTPException(
            status_code=403, detail="No tienes permisos para modificar este proyecto"
        )

    # Obtener todos los estados disponibles para debug
    estados_disponibles = db.query(Estado).all()
    print(f"Estados disponibles en la base de datos:")
    for estado in estados_disponibles:
        print(f"  - ID: {estado.id}, Nombre: '{estado.nombre}'")

    print(f"Buscando estado: '{datos.estado}'")

    # Buscar el estado en la base de datos por nombre (case insensitive)
    estado_obj = db.query(Estado).filter(Estado.nombre.ilike(datos.estado)).first()
    if not estado_obj:
        # Intentar buscar por nombre exacto
        estado_obj = db.query(Estado).filter(Estado.nombre == datos.estado).first()

    if not estado_obj:
        estados_nombres = [e.nombre for e in estados_disponibles]
        raise HTTPException(
            status_code=422,
            detail=f"Estado '{datos.estado}' no encontrado. Estados disponibles: {estados_nombres}",
        )

    print(f"Estado encontrado: ID {estado_obj.id}, Nombre: '{estado_obj.nombre}'")

    # Actualizar el estado_id
    proyecto.estado_id = estado_obj.id

    # Actualizar el progreso si se proporciona
    if datos.progreso is not None:
        print(f"Actualizando progreso de {proyecto.progreso}% a {datos.progreso}%")
        proyecto.progreso = datos.progreso

    db.commit()
    db.refresh(proyecto)

    response_data = {
        "message": "Estado actualizado correctamente",
        "nuevo_estado": datos.estado,
    }

    if datos.progreso is not None:
        response_data["nuevo_progreso"] = datos.progreso

    return response_data


@router.patch("/{proyecto_id}/equipo")
def actualizar_equipo_proyecto(
    proyecto_id: int,
    datos: dict,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Endpoint específico para actualizar solo el equipo de un proyecto"""
    proyecto = db.query(modelo.Proyecto).filter_by(id=proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if usuario.rol != "admin" and proyecto.responsable_id != usuario.id:
        raise HTTPException(
            status_code=403, detail="No tienes permisos para modificar este proyecto"
        )

    # Obtener la lista de equipos del request
    equipo_list = datos.get("equipo", [])
    print(f"DEBUG: Equipos recibidos en PATCH: {equipo_list}")

    # Verificar qué equipos existen en la base de datos
    todos_equipos = db.query(Equipo).all()
    print(f"DEBUG: Equipos disponibles en BD: {[e.nombre for e in todos_equipos]}")

    if equipo_list:
        equipos_objs = db.query(Equipo).filter(Equipo.nombre.in_(equipo_list)).all()
        print(f"DEBUG: Equipos encontrados: {[e.nombre for e in equipos_objs]}")
        proyecto.equipos = equipos_objs
    else:
        # Si se envía una lista vacía, limpiar los equipos
        proyecto.equipos = []

    db.commit()
    db.refresh(proyecto)
    return {
        "message": "Equipo actualizado correctamente",
        "nuevo_equipo": [e.nombre for e in proyecto.equipos],
    }


@router.put("/{proyecto_id}", response_model=ProyectoOut)
def actualizar_proyecto(
    proyecto_id: int,
    datos: ProyectoUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    proyecto = db.query(modelo.Proyecto).filter_by(id=proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    if usuario.rol != "admin" and proyecto.responsable_id != usuario.id:
        raise HTTPException(
            status_code=403, detail="No tienes permisos para modificar este proyecto"
        )

    if (
        "responsable_id" in datos.dict(exclude_unset=True)
        and datos.responsable_id != proyecto.responsable_id
    ):
        if usuario.rol != "admin":
            raise HTTPException(
                status_code=403,
                detail="Solo los administradores pueden cambiar el responsable de un proyecto",
            )

    update_data = datos.dict(exclude_unset=True)

    # Manejar campos de relaciones especiales
    if "tipos" in update_data:
        if update_data["tipos"]:
            tipos_objs = (
                db.query(Tipo).filter(Tipo.nombre.in_(update_data["tipos"])).all()
            )
            proyecto.tipos = tipos_objs
        else:
            proyecto.tipos = []
        update_data.pop("tipos", None)

    # Mantener compatibilidad con 'tipo' (plural)
    if "tipo" in update_data:
        if update_data["tipo"]:
            tipos_objs = (
                db.query(Tipo).filter(Tipo.nombre.in_(update_data["tipo"])).all()
            )
            proyecto.tipos = tipos_objs
        else:
            proyecto.tipos = []
        update_data.pop("tipo", None)

    if "equipos" in update_data:
        print(f"DEBUG: Equipos recibidos: {update_data['equipos']}")
        if update_data["equipos"]:
            # Verificar qué equipos existen en la base de datos
            todos_equipos = db.query(Equipo).all()
            print(
                f"DEBUG: Equipos disponibles en BD: {[e.nombre for e in todos_equipos]}"
            )

            equipos_objs = (
                db.query(Equipo).filter(Equipo.nombre.in_(update_data["equipos"])).all()
            )
            print(f"DEBUG: Equipos encontrados: {[e.nombre for e in equipos_objs]}")
            proyecto.equipos = equipos_objs
        else:
            # Si se envía una lista vacía, limpiar los equipos
            proyecto.equipos = []
        update_data.pop("equipos", None)

    # Mantener compatibilidad con 'equipo' (singular)
    if "equipo" in update_data:
        print(f"DEBUG: Equipos recibidos (singular): {update_data['equipo']}")
        if update_data["equipo"]:
            # Verificar qué equipos existen en la base de datos
            todos_equipos = db.query(Equipo).all()
            print(
                f"DEBUG: Equipos disponibles en BD: {[e.nombre for e in todos_equipos]}"
            )

            equipos_objs = (
                db.query(Equipo).filter(Equipo.nombre.in_(update_data["equipo"])).all()
            )
            print(f"DEBUG: Equipos encontrados: {[e.nombre for e in equipos_objs]}")
            proyecto.equipos = equipos_objs
        else:
            # Si se envía una lista vacía, limpiar los equipos
            proyecto.equipos = []
        update_data.pop("equipo", None)

    # Validar estado dinámicamente desde la base de datos
    if "estado" in update_data:
        print(f"🔍 DEBUG: Procesando actualización de estado...")
        print(f"🔍 DEBUG: Estado recibido: '{update_data['estado']}'")
        print(f"🔍 DEBUG: Tipo del estado: {type(update_data['estado'])}")

        try:
            # Buscar el estado por nombre para obtener el ID
            estado_obj = (
                db.query(Estado).filter(Estado.nombre == update_data["estado"]).first()
            )
            print(f"🔍 DEBUG: Objeto estado encontrado: {estado_obj}")

            if not estado_obj:
                estados_validos = db.query(Estado).all()
                nombres_estados_validos = [e.nombre for e in estados_validos]
                print(
                    f"❌ DEBUG: Estado '{update_data['estado']}' NO encontrado en estados válidos: {nombres_estados_validos}"
                )
                raise HTTPException(
                    status_code=422,
                    detail=f"Estado no válido. Estados disponibles: {nombres_estados_validos}",
                )

            print(
                f"✅ DEBUG: Estado '{update_data['estado']}' es válido, ID: {estado_obj.id}"
            )
            # Convertir el nombre del estado a estado_id para la base de datos
            update_data["estado_id"] = estado_obj.id
            # Remover el campo 'estado' ya que no existe en el modelo
            update_data.pop("estado", None)
            print(f"🔍 DEBUG: Datos actualizados: estado_id = {estado_obj.id}")

        except Exception as e:
            print(f"💥 ERROR en validación de estado: {e}")
            import traceback

            print(f"💥 Stack trace: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error interno en validación de estado: {str(e)}",
            )

    # Validar prioridad dinámicamente desde la base de datos
    if "prioridad" in update_data:
        print(f"🔍 DEBUG: Procesando actualización de prioridad...")
        print(f"🔍 DEBUG: Prioridad recibida: '{update_data['prioridad']}'")
        print(f"🔍 DEBUG: Tipo de la prioridad: {type(update_data['prioridad'])}")

        try:
            # Buscar la prioridad por nivel para obtener el ID
            prioridad_obj = (
                db.query(Prioridad)
                .filter(Prioridad.nivel == update_data["prioridad"])
                .first()
            )
            print(f"🔍 DEBUG: Objeto prioridad encontrado: {prioridad_obj}")

            if not prioridad_obj:
                prioridades_validas = db.query(Prioridad).all()
                niveles_prioridades_validas = [p.nivel for p in prioridades_validas]
                print(
                    f"❌ DEBUG: Prioridad '{update_data['prioridad']}' NO encontrada en prioridades válidas: {niveles_prioridades_validas}"
                )
                raise HTTPException(
                    status_code=422,
                    detail=f"Prioridad no válida. Prioridades disponibles: {niveles_prioridades_validas}",
                )

            print(
                f"✅ DEBUG: Prioridad '{update_data['prioridad']}' es válida, ID: {prioridad_obj.id}"
            )
            # Convertir el nivel de prioridad a prioridad_id para la base de datos
            update_data["prioridad_id"] = prioridad_obj.id
            # Remover el campo 'prioridad' ya que no existe en el modelo
            update_data.pop("prioridad", None)
            print(f"🔍 DEBUG: Datos actualizados: prioridad_id = {prioridad_obj.id}")

        except Exception as e:
            print(f"💥 ERROR en validación de prioridad: {e}")
            import traceback

            print(f"💥 Stack trace: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error interno en validación de prioridad: {str(e)}",
            )

    print(f"🔍 DEBUG: Aplicando cambios al proyecto...")
    print(f"🔍 DEBUG: Campos a actualizar: {list(update_data.keys())}")

    try:
        for campo, valor in update_data.items():
            print(f"🔍 DEBUG: Actualizando {campo} = {valor}")
            setattr(proyecto, campo, valor)

        print(f"🔍 DEBUG: Guardando cambios en la base de datos...")
        db.commit()
        print(f"🔍 DEBUG: Refrescando objeto proyecto...")
        db.refresh(proyecto)
        print(f"✅ DEBUG: Proyecto actualizado exitosamente")

    except Exception as e:
        print(f"💥 ERROR al actualizar proyecto: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno al actualizar proyecto: {str(e)}"
        )

    return proyecto


# @router.patch("/{proyecto_id}", response_model=ProyectoOut)
# def actualizar_proyecto_parcial(
#     proyecto_id: int,
#     datos: ProyectoPatch,
#     db: Session = Depends(get_db),
#     usuario: UserInDB = Depends(get_current_user)
# ):
#     """
#     Endpoint PATCH para actualizar solo campos específicos de un proyecto.
#     Más eficiente que PUT ya que solo valida y actualiza los campos enviados.
#     """
#     proyecto = db.query(modelo.Proyecto).filter_by(id=proyecto_id).first()
#     if not proyecto:
#         raise HTTPException(status_code=404, detail="Proyecto no encontrado")

#     if usuario.rol != "admin" and proyecto.responsable_id != usuario.id:
#         raise HTTPException(status_code=403, detail="No tienes permisos para modificar este proyecto")

#     # Solo obtener campos que realmente fueron enviados (exclude_unset=True)
#     update_data = datos.dict(exclude_unset=True)

#     print(f"🔧 PATCH: Actualizando proyecto {proyecto_id} con datos: {update_data}")

#     # Validar responsable_id si se está cambiando
#     if 'responsable_id' in update_data and datos.responsable_id != proyecto.responsable_id:
#         if usuario.rol != "admin":
#             raise HTTPException(status_code=403, detail="Solo los administradores pueden cambiar el responsable de un proyecto")

#     # Procesar campos especiales que requieren manejo de relaciones
#     if 'tipos' in update_data:
#         if update_data['tipos']:
#             tipos_objs = db.query(Tipo).filter(Tipo.nombre.in_(update_data['tipos'])).all()
#             proyecto.tipos = tipos_objs
#         else:
#             proyecto.tipos = []
#         update_data.pop('tipos', None)

#     if 'equipos' in update_data:
#         print(f"🔧 PATCH: Equipos recibidos: {update_data['equipos']}")
#         if update_data['equipos']:
#             equipos_objs = db.query(Equipo).filter(Equipo.nombre.in_(update_data['equipos'])).all()
#             print(f"🔧 PATCH: Equipos encontrados: {[e.nombre for e in equipos_objs]}")
#             proyecto.equipos = equipos_objs
#         else:
#             proyecto.equipos = []
#         update_data.pop('equipos', None)

#     # Validar estado dinámicamente desde la base de datos
#     if 'estado' in update_data:
#         estados_validos = db.query(Estado).all()
#         nombres_estados_validos = [e.nombre for e in estados_validos]
#         print(f"🔧 PATCH: Estados válidos en BD: {nombres_estados_validos}")
#         print(f"🔧 PATCH: Estado recibido: {update_data['estado']}")

#         if update_data['estado'] not in nombres_estados_validos:
#             raise HTTPException(status_code=422, detail=f"Estado no válido. Estados disponibles: {nombres_estados_validos}")

#     # Validar prioridad si se está actualizando
#     if 'prioridad' in update_data and update_data['prioridad'] not in ['Alta', 'Media', 'Baja']:
#         raise HTTPException(status_code=422, detail="Prioridad no válida")

#     # Aplicar los cambios de campos simples
#     for campo, valor in update_data.items():
#         if hasattr(proyecto, campo):
#             print(f"🔧 PATCH: Actualizando {campo} = {valor}")
#             setattr(proyecto, campo, valor)
#         else:
#             print(f"⚠️ PATCH: Campo '{campo}' no existe en el modelo Proyecto")

#     db.commit()
#     db.refresh(proyecto)

#     print(f"✅ PATCH: Proyecto {proyecto_id} actualizado exitosamente")
#     return proyecto


@router.delete("/{proyecto_id}")
def eliminar_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    proyecto = db.query(modelo.Proyecto).filter_by(id=proyecto_id).first()
    if not proyecto or (
        usuario.rol != "admin" and proyecto.responsable_id != usuario.id
    ):
        raise HTTPException(status_code=403, detail="No autorizado")
    try:
        # Eliminar tareas asociadas primero
        from app.models.tarea import Tarea

        db.query(Tarea).filter_by(proyecto_id=proyecto_id).delete()
        db.delete(proyecto)
        db.commit()
        return {"ok": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar: {str(e)}")


@router.get("/{proyecto_id}", response_model=ProyectoOut)
def obtener_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    query = (
        db.query(modelo.Proyecto, Usuario.nombre.label("responsable_nombre"))
        .join(Usuario, modelo.Proyecto.responsable_id == Usuario.id)
        .filter(modelo.Proyecto.id == proyecto_id)
    )

    if usuario.rol != "admin":
        query = query.filter(modelo.Proyecto.responsable_id == usuario.id)

    resultado = query.first()
    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Proyecto no encontrado o no tienes permisos para verlo",
        )

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
        "equipos": equipos,
    }
