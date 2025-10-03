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

class EstadoUpdate(BaseModel):
    estado: str

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

@router.put("/{id}/estado", response_model=ImplementacionBasic)
def actualizar_estado_implementacion(id: int, data: EstadoUpdate, db: Session = Depends(get_db)):
    """Endpoint para actualizar solo el estado de una implementación"""
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")
    
    imp.estado = data.estado
    db.commit()
    db.refresh(imp)
    
    return ImplementacionBasic(
        id=imp.id,
        cliente=imp.cliente,
        proceso=imp.proceso,
        estado=imp.estado
    )

@router.get("/{id}", response_model=ImplementacionOut)
def obtener_implementacion(id: int, db: Session = Depends(get_db)):
    """Endpoint para obtener una implementación específica con todos sus detalles"""
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")
    
    # Obtener datos de tablas relacionadas
    contractual_data = db.query(ProjectImplementacionContractual).filter_by(cliente_implementacion_id=id).first()
    talento_data = db.query(ProjectImplementacionTalentoHumano).filter_by(cliente_implementacion_id=id).first()
    procesos_data = db.query(ProjectImplementacionProcesos).filter_by(cliente_implementacion_id=id).first()
    tecnologia_data = db.query(ProjectImplementacionTecnologia).filter_by(cliente_implementacion_id=id).first()
    
    # Construir objeto contractual
    contractual = {}
    if contractual_data:
        contractual = {
            'modeloContrato': {
                'seguimiento': contractual_data.modelo_contrato_seguimiento or '',
                'estado': contractual_data.modelo_contrato_estado or '',
                'responsable': contractual_data.modelo_contrato_responsable or '',
                'notas': contractual_data.modelo_contrato_notas or ''
            },
            'modeloConfidencialidad': {
                'seguimiento': contractual_data.modelo_confidencialidad_seguimiento or '',
                'estado': contractual_data.modelo_confidencialidad_estado or '',
                'responsable': contractual_data.modelo_confidencialidad_responsable or '',
                'notas': contractual_data.modelo_confidencialidad_notas or ''
            },
            'alcance': {
                'seguimiento': contractual_data.alcance_seguimiento or '',
                'estado': contractual_data.alcance_estado or '',
                'responsable': contractual_data.alcance_responsable or '',
                'notas': contractual_data.alcance_notas or ''
            },
            'fechaInicio': {
                'seguimiento': contractual_data.fecha_inicio_seguimiento or '',
                'estado': contractual_data.fecha_inicio_estado or '',
                'responsable': contractual_data.fecha_inicio_responsable or '',
                'notas': contractual_data.fecha_inicio_notas or ''
            }
        }
    
    # Construir objeto talento_humano
    talento_humano = {}
    if talento_data:
        talento_humano = {
            'perfilPersonal': {
                'seguimiento': talento_data.perfil_personal_seguimiento or '',
                'estado': talento_data.perfil_personal_estado or '',
                'responsable': talento_data.perfil_personal_responsable or '',
                'notas': talento_data.perfil_personal_notas or ''
            },
            'cantidadAsesores': {
                'seguimiento': talento_data.cantidad_asesores_seguimiento or '',
                'estado': talento_data.cantidad_asesores_estado or '',
                'responsable': talento_data.cantidad_asesores_responsable or '',
                'notas': talento_data.cantidad_asesores_notas or ''
            },
            'horarios': {
                'seguimiento': talento_data.horarios_seguimiento or '',
                'estado': talento_data.horarios_estado or '',
                'responsable': talento_data.horarios_responsable or '',
                'notas': talento_data.horarios_notas or ''
            },
            'formador': {
                'seguimiento': talento_data.formador_seguimiento or '',
                'estado': talento_data.formador_estado or '',
                'responsable': talento_data.formador_responsable or '',
                'notas': talento_data.formador_notas or ''
            },
            'capacitacionesAndes': {
                'seguimiento': talento_data.capacitaciones_andes_seguimiento or '',
                'estado': talento_data.capacitaciones_andes_estado or '',
                'responsable': talento_data.capacitaciones_andes_responsable or '',
                'notas': talento_data.capacitaciones_andes_notas or ''
            },
            'capacitacionesCliente': {
                'seguimiento': talento_data.capacitaciones_cliente_seguimiento or '',
                'estado': talento_data.capacitaciones_cliente_estado or '',
                'responsable': talento_data.capacitaciones_cliente_responsable or '',
                'notas': talento_data.capacitaciones_cliente_notas or ''
            }
        }
    
    # Construir objeto procesos
    procesos = {}
    if procesos_data:
        procesos = {
            'responsableCliente': {
                'seguimiento': procesos_data.responsable_cliente_seguimiento or '',
                'estado': procesos_data.responsable_cliente_estado or '',
                'responsable': procesos_data.responsable_cliente_responsable or '',
                'notas': procesos_data.responsable_cliente_notas or ''
            },
            'responsableAndes': {
                'seguimiento': procesos_data.responsable_andes_seguimiento or '',
                'estado': procesos_data.responsable_andes_estado or '',
                'responsable': procesos_data.responsable_andes_responsable or '',
                'notas': procesos_data.responsable_andes_notas or ''
            },
            'responsablesOperacion': {
                'seguimiento': procesos_data.responsables_operacion_seguimiento or '',
                'estado': procesos_data.responsables_operacion_estado or '',
                'responsable': procesos_data.responsables_operacion_responsable or '',
                'notas': procesos_data.responsables_operacion_notas or ''
            },
            'listadoReportes': {
                'seguimiento': procesos_data.listado_reportes_seguimiento or '',
                'estado': procesos_data.listado_reportes_estado or '',
                'responsable': procesos_data.listado_reportes_responsable or '',
                'notas': procesos_data.listado_reportes_notas or ''
            },
            'protocoloComunicaciones': {
                'seguimiento': procesos_data.protocolo_comunicaciones_seguimiento or '',
                'estado': procesos_data.protocolo_comunicaciones_estado or '',
                'responsable': procesos_data.protocolo_comunicaciones_responsable or '',
                'notas': procesos_data.protocolo_comunicaciones_notas or ''
            },
            'guionesProtocolos': {
                'seguimiento': procesos_data.guiones_protocolos_seguimiento or '',
                'estado': procesos_data.guiones_protocolos_estado or '',
                'responsable': procesos_data.guiones_protocolos_responsable or '',
                'notas': procesos_data.guiones_protocolos_notas or ''
            },
            'procesoMonitoreo': {
                'seguimiento': procesos_data.proceso_monitoreo_seguimiento or '',
                'estado': procesos_data.proceso_monitoreo_estado or '',
                'responsable': procesos_data.proceso_monitoreo_responsable or '',
                'notas': procesos_data.proceso_monitoreo_notas or ''
            },
            'cronogramaTecnologia': {
                'seguimiento': procesos_data.cronograma_tecnologia_seguimiento or '',
                'estado': procesos_data.cronograma_tecnologia_estado or '',
                'responsable': procesos_data.cronograma_tecnologia_responsable or '',
                'notas': procesos_data.cronograma_tecnologia_notas or ''
            },
            'cronogramaCapacitaciones': {
                'seguimiento': procesos_data.cronograma_capacitaciones_seguimiento or '',
                'estado': procesos_data.cronograma_capacitaciones_estado or '',
                'responsable': procesos_data.cronograma_capacitaciones_responsable or '',
                'notas': procesos_data.cronograma_capacitaciones_notas or ''
            },
            'realizacionPruebas': {
                'seguimiento': procesos_data.realizacion_pruebas_seguimiento or '',
                'estado': procesos_data.realizacion_pruebas_estado or '',
                'responsable': procesos_data.realizacion_pruebas_responsable or '',
                'notas': procesos_data.realizacion_pruebas_notas or ''
            }
        }
    
    # Construir objeto tecnologia
    tecnologia = {}
    if tecnologia_data:
        tecnologia = {
            'creacionModulo': {
                'seguimiento': tecnologia_data.creacion_modulo_seguimiento or '',
                'estado': tecnologia_data.creacion_modulo_estado or '',
                'responsable': tecnologia_data.creacion_modulo_responsable or '',
                'notas': tecnologia_data.creacion_modulo_notas or ''
            },
            'tipificacionInteracciones': {
                'seguimiento': tecnologia_data.tipificacion_interacciones_seguimiento or '',
                'estado': tecnologia_data.tipificacion_interacciones_estado or '',
                'responsable': tecnologia_data.tipificacion_interacciones_responsable or '',
                'notas': tecnologia_data.tipificacion_interacciones_notas or ''
            },
            'aplicativosProceso': {
                'seguimiento': tecnologia_data.aplicativos_proceso_seguimiento or '',
                'estado': tecnologia_data.aplicativos_proceso_estado or '',
                'responsable': tecnologia_data.aplicativos_proceso_responsable or '',
                'notas': tecnologia_data.aplicativos_proceso_notas or ''
            },
            'whatsapp': {
                'seguimiento': tecnologia_data.whatsapp_seguimiento or '',
                'estado': tecnologia_data.whatsapp_estado or '',
                'responsable': tecnologia_data.whatsapp_responsable or '',
                'notas': tecnologia_data.whatsapp_notas or ''
            },
            'correosElectronicos': {
                'seguimiento': tecnologia_data.correos_electronicos_seguimiento or '',
                'estado': tecnologia_data.correos_electronicos_estado or '',
                'responsable': tecnologia_data.correos_electronicos_responsable or '',
                'notas': tecnologia_data.correos_electronicos_notas or ''
            },
            'requisitosGrabacion': {
                'seguimiento': tecnologia_data.requisitos_grabacion_seguimiento or '',
                'estado': tecnologia_data.requisitos_grabacion_estado or '',
                'responsable': tecnologia_data.requisitos_grabacion_responsable or '',
                'notas': tecnologia_data.requisitos_grabacion_notas or ''
            }
        }
    
    return ImplementacionOut(
        id=imp.id,
        cliente=imp.cliente,
        proceso=imp.proceso,
        estado=imp.estado,
        contractual=contractual,
        talento_humano=talento_humano,
        procesos=procesos,
        tecnologia=tecnologia
    )

