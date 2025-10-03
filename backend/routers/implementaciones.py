from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from core.database import get_db
from models.project_implementaciones_clienteimple import ProjectImplementacionesClienteImple
from models.project_implementacion_contractual import ProjectImplementacionContractual
from models.project_implementacion_talentoHumano import ProjectImplementacionTalentoHumano
from models.project_implementacion_procesos import ProjectImplementacionProcesos
from models.project_implementacion_tecnologia import ProjectImplementacionTecnologia
from pydantic import BaseModel
import pandas as pd
import io

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

router = APIRouter(prefix="/implementaciones", tags=["Implementaciones"])

@router.post("/", response_model=ImplementacionOut)
def crear_implementacion(data: ImplementacionCreate, db: Session = Depends(get_db)):
    # 1. Crear implementación principal
    nueva = ProjectImplementacionesClienteImple(
        cliente=data.cliente,
        proceso=data.proceso,
        estado=data.estado
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    # 2. Crear contractual
    contractual = ProjectImplementacionContractual(
        cliente_implementacion_id=nueva.id,
        modelo_contrato_seguimiento=data.contractual.get('modeloContrato', {}).get('seguimiento', ''),
        modelo_contrato_estado=data.contractual.get('modeloContrato', {}).get('estado', ''),
        modelo_contrato_responsable=data.contractual.get('modeloContrato', {}).get('responsable', ''),
        modelo_contrato_notas=data.contractual.get('modeloContrato', {}).get('notas', ''),
        modelo_confidencialidad_seguimiento=data.contractual.get('modeloConfidencialidad', {}).get('seguimiento', ''),
        modelo_confidencialidad_estado=data.contractual.get('modeloConfidencialidad', {}).get('estado', ''),
        modelo_confidencialidad_responsable=data.contractual.get('modeloConfidencialidad', {}).get('responsable', ''),
        modelo_confidencialidad_notas=data.contractual.get('modeloConfidencialidad', {}).get('notas', ''),
        alcance_seguimiento=data.contractual.get('alcance', {}).get('seguimiento', ''),
        alcance_estado=data.contractual.get('alcance', {}).get('estado', ''),
        alcance_responsable=data.contractual.get('alcance', {}).get('responsable', ''),
        alcance_notas=data.contractual.get('alcance', {}).get('notas', ''),
        fecha_inicio_seguimiento=data.contractual.get('fechaInicio', {}).get('seguimiento', ''),
        fecha_inicio_estado=data.contractual.get('fechaInicio', {}).get('estado', ''),
        fecha_inicio_responsable=data.contractual.get('fechaInicio', {}).get('responsable', ''),
        fecha_inicio_notas=data.contractual.get('fechaInicio', {}).get('notas', '')
    )
    db.add(contractual)
    # 3. Crear talento humano
    talento = ProjectImplementacionTalentoHumano(
        cliente_implementacion_id=nueva.id,
        perfil_personal_seguimiento=data.talento_humano.get('perfilPersonal', {}).get('seguimiento', ''),
        perfil_personal_estado=data.talento_humano.get('perfilPersonal', {}).get('estado', ''),
        perfil_personal_responsable=data.talento_humano.get('perfilPersonal', {}).get('responsable', ''),
        perfil_personal_notas=data.talento_humano.get('perfilPersonal', {}).get('notas', ''),
        cantidad_asesores_seguimiento=data.talento_humano.get('cantidadAsesores', {}).get('seguimiento', ''),
        cantidad_asesores_estado=data.talento_humano.get('cantidadAsesores', {}).get('estado', ''),
        cantidad_asesores_responsable=data.talento_humano.get('cantidadAsesores', {}).get('responsable', ''),
        cantidad_asesores_notas=data.talento_humano.get('cantidadAsesores', {}).get('notas', ''),
        horarios_seguimiento=data.talento_humano.get('horarios', {}).get('seguimiento', ''),
        horarios_estado=data.talento_humano.get('horarios', {}).get('estado', ''),
        horarios_responsable=data.talento_humano.get('horarios', {}).get('responsable', ''),
        horarios_notas=data.talento_humano.get('horarios', {}).get('notas', ''),
        formador_seguimiento=data.talento_humano.get('formador', {}).get('seguimiento', ''),
        formador_estado=data.talento_humano.get('formador', {}).get('estado', ''),
        formador_responsable=data.talento_humano.get('formador', {}).get('responsable', ''),
        formador_notas=data.talento_humano.get('formador', {}).get('notas', ''),
        capacitaciones_andes_seguimiento=data.talento_humano.get('capacitacionesAndes', {}).get('seguimiento', ''),
        capacitaciones_andes_estado=data.talento_humano.get('capacitacionesAndes', {}).get('estado', ''),
        capacitaciones_andes_responsable=data.talento_humano.get('capacitacionesAndes', {}).get('responsable', ''),
        capacitaciones_andes_notas=data.talento_humano.get('capacitacionesAndes', {}).get('notas', ''),
        capacitaciones_cliente_seguimiento=data.talento_humano.get('capacitacionesCliente', {}).get('seguimiento', ''),
        capacitaciones_cliente_estado=data.talento_humano.get('capacitacionesCliente', {}).get('estado', ''),
        capacitaciones_cliente_responsable=data.talento_humano.get('capacitacionesCliente', {}).get('responsable', ''),
        capacitaciones_cliente_notas=data.talento_humano.get('capacitacionesCliente', {}).get('notas', '')
    )
    db.add(talento)
    # 4. Crear procesos
    procesos = ProjectImplementacionProcesos(
        cliente_implementacion_id=nueva.id,
        responsable_cliente_seguimiento=data.procesos.get('responsableCliente', {}).get('seguimiento', ''),
        responsable_cliente_estado=data.procesos.get('responsableCliente', {}).get('estado', ''),
        responsable_cliente_responsable=data.procesos.get('responsableCliente', {}).get('responsable', ''),
        responsable_cliente_notas=data.procesos.get('responsableCliente', {}).get('notas', ''),
        responsable_andes_seguimiento=data.procesos.get('responsableAndes', {}).get('seguimiento', ''),
        responsable_andes_estado=data.procesos.get('responsableAndes', {}).get('estado', ''),
        responsable_andes_responsable=data.procesos.get('responsableAndes', {}).get('responsable', ''),
        responsable_andes_notas=data.procesos.get('responsableAndes', {}).get('notas', ''),
        responsables_operacion_seguimiento=data.procesos.get('responsablesOperacion', {}).get('seguimiento', ''),
        responsables_operacion_estado=data.procesos.get('responsablesOperacion', {}).get('estado', ''),
        responsables_operacion_responsable=data.procesos.get('responsablesOperacion', {}).get('responsable', ''),
        responsables_operacion_notas=data.procesos.get('responsablesOperacion', {}).get('notas', ''),
        listado_reportes_seguimiento=data.procesos.get('listadoReportes', {}).get('seguimiento', ''),
        listado_reportes_estado=data.procesos.get('listadoReportes', {}).get('estado', ''),
        listado_reportes_responsable=data.procesos.get('listadoReportes', {}).get('responsable', ''),
        listado_reportes_notas=data.procesos.get('listadoReportes', {}).get('notas', ''),
        protocolo_comunicaciones_seguimiento=data.procesos.get('protocoloComunicaciones', {}).get('seguimiento', ''),
        protocolo_comunicaciones_estado=data.procesos.get('protocoloComunicaciones', {}).get('estado', ''),
        protocolo_comunicaciones_responsable=data.procesos.get('protocoloComunicaciones', {}).get('responsable', ''),
        protocolo_comunicaciones_notas=data.procesos.get('protocoloComunicaciones', {}).get('notas', ''),
        informacion_diaria_seguimiento=data.procesos.get('informacionDiaria', {}).get('seguimiento', ''),
        informacion_diaria_estado=data.procesos.get('informacionDiaria', {}).get('estado', ''),
        informacion_diaria_responsable=data.procesos.get('informacionDiaria', {}).get('responsable', ''),
        informacion_diaria_notas=data.procesos.get('informacionDiaria', {}).get('notas', ''),
        seguimiento_periodico_seguimiento=data.procesos.get('seguimientoPeriodico', {}).get('seguimiento', ''),
        seguimiento_periodico_estado=data.procesos.get('seguimientoPeriodico', {}).get('estado', ''),
        seguimiento_periodico_responsable=data.procesos.get('seguimientoPeriodico', {}).get('responsable', ''),
        seguimiento_periodico_notas=data.procesos.get('seguimientoPeriodico', {}).get('notas', ''),
        guiones_protocolos_seguimiento=data.procesos.get('guionesProtocolos', {}).get('seguimiento', ''),
        guiones_protocolos_estado=data.procesos.get('guionesProtocolos', {}).get('estado', ''),
        guiones_protocolos_responsable=data.procesos.get('guionesProtocolos', {}).get('responsable', ''),
        guiones_protocolos_notas=data.procesos.get('guionesProtocolos', {}).get('notas', ''),
        proceso_monitoreo_seguimiento=data.procesos.get('procesoMonitoreo', {}).get('seguimiento', '')
        # ...agrega los demás campos de procesos aquí...
    )
    db.add(procesos)
    # 5. Crear tecnología
    tecnologia = ProjectImplementacionTecnologia(
        cliente_implementacion_id=nueva.id,
        creacion_modulo_seguimiento=data.tecnologia.get('creacionModulo', {}).get('seguimiento', ''),
        creacion_modulo_estado=data.tecnologia.get('creacionModulo', {}).get('estado', ''),
        creacion_modulo_responsable=data.tecnologia.get('creacionModulo', {}).get('responsable', ''),
        creacion_modulo_notas=data.tecnologia.get('creacionModulo', {}).get('notas', ''),
        tipificacion_interacciones_seguimiento=data.tecnologia.get('tipificacionInteracciones', {}).get('seguimiento', ''),
        tipificacion_interacciones_estado=data.tecnologia.get('tipificacionInteracciones', {}).get('estado', ''),
        tipificacion_interacciones_responsable=data.tecnologia.get('tipificacionInteracciones', {}).get('responsable', ''),
        tipificacion_interacciones_notas=data.tecnologia.get('tipificacionInteracciones', {}).get('notas', ''),
        aplicativos_proceso_seguimiento=data.tecnologia.get('aplicativosProceso', {}).get('seguimiento', ''),
        aplicativos_proceso_estado=data.tecnologia.get('aplicativosProceso', {}).get('estado', ''),
        aplicativos_proceso_responsable=data.tecnologia.get('aplicativosProceso', {}).get('responsable', ''),
        aplicativos_proceso_notas=data.tecnologia.get('aplicativosProceso', {}).get('notas', ''),
        whatsapp_seguimiento=data.tecnologia.get('whatsapp', {}).get('seguimiento', ''),
        whatsapp_estado=data.tecnologia.get('whatsapp', {}).get('estado', ''),
        whatsapp_responsable=data.tecnologia.get('whatsapp', {}).get('responsable', ''),
        whatsapp_notas=data.tecnologia.get('whatsapp', {}).get('notas', ''),
        correos_electronicos_seguimiento=data.tecnologia.get('correosElectronicos', {}).get('seguimiento', ''),
        correos_electronicos_estado=data.tecnologia.get('correosElectronicos', {}).get('estado', ''),
        correos_electronicos_responsable=data.tecnologia.get('correosElectronicos', {}).get('responsable', ''),
        correos_electronicos_notas=data.tecnologia.get('correosElectronicos', {}).get('notas', ''),
        requisitos_grabacion_seguimiento=data.tecnologia.get('requisitosGrabacion', {}).get('seguimiento', ''),
        requisitos_grabacion_estado=data.tecnologia.get('requisitosGrabacion', {}).get('estado', ''),
        requisitos_grabacion_responsable=data.tecnologia.get('requisitosGrabacion', {}).get('responsable', ''),
        requisitos_grabacion_notas=data.tecnologia.get('requisitosGrabacion', {}).get('notas', '')
    )
    db.add(tecnologia)
    db.commit()
    # 6. Retornar toda la info
    return {
        "id": nueva.id,
        "cliente": nueva.cliente,
        "proceso": nueva.proceso,
        "estado": nueva.estado,
        "contractual": data.contractual,
        "talento_humano": data.talento_humano,
        "procesos": data.procesos,
        "tecnologia": data.tecnologia
    }

@router.get("/basic", response_model=List[ImplementacionBasic])
def listar_implementaciones_basico(db: Session = Depends(get_db)):
    """Endpoint básico que devuelve solo los datos esenciales de implementaciones"""
    return db.query(ProjectImplementacionesClienteImple).all()

@router.get("/", response_model=List[ImplementacionOut])
def listar_implementaciones(db: Session = Depends(get_db)):
    return db.query(ProjectImplementacionesClienteImple).all()

@router.put("/{id}", response_model=ImplementacionOut)
def actualizar_implementacion(id: int, data: ImplementacionCreate, db: Session = Depends(get_db)):
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")
    for k, v in data.dict().items():
        setattr(imp, k, v)
    db.commit()
    db.refresh(imp)
    return imp

@router.delete("/{id}")
def eliminar_implementacion(id: int, db: Session = Depends(get_db)):
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")
    db.delete(imp)
    db.commit()
    return {"message": "Implementación eliminada"}

@router.get("/descargar_excel")
def descargar_excel(db: Session = Depends(get_db)):
    datos = db.query(ProjectImplementacionesClienteImple).all()
    df = pd.DataFrame([i.__dict__ for i in datos])
    df = df.drop("_sa_instance_state", axis=1, errors="ignore")
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False)
    response = Response(output.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response.headers["Content-Disposition"] = "attachment; filename=implementaciones.xlsx"
    return response
