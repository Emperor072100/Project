from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from core.database import get_db
from models.project_implementaciones_clienteimple import (
    ProjectImplementacionesClienteImple,
)
from models.project_implementacion_contractual import ProjectImplementacionContractual
from models.project_implementacion_talentoHumano import (
    ProjectImplementacionTalentoHumano,
)
from models.project_implementacion_procesos import ProjectImplementacionProcesos
from models.project_implementacion_tecnologia import ProjectImplementacionTecnologia
from models.project_implementacion_subseccion_personalizada import (
    ProjectImplementacionSubseccionPersonalizada,
)
from models.project_subseccion_implementacion_talentoHumano import (
    ProjectSubseccionImplementacionTalentoHumano,
)
from models.project_subseccion_implementacion_procesos import (
    ProjectSubseccionImplementacionProcesos,
)
from models.project_subseccion_implementacion_tecnologia import (
    ProjectSubseccionImplementacionTecnologia,
)
from pydantic import BaseModel
import pandas as pd
import io
from xhtml2pdf import pisa
from datetime import datetime


class ImplementacionCreate(BaseModel):
    cliente: str
    proceso: str
    estado: Optional[str] = None
    contractual: Dict[str, Dict[str, Any]]
    talento_humano: Dict[str, Dict[str, Any]]
    procesos: Dict[str, Dict[str, Any]]
    tecnologia: Dict[str, Dict[str, Any]]


class ImplementacionOut(BaseModel):
    id: int
    cliente: str
    proceso: str
    estado: Optional[str]
    contractual: Optional[Dict[str, Any]]
    talento_humano: Optional[Dict[str, Any]]
    procesos: Optional[Dict[str, Any]]
    tecnologia: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class ImplementacionBasic(BaseModel):
    id: int
    cliente: str
    proceso: str
    estado: Optional[str]

    class Config:
        from_attributes = True


class EstadoUpdate(BaseModel):
    estado: str


router = APIRouter(prefix="/implementaciones", tags=["Implementaciones"])

# Campos predefinidos para cada sección (no son personalizados)
CAMPOS_PREDEFINIDOS = {
    "contractual": [
        "modeloContrato",
        "modeloConfidencialidad",
        "alcance",
        "fechaInicio",
    ],
    "talento_humano": [
        "perfilPersonal",
        "cantidadAsesores",
        "horarios",
        "formador",
        "capacitacionesAndes",
        "capacitacionesCliente",
    ],
    "procesos": [
        "responsableCliente",
        "responsableAndes",
        "responsablesOperacion",
        "listadoReportes",
        "protocoloComunicaciones",
        "informacionDiaria",
        "seguimientoPeriodico",
        "guionesProtocolos",
        "procesoMonitoreo",
    ],
    "tecnologia": [
        "creacionModulo",
        "tipificacionInteracciones",
        "aplicativosProceso",
        "whatsapp",
        "correosElectronicos",
        "requisitosGrabacion",
    ],
}

# ============================================================================
# HELPER FUNCTIONS - Subsecciones Personalizadas Contractual (tabla universal)
# ============================================================================


def guardar_subsecciones_contractual(
    db: Session, cliente_implementacion_id: int, contractual_data: Dict[str, Any]
):
    """
    Guarda las subsecciones personalizadas (no predefinidas) de Contractual en la tabla universal.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal
        contractual_data: Diccionario con todos los datos de Contractual (predefinidos + personalizados)
    """
    campos_predefinidos = CAMPOS_PREDEFINIDOS["contractual"]

    # Filtrar solo las subsecciones personalizadas (las que no están en campos predefinidos)
    for key, value in contractual_data.items():
        if key not in campos_predefinidos and isinstance(value, dict):
            # Esta es una subsección personalizada
            subseccion = ProjectImplementacionSubseccionPersonalizada(
                cliente_implementacion_id=cliente_implementacion_id,
                seccion="contractual",
                nombre_subsesion=key,
                seguimiento=value.get("seguimiento", ""),
                estado=value.get("estado", ""),
                responsable=value.get("responsable", ""),
                notas=value.get("notas", ""),
            )
            db.add(subseccion)

    db.commit()


def obtener_subsecciones_contractual(
    db: Session, cliente_implementacion_id: int
) -> Dict[str, Any]:
    """
    Obtiene las subsecciones personalizadas de Contractual desde la tabla universal.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal

    Returns:
        Diccionario con las subsecciones personalizadas en formato {nombre_subsesion: {seguimiento, estado, responsable, notas}}
    """
    subsecciones = (
        db.query(ProjectImplementacionSubseccionPersonalizada)
        .filter(
            ProjectImplementacionSubseccionPersonalizada.cliente_implementacion_id
            == cliente_implementacion_id,
            ProjectImplementacionSubseccionPersonalizada.seccion == "contractual",
        )
        .all()
    )

    resultado = {}
    for subseccion in subsecciones:
        resultado[subseccion.nombre_subsesion] = {
            "seguimiento": subseccion.seguimiento or "",
            "estado": subseccion.estado or "",
            "responsable": subseccion.responsable or "",
            "notas": subseccion.notas or "",
        }

    return resultado


# ============================================================================
# HELPER FUNCTIONS - Subsecciones Personalizadas Talento Humano
# ============================================================================


def guardar_subsecciones_talento_humano(
    db: Session, cliente_implementacion_id: int, talento_humano_data: Dict[str, Any]
):
    """
    Guarda las subsecciones personalizadas (no predefinidas) de Talento Humano en la tabla específica.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal
        talento_humano_data: Diccionario con todos los datos de Talento Humano (predefinidos + personalizados)
    """
    campos_predefinidos = CAMPOS_PREDEFINIDOS["talento_humano"]

    # Filtrar solo las subsecciones personalizadas (las que no están en campos predefinidos)
    for key, value in talento_humano_data.items():
        if key not in campos_predefinidos and isinstance(value, dict):
            # Esta es una subsección personalizada
            subseccion = ProjectSubseccionImplementacionTalentoHumano(
                cliente_implementacion_id=cliente_implementacion_id,
                seccion="talento_humano",
                nombre_subsesion=key,
                seguimiento=value.get("seguimiento", ""),
                estado=value.get("estado", ""),
                responsable=value.get("responsable", ""),
                notas=value.get("notas", ""),
            )
            db.add(subseccion)

    db.commit()


def obtener_subsecciones_talento_humano(
    db: Session, cliente_implementacion_id: int
) -> Dict[str, Any]:
    """
    Obtiene las subsecciones personalizadas de Talento Humano desde la tabla específica.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal

    Returns:
        Diccionario con las subsecciones personalizadas en formato {nombre_subsesion: {seguimiento, estado, responsable, notas}}
    """
    subsecciones = (
        db.query(ProjectSubseccionImplementacionTalentoHumano)
        .filter(
            ProjectSubseccionImplementacionTalentoHumano.cliente_implementacion_id
            == cliente_implementacion_id
        )
        .all()
    )

    resultado = {}
    for subseccion in subsecciones:
        resultado[subseccion.nombre_subsesion] = {
            "seguimiento": subseccion.seguimiento or "",
            "estado": subseccion.estado or "",
            "responsable": subseccion.responsable or "",
            "notas": subseccion.notas or "",
        }

    return resultado


# ============================================================================
# HELPER FUNCTIONS - Subsecciones Personalizadas Procesos
# ============================================================================


def guardar_subsecciones_procesos(
    db: Session, cliente_implementacion_id: int, procesos_data: Dict[str, Any]
):
    """
    Guarda las subsecciones personalizadas (no predefinidas) de Procesos en la tabla específica.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal
        procesos_data: Diccionario con todos los datos de Procesos (predefinidos + personalizados)
    """
    campos_predefinidos = CAMPOS_PREDEFINIDOS["procesos"]

    # Filtrar solo las subsecciones personalizadas (las que no están en campos predefinidos)
    for key, value in procesos_data.items():
        if key not in campos_predefinidos and isinstance(value, dict):
            # Esta es una subsección personalizada
            subseccion = ProjectSubseccionImplementacionProcesos(
                cliente_implementacion_id=cliente_implementacion_id,
                seccion="procesos",
                nombre_subsesion=key,
                seguimiento=value.get("seguimiento", ""),
                estado=value.get("estado", ""),
                responsable=value.get("responsable", ""),
                notas=value.get("notas", ""),
            )
            db.add(subseccion)

    db.commit()


def obtener_subsecciones_procesos(
    db: Session, cliente_implementacion_id: int
) -> Dict[str, Any]:
    """
    Obtiene las subsecciones personalizadas de Procesos desde la tabla específica.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal

    Returns:
        Diccionario con las subsecciones personalizadas en formato {nombre_subsesion: {seguimiento, estado, responsable, notas}}
    """
    subsecciones = (
        db.query(ProjectSubseccionImplementacionProcesos)
        .filter(
            ProjectSubseccionImplementacionProcesos.cliente_implementacion_id
            == cliente_implementacion_id
        )
        .all()
    )

    resultado = {}
    for subseccion in subsecciones:
        resultado[subseccion.nombre_subsesion] = {
            "seguimiento": subseccion.seguimiento or "",
            "estado": subseccion.estado or "",
            "responsable": subseccion.responsable or "",
            "notas": subseccion.notas or "",
        }

    return resultado


# ============================================================================
# HELPER FUNCTIONS - Subsecciones Personalizadas Tecnología
# ============================================================================


def guardar_subsecciones_tecnologia(
    db: Session, cliente_implementacion_id: int, tecnologia_data: Dict[str, Any]
):
    """
    Guarda las subsecciones personalizadas (no predefinidas) de Tecnología en la tabla específica.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal
        tecnologia_data: Diccionario con todos los datos de Tecnología (predefinidos + personalizados)
    """
    campos_predefinidos = CAMPOS_PREDEFINIDOS["tecnologia"]

    # Filtrar solo las subsecciones personalizadas (las que no están en campos predefinidos)
    for key, value in tecnologia_data.items():
        if key not in campos_predefinidos and isinstance(value, dict):
            # Esta es una subsección personalizada
            subseccion = ProjectSubseccionImplementacionTecnologia(
                cliente_implementacion_id=cliente_implementacion_id,
                seccion="tecnologia",
                nombre_subsesion=key,
                seguimiento=value.get("seguimiento", ""),
                estado=value.get("estado", ""),
                responsable=value.get("responsable", ""),
                notas=value.get("notas", ""),
            )
            db.add(subseccion)

    db.commit()