@router.get("/", response_model=List[ImplementacionOut])
def listar_implementaciones(db: Session = Depends(get_db)):
    return db.query(ProjectImplementacionesClienteImple).all()

@router.put("/{id}")
def actualizar_implementacion(id: int, data: ImplementacionCreate, db: Session = Depends(get_db)):
    # Buscar la implementación existente
    imp = db.query(ProjectImplementacionesClienteImple).filter_by(id=id).first()
    if not imp:
        raise HTTPException(status_code=404, detail="Implementación no encontrada")
    
    # Log para debug
    print(f"\n=== ACTUALIZANDO IMPLEMENTACIÓN ID: {id} ===")
    print(f"Cliente: {data.cliente}")
    print(f"Estado: {data.estado}")
    print(f"Proceso: {data.proceso}")
    print(f"Contractual keys: {list(data.contractual.keys()) if data.contractual else 'None'}")
    print(f"Talento Humano keys: {list(data.talento_humano.keys()) if data.talento_humano else 'None'}")
    
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
        contractual_record = db.query(ProjectImplementacionContractual).filter_by(cliente_implementacion_id=id).first()
        if not contractual_record:
            contractual_record = ProjectImplementacionContractual(cliente_implementacion_id=id)
            db.add(contractual_record)
            print("Creado nuevo registro contractual")
        else:
            print("Actualizando registro contractual existente")
        
        # Actualizar campos contractuales (TODOS)
        contractual_data = data.contractual
        if contractual_data:
            if 'modeloContrato' in contractual_data:
                modelo_contrato = contractual_data['modeloContrato']
                contractual_record.modelo_contrato_seguimiento = modelo_contrato.get('seguimiento', '')
                contractual_record.modelo_contrato_estado = modelo_contrato.get('estado', '')
                contractual_record.modelo_contrato_responsable = modelo_contrato.get('responsable', '')
                contractual_record.modelo_contrato_notas = modelo_contrato.get('notas', '')
                print(f"Actualizado modelo contrato: seguimiento='{modelo_contrato.get('seguimiento', '')}'")
            
            if 'modeloConfidencialidad' in contractual_data:
                modelo_conf = contractual_data['modeloConfidencialidad']
                contractual_record.modelo_confidencialidad_seguimiento = modelo_conf.get('seguimiento', '')
                contractual_record.modelo_confidencialidad_estado = modelo_conf.get('estado', '')
                contractual_record.modelo_confidencialidad_responsable = modelo_conf.get('responsable', '')
                contractual_record.modelo_confidencialidad_notas = modelo_conf.get('notas', '')
                print(f"Actualizado modelo confidencialidad: seguimiento='{modelo_conf.get('seguimiento', '')}'")
            
            if 'alcance' in contractual_data:
                alcance = contractual_data['alcance']
                contractual_record.alcance_seguimiento = alcance.get('seguimiento', '')
                contractual_record.alcance_estado = alcance.get('estado', '')
                contractual_record.alcance_responsable = alcance.get('responsable', '')
                contractual_record.alcance_notas = alcance.get('notas', '')
                print(f"Actualizado alcance: seguimiento='{alcance.get('seguimiento', '')}'")
            
            if 'fechaInicio' in contractual_data:
                fecha_inicio = contractual_data['fechaInicio']
                contractual_record.fecha_inicio_seguimiento = fecha_inicio.get('seguimiento', '')
                contractual_record.fecha_inicio_estado = fecha_inicio.get('estado', '')
                contractual_record.fecha_inicio_responsable = fecha_inicio.get('responsable', '')
                contractual_record.fecha_inicio_notas = fecha_inicio.get('notas', '')
                print(f"Actualizado fecha inicio: seguimiento='{fecha_inicio.get('seguimiento', '')}'")
        
        # Actualizar o crear registro talento humano
        talento_record = db.query(ProjectImplementacionTalentoHumano).filter_by(cliente_implementacion_id=id).first()
        if not talento_record:
            talento_record = ProjectImplementacionTalentoHumano(cliente_implementacion_id=id)
            db.add(talento_record)
            print("Creado nuevo registro talento humano")
        else:
            print("Actualizando registro talento humano existente")
        
        # Actualizar campos talento humano (TODOS)
        talento_data = data.talento_humano
        if talento_data:
            if 'perfilPersonal' in talento_data:
                perfil = talento_data['perfilPersonal']
                talento_record.perfil_personal_seguimiento = perfil.get('seguimiento', '')
                talento_record.perfil_personal_estado = perfil.get('estado', '')
                talento_record.perfil_personal_responsable = perfil.get('responsable', '')
                talento_record.perfil_personal_notas = perfil.get('notas', '')
                print(f"Actualizado perfil personal: seguimiento='{perfil.get('seguimiento', '')}'")
            
            if 'cantidadAsesores' in talento_data:
                cantidad = talento_data['cantidadAsesores']
                talento_record.cantidad_asesores_seguimiento = cantidad.get('seguimiento', '')
                talento_record.cantidad_asesores_estado = cantidad.get('estado', '')
                talento_record.cantidad_asesores_responsable = cantidad.get('responsable', '')
                talento_record.cantidad_asesores_notas = cantidad.get('notas', '')
                print(f"Actualizado cantidad asesores: seguimiento='{cantidad.get('seguimiento', '')}'")
            
            if 'horarios' in talento_data:
                horarios = talento_data['horarios']
                talento_record.horarios_seguimiento = horarios.get('seguimiento', '')
                talento_record.horarios_estado = horarios.get('estado', '')
                talento_record.horarios_responsable = horarios.get('responsable', '')
                talento_record.horarios_notas = horarios.get('notas', '')
                print(f"Actualizado horarios: seguimiento='{horarios.get('seguimiento', '')}'")
            
            if 'formador' in talento_data:
                formador = talento_data['formador']
                talento_record.formador_seguimiento = formador.get('seguimiento', '')
                talento_record.formador_estado = formador.get('estado', '')
                talento_record.formador_responsable = formador.get('responsable', '')
                talento_record.formador_notas = formador.get('notas', '')
                print(f"Actualizado formador: seguimiento='{formador.get('seguimiento', '')}'")
            
            if 'capacitacionesAndes' in talento_data:
                cap_andes = talento_data['capacitacionesAndes']
                talento_record.capacitaciones_andes_seguimiento = cap_andes.get('seguimiento', '')
                talento_record.capacitaciones_andes_estado = cap_andes.get('estado', '')
                talento_record.capacitaciones_andes_responsable = cap_andes.get('responsable', '')
                talento_record.capacitaciones_andes_notas = cap_andes.get('notas', '')
                print(f"Actualizado capacitaciones andes: seguimiento='{cap_andes.get('seguimiento', '')}'")
            
            if 'capacitacionesCliente' in talento_data:
                cap_cliente = talento_data['capacitacionesCliente']
                talento_record.capacitaciones_cliente_seguimiento = cap_cliente.get('seguimiento', '')
                talento_record.capacitaciones_cliente_estado = cap_cliente.get('estado', '')
                talento_record.capacitaciones_cliente_responsable = cap_cliente.get('responsable', '')
                talento_record.capacitaciones_cliente_notas = cap_cliente.get('notas', '')
                print(f"Actualizado capacitaciones cliente: seguimiento='{cap_cliente.get('seguimiento', '')}'")
        
        # Actualizar o crear registro procesos
        procesos_record = db.query(ProjectImplementacionProcesos).filter_by(cliente_implementacion_id=id).first()
        if not procesos_record:
            procesos_record = ProjectImplementacionProcesos(cliente_implementacion_id=id)
            db.add(procesos_record)
            print("Creado nuevo registro procesos")
        else:
            print("Actualizando registro procesos existente")
        
        # Actualizar campos procesos (TODOS)
        procesos_data = data.procesos
        if procesos_data:
            if 'responsableCliente' in procesos_data:
                resp_cliente = procesos_data['responsableCliente']
                procesos_record.responsable_cliente_seguimiento = resp_cliente.get('seguimiento', '')
                procesos_record.responsable_cliente_estado = resp_cliente.get('estado', '')
                procesos_record.responsable_cliente_responsable = resp_cliente.get('responsable', '')
                procesos_record.responsable_cliente_notas = resp_cliente.get('notas', '')
                print(f"Actualizado responsable cliente: seguimiento='{resp_cliente.get('seguimiento', '')}'")
            
            if 'responsableAndes' in procesos_data:
                resp_andes = procesos_data['responsableAndes']
                procesos_record.responsable_andes_seguimiento = resp_andes.get('seguimiento', '')
                procesos_record.responsable_andes_estado = resp_andes.get('estado', '')
                procesos_record.responsable_andes_responsable = resp_andes.get('responsable', '')
                procesos_record.responsable_andes_notas = resp_andes.get('notas', '')
                print(f"Actualizado responsable andes: seguimiento='{resp_andes.get('seguimiento', '')}'")
            
            if 'horarioTrabajo' in procesos_data:
                horario = procesos_data['horarioTrabajo']
                procesos_record.horario_trabajo_seguimiento = horario.get('seguimiento', '')
                procesos_record.horario_trabajo_estado = horario.get('estado', '')
                procesos_record.horario_trabajo_responsable = horario.get('responsable', '')
                procesos_record.horario_trabajo_notas = horario.get('notas', '')
                print(f"Actualizado horario trabajo: seguimiento='{horario.get('seguimiento', '')}'")
            
            if 'capacitacionOperativa' in procesos_data:
                cap_operativa = procesos_data['capacitacionOperativa']
                procesos_record.capacitacion_operativa_seguimiento = cap_operativa.get('seguimiento', '')
                procesos_record.capacitacion_operativa_estado = cap_operativa.get('estado', '')
                procesos_record.capacitacion_operativa_responsable = cap_operativa.get('responsable', '')
                procesos_record.capacitacion_operativa_notas = cap_operativa.get('notas', '')
                print(f"Actualizado capacitacion operativa: seguimiento='{cap_operativa.get('seguimiento', '')}'")
            
            if 'procedimientos' in procesos_data:
                procedimientos = procesos_data['procedimientos']
                procesos_record.procedimientos_seguimiento = procedimientos.get('seguimiento', '')
                procesos_record.procedimientos_estado = procedimientos.get('estado', '')
                procesos_record.procedimientos_responsable = procedimientos.get('responsable', '')
                procesos_record.procedimientos_notas = procedimientos.get('notas', '')
                print(f"Actualizado procedimientos: seguimiento='{procedimientos.get('seguimiento', '')}'")
            
            if 'registrosControl' in procesos_data:
                registros = procesos_data['registrosControl']
                procesos_record.registros_control_seguimiento = registros.get('seguimiento', '')
                procesos_record.registros_control_estado = registros.get('estado', '')
                procesos_record.registros_control_responsable = registros.get('responsable', '')
                procesos_record.registros_control_notas = registros.get('notas', '')
                print(f"Actualizado registros control: seguimiento='{registros.get('seguimiento', '')}'")
            
            if 'calendarioTrabajo' in procesos_data:
                calendario = procesos_data['calendarioTrabajo']
                procesos_record.calendario_trabajo_seguimiento = calendario.get('seguimiento', '')
                procesos_record.calendario_trabajo_estado = calendario.get('estado', '')
                procesos_record.calendario_trabajo_responsable = calendario.get('responsable', '')
                procesos_record.calendario_trabajo_notas = calendario.get('notas', '')
                print(f"Actualizado calendario trabajo: seguimiento='{calendario.get('seguimiento', '')}'")
            
            if 'actualizacionBases' in procesos_data:
                bases = procesos_data['actualizacionBases']
                procesos_record.actualizacion_bases_seguimiento = bases.get('seguimiento', '')
                procesos_record.actualizacion_bases_estado = bases.get('estado', '')
                procesos_record.actualizacion_bases_responsable = bases.get('responsable', '')
                procesos_record.actualizacion_bases_notas = bases.get('notas', '')
                print(f"Actualizado actualizacion bases: seguimiento='{bases.get('seguimiento', '')}'")
            
            if 'backupBasesRestore' in procesos_data:
                backup = procesos_data['backupBasesRestore']
                procesos_record.backup_bases_restore_seguimiento = backup.get('seguimiento', '')
                procesos_record.backup_bases_restore_estado = backup.get('estado', '')
                procesos_record.backup_bases_restore_responsable = backup.get('responsable', '')
                procesos_record.backup_bases_restore_notas = backup.get('notas', '')
                print(f"Actualizado backup bases restore: seguimiento='{backup.get('seguimiento', '')}'")
            
            if 'atencionObjeciones' in procesos_data:
                objeciones = procesos_data['atencionObjeciones']
                procesos_record.atencion_objeciones_seguimiento = objeciones.get('seguimiento', '')
                procesos_record.atencion_objeciones_estado = objeciones.get('estado', '')
                procesos_record.atencion_objeciones_responsable = objeciones.get('responsable', '')
                procesos_record.atencion_objeciones_notas = objeciones.get('notas', '')
                print(f"Actualizado atencion objeciones: seguimiento='{objeciones.get('seguimiento', '')}'")
        else:
            print("⚠️ No hay datos de procesos para actualizar")
        
        # Actualizar o crear registro tecnología
        tecnologia_record = db.query(ProjectImplementacionTecnologia).filter_by(cliente_implementacion_id=id).first()
        if not tecnologia_record:
            tecnologia_record = ProjectImplementacionTecnologia(cliente_implementacion_id=id)
            db.add(tecnologia_record)
            print("Creado nuevo registro tecnología")
        else:
            print("Actualizando registro tecnología existente")
        
        # Actualizar campos tecnología
        tecnologia_data = data.tecnologia
        print(f"Datos tecnología recibidos: {list(tecnologia_data.keys()) if tecnologia_data else 'None'}")
        
        if tecnologia_data:
            if 'requisitosGrabacion' in tecnologia_data:
                requisitos = tecnologia_data['requisitosGrabacion']
                tecnologia_record.requisitos_grabacion_seguimiento = requisitos.get('seguimiento', '')
                tecnologia_record.requisitos_grabacion_estado = requisitos.get('estado', '')
                tecnologia_record.requisitos_grabacion_responsable = requisitos.get('responsable', '')
                tecnologia_record.requisitos_grabacion_notas = requisitos.get('notas', '')
                print(f"🎯 ACTUALIZADO requisitos grabacion: seguimiento='{requisitos.get('seguimiento', '')}' estado='{requisitos.get('estado', '')}' responsable='{requisitos.get('responsable', '')}'")
            
            if 'creacionModulo' in tecnologia_data:
                creacion = tecnologia_data['creacionModulo']
                tecnologia_record.creacion_modulo_seguimiento = creacion.get('seguimiento', '')
                tecnologia_record.creacion_modulo_estado = creacion.get('estado', '')
                tecnologia_record.creacion_modulo_responsable = creacion.get('responsable', '')
                tecnologia_record.creacion_modulo_notas = creacion.get('notas', '')
                print(f"Actualizado creacion modulo: seguimiento='{creacion.get('seguimiento', '')}'")
            
            if 'tipificacionInteracciones' in tecnologia_data:
                tipificacion = tecnologia_data['tipificacionInteracciones']
                tecnologia_record.tipificacion_interacciones_seguimiento = tipificacion.get('seguimiento', '')
                tecnologia_record.tipificacion_interacciones_estado = tipificacion.get('estado', '')
                tecnologia_record.tipificacion_interacciones_responsable = tipificacion.get('responsable', '')
                tecnologia_record.tipificacion_interacciones_notas = tipificacion.get('notas', '')
                print(f"Actualizado tipificacion interacciones: seguimiento='{tipificacion.get('seguimiento', '')}'")
            
            if 'aplicativosProceso' in tecnologia_data:
                aplicativos = tecnologia_data['aplicativosProceso']
                tecnologia_record.aplicativos_proceso_seguimiento = aplicativos.get('seguimiento', '')
                tecnologia_record.aplicativos_proceso_estado = aplicativos.get('estado', '')
                tecnologia_record.aplicativos_proceso_responsable = aplicativos.get('responsable', '')
                tecnologia_record.aplicativos_proceso_notas = aplicativos.get('notas', '')
                print(f"Actualizado aplicativos proceso: seguimiento='{aplicativos.get('seguimiento', '')}'")
            
            if 'whatsapp' in tecnologia_data:
                whatsapp = tecnologia_data['whatsapp']
                tecnologia_record.whatsapp_seguimiento = whatsapp.get('seguimiento', '')
                tecnologia_record.whatsapp_estado = whatsapp.get('estado', '')
                tecnologia_record.whatsapp_responsable = whatsapp.get('responsable', '')
                tecnologia_record.whatsapp_notas = whatsapp.get('notas', '')
                print(f"Actualizado whatsapp: seguimiento='{whatsapp.get('seguimiento', '')}'")
            
            if 'correosElectronicos' in tecnologia_data:
                correos = tecnologia_data['correosElectronicos']
                tecnologia_record.correos_electronicos_seguimiento = correos.get('seguimiento', '')
                tecnologia_record.correos_electronicos_estado = correos.get('estado', '')
                tecnologia_record.correos_electronicos_responsable = correos.get('responsable', '')
                tecnologia_record.correos_electronicos_notas = correos.get('notas', '')
                print(f"Actualizado correos electronicos: seguimiento='{correos.get('seguimiento', '')}'")
        else:
            print("⚠️ No hay datos de tecnología para actualizar")
        
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
            "proceso": imp.proceso
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al actualizar implementación: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al actualizar implementación: {str(e)}")

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