def obtener_subsecciones_tecnologia(
    db: Session, cliente_implementacion_id: int
) -> Dict[str, Any]:
    """
    Obtiene las subsecciones personalizadas de Tecnología desde la tabla específica.

    Args:
        db: Sesión de base de datos
        cliente_implementacion_id: ID de la implementación principal

    Returns:
        Diccionario con las subsecciones personalizadas en formato {nombre_subsesion: {seguimiento, estado, responsable, notas}}
    """
    subsecciones = (
        db.query(ProjectSubseccionImplementacionTecnologia)
        .filter(
            ProjectSubseccionImplementacionTecnologia.cliente_implementacion_id
            == cliente_implementacion_id
        )
        .all()
    )

    resultado = {}
    for subseccion in subsecciones:
        resultado[subseccion.nombre_subsesion] = {
            "seguimiento": subseccion.seguimiento or "",
            "estado": subseccion.estado or "",
            "responsable": subseccion.responsable or "",
            "notas": subseccion.notas or "",
        }

    return resultado


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.post("/", response_model=ImplementacionOut)
def crear_implementacion(data: ImplementacionCreate, db: Session = Depends(get_db)):
    # 1. Crear implementación principal
    nueva = ProjectImplementacionesClienteImple(
        cliente=data.cliente, proceso=data.proceso, estado=data.estado
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    # 2. Crear contractual
    contractual = ProjectImplementacionContractual(
        cliente_implementacion_id=nueva.id,
        modelo_contrato_seguimiento=data.contractual.get("modeloContrato", {}).get(
            "seguimiento", ""
        ),
        modelo_contrato_estado=data.contractual.get("modeloContrato", {}).get(
            "estado", ""
        ),
        modelo_contrato_responsable=data.contractual.get("modeloContrato", {}).get(
            "responsable", ""
        ),
        modelo_contrato_notas=data.contractual.get("modeloContrato", {}).get(
            "notas", ""
        ),
        modelo_confidencialidad_seguimiento=data.contractual.get(
            "modeloConfidencialidad", {}
        ).get("seguimiento", ""),
        modelo_confidencialidad_estado=data.contractual.get(
            "modeloConfidencialidad", {}
        ).get("estado", ""),
        modelo_confidencialidad_responsable=data.contractual.get(
            "modeloConfidencialidad", {}
        ).get("responsable", ""),
        modelo_confidencialidad_notas=data.contractual.get(
            "modeloConfidencialidad", {}
        ).get("notas", ""),
        alcance_seguimiento=data.contractual.get("alcance", {}).get("seguimiento", ""),
        alcance_estado=data.contractual.get("alcance", {}).get("estado", ""),
        alcance_responsable=data.contractual.get("alcance", {}).get("responsable", ""),
        alcance_notas=data.contractual.get("alcance", {}).get("notas", ""),
        fecha_inicio_seguimiento=data.contractual.get("fechaInicio", {}).get(
            "seguimiento", ""
        ),
        fecha_inicio_estado=data.contractual.get("fechaInicio", {}).get("estado", ""),
        fecha_inicio_responsable=data.contractual.get("fechaInicio", {}).get(
            "responsable", ""
        ),
        fecha_inicio_notas=data.contractual.get("fechaInicio", {}).get("notas", ""),
    )
    db.add(contractual)
    # 3. Crear talento humano
    talento = ProjectImplementacionTalentoHumano(
        cliente_implementacion_id=nueva.id,
        perfil_personal_seguimiento=data.talento_humano.get("perfilPersonal", {}).get(
            "seguimiento", ""
        ),
        perfil_personal_estado=data.talento_humano.get("perfilPersonal", {}).get(
            "estado", ""
        ),
        perfil_personal_responsable=data.talento_humano.get("perfilPersonal", {}).get(
            "responsable", ""
        ),
        perfil_personal_notas=data.talento_humano.get("perfilPersonal", {}).get(
            "notas", ""
        ),
        cantidad_asesores_seguimiento=data.talento_humano.get(
            "cantidadAsesores", {}
        ).get("seguimiento", ""),
        cantidad_asesores_estado=data.talento_humano.get("cantidadAsesores", {}).get(
            "estado", ""
        ),
        cantidad_asesores_responsable=data.talento_humano.get(
            "cantidadAsesores", {}
        ).get("responsable", ""),
        cantidad_asesores_notas=data.talento_humano.get("cantidadAsesores", {}).get(
            "notas", ""
        ),
        horarios_seguimiento=data.talento_humano.get("horarios", {}).get(
            "seguimiento", ""
        ),
        horarios_estado=data.talento_humano.get("horarios", {}).get("estado", ""),
        horarios_responsable=data.talento_humano.get("horarios", {}).get(
            "responsable", ""
        ),
        horarios_notas=data.talento_humano.get("horarios", {}).get("notas", ""),
        formador_seguimiento=data.talento_humano.get("formador", {}).get(
            "seguimiento", ""
        ),
        formador_estado=data.talento_humano.get("formador", {}).get("estado", ""),
        formador_responsable=data.talento_humano.get("formador", {}).get(
            "responsable", ""
        ),
        formador_notas=data.talento_humano.get("formador", {}).get("notas", ""),
        capacitaciones_andes_seguimiento=data.talento_humano.get(
            "capacitacionesAndes", {}
        ).get("seguimiento", ""),
        capacitaciones_andes_estado=data.talento_humano.get(
            "capacitacionesAndes", {}
        ).get("estado", ""),
        capacitaciones_andes_responsable=data.talento_humano.get(
            "capacitacionesAndes", {}
        ).get("responsable", ""),
        capacitaciones_andes_notas=data.talento_humano.get(
            "capacitacionesAndes", {}
        ).get("notas", ""),
        capacitaciones_cliente_seguimiento=data.talento_humano.get(
            "capacitacionesCliente", {}
        ).get("seguimiento", ""),
        capacitaciones_cliente_estado=data.talento_humano.get(
            "capacitacionesCliente", {}
        ).get("estado", ""),
        capacitaciones_cliente_responsable=data.talento_humano.get(
            "capacitacionesCliente", {}
        ).get("responsable", ""),
        capacitaciones_cliente_notas=data.talento_humano.get(
            "capacitacionesCliente", {}
        ).get("notas", ""),
    )
    db.add(talento)
    # 4. Crear procesos
    procesos = ProjectImplementacionProcesos(
        cliente_implementacion_id=nueva.id,
        responsable_cliente_seguimiento=data.procesos.get("responsableCliente", {}).get(
            "seguimiento", ""
        ),
        responsable_cliente_estado=data.procesos.get("responsableCliente", {}).get(
            "estado", ""
        ),
        responsable_cliente_responsable=data.procesos.get("responsableCliente", {}).get(
            "responsable", ""
        ),
        responsable_cliente_notas=data.procesos.get("responsableCliente", {}).get(
            "notas", ""
        ),
        responsable_andes_seguimiento=data.procesos.get("responsableAndes", {}).get(
            "seguimiento", ""
        ),
        responsable_andes_estado=data.procesos.get("responsableAndes", {}).get(
            "estado", ""
        ),
        responsable_andes_responsable=data.procesos.get("responsableAndes", {}).get(
            "responsable", ""
        ),
        responsable_andes_notas=data.procesos.get("responsableAndes", {}).get(
            "notas", ""
        ),
        responsables_operacion_seguimiento=data.procesos.get(
            "responsablesOperacion", {}
        ).get("seguimiento", ""),
        responsables_operacion_estado=data.procesos.get(
            "responsablesOperacion", {}
        ).get("estado", ""),
        responsables_operacion_responsable=data.procesos.get(
            "responsablesOperacion", {}
        ).get("responsable", ""),
        responsables_operacion_notas=data.procesos.get("responsablesOperacion", {}).get(
            "notas", ""
        ),
        listado_reportes_seguimiento=data.procesos.get("listadoReportes", {}).get(
            "seguimiento", ""
        ),
        listado_reportes_estado=data.procesos.get("listadoReportes", {}).get(
            "estado", ""
        ),
        listado_reportes_responsable=data.procesos.get("listadoReportes", {}).get(
            "responsable", ""
        ),
        listado_reportes_notas=data.procesos.get("listadoReportes", {}).get(
            "notas", ""
        ),
        protocolo_comunicaciones_seguimiento=data.procesos.get(
            "protocoloComunicaciones", {}
        ).get("seguimiento", ""),
        protocolo_comunicaciones_estado=data.procesos.get(
            "protocoloComunicaciones", {}
        ).get("estado", ""),
        protocolo_comunicaciones_responsable=data.procesos.get(
            "protocoloComunicaciones", {}
        ).get("responsable", ""),
        protocolo_comunicaciones_notas=data.procesos.get(
            "protocoloComunicaciones", {}
        ).get("notas", ""),
        informacion_diaria_seguimiento=data.procesos.get("informacionDiaria", {}).get(
            "seguimiento", ""
        ),
        informacion_diaria_estado=data.procesos.get("informacionDiaria", {}).get(
            "estado", ""
        ),
        informacion_diaria_responsable=data.procesos.get("informacionDiaria", {}).get(
            "responsable", ""
        ),
        informacion_diaria_notas=data.procesos.get("informacionDiaria", {}).get(
            "notas", ""
        ),
        seguimiento_periodico_seguimiento=data.procesos.get(
            "seguimientoPeriodico", {}
        ).get("seguimiento", ""),
        seguimiento_periodico_estado=data.procesos.get("seguimientoPeriodico", {}).get(
            "estado", ""
        ),
        seguimiento_periodico_responsable=data.procesos.get(
            "seguimientoPeriodico", {}
        ).get("responsable", ""),
        seguimiento_periodico_notas=data.procesos.get("seguimientoPeriodico", {}).get(
            "notas", ""
        ),
        guiones_protocolos_seguimiento=data.procesos.get("guionesProtocolos", {}).get(
            "seguimiento", ""
        ),
        guiones_protocolos_estado=data.procesos.get("guionesProtocolos", {}).get(
            "estado", ""
        ),
        guiones_protocolos_responsable=data.procesos.get("guionesProtocolos", {}).get(
            "responsable", ""
        ),
        guiones_protocolos_notas=data.procesos.get("guionesProtocolos", {}).get(
            "notas", ""
        ),
        proceso_monitoreo_seguimiento=data.procesos.get("procesoMonitoreo", {}).get(
            "seguimiento", ""
        ),
        # ...agrega los demás campos de procesos aquí...
    )
    db.add(procesos)
    # 5. Crear tecnología
    tecnologia = ProjectImplementacionTecnologia(
        cliente_implementacion_id=nueva.id,
        creacion_modulo_seguimiento=data.tecnologia.get("creacionModulo", {}).get(
            "seguimiento", ""
        ),
        creacion_modulo_estado=data.tecnologia.get("creacionModulo", {}).get(
            "estado", ""
        ),
        creacion_modulo_responsable=data.tecnologia.get("creacionModulo", {}).get(
            "responsable", ""
        ),
        creacion_modulo_notas=data.tecnologia.get("creacionModulo", {}).get(
            "notas", ""
        ),
        tipificacion_interacciones_seguimiento=data.tecnologia.get(
            "tipificacionInteracciones", {}
        ).get("seguimiento", ""),
        tipificacion_interacciones_estado=data.tecnologia.get(
            "tipificacionInteracciones", {}
        ).get("estado", ""),
        tipificacion_interacciones_responsable=data.tecnologia.get(
            "tipificacionInteracciones", {}
        ).get("responsable", ""),
        tipificacion_interacciones_notas=data.tecnologia.get(
            "tipificacionInteracciones", {}
        ).get("notas", ""),
        aplicativos_proceso_seguimiento=data.tecnologia.get(
            "aplicativosProceso", {}
        ).get("seguimiento", ""),
        aplicativos_proceso_estado=data.tecnologia.get("aplicativosProceso", {}).get(
            "estado", ""
        ),
        aplicativos_proceso_responsable=data.tecnologia.get(
            "aplicativosProceso", {}
        ).get("responsable", ""),
        aplicativos_proceso_notas=data.tecnologia.get("aplicativosProceso", {}).get(
            "notas", ""
        ),
        whatsapp_seguimiento=data.tecnologia.get("whatsapp", {}).get("seguimiento", ""),
        whatsapp_estado=data.tecnologia.get("whatsapp", {}).get("estado", ""),
        whatsapp_responsable=data.tecnologia.get("whatsapp", {}).get("responsable", ""),
        whatsapp_notas=data.tecnologia.get("whatsapp", {}).get("notas", ""),
        correos_electronicos_seguimiento=data.tecnologia.get(
            "correosElectronicos", {}
        ).get("seguimiento", ""),
        correos_electronicos_estado=data.tecnologia.get("correosElectronicos", {}).get(
            "estado", ""
        ),
        correos_electronicos_responsable=data.tecnologia.get(
            "correosElectronicos", {}
        ).get("responsable", ""),
        correos_electronicos_notas=data.tecnologia.get("correosElectronicos", {}).get(
            "notas", ""
        ),
        requisitos_grabacion_seguimiento=data.tecnologia.get(
            "requisitosGrabacion", {}
        ).get("seguimiento", ""),
        requisitos_grabacion_estado=data.tecnologia.get("requisitosGrabacion", {}).get(
            "estado", ""
        ),
        requisitos_grabacion_responsable=data.tecnologia.get(
            "requisitosGrabacion", {}
        ).get("responsable", ""),
        requisitos_grabacion_notas=data.tecnologia.get("requisitosGrabacion", {}).get(
            "notas", ""
        ),
    )
    db.add(tecnologia)
    db.commit()

    # 6. Guardar subsecciones personalizadas (en tablas específicas)
    guardar_subsecciones_contractual(db, nueva.id, data.contractual)
    guardar_subsecciones_talento_humano(db, nueva.id, data.talento_humano)
    guardar_subsecciones_procesos(db, nueva.id, data.procesos)
    guardar_subsecciones_tecnologia(db, nueva.id, data.tecnologia)

    # 7. Retornar toda la info
    return {
        "id": nueva.id,
        "cliente": nueva.cliente,
        "proceso": nueva.proceso,
        "estado": nueva.estado,
        "contractual": data.contractual,
        "talento_humano": data.talento_humano,
        "procesos": data.procesos,
        "tecnologia": data.tecnologia,
    }


@router.get("/basic", response_model=List[ImplementacionBasic])
def listar_implementaciones_basico(db: Session = Depends(get_db)):
    """Endpoint básico que devuelve solo los datos esenciales de implementaciones"""
    return db.query(ProjectImplementacionesClienteImple).all()


@router.put("/{id}/estado", response_model=ImplementacionBasic)
def actualizar_estado_implementacion(
    id: int, data: EstadoUpdate, db: Session = Depends(get_db)
):
    """Endpoint para actualizar solo el estado de una implementación"""
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")

    imp.estado = data.estado
    db.commit()
    db.refresh(imp)

    return ImplementacionBasic(
        id=imp.id, cliente=imp.cliente, proceso=imp.proceso, estado=imp.estado
    )


@router.get("/{id}", response_model=ImplementacionOut)
def obtener_implementacion(id: int, db: Session = Depends(get_db)):
    """Endpoint para obtener una implementación específica con todos sus detalles"""
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")

    # Obtener datos de tablas relacionadas
    contractual_data = (
        db.query(ProjectImplementacionContractual)
        .filter_by(cliente_implementacion_id=id)
        .first()
    )
    talento_data = (
        db.query(ProjectImplementacionTalentoHumano)
        .filter_by(cliente_implementacion_id=id)
        .first()
    )
    procesos_data = (
        db.query(ProjectImplementacionProcesos)
        .filter_by(cliente_implementacion_id=id)
        .first()
    )
    tecnologia_data = (
        db.query(ProjectImplementacionTecnologia)
        .filter_by(cliente_implementacion_id=id)
        .first()
    )

    # Construir objeto contractual
    contractual = {}
    if contractual_data:
        contractual = {
            "modeloContrato": {
                "seguimiento": contractual_data.modelo_contrato_seguimiento or "",
                "estado": contractual_data.modelo_contrato_estado or "",
                "responsable": contractual_data.modelo_contrato_responsable or "",
                "notas": contractual_data.modelo_contrato_notas or "",
            },
            "modeloConfidencialidad": {
                "seguimiento": contractual_data.modelo_confidencialidad_seguimiento
                or "",
                "estado": contractual_data.modelo_confidencialidad_estado or "",
                "responsable": contractual_data.modelo_confidencialidad_responsable
                or "",
                "notas": contractual_data.modelo_confidencialidad_notas or "",
            },
            "alcance": {
                "seguimiento": contractual_data.alcance_seguimiento or "",
                "estado": contractual_data.alcance_estado or "",
                "responsable": contractual_data.alcance_responsable or "",
                "notas": contractual_data.alcance_notas or "",
            },
            "fechaInicio": {
                "seguimiento": contractual_data.fecha_inicio_seguimiento or "",
                "estado": contractual_data.fecha_inicio_estado or "",
                "responsable": contractual_data.fecha_inicio_responsable or "",
                "notas": contractual_data.fecha_inicio_notas or "",
            },
        }

    # Construir objeto talento_humano
    talento_humano = {}
    if talento_data:
        talento_humano = {
            "perfilPersonal": {
                "seguimiento": talento_data.perfil_personal_seguimiento or "",
                "estado": talento_data.perfil_personal_estado or "",
                "responsable": talento_data.perfil_personal_responsable or "",
                "notas": talento_data.perfil_personal_notas or "",
            },
            "cantidadAsesores": {
                "seguimiento": talento_data.cantidad_asesores_seguimiento or "",
                "estado": talento_data.cantidad_asesores_estado or "",
                "responsable": talento_data.cantidad_asesores_responsable or "",
                "notas": talento_data.cantidad_asesores_notas or "",
            },
            "horarios": {
                "seguimiento": talento_data.horarios_seguimiento or "",
                "estado": talento_data.horarios_estado or "",
                "responsable": talento_data.horarios_responsable or "",
                "notas": talento_data.horarios_notas or "",
            },
            "formador": {
                "seguimiento": talento_data.formador_seguimiento or "",
                "estado": talento_data.formador_estado or "",
                "responsable": talento_data.formador_responsable or "",
                "notas": talento_data.formador_notas or "",
            },
            "capacitacionesAndes": {
                "seguimiento": talento_data.capacitaciones_andes_seguimiento or "",
                "estado": talento_data.capacitaciones_andes_estado or "",
                "responsable": talento_data.capacitaciones_andes_responsable or "",
                "notas": talento_data.capacitaciones_andes_notas or "",
            },
            "capacitacionesCliente": {
                "seguimiento": talento_data.capacitaciones_cliente_seguimiento or "",
                "estado": talento_data.capacitaciones_cliente_estado or "",
                "responsable": talento_data.capacitaciones_cliente_responsable or "",
                "notas": talento_data.capacitaciones_cliente_notas or "",
            },
        }

    # Construir objeto procesos
    procesos = {}
    if procesos_data:
        procesos = {
            "responsableCliente": {
                "seguimiento": procesos_data.responsable_cliente_seguimiento or "",
                "estado": procesos_data.responsable_cliente_estado or "",
                "responsable": procesos_data.responsable_cliente_responsable or "",
                "notas": procesos_data.responsable_cliente_notas or "",
            },
            "responsableAndes": {
                "seguimiento": procesos_data.responsable_andes_seguimiento or "",
                "estado": procesos_data.responsable_andes_estado or "",
                "responsable": procesos_data.responsable_andes_responsable or "",
                "notas": procesos_data.responsable_andes_notas or "",
            },
            "responsablesOperacion": {
                "seguimiento": procesos_data.responsables_operacion_seguimiento or "",
                "estado": procesos_data.responsables_operacion_estado or "",
                "responsable": procesos_data.responsables_operacion_responsable or "",
                "notas": procesos_data.responsables_operacion_notas or "",
            },
            "listadoReportes": {
                "seguimiento": procesos_data.listado_reportes_seguimiento or "",
                "estado": procesos_data.listado_reportes_estado or "",
                "responsable": procesos_data.listado_reportes_responsable or "",
                "notas": procesos_data.listado_reportes_notas or "",
            },
            "protocoloComunicaciones": {
                "seguimiento": procesos_data.protocolo_comunicaciones_seguimiento or "",
                "estado": procesos_data.protocolo_comunicaciones_estado or "",
                "responsable": procesos_data.protocolo_comunicaciones_responsable or "",
                "notas": procesos_data.protocolo_comunicaciones_notas or "",
            },
            "guionesProtocolos": {
                "seguimiento": procesos_data.guiones_protocolos_seguimiento or "",
                "estado": procesos_data.guiones_protocolos_estado or "",
                "responsable": procesos_data.guiones_protocolos_responsable or "",
                "notas": procesos_data.guiones_protocolos_notas or "",
            },
            "procesoMonitoreo": {
                "seguimiento": procesos_data.proceso_monitoreo_seguimiento or "",
                "estado": procesos_data.proceso_monitoreo_estado or "",
                "responsable": procesos_data.proceso_monitoreo_responsable or "",
                "notas": procesos_data.proceso_monitoreo_notas or "",
            },
            "cronogramaTecnologia": {
                "seguimiento": procesos_data.cronograma_tecnologia_seguimiento or "",
                "estado": procesos_data.cronograma_tecnologia_estado or "",
                "responsable": procesos_data.cronograma_tecnologia_responsable or "",
                "notas": procesos_data.cronograma_tecnologia_notas or "",
            },
            "cronogramaCapacitaciones": {
                "seguimiento": procesos_data.cronograma_capacitaciones_seguimiento
                or "",
                "estado": procesos_data.cronograma_capacitaciones_estado or "",
                "responsable": procesos_data.cronograma_capacitaciones_responsable
                or "",
                "notas": procesos_data.cronograma_capacitaciones_notas or "",
            },
            "realizacionPruebas": {
                "seguimiento": procesos_data.realizacion_pruebas_seguimiento or "",
                "estado": procesos_data.realizacion_pruebas_estado or "",
                "responsable": procesos_data.realizacion_pruebas_responsable or "",
                "notas": procesos_data.realizacion_pruebas_notas or "",
            },
        }

    # Construir objeto tecnologia
    tecnologia = {}
    if tecnologia_data:
        tecnologia = {
            "creacionModulo": {
                "seguimiento": tecnologia_data.creacion_modulo_seguimiento or "",
                "estado": tecnologia_data.creacion_modulo_estado or "",
                "responsable": tecnologia_data.creacion_modulo_responsable or "",
                "notas": tecnologia_data.creacion_modulo_notas or "",
            },
            "tipificacionInteracciones": {
                "seguimiento": tecnologia_data.tipificacion_interacciones_seguimiento
                or "",
                "estado": tecnologia_data.tipificacion_interacciones_estado or "",
                "responsable": tecnologia_data.tipificacion_interacciones_responsable
                or "",
                "notas": tecnologia_data.tipificacion_interacciones_notas or "",
            },
            "aplicativosProceso": {
                "seguimiento": tecnologia_data.aplicativos_proceso_seguimiento or "",
                "estado": tecnologia_data.aplicativos_proceso_estado or "",
                "responsable": tecnologia_data.aplicativos_proceso_responsable or "",
                "notas": tecnologia_data.aplicativos_proceso_notas or "",
            },
            "whatsapp": {
                "seguimiento": tecnologia_data.whatsapp_seguimiento or "",
                "estado": tecnologia_data.whatsapp_estado or "",
                "responsable": tecnologia_data.whatsapp_responsable or "",
                "notas": tecnologia_data.whatsapp_notas or "",
            },
            "correosElectronicos": {
                "seguimiento": tecnologia_data.correos_electronicos_seguimiento or "",
                "estado": tecnologia_data.correos_electronicos_estado or "",
                "responsable": tecnologia_data.correos_electronicos_responsable or "",
                "notas": tecnologia_data.correos_electronicos_notas or "",
            },
            "requisitosGrabacion": {
                "seguimiento": tecnologia_data.requisitos_grabacion_seguimiento or "",
                "estado": tecnologia_data.requisitos_grabacion_estado or "",
                "responsable": tecnologia_data.requisitos_grabacion_responsable or "",
                "notas": tecnologia_data.requisitos_grabacion_notas or "",
            },
        }

    # Agregar subsecciones personalizadas (desde tablas específicas)
    contractual.update(obtener_subsecciones_contractual(db, id))
    talento_humano.update(obtener_subsecciones_talento_humano(db, id))
    procesos.update(obtener_subsecciones_procesos(db, id))
    tecnologia.update(obtener_subsecciones_tecnologia(db, id))

    return ImplementacionOut(
        id=imp.id,
        cliente=imp.cliente,
        proceso=imp.proceso,
        estado=imp.estado,
        contractual=contractual,
        talento_humano=talento_humano,
        procesos=procesos,
        tecnologia=tecnologia,
    )


@router.get("/", response_model=List[ImplementacionOut])
def listar_implementaciones(db: Session = Depends(get_db)):
    return db.query(ProjectImplementacionesClienteImple).all()


@router.put("/{id}")
def actualizar_implementacion(
    id: int, data: ImplementacionCreate, db: Session = Depends(get_db)
):
    # Buscar la implementación existente
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")

    # Log para debug
    print(f"\n=== ACTUALIZANDO IMPLEMENTACIÓN ID: {id} ===")
    print(f"Cliente: {data.cliente}")
    print(f"Estado: {data.estado}")
    print(f"Proceso: {data.proceso}")
    print(
        f"Contractual keys: {list(data.contractual.keys()) if data.contractual else 'None'}"
    )
    print(
        f"Talento Humano keys: {list(data.talento_humano.keys()) if data.talento_humano else 'None'}"
    )

    try:
        # Actualizar campos básicos de la implementación
        imp.cliente = data.cliente
        imp.proceso = data.proceso
        imp.estado = data.estado

        # También actualizar los campos JSON como respaldo
        imp.contractual = data.contractual
        imp.talento_humano = data.talento_humano
        imp.procesos = data.procesos
        imp.tecnologia = data.tecnologia

        print("Campos básicos actualizados en la tabla principal")

        # Actualizar o crear registro contractual
        contractual_record = (
            db.query(ProjectImplementacionContractual)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if not contractual_record:
            contractual_record = ProjectImplementacionContractual(
                cliente_implementacion_id=id
            )
            db.add(contractual_record)
            print("Creado nuevo registro contractual")
        else:
            print("Actualizando registro contractual existente")

        # Actualizar campos contractuales (TODOS)
        contractual_data = data.contractual
        if contractual_data:
            if "modeloContrato" in contractual_data:
                modelo_contrato = contractual_data["modeloContrato"]
                contractual_record.modelo_contrato_seguimiento = modelo_contrato.get(
                    "seguimiento", ""
                )
                contractual_record.modelo_contrato_estado = modelo_contrato.get(
                    "estado", ""
                )
                contractual_record.modelo_contrato_responsable = modelo_contrato.get(
                    "responsable", ""
                )
                contractual_record.modelo_contrato_notas = modelo_contrato.get(
                    "notas", ""
                )
                print(
                    f"Actualizado modelo contrato: seguimiento='{modelo_contrato.get('seguimiento', '')}'"
                )

            if "modeloConfidencialidad" in contractual_data:
                modelo_conf = contractual_data["modeloConfidencialidad"]
                contractual_record.modelo_confidencialidad_seguimiento = (
                    modelo_conf.get("seguimiento", "")
                )
                contractual_record.modelo_confidencialidad_estado = modelo_conf.get(
                    "estado", ""
                )
                contractual_record.modelo_confidencialidad_responsable = (
                    modelo_conf.get("responsable", "")
                )
                contractual_record.modelo_confidencialidad_notas = modelo_conf.get(
                    "notas", ""
                )
                print(
                    f"Actualizado modelo confidencialidad: seguimiento='{modelo_conf.get('seguimiento', '')}'"
                )

            if "alcance" in contractual_data:
                alcance = contractual_data["alcance"]
                contractual_record.alcance_seguimiento = alcance.get("seguimiento", "")
                contractual_record.alcance_estado = alcance.get("estado", "")
                contractual_record.alcance_responsable = alcance.get("responsable", "")
                contractual_record.alcance_notas = alcance.get("notas", "")
                print(
                    f"Actualizado alcance: seguimiento='{alcance.get('seguimiento', '')}'"
                )

            if "fechaInicio" in contractual_data:
                fecha_inicio = contractual_data["fechaInicio"]
                contractual_record.fecha_inicio_seguimiento = fecha_inicio.get(
                    "seguimiento", ""
                )
                contractual_record.fecha_inicio_estado = fecha_inicio.get("estado", "")
                contractual_record.fecha_inicio_responsable = fecha_inicio.get(
                    "responsable", ""
                )
                contractual_record.fecha_inicio_notas = fecha_inicio.get("notas", "")
                print(
                    f"Actualizado fecha inicio: seguimiento='{fecha_inicio.get('seguimiento', '')}'"
                )

        # Actualizar o crear registro talento humano
        talento_record = (
            db.query(ProjectImplementacionTalentoHumano)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if not talento_record:
            talento_record = ProjectImplementacionTalentoHumano(
                cliente_implementacion_id=id
            )
            db.add(talento_record)
            print("Creado nuevo registro talento humano")
        else:
            print("Actualizando registro talento humano existente")

        # Actualizar campos talento humano (TODOS)
        talento_data = data.talento_humano
        if talento_data:
            if "perfilPersonal" in talento_data:
                perfil = talento_data["perfilPersonal"]
                talento_record.perfil_personal_seguimiento = perfil.get(
                    "seguimiento", ""
                )
                talento_record.perfil_personal_estado = perfil.get("estado", "")
                talento_record.perfil_personal_responsable = perfil.get(
                    "responsable", ""
                )
                talento_record.perfil_personal_notas = perfil.get("notas", "")
                print(
                    f"Actualizado perfil personal: seguimiento='{perfil.get('seguimiento', '')}'"
                )

            if "cantidadAsesores" in talento_data:
                cantidad = talento_data["cantidadAsesores"]
                talento_record.cantidad_asesores_seguimiento = cantidad.get(
                    "seguimiento", ""
                )
                talento_record.cantidad_asesores_estado = cantidad.get("estado", "")
                talento_record.cantidad_asesores_responsable = cantidad.get(
                    "responsable", ""
                )
                talento_record.cantidad_asesores_notas = cantidad.get("notas", "")
                print(
                    f"Actualizado cantidad asesores: seguimiento='{cantidad.get('seguimiento', '')}'"
                )

            if "horarios" in talento_data:
                horarios = talento_data["horarios"]
                talento_record.horarios_seguimiento = horarios.get("seguimiento", "")
                talento_record.horarios_estado = horarios.get("estado", "")
                talento_record.horarios_responsable = horarios.get("responsable", "")
                talento_record.horarios_notas = horarios.get("notas", "")
                print(
                    f"Actualizado horarios: seguimiento='{horarios.get('seguimiento', '')}'"
                )

            if "formador" in talento_data:
                formador = talento_data["formador"]
                talento_record.formador_seguimiento = formador.get("seguimiento", "")
                talento_record.formador_estado = formador.get("estado", "")
                talento_record.formador_responsable = formador.get("responsable", "")
                talento_record.formador_notas = formador.get("notas", "")
                print(
                    f"Actualizado formador: seguimiento='{formador.get('seguimiento', '')}'"
                )

            if "capacitacionesAndes" in talento_data:
                cap_andes = talento_data["capacitacionesAndes"]
                talento_record.capacitaciones_andes_seguimiento = cap_andes.get(
                    "seguimiento", ""
                )
                talento_record.capacitaciones_andes_estado = cap_andes.get("estado", "")
                talento_record.capacitaciones_andes_responsable = cap_andes.get(
                    "responsable", ""
                )
                talento_record.capacitaciones_andes_notas = cap_andes.get("notas", "")
                print(
                    f"Actualizado capacitaciones andes: seguimiento='{cap_andes.get('seguimiento', '')}'"
                )

            if "capacitacionesCliente" in talento_data:
                cap_cliente = talento_data["capacitacionesCliente"]
                talento_record.capacitaciones_cliente_seguimiento = cap_cliente.get(
                    "seguimiento", ""
                )
                talento_record.capacitaciones_cliente_estado = cap_cliente.get(
                    "estado", ""
                )
                talento_record.capacitaciones_cliente_responsable = cap_cliente.get(
                    "responsable", ""
                )
                talento_record.capacitaciones_cliente_notas = cap_cliente.get(
                    "notas", ""
                )
                print(
                    f"Actualizado capacitaciones cliente: seguimiento='{cap_cliente.get('seguimiento', '')}'"
                )

        # Actualizar o crear registro procesos
        procesos_record = (
            db.query(ProjectImplementacionProcesos)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if not procesos_record:
            procesos_record = ProjectImplementacionProcesos(
                cliente_implementacion_id=id
            )
            db.add(procesos_record)
            print("Creado nuevo registro procesos")
        else:
            print("Actualizando registro procesos existente")

        # Actualizar campos procesos (TODOS)
        procesos_data = data.procesos
        if procesos_data:
            if "responsableCliente" in procesos_data:
                resp_cliente = procesos_data["responsableCliente"]
                procesos_record.responsable_cliente_seguimiento = resp_cliente.get(
                    "seguimiento", ""
                )
                procesos_record.responsable_cliente_estado = resp_cliente.get(
                    "estado", ""
                )
                procesos_record.responsable_cliente_responsable = resp_cliente.get(
                    "responsable", ""
                )
                procesos_record.responsable_cliente_notas = resp_cliente.get(
                    "notas", ""
                )
                print(
                    f"Actualizado responsable cliente: seguimiento='{resp_cliente.get('seguimiento', '')}'"
                )

            if "responsableAndes" in procesos_data:
                resp_andes = procesos_data["responsableAndes"]
                procesos_record.responsable_andes_seguimiento = resp_andes.get(
                    "seguimiento", ""
                )
                procesos_record.responsable_andes_estado = resp_andes.get("estado", "")
                procesos_record.responsable_andes_responsable = resp_andes.get(
                    "responsable", ""
                )
                procesos_record.responsable_andes_notas = resp_andes.get("notas", "")
                print(
                    f"Actualizado responsable andes: seguimiento='{resp_andes.get('seguimiento', '')}'"
                )

            if "horarioTrabajo" in procesos_data:
                horario = procesos_data["horarioTrabajo"]
                procesos_record.horario_trabajo_seguimiento = horario.get(
                    "seguimiento", ""
                )
                procesos_record.horario_trabajo_estado = horario.get("estado", "")
                procesos_record.horario_trabajo_responsable = horario.get(
                    "responsable", ""
                )
                procesos_record.horario_trabajo_notas = horario.get("notas", "")
                print(
                    f"Actualizado horario trabajo: seguimiento='{horario.get('seguimiento', '')}'"
                )

            if "capacitacionOperativa" in procesos_data:
                cap_operativa = procesos_data["capacitacionOperativa"]
                procesos_record.capacitacion_operativa_seguimiento = cap_operativa.get(
                    "seguimiento", ""
                )
                procesos_record.capacitacion_operativa_estado = cap_operativa.get(
                    "estado", ""
                )
                procesos_record.capacitacion_operativa_responsable = cap_operativa.get(
                    "responsable", ""
                )
                procesos_record.capacitacion_operativa_notas = cap_operativa.get(
                    "notas", ""
                )
                print(
                    f"Actualizado capacitacion operativa: seguimiento='{cap_operativa.get('seguimiento', '')}'"
                )

            if "procedimientos" in procesos_data:
                procedimientos = procesos_data["procedimientos"]
                procesos_record.procedimientos_seguimiento = procedimientos.get(
                    "seguimiento", ""
                )
                procesos_record.procedimientos_estado = procedimientos.get("estado", "")
                procesos_record.procedimientos_responsable = procedimientos.get(
                    "responsable", ""
                )
                procesos_record.procedimientos_notas = procedimientos.get("notas", "")
                print(
                    f"Actualizado procedimientos: seguimiento='{procedimientos.get('seguimiento', '')}'"
                )

            if "registrosControl" in procesos_data:
                registros = procesos_data["registrosControl"]
                procesos_record.registros_control_seguimiento = registros.get(
                    "seguimiento", ""
                )
                procesos_record.registros_control_estado = registros.get("estado", "")
                procesos_record.registros_control_responsable = registros.get(
                    "responsable", ""
                )
                procesos_record.registros_control_notas = registros.get("notas", "")
                print(
                    f"Actualizado registros control: seguimiento='{registros.get('seguimiento', '')}'"
                )

            if "calendarioTrabajo" in procesos_data:
                calendario = procesos_data["calendarioTrabajo"]
                procesos_record.calendario_trabajo_seguimiento = calendario.get(
                    "seguimiento", ""
                )
                procesos_record.calendario_trabajo_estado = calendario.get("estado", "")
                procesos_record.calendario_trabajo_responsable = calendario.get(
                    "responsable", ""
                )
                procesos_record.calendario_trabajo_notas = calendario.get("notas", "")
                print(
                    f"Actualizado calendario trabajo: seguimiento='{calendario.get('seguimiento', '')}'"
                )

            if "actualizacionBases" in procesos_data:
                bases = procesos_data["actualizacionBases"]
                procesos_record.actualizacion_bases_seguimiento = bases.get(
                    "seguimiento", ""
                )
                procesos_record.actualizacion_bases_estado = bases.get("estado", "")
                procesos_record.actualizacion_bases_responsable = bases.get(
                    "responsable", ""
                )
                procesos_record.actualizacion_bases_notas = bases.get("notas", "")
                print(
                    f"Actualizado actualizacion bases: seguimiento='{bases.get('seguimiento', '')}'"
                )

            if "backupBasesRestore" in procesos_data:
                backup = procesos_data["backupBasesRestore"]
                procesos_record.backup_bases_restore_seguimiento = backup.get(
                    "seguimiento", ""
                )
                procesos_record.backup_bases_restore_estado = backup.get("estado", "")
                procesos_record.backup_bases_restore_responsable = backup.get(
                    "responsable", ""
                )
                procesos_record.backup_bases_restore_notas = backup.get("notas", "")
                print(
                    f"Actualizado backup bases restore: seguimiento='{backup.get('seguimiento', '')}'"
                )

            if "atencionObjeciones" in procesos_data:
                objeciones = procesos_data["atencionObjeciones"]
                procesos_record.atencion_objeciones_seguimiento = objeciones.get(
                    "seguimiento", ""
                )
                procesos_record.atencion_objeciones_estado = objeciones.get(
                    "estado", ""
                )
                procesos_record.atencion_objeciones_responsable = objeciones.get(
                    "responsable", ""
                )
                procesos_record.atencion_objeciones_notas = objeciones.get("notas", "")
                print(
                    f"Actualizado atencion objeciones: seguimiento='{objeciones.get('seguimiento', '')}'"
                )
        else:
            print("⚠️ No hay datos de procesos para actualizar")

        # Actualizar o crear registro tecnología
        tecnologia_record = (
            db.query(ProjectImplementacionTecnologia)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if not tecnologia_record:
            tecnologia_record = ProjectImplementacionTecnologia(
                cliente_implementacion_id=id
            )
            db.add(tecnologia_record)
            print("Creado nuevo registro tecnología")
        else:
            print("Actualizando registro tecnología existente")

        # Actualizar campos tecnología
        tecnologia_data = data.tecnologia
        print(
            f"Datos tecnología recibidos: {list(tecnologia_data.keys()) if tecnologia_data else 'None'}"
        )

        if tecnologia_data:
            if "requisitosGrabacion" in tecnologia_data:
                requisitos = tecnologia_data["requisitosGrabacion"]
                tecnologia_record.requisitos_grabacion_seguimiento = requisitos.get(
                    "seguimiento", ""
                )
                tecnologia_record.requisitos_grabacion_estado = requisitos.get(
                    "estado", ""
                )
                tecnologia_record.requisitos_grabacion_responsable = requisitos.get(
                    "responsable", ""
                )
                tecnologia_record.requisitos_grabacion_notas = requisitos.get(
                    "notas", ""
                )
                print(
                    f"🎯 ACTUALIZADO requisitos grabacion: seguimiento='{requisitos.get('seguimiento', '')}' estado='{requisitos.get('estado', '')}' responsable='{requisitos.get('responsable', '')}'"
                )

            if "creacionModulo" in tecnologia_data:
                creacion = tecnologia_data["creacionModulo"]
                tecnologia_record.creacion_modulo_seguimiento = creacion.get(
                    "seguimiento", ""
                )
                tecnologia_record.creacion_modulo_estado = creacion.get("estado", "")
                tecnologia_record.creacion_modulo_responsable = creacion.get(
                    "responsable", ""
                )
                tecnologia_record.creacion_modulo_notas = creacion.get("notas", "")
                print(
                    f"Actualizado creacion modulo: seguimiento='{creacion.get('seguimiento', '')}'"
                )

            if "tipificacionInteracciones" in tecnologia_data:
                tipificacion = tecnologia_data["tipificacionInteracciones"]
                tecnologia_record.tipificacion_interacciones_seguimiento = (
                    tipificacion.get("seguimiento", "")
                )
                tecnologia_record.tipificacion_interacciones_estado = tipificacion.get(
                    "estado", ""
                )
                tecnologia_record.tipificacion_interacciones_responsable = (
                    tipificacion.get("responsable", "")
                )
                tecnologia_record.tipificacion_interacciones_notas = tipificacion.get(
                    "notas", ""
                )
                print(
                    f"Actualizado tipificacion interacciones: seguimiento='{tipificacion.get('seguimiento', '')}'"
                )

            if "aplicativosProceso" in tecnologia_data:
                aplicativos = tecnologia_data["aplicativosProceso"]
                tecnologia_record.aplicativos_proceso_seguimiento = aplicativos.get(
                    "seguimiento", ""
                )
                tecnologia_record.aplicativos_proceso_estado = aplicativos.get(
                    "estado", ""
                )
                tecnologia_record.aplicativos_proceso_responsable = aplicativos.get(
                    "responsable", ""
                )
                tecnologia_record.aplicativos_proceso_notas = aplicativos.get(
                    "notas", ""
                )
                print(
                    f"Actualizado aplicativos proceso: seguimiento='{aplicativos.get('seguimiento', '')}'"
                )

            if "whatsapp" in tecnologia_data:
                whatsapp = tecnologia_data["whatsapp"]
                tecnologia_record.whatsapp_seguimiento = whatsapp.get("seguimiento", "")
                tecnologia_record.whatsapp_estado = whatsapp.get("estado", "")
                tecnologia_record.whatsapp_responsable = whatsapp.get("responsable", "")
                tecnologia_record.whatsapp_notas = whatsapp.get("notas", "")
                print(
                    f"Actualizado whatsapp: seguimiento='{whatsapp.get('seguimiento', '')}'"
                )

            if "correosElectronicos" in tecnologia_data:
                correos = tecnologia_data["correosElectronicos"]
                tecnologia_record.correos_electronicos_seguimiento = correos.get(
                    "seguimiento", ""
                )
                tecnologia_record.correos_electronicos_estado = correos.get(
                    "estado", ""
                )
                tecnologia_record.correos_electronicos_responsable = correos.get(
                    "responsable", ""
                )
                tecnologia_record.correos_electronicos_notas = correos.get("notas", "")
                print(
                    f"Actualizado correos electronicos: seguimiento='{correos.get('seguimiento', '')}'"
                )
        else:
            print("⚠️ No hay datos de tecnología para actualizar")

        # Actualizar subsecciones personalizadas (Contractual, Talento Humano, Procesos y Tecnología)
        # Primero eliminar las existentes para esta implementación
        db.query(ProjectImplementacionSubseccionPersonalizada).filter_by(
            cliente_implementacion_id=id, seccion="contractual"
        ).delete()
        db.query(ProjectSubseccionImplementacionTalentoHumano).filter_by(
            cliente_implementacion_id=id
        ).delete()
        db.query(ProjectSubseccionImplementacionProcesos).filter_by(
            cliente_implementacion_id=id
        ).delete()
        db.query(ProjectSubseccionImplementacionTecnologia).filter_by(
            cliente_implementacion_id=id
        ).delete()

        # Luego guardar las nuevas subsecciones personalizadas
        guardar_subsecciones_contractual(db, id, data.contractual)
        guardar_subsecciones_talento_humano(db, id, data.talento_humano)
        guardar_subsecciones_procesos(db, id, data.procesos)
        guardar_subsecciones_tecnologia(db, id, data.tecnologia)
        print(
            "Subsecciones personalizadas actualizadas (Contractual, Talento Humano, Procesos, Tecnología)"
        )

        # Commit de la transacción
        db.commit()
        db.refresh(imp)
        print(f"✅ Implementación actualizada exitosamente: {imp.id}")

        # Devolver respuesta simple
        return {
            "message": "Implementación actualizada exitosamente",
            "id": imp.id,
            "cliente": imp.cliente,
            "estado": imp.estado,
            "proceso": imp.proceso,
        }

    except Exception as e:
        db.rollback()
        print(f"❌ Error al actualizar implementación: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Error al actualizar implementación: {str(e)}"
        )


@router.delete("/{id}")
def eliminar_implementacion(id: int, db: Session = Depends(get_db)):
    try:
        # Verificar que la implementación existe
        imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
        if not imp:
            raise HTTPException(status_code=404, detail="Implementación no encontrada")

        print(
            f"🗑️ Iniciando eliminación de implementación ID: {id}, Cliente: {imp.cliente}"
        )

        # Eliminar registros relacionados primero
        contractual_record = (
            db.query(ProjectImplementacionContractual)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if contractual_record:
            db.delete(contractual_record)
            print(f"✅ Eliminado registro contractual")

        talento_record = (
            db.query(ProjectImplementacionTalentoHumano)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if talento_record:
            db.delete(talento_record)
            print(f"✅ Eliminado registro talento humano")

        procesos_record = (
            db.query(ProjectImplementacionProcesos)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if procesos_record:
            db.delete(procesos_record)
            print(f"✅ Eliminado registro procesos")

        tecnologia_record = (
            db.query(ProjectImplementacionTecnologia)
            .filter_by(cliente_implementacion_id=id)
            .first()
        )
        if tecnologia_record:
            db.delete(tecnologia_record)
            print(f"✅ Eliminado registro tecnología")

        # Finalmente eliminar el registro principal
        db.delete(imp)

        # Commit de todas las eliminaciones
        db.commit()

        print(f"🎉 Implementación {id} eliminada completamente")
        return {"message": f"Implementación '{imp.cliente}' eliminada exitosamente"}

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error al eliminar implementación {id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/descargar_excel")
def descargar_excel(db: Session = Depends(get_db)):
    """
    Genera un Excel con todas las implementaciones incluyendo campos predefinidos y personalizados
    de las 4 secciones (Contractual, Talento Humano, Procesos, Tecnología)
    """
    try:
        # Obtener todas las implementaciones
        implementaciones = db.query(ProjectImplementacionesClienteImple).all()

        # Lista para almacenar los datos procesados
        datos_excel = []

        for impl in implementaciones:
            # Datos básicos
            fila = {
                "ID": impl.id,
                "Cliente": impl.cliente,
                "Proceso": impl.proceso,
                "Estado General": impl.estado or "",
            }

            # === CONTRACTUAL ===
            contractual_data = (
                db.query(ProjectImplementacionContractual)
                .filter_by(cliente_implementacion_id=impl.id)
                .first()
            )

            if contractual_data:
                # Campos predefinidos contractuales
                fila["CONTRACTUAL - Modelo Contrato (Seguimiento)"] = (
                    contractual_data.modelo_contrato_seguimiento or ""
                )
                fila["CONTRACTUAL - Modelo Contrato (Estado)"] = (
                    contractual_data.modelo_contrato_estado or ""
                )
                fila["CONTRACTUAL - Modelo Contrato (Responsable)"] = (
                    contractual_data.modelo_contrato_responsable or ""
                )
                fila["CONTRACTUAL - Modelo Contrato (Notas)"] = (
                    contractual_data.modelo_contrato_notas or ""
                )

                fila["CONTRACTUAL - Modelo Confidencialidad (Seguimiento)"] = (
                    contractual_data.modelo_confidencialidad_seguimiento or ""
                )
                fila["CONTRACTUAL - Modelo Confidencialidad (Estado)"] = (
                    contractual_data.modelo_confidencialidad_estado or ""
                )
                fila["CONTRACTUAL - Modelo Confidencialidad (Responsable)"] = (
                    contractual_data.modelo_confidencialidad_responsable or ""
                )
                fila["CONTRACTUAL - Modelo Confidencialidad (Notas)"] = (
                    contractual_data.modelo_confidencialidad_notas or ""
                )

                fila["CONTRACTUAL - Alcance (Seguimiento)"] = (
                    contractual_data.alcance_seguimiento or ""
                )
                fila["CONTRACTUAL - Alcance (Estado)"] = (
                    contractual_data.alcance_estado or ""
                )
                fila["CONTRACTUAL - Alcance (Responsable)"] = (
                    contractual_data.alcance_responsable or ""
                )
                fila["CONTRACTUAL - Alcance (Notas)"] = (
                    contractual_data.alcance_notas or ""
                )

                fila["CONTRACTUAL - Fecha Inicio (Seguimiento)"] = (
                    contractual_data.fecha_inicio_seguimiento or ""
                )
                fila["CONTRACTUAL - Fecha Inicio (Estado)"] = (
                    contractual_data.fecha_inicio_estado or ""
                )
                fila["CONTRACTUAL - Fecha Inicio (Responsable)"] = (
                    contractual_data.fecha_inicio_responsable or ""
                )
                fila["CONTRACTUAL - Fecha Inicio (Notas)"] = (
                    contractual_data.fecha_inicio_notas or ""
                )

            # Subsecciones personalizadas Contractual
            subsecciones_contractual = (
                db.query(ProjectImplementacionSubseccionPersonalizada)
                .filter_by(cliente_implementacion_id=impl.id, seccion="contractual")
                .all()
            )

            print(
                f"🔍 Implementación {impl.id} ({impl.cliente}): {len(subsecciones_contractual)} subsecciones contractuales"
            )

            for subseccion in subsecciones_contractual:
                nombre_campo = subseccion.nombre_subsesion
                print(f"  ➕ Agregando subsección contractual: {nombre_campo}")
                fila[f"CONTRACTUAL - {nombre_campo} (Seguimiento)"] = (
                    subseccion.seguimiento or ""
                )
                fila[f"CONTRACTUAL - {nombre_campo} (Estado)"] = subseccion.estado or ""
                fila[f"CONTRACTUAL - {nombre_campo} (Responsable)"] = (
                    subseccion.responsable or ""
                )
                fila[f"CONTRACTUAL - {nombre_campo} (Notas)"] = subseccion.notas or ""

            # === TALENTO HUMANO ===
            talento_data = (
                db.query(ProjectImplementacionTalentoHumano)
                .filter_by(cliente_implementacion_id=impl.id)
                .first()
            )

            if talento_data:
                # Campos predefinidos talento humano
                fila["TALENTO HUMANO - Perfil Personal (Seguimiento)"] = (
                    talento_data.perfil_personal_seguimiento or ""
                )
                fila["TALENTO HUMANO - Perfil Personal (Estado)"] = (
                    talento_data.perfil_personal_estado or ""
                )
                fila["TALENTO HUMANO - Perfil Personal (Responsable)"] = (
                    talento_data.perfil_personal_responsable or ""
                )
                fila["TALENTO HUMANO - Perfil Personal (Notas)"] = (
                    talento_data.perfil_personal_notas or ""
                )

                fila["TALENTO HUMANO - Cantidad Asesores (Seguimiento)"] = (
                    talento_data.cantidad_asesores_seguimiento or ""
                )
                fila["TALENTO HUMANO - Cantidad Asesores (Estado)"] = (
                    talento_data.cantidad_asesores_estado or ""
                )
                fila["TALENTO HUMANO - Cantidad Asesores (Responsable)"] = (
                    talento_data.cantidad_asesores_responsable or ""
                )
                fila["TALENTO HUMANO - Cantidad Asesores (Notas)"] = (
                    talento_data.cantidad_asesores_notas or ""
                )

                fila["TALENTO HUMANO - Horarios (Seguimiento)"] = (
                    talento_data.horarios_seguimiento or ""
                )
                fila["TALENTO HUMANO - Horarios (Estado)"] = (
                    talento_data.horarios_estado or ""
                )
                fila["TALENTO HUMANO - Horarios (Responsable)"] = (
                    talento_data.horarios_responsable or ""
                )
                fila["TALENTO HUMANO - Horarios (Notas)"] = (
                    talento_data.horarios_notas or ""
                )

                fila["TALENTO HUMANO - Formador (Seguimiento)"] = (
                    talento_data.formador_seguimiento or ""
                )
                fila["TALENTO HUMANO - Formador (Estado)"] = (
                    talento_data.formador_estado or ""
                )
                fila["TALENTO HUMANO - Formador (Responsable)"] = (
                    talento_data.formador_responsable or ""
                )
                fila["TALENTO HUMANO - Formador (Notas)"] = (
                    talento_data.formador_notas or ""
                )

                fila["TALENTO HUMANO - Capacitaciones Andes (Seguimiento)"] = (
                    talento_data.capacitaciones_andes_seguimiento or ""
                )
                fila["TALENTO HUMANO - Capacitaciones Andes (Estado)"] = (
                    talento_data.capacitaciones_andes_estado or ""
                )
                fila["TALENTO HUMANO - Capacitaciones Andes (Responsable)"] = (
                    talento_data.capacitaciones_andes_responsable or ""
                )
                fila["TALENTO HUMANO - Capacitaciones Andes (Notas)"] = (
                    talento_data.capacitaciones_andes_notas or ""
                )

                fila["TALENTO HUMANO - Capacitaciones Cliente (Seguimiento)"] = (
                    talento_data.capacitaciones_cliente_seguimiento or ""
                )
                fila["TALENTO HUMANO - Capacitaciones Cliente (Estado)"] = (
                    talento_data.capacitaciones_cliente_estado or ""
                )
                fila["TALENTO HUMANO - Capacitaciones Cliente (Responsable)"] = (
                    talento_data.capacitaciones_cliente_responsable or ""
                )
                fila["TALENTO HUMANO - Capacitaciones Cliente (Notas)"] = (
                    talento_data.capacitaciones_cliente_notas or ""
                )

            # Subsecciones personalizadas Talento Humano
            subsecciones_talento = (
                db.query(ProjectSubseccionImplementacionTalentoHumano)
                .filter_by(cliente_implementacion_id=impl.id)
                .all()
            )

            print(
                f"🔍 Implementación {impl.id}: {len(subsecciones_talento)} subsecciones talento humano"
            )

            for subseccion in subsecciones_talento:
                nombre_campo = subseccion.nombre_subsesion
                print(f"  ➕ Agregando subsección talento humano: {nombre_campo}")
                fila[f"TALENTO HUMANO - {nombre_campo} (Seguimiento)"] = (
                    subseccion.seguimiento or ""
                )
                fila[f"TALENTO HUMANO - {nombre_campo} (Estado)"] = (
                    subseccion.estado or ""
                )
                fila[f"TALENTO HUMANO - {nombre_campo} (Responsable)"] = (
                    subseccion.responsable or ""
                )
                fila[f"TALENTO HUMANO - {nombre_campo} (Notas)"] = (
                    subseccion.notas or ""
                )

            # === PROCESOS ===
            procesos_data = (
                db.query(ProjectImplementacionProcesos)
                .filter_by(cliente_implementacion_id=impl.id)
                .first()
            )

            if procesos_data:
                # Campos predefinidos procesos
                fila["PROCESOS - Responsable Cliente (Seguimiento)"] = (
                    procesos_data.responsable_cliente_seguimiento or ""
                )
                fila["PROCESOS - Responsable Cliente (Estado)"] = (
                    procesos_data.responsable_cliente_estado or ""
                )
                fila["PROCESOS - Responsable Cliente (Responsable)"] = (
                    procesos_data.responsable_cliente_responsable or ""
                )
                fila["PROCESOS - Responsable Cliente (Notas)"] = (
                    procesos_data.responsable_cliente_notas or ""
                )

                fila["PROCESOS - Responsable Andes (Seguimiento)"] = (
                    procesos_data.responsable_andes_seguimiento or ""
                )
                fila["PROCESOS - Responsable Andes (Estado)"] = (
                    procesos_data.responsable_andes_estado or ""
                )
                fila["PROCESOS - Responsable Andes (Responsable)"] = (
                    procesos_data.responsable_andes_responsable or ""
                )
                fila["PROCESOS - Responsable Andes (Notas)"] = (
                    procesos_data.responsable_andes_notas or ""
                )

                fila["PROCESOS - Responsables Operación (Seguimiento)"] = (
                    procesos_data.responsables_operacion_seguimiento or ""
                )
                fila["PROCESOS - Responsables Operación (Estado)"] = (
                    procesos_data.responsables_operacion_estado or ""
                )
                fila["PROCESOS - Responsables Operación (Responsable)"] = (
                    procesos_data.responsables_operacion_responsable or ""
                )
                fila["PROCESOS - Responsables Operación (Notas)"] = (
                    procesos_data.responsables_operacion_notas or ""
                )

                fila["PROCESOS - Listado Reportes (Seguimiento)"] = (
                    procesos_data.listado_reportes_seguimiento or ""
                )
                fila["PROCESOS - Listado Reportes (Estado)"] = (
                    procesos_data.listado_reportes_estado or ""
                )
                fila["PROCESOS - Listado Reportes (Responsable)"] = (
                    procesos_data.listado_reportes_responsable or ""
                )
                fila["PROCESOS - Listado Reportes (Notas)"] = (
                    procesos_data.listado_reportes_notas or ""
                )

                fila["PROCESOS - Protocolo Comunicaciones (Seguimiento)"] = (
                    procesos_data.protocolo_comunicaciones_seguimiento or ""
                )
                fila["PROCESOS - Protocolo Comunicaciones (Estado)"] = (
                    procesos_data.protocolo_comunicaciones_estado or ""
                )
                fila["PROCESOS - Protocolo Comunicaciones (Responsable)"] = (
                    procesos_data.protocolo_comunicaciones_responsable or ""
                )
                fila["PROCESOS - Protocolo Comunicaciones (Notas)"] = (
                    procesos_data.protocolo_comunicaciones_notas or ""
                )

                fila["PROCESOS - Información Diaria (Seguimiento)"] = (
                    procesos_data.informacion_diaria_seguimiento or ""
                )
                fila["PROCESOS - Información Diaria (Estado)"] = (
                    procesos_data.informacion_diaria_estado or ""
                )
                fila["PROCESOS - Información Diaria (Responsable)"] = (
                    procesos_data.informacion_diaria_responsable or ""
                )
                fila["PROCESOS - Información Diaria (Notas)"] = (
                    procesos_data.informacion_diaria_notas or ""
                )

                fila["PROCESOS - Seguimiento Periódico (Seguimiento)"] = (
                    procesos_data.seguimiento_periodico_seguimiento or ""
                )
                fila["PROCESOS - Seguimiento Periódico (Estado)"] = (
                    procesos_data.seguimiento_periodico_estado or ""
                )
                fila["PROCESOS - Seguimiento Periódico (Responsable)"] = (
                    procesos_data.seguimiento_periodico_responsable or ""
                )
                fila["PROCESOS - Seguimiento Periódico (Notas)"] = (
                    procesos_data.seguimiento_periodico_notas or ""
                )

                fila["PROCESOS - Guiones Protocolos (Seguimiento)"] = (
                    procesos_data.guiones_protocolos_seguimiento or ""
                )
                fila["PROCESOS - Guiones Protocolos (Estado)"] = (
                    procesos_data.guiones_protocolos_estado or ""
                )
                fila["PROCESOS - Guiones Protocolos (Responsable)"] = (
                    procesos_data.guiones_protocolos_responsable or ""
                )
                fila["PROCESOS - Guiones Protocolos (Notas)"] = (
                    procesos_data.guiones_protocolos_notas or ""
                )

                fila["PROCESOS - Proceso Monitoreo (Seguimiento)"] = (
                    procesos_data.proceso_monitoreo_seguimiento or ""
                )
                fila["PROCESOS - Proceso Monitoreo (Estado)"] = (
                    procesos_data.proceso_monitoreo_estado or ""
                )
                fila["PROCESOS - Proceso Monitoreo (Responsable)"] = (
                    procesos_data.proceso_monitoreo_responsable or ""
                )
                fila["PROCESOS - Proceso Monitoreo (Notas)"] = (
                    procesos_data.proceso_monitoreo_notas or ""
                )

                fila["PROCESOS - Cronograma Tecnología (Seguimiento)"] = (
                    procesos_data.cronograma_tecnologia_seguimiento or ""
                )
                fila["PROCESOS - Cronograma Tecnología (Estado)"] = (
                    procesos_data.cronograma_tecnologia_estado or ""
                )
                fila["PROCESOS - Cronograma Tecnología (Responsable)"] = (
                    procesos_data.cronograma_tecnologia_responsable or ""
                )
                fila["PROCESOS - Cronograma Tecnología (Notas)"] = (
                    procesos_data.cronograma_tecnologia_notas or ""
                )

                fila["PROCESOS - Cronograma Capacitaciones (Seguimiento)"] = (
                    procesos_data.cronograma_capacitaciones_seguimiento or ""
                )
                fila["PROCESOS - Cronograma Capacitaciones (Estado)"] = (
                    procesos_data.cronograma_capacitaciones_estado or ""
                )
                fila["PROCESOS - Cronograma Capacitaciones (Responsable)"] = (
                    procesos_data.cronograma_capacitaciones_responsable or ""
                )
                fila["PROCESOS - Cronograma Capacitaciones (Notas)"] = (
                    procesos_data.cronograma_capacitaciones_notas or ""
                )

                fila["PROCESOS - Realización Pruebas (Seguimiento)"] = (
                    procesos_data.realizacion_pruebas_seguimiento or ""
                )
                fila["PROCESOS - Realización Pruebas (Estado)"] = (
                    procesos_data.realizacion_pruebas_estado or ""
                )
                fila["PROCESOS - Realización Pruebas (Responsable)"] = (
                    procesos_data.realizacion_pruebas_responsable or ""
                )
                fila["PROCESOS - Realización Pruebas (Notas)"] = (
                    procesos_data.realizacion_pruebas_notas or ""
                )

            # Subsecciones personalizadas Procesos
            subsecciones_procesos = (
                db.query(ProjectSubseccionImplementacionProcesos)
                .filter_by(cliente_implementacion_id=impl.id)
                .all()
            )

            print(
                f"🔍 Implementación {impl.id}: {len(subsecciones_procesos)} subsecciones procesos"
            )

            for subseccion in subsecciones_procesos:
                nombre_campo = subseccion.nombre_subsesion
                print(f"  ➕ Agregando subsección procesos: {nombre_campo}")
                fila[f"PROCESOS - {nombre_campo} (Seguimiento)"] = (
                    subseccion.seguimiento or ""
                )
                fila[f"PROCESOS - {nombre_campo} (Estado)"] = subseccion.estado or ""
                fila[f"PROCESOS - {nombre_campo} (Responsable)"] = (
                    subseccion.responsable or ""
                )
                fila[f"PROCESOS - {nombre_campo} (Notas)"] = subseccion.notas or ""

            # === TECNOLOGÍA ===
            tecnologia_data = (
                db.query(ProjectImplementacionTecnologia)
                .filter_by(cliente_implementacion_id=impl.id)
                .first()
            )

            if tecnologia_data:
                # Campos predefinidos tecnología
                fila["TECNOLOGÍA - Creación Módulo (Seguimiento)"] = (
                    tecnologia_data.creacion_modulo_seguimiento or ""
                )
                fila["TECNOLOGÍA - Creación Módulo (Estado)"] = (
                    tecnologia_data.creacion_modulo_estado or ""
                )
                fila["TECNOLOGÍA - Creación Módulo (Responsable)"] = (
                    tecnologia_data.creacion_modulo_responsable or ""
                )
                fila["TECNOLOGÍA - Creación Módulo (Notas)"] = (
                    tecnologia_data.creacion_modulo_notas or ""
                )

                fila["TECNOLOGÍA - Tipificación Interacciones (Seguimiento)"] = (
                    tecnologia_data.tipificacion_interacciones_seguimiento or ""
                )
                fila["TECNOLOGÍA - Tipificación Interacciones (Estado)"] = (
                    tecnologia_data.tipificacion_interacciones_estado or ""
                )
                fila["TECNOLOGÍA - Tipificación Interacciones (Responsable)"] = (
                    tecnologia_data.tipificacion_interacciones_responsable or ""
                )
                fila["TECNOLOGÍA - Tipificación Interacciones (Notas)"] = (
                    tecnologia_data.tipificacion_interacciones_notas or ""
                )

                fila["TECNOLOGÍA - Aplicativos Proceso (Seguimiento)"] = (
                    tecnologia_data.aplicativos_proceso_seguimiento or ""
                )
                fila["TECNOLOGÍA - Aplicativos Proceso (Estado)"] = (
                    tecnologia_data.aplicativos_proceso_estado or ""
                )
                fila["TECNOLOGÍA - Aplicativos Proceso (Responsable)"] = (
                    tecnologia_data.aplicativos_proceso_responsable or ""
                )
                fila["TECNOLOGÍA - Aplicativos Proceso (Notas)"] = (
                    tecnologia_data.aplicativos_proceso_notas or ""
                )

                fila["TECNOLOGÍA - WhatsApp (Seguimiento)"] = (
                    tecnologia_data.whatsapp_seguimiento or ""
                )
                fila["TECNOLOGÍA - WhatsApp (Estado)"] = (
                    tecnologia_data.whatsapp_estado or ""
                )
                fila["TECNOLOGÍA - WhatsApp (Responsable)"] = (
                    tecnologia_data.whatsapp_responsable or ""
                )
                fila["TECNOLOGÍA - WhatsApp (Notas)"] = (
                    tecnologia_data.whatsapp_notas or ""
                )

                fila["TECNOLOGÍA - Correos Electrónicos (Seguimiento)"] = (
                    tecnologia_data.correos_electronicos_seguimiento or ""
                )
                fila["TECNOLOGÍA - Correos Electrónicos (Estado)"] = (
                    tecnologia_data.correos_electronicos_estado or ""
                )
                fila["TECNOLOGÍA - Correos Electrónicos (Responsable)"] = (
                    tecnologia_data.correos_electronicos_responsable or ""
                )
                fila["TECNOLOGÍA - Correos Electrónicos (Notas)"] = (
                    tecnologia_data.correos_electronicos_notas or ""
                )

                fila["TECNOLOGÍA - Requisitos Grabación (Seguimiento)"] = (
                    tecnologia_data.requisitos_grabacion_seguimiento or ""
                )
                fila["TECNOLOGÍA - Requisitos Grabación (Estado)"] = (
                    tecnologia_data.requisitos_grabacion_estado or ""
                )
                fila["TECNOLOGÍA - Requisitos Grabación (Responsable)"] = (
                    tecnologia_data.requisitos_grabacion_responsable or ""
                )
                fila["TECNOLOGÍA - Requisitos Grabación (Notas)"] = (
                    tecnologia_data.requisitos_grabacion_notas or ""
                )

            # Subsecciones personalizadas Tecnología
            subsecciones_tecnologia = (
                db.query(ProjectSubseccionImplementacionTecnologia)
                .filter_by(cliente_implementacion_id=impl.id)
                .all()
            )

            print(
                f"🔍 Implementación {impl.id}: {len(subsecciones_tecnologia)} subsecciones tecnología"
            )

            for subseccion in subsecciones_tecnologia:
                nombre_campo = subseccion.nombre_subsesion
                print(f"  ➕ Agregando subsección tecnología: {nombre_campo}")
                fila[f"TECNOLOGÍA - {nombre_campo} (Seguimiento)"] = (
                    subseccion.seguimiento or ""
                )
                fila[f"TECNOLOGÍA - {nombre_campo} (Estado)"] = subseccion.estado or ""
                fila[f"TECNOLOGÍA - {nombre_campo} (Responsable)"] = (
                    subseccion.responsable or ""
                )
                fila[f"TECNOLOGÍA - {nombre_campo} (Notas)"] = subseccion.notas or ""

            datos_excel.append(fila)

        print(f"\n📊 Total de implementaciones procesadas: {len(datos_excel)}")

        # Crear DataFrame con todos los datos
        # Esto garantiza que todas las columnas dinámicas se incluyan
        df = pd.DataFrame(datos_excel)

        # Ordenar columnas: primero las básicas, luego las de cada sección
        columnas_ordenadas = []
        columnas_basicas = ["ID", "Cliente", "Proceso", "Estado General"]
        for col in columnas_basicas:
            if col in df.columns:
                columnas_ordenadas.append(col)

        # Agregar columnas de cada sección en orden
        prefijos = ["CONTRACTUAL", "TALENTO HUMANO", "PROCESOS", "TECNOLOGÍA"]
        for prefijo in prefijos:
            cols_seccion = [col for col in df.columns if col.startswith(prefijo)]
            columnas_ordenadas.extend(sorted(cols_seccion))

        # Reordenar columnas
        df = df[columnas_ordenadas]

        print(f"📋 Total de columnas en el Excel: {len(df.columns)}")
        print(f"🔍 Columnas con subsecciones personalizadas:")
        for col in df.columns:
            if not any(
                campo in col
                for campo in [
                    "Modelo Contrato",
                    "Modelo Confidencialidad",
                    "Alcance",
                    "Fecha Inicio",
                    "Perfil Personal",
                    "Cantidad Asesores",
                    "Horarios",
                    "Formador",
                    "Capacitaciones",
                    "Responsable Cliente",
                    "Responsable Andes",
                    "Responsables Operación",
                    "Listado Reportes",
                    "Protocolo Comunicaciones",
                    "Información Diaria",
                    "Seguimiento Periódico",
                    "Guiones Protocolos",
                    "Proceso Monitoreo",
                    "Cronograma",
                    "Realización Pruebas",
                    "Creación Módulo",
                    "Tipificación Interacciones",
                    "Aplicativos Proceso",
                    "WhatsApp",
                    "Correos Electrónicos",
                    "Requisitos Grabación",
                    "ID",
                    "Cliente",
                    "Proceso",
                    "Estado General",
                ]
            ):
                print(f"  ✨ {col}")

        # Generar Excel
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="Implementaciones")

            # Obtener el workbook y worksheet para formato
            workbook = writer.book
            worksheet = writer.sheets["Implementaciones"]

            # Formato para encabezados
            header_format = workbook.add_format(
                {
                    "bold": True,
                    "bg_color": "#4F46E5",
                    "font_color": "white",
                    "border": 1,
                    "align": "center",
                    "valign": "vcenter",
                }
            )

            # Aplicar formato a encabezados
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)

            # Ajustar ancho de columnas
            for i, col in enumerate(df.columns):
                max_len = max(df[col].astype(str).apply(len).max(), len(str(col)))
                worksheet.set_column(i, i, min(max_len + 2, 50))

        output.seek(0)

        # Generar nombre de archivo con fecha
        from datetime import datetime

        fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"implementaciones_completo_{fecha_actual}.xlsx"

        response = Response(
            output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'

        print(f"✅ Excel generado exitosamente: {filename}")
        print(f"📊 Total de implementaciones: {len(datos_excel)}")
        print(f"📋 Total de columnas: {len(df.columns)}")

        return response

    except Exception as e:
        print(f"❌ Error al generar Excel: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar Excel: {str(e)}")


@router.get("/{id}/descargar_pdf")
def descargar_pdf_implementacion(id: int, db: Session = Depends(get_db)):
    """Genera PDF con formato de entrega de campaña desde la última entrega"""
    try:
        from models.project_entregaImplementaciones import (
            ProjectEntregaImplementaciones,
        )
        import base64
        import os

        print(f"\n🔍 Buscando implementación ID: {id}")
        imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
        if not imp:
            print(f"❌ Implementación {id} no encontrada")
            raise HTTPException(status_code=404, detail="Implementación no encontrada")

        print(f"✅ Implementación encontrada: {imp.cliente}")

        # Obtener la ÚLTIMA entrega de esta implementación
        entrega = (
            db.query(ProjectEntregaImplementaciones)
            .filter_by(implementacion_id=id)
            .order_by(ProjectEntregaImplementaciones.fecha_entrega.desc())
            .first()
        )

        if not entrega:
            print(f"❌ No se encontró entrega para implementación {id}")
            raise HTTPException(
                status_code=404,
                detail="No hay entregas registradas para esta implementación",
            )

        print(f"✅ Entrega encontrada ID: {entrega.id}, Fecha: {entrega.fecha_entrega}")

        fecha_actual = datetime.now().strftime("%d/%m/%Y")

        # Cargar logo como base64
        logo_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "frontend",
            "src",
            "img",
            "logo-andesbpo (1).png",
        )
        logo_base64 = ""
        try:
            with open(logo_path, "rb") as f:
                logo_bytes = f.read()
                logo_base64 = "data:image/png;base64," + base64.b64encode(
                    logo_bytes
                ).decode("utf-8")
        except Exception as e:
            print(f"⚠️ No se pudo cargar el logo: {e}")

        # Función helper para sanitizar texto
        def safe_text(text):
            if not text:
                return "&nbsp;"
            return str(text).replace('"', "'").replace("<", "&lt;").replace(">", "&gt;")

        # Datos sanitizados
        cliente = safe_text(imp.cliente) if imp.cliente else "&nbsp;"
        proceso = safe_text(imp.proceso) if imp.proceso else "&nbsp;"

        # Estilos inline directos optimizados para mejor uso del espacio
        style_header = "background:#000; color:#fff; padding:3px 2px; text-align:center; vertical-align:middle; font-size:8pt; font-weight:bold; border:1px solid #000; font-family:Roboto, Arial, sans-serif; line-height:1.2;"
        style_header_proceso = "background:#000; color:#fff; padding:3px 2px; text-align:center; vertical-align:middle; font-size:8pt; font-weight:bold; border:1px solid #000; width:16%; font-family:Roboto, Arial, sans-serif; line-height:1.2;"
        style_header_concepto = "background:#000; color:#fff; padding:3px 2px; text-align:center; vertical-align:middle; font-size:8pt; font-weight:bold; border:1px solid #000; width:37%; font-family:Roboto, Arial, sans-serif; line-height:1.2;"
        style_header_observacion = "background:#000; color:#fff; padding:3px 2px; text-align:center; vertical-align:middle; font-size:8pt; font-weight:bold; border:1px solid #000; width:47%; font-family:Roboto, Arial, sans-serif; line-height:1.2;"
        style_proceso = "padding:3px 2px; font-size:8pt; border:1px solid #444; vertical-align:top; text-align:center; font-family:Roboto, Arial, sans-serif; line-height:1.3;"
        style_concepto = "padding:3px 2px; font-size:8pt; border:1px solid #444; vertical-align:top; text-align:left; font-family:Roboto, Arial, sans-serif; line-height:1.3;"
        style_observacion = "padding:3px 2px; font-size:8pt; border:1px solid #444; vertical-align:top; text-align:left; font-family:Roboto, Arial, sans-serif; line-height:1.3; word-wrap:break-word;"

        # HTML con maquetación optimizada para mejor uso del espacio
        html_content = f"""<!doctype html>
    <html lang="es">
    <head>
    <meta charset="utf-8"/>
    <title>Formato Entrega Campañas</title>
    <style>
    @page {{ 
        size: A4; 
        margin: 12mm 10mm 12mm 10mm;
    }}
    body {{ 
        font-family: 'Roboto', Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        font-size: 8pt;
        line-height: 1.3;
    }}
    table {{ 
        width: 100%; 
        border-collapse: collapse; 
        font-family: 'Roboto', Arial, sans-serif;
        table-layout: fixed;
    }}
    .info-table {{
        margin-bottom: 8px;
    }}
    .data-table {{
        page-break-inside: auto;
    }}
    .data-table thead {{
        display: table-header-group;
    }}
    .data-table tbody tr {{
        page-break-inside: avoid;
    }}
    td {{
        word-wrap: break-word;
        overflow-wrap: break-word;
    }}
    </style>
    </head>
    <body>

    <!-- Header con título centrado y logo a la derecha -->
    <table style="width:100%; margin-bottom:8px; border:none; border-collapse:collapse;">
        <tr>
            <td style="width:15%; border:none; padding:0;"></td>
            <td style="width:55%; text-align:center; border:none; padding:0; vertical-align:bottom;">
                <h1 style="font-size:10pt; margin:0; font-family:Roboto, Arial, sans-serif; font-weight:bold;">FORMATO ENTREGA CAMPAÑAS</h1>
            </td>
            <td style="width:30%; text-align:right; border:none; padding:0; vertical-align:bottom;">
                <img src="{logo_base64}" style="height:60px; width:auto; display:block; margin-left:auto;" alt="AndesBPO" />
            </td>
        </tr>
    </table>

    <!-- Tabla de información del cliente -->
    <table class="info-table">
    <tr>
    <td style="width:35%; padding:2px 4px; border:1px solid #444; background:#f0f0f0; font-weight:bold; vertical-align:middle; text-align:left; font-size:8pt; font-family:Roboto, Arial, sans-serif;">NOMBRE DEL CLIENTE</td>
    <td style="padding:2px 4px; border:1px solid #444; text-align:left; vertical-align:middle; font-size:8pt; font-family:Roboto, Arial, sans-serif;">{cliente}</td>
    </tr>
    <tr>
    <td style="padding:2px 4px; border:1px solid #444; background:#f0f0f0; font-weight:bold; vertical-align:middle; text-align:left; font-size:8pt; font-family:Roboto, Arial, sans-serif;">TIPO DE SERVICIO</td>
    <td style="padding:2px 4px; border:1px solid #444; text-align:left; vertical-align:middle; font-size:8pt; font-family:Roboto, Arial, sans-serif;">{proceso}</td>
    </tr>
    <tr>
    <td style="padding:2px 4px; border:1px solid #444; background:#f0f0f0; font-weight:bold; vertical-align:middle; text-align:left; font-size:8pt; font-family:Roboto, Arial, sans-serif;">FECHA DE INICIO SERVICIO</td>
    <td style="padding:2px 4px; border:1px solid #444; text-align:left; vertical-align:middle; font-size:8pt; font-family:Roboto, Arial, sans-serif;">{fecha_actual}</td>
    </tr>
    <tr>
    <td style="padding:2px 4px; border:1px solid #444; background:#f0f0f0; font-weight:bold; vertical-align:middle; text-align:left; font-size:8pt; font-family:Roboto, Arial, sans-serif;">FECHA DE ENTREGA</td>
    <td style="padding:2px 4px; border:1px solid #444; text-align:left; vertical-align:middle; font-size:8pt; font-family:Roboto, Arial, sans-serif;">{fecha_actual}</td>
    </tr>
    </table>

    <!-- Tabla de tres columnas con encabezado repetido -->
    <table class="data-table" style="margin-top:8px; width:100%;">
    <!-- Encabezados que se repiten en cada página -->
    <thead>
    <tr>
    <td style="{style_header_proceso}">PROCESO</td>
    <td style="{style_header_concepto}">CONCEPTO</td>
    <td style="{style_header_observacion}">OBSERVACION</td>
    </tr>
    </thead>
    <tbody>

    <!-- CONTRACTUAL -->
    <tr>
    <td rowspan="8" style="{style_proceso}">CONTRACTUAL</td>
    <td style="{style_concepto}">Contrato</td>
    <td style="{style_observacion}">{safe_text(entrega.contrato)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Acuerdos de Niveles de Servicio</td>
    <td style="{style_observacion}">{safe_text(entrega.acuerdo_niveles_servicio)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Pólizas</td>
    <td style="{style_observacion}">{safe_text(entrega.polizas)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Penalidades</td>
    <td style="{style_observacion}">{safe_text(entrega.penalidades)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Alcance del Servicio</td>
    <td style="{style_observacion}">{safe_text(entrega.alcance_servicio)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Unidades de Facturación</td>
    <td style="{style_observacion}">{safe_text(entrega.unidades_facturacion)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Acuerdo de Pago</td>
    <td style="{style_observacion}">{safe_text(entrega.acuerdo_pago)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Incremento</td>
    <td style="{style_observacion}">{safe_text(entrega.incremento)}</td>
    </tr>

    <!-- TECNOLOGIA -->
    <tr>
    <td rowspan="14" style="{style_proceso}">TECNOLOGIA</td>
    <td style="{style_concepto}">Mapa de Aplicativos a utilizarse (Nombres, alcances, requerimientos técnicos, funcionalidades)</td>
    <td style="{style_observacion}">{safe_text(entrega.mapa_aplicativos)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Internet</td>
    <td style="{style_observacion}">{safe_text(entrega.internet)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Telefonía</td>
    <td style="{style_observacion}">{safe_text(entrega.telefonia)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Whatsapp</td>
    <td style="{style_observacion}">{safe_text(entrega.whatsapp)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Integraciones</td>
    <td style="{style_observacion}">{safe_text(entrega.integraciones)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">VPN</td>
    <td style="{style_observacion}">{safe_text(entrega.vpn)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Diseño del IVR</td>
    <td style="{style_observacion}">{safe_text(entrega.diseno_ivr)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Transferencia de llamadas entre empresas: Lineas Telefónicas, Volumen de Llamadas</td>
    <td style="{style_observacion}">{safe_text(entrega.transferencia_llamadas)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Correos Electrónicos (Condiciones de Uso, capacidades)</td>
    <td style="{style_observacion}">{safe_text(entrega.correos_electronicos)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Línea 018000</td>
    <td style="{style_observacion}">{safe_text(entrega.linea_018000)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Línea de Entrada</td>
    <td style="{style_observacion}">{safe_text(entrega.linea_entrada)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">SMS (Caracteristicas)</td>
    <td style="{style_observacion}">{safe_text(entrega.sms)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Requisitos Grabación de llamada, entrega y resguardo de las mismas</td>
    <td style="{style_observacion}">{safe_text(entrega.requisitos_grabacion)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Encuestas de satisfacción</td>
    <td style="{style_observacion}">{safe_text(entrega.encuesta_satisfaccion)}</td>
    </tr>

    <!-- PROCESOS -->
    <tr>
    <td rowspan="2" style="{style_proceso}">PROCESOS</td>
    <td style="{style_concepto}">Listado Reportes Esperados</td>
    <td style="{style_observacion}">{safe_text(entrega.listado_reportes)}</td>
    </tr>
    <tr>
    <td style="{style_concepto}">Proceso Monitoreo y Calidad Andes BPO</td>
    <td style="{style_observacion}">{safe_text(entrega.proceso_monitoreo_calidad)}</td>
    </tr>
    </tbody>
    </table>

    <!-- Firmas - con espacio para firmar -->
    <div style="margin-top:25px; page-break-inside:avoid;">
    <table style="width:100%; border:none; border-collapse:collapse;">
    <tr>
    <td style="width:50%; padding:8px 10px; border:none; vertical-align:top;">
    <p style="margin:0 0 3px 0; font-weight:bold; font-size:9pt; font-family:Roboto, Arial, sans-serif;">Ejecutivo Campaña</p>
    <div style="height:38px; margin-top:5px;">
        <div style="display:block; border-bottom:2px solid #000; width:90%; height:1px;">&nbsp;</div>
    </div>
    </td>
    <td style="width:50%; padding:8px 10px; border:none; vertical-align:top;">
    <p style="margin:0 0 3px 0; font-weight:bold; font-size:9pt; font-family:Roboto, Arial, sans-serif;">Líder Campaña</p>
    <div style="height:38px; margin-top:5px;">
        <div style="display:block; border-bottom:2px solid #000; width:90%; height:1px;">&nbsp;</div>
    </div>
    </td>
    </tr>
    <tr>
    <td style="padding:15px 10px 8px 10px; border:none; vertical-align:top;">
    <p style="margin:0 0 3px 0; font-weight:bold; font-size:9pt; font-family:Roboto, Arial, sans-serif;">Auxiliar Administrativo</p>
    <div style="height:38px; margin-top:5px;">
        <div style="display:block; border-bottom:2px solid #000; width:90%; height:1px;">&nbsp;</div>
    </div>
    </td>
    <td style="padding:15px 10px 8px 10px; border:none; vertical-align:top;">
    <p style="margin:0 0 3px 0; font-weight:bold; font-size:9pt; font-family:Roboto, Arial, sans-serif;">Ejecutivo Comercial</p>
    <div style="height:38px; margin-top:5px;">
        <div style="display:block; border-bottom:2px solid #000; width:90%; height:1px;">&nbsp;</div>
    </div>
    </td>
    </tr>
        <tr>
        <td colspan="2" style="padding:15px 10px 8px 10px; border:none; vertical-align:top;">
        <p style="margin:0 0 3px 0; font-weight:bold; font-size:9pt; font-family:Roboto, Arial, sans-serif;">Líder Implementación</p>
            <!-- Nested table with line on the left: 50% line | 50% empty -->
            <table style="width:100%; border:none; border-collapse:collapse; margin-top:35px;">
                <tr>
                    <td style="width:48.5%; border:none; padding:0; vertical-align:bottom;">
                        <div style="border-bottom:2px solid #000; width:100%; height:1px;">&nbsp;</div>
                    </td>
                    <td style="width:50%; border:none; padding:0;">&nbsp;</td>
                </tr>
            </table>
        </td>
        </tr>
    </table>
    </div>

    </body>
    </html>
    """

        print("📄 Generando PDF con maquetación limpia...")

        # Generar PDF con xhtml2pdf
        pdf_buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_content.encode("utf-8"), dest=pdf_buffer)

        if pisa_status.err:
            print(f"❌ Error en pisa.CreatePDF: {pisa_status.err}")
            print("Errores de pisa:", pisa_status.log)
            raise HTTPException(status_code=500, detail="Error al generar PDF")

        print("✅ PDF generado exitosamente")
        pdf_buffer.seek(0)
        filename = f"entrega_{cliente.replace(' ', '_').replace('&nbsp;', '')}_{fecha_actual.replace('/', '-')}.pdf"

        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error inesperado generando PDF: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar PDF: {str(e)}")
