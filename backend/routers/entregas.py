from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from core.database import get_db
from models.project_entregaImplementaciones import ProjectEntregaImplementaciones
from models.project_implementaciones_clienteimple import ProjectImplementacionesClienteImple
from pydantic import BaseModel

router = APIRouter(prefix="/entregas", tags=["entregas"])


# Schemas de Pydantic
class EntregaCreate(BaseModel):
    implementacion_id: int
    fecha_entrega: Optional[str] = None
    datos_entrega: dict = {}


class ImplementacionInfo(BaseModel):
    id: int
    cliente: Optional[str] = None
    proceso: Optional[str] = None
    
    class Config:
        from_attributes = True


class EntregaResponse(BaseModel):
    id: int
    implementacion_id: int
    fecha_entrega: datetime
    estado_entrega: str
    
    # Información de la implementación relacionada
    implementacion: Optional[ImplementacionInfo] = None
    
    # Campos contractuales
    contrato: Optional[str] = None
    acuerdo_niveles_servicio: Optional[str] = None
    polizas: Optional[str] = None
    penalidades: Optional[str] = None
    alcance_servicio: Optional[str] = None
    unidades_facturacion: Optional[str] = None
    acuerdo_pago: Optional[str] = None
    incremento: Optional[str] = None
    
    # Campos tecnológicos
    mapa_aplicativos: Optional[str] = None
    internet: Optional[str] = None
    telefonia: Optional[str] = None
    whatsapp: Optional[str] = None
    integraciones: Optional[str] = None
    vpn: Optional[str] = None
    diseno_ivr: Optional[str] = None
    transferencia_llamadas: Optional[str] = None
    correos_electronicos: Optional[str] = None
    linea_018000: Optional[str] = None
    linea_entrada: Optional[str] = None
    sms: Optional[str] = None
    requisitos_grabacion: Optional[str] = None
    entrega_resguardo: Optional[str] = None
    encuesta_satisfaccion: Optional[str] = None
    
    # Campos de procesos
    listado_reportes: Optional[str] = None
    proceso_monitoreo_calidad: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=EntregaResponse, status_code=status.HTTP_201_CREATED)
async def crear_entrega(entrega: EntregaCreate, db: Session = Depends(get_db)):
    """
    Crear una nueva entrega de implementación
    """
    try:
        # Verificar que la implementación existe
        implementacion = db.query(ProjectImplementacionesClienteImple).filter(
            ProjectImplementacionesClienteImple.id == entrega.implementacion_id
        ).first()
        
        if not implementacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Implementación con ID {entrega.implementacion_id} no encontrada"
            )
        
        # Crear la nueva entrega
        nueva_entrega = ProjectEntregaImplementaciones(
            implementacion_id=entrega.implementacion_id,
            fecha_entrega=datetime.fromisoformat(entrega.fecha_entrega) if entrega.fecha_entrega else datetime.now()
        )
        
        # Mapear los datos del formulario a los campos del modelo
        datos = entrega.datos_entrega
        
        # Campos contractuales
        if 'contractual' in datos:
            contractual = datos['contractual']
            nueva_entrega.contrato = contractual.get('contrato', '')
            nueva_entrega.acuerdo_niveles_servicio = contractual.get('acuerdoNivelesServicio', '')
            nueva_entrega.polizas = contractual.get('polizas', '')
            nueva_entrega.penalidades = contractual.get('penalidades', '')
            nueva_entrega.alcance_servicio = contractual.get('alcanceServicio', '')
            nueva_entrega.unidades_facturacion = contractual.get('unidadesFacturacion', '')
            nueva_entrega.acuerdo_pago = contractual.get('acuerdoPago', '')
            nueva_entrega.incremento = contractual.get('incremento', '')
        
        # Campos tecnológicos
        if 'tecnologia' in datos:
            tecnologia = datos['tecnologia']
            nueva_entrega.mapa_aplicativos = tecnologia.get('mapaAplicativos', '')
            nueva_entrega.internet = tecnologia.get('internet', '')
            nueva_entrega.telefonia = tecnologia.get('telefonia', '')
            nueva_entrega.whatsapp = tecnologia.get('whatsapp', '')
            nueva_entrega.integraciones = tecnologia.get('integraciones', '')
            nueva_entrega.vpn = tecnologia.get('vpn', '')
            nueva_entrega.diseno_ivr = tecnologia.get('disenoIVR', '')
            nueva_entrega.transferencia_llamadas = tecnologia.get('transferenciaLlamadas', '')
            nueva_entrega.correos_electronicos = tecnologia.get('correosElectronicos', '')
            nueva_entrega.linea_018000 = tecnologia.get('linea018000', '')
            nueva_entrega.linea_entrada = tecnologia.get('lineaEntrada', '')
            nueva_entrega.sms = tecnologia.get('sms', '')
            nueva_entrega.requisitos_grabacion = tecnologia.get('requisitosGrabacion', '')
            nueva_entrega.entrega_resguardo = tecnologia.get('entregaResguardo', '')
            nueva_entrega.encuesta_satisfaccion = tecnologia.get('encuestaSatisfaccion', '')
        
        # Campos de procesos
        if 'procesos' in datos:
            procesos = datos['procesos']
            nueva_entrega.listado_reportes = procesos.get('listadoReportes', '')
            nueva_entrega.proceso_monitoreo_calidad = procesos.get('procesoMonitoreoCalidad', '')
        
        # Guardar en la base de datos
        db.add(nueva_entrega)
        db.commit()
        db.refresh(nueva_entrega)
        
        return nueva_entrega
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la entrega: {str(e)}"
        )


@router.get("/", response_model=List[EntregaResponse])
async def obtener_entregas(
    implementacion_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Obtener todas las entregas o filtrar por implementación
    """
    query = db.query(ProjectEntregaImplementaciones)
    
    if implementacion_id:
        query = query.filter(ProjectEntregaImplementaciones.implementacion_id == implementacion_id)
    
    entregas = query.all()
    return entregas


@router.get("/{entrega_id}", response_model=EntregaResponse)
async def obtener_entrega(entrega_id: int, db: Session = Depends(get_db)):
    """
    Obtener una entrega específica por ID
    """
    entrega = db.query(ProjectEntregaImplementaciones).filter(
        ProjectEntregaImplementaciones.id == entrega_id
    ).first()
    
    if not entrega:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega con ID {entrega_id} no encontrada"
        )
    
    return entrega


@router.put("/{entrega_id}", response_model=EntregaResponse)
async def actualizar_entrega(entrega_id: int, entrega: EntregaCreate, db: Session = Depends(get_db)):
    """
    Actualizar una entrega existente
    """
    try:
        # Buscar la entrega existente
        entrega_existente = db.query(ProjectEntregaImplementaciones).filter(
            ProjectEntregaImplementaciones.id == entrega_id
        ).first()
        
        if not entrega_existente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrega con ID {entrega_id} no encontrada"
            )
        
        # Verificar que la implementación existe
        implementacion = db.query(ProjectImplementacionesClienteImple).filter(
            ProjectImplementacionesClienteImple.id == entrega.implementacion_id
        ).first()
        
        if not implementacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Implementación con ID {entrega.implementacion_id} no encontrada"
            )
        
        # Actualizar los campos básicos
        entrega_existente.implementacion_id = entrega.implementacion_id
        if entrega.fecha_entrega:
            entrega_existente.fecha_entrega = datetime.fromisoformat(entrega.fecha_entrega)
        
        # Mapear los datos del formulario a los campos del modelo
        datos = entrega.datos_entrega
        
        # Campos contractuales
        if 'contractual' in datos:
            contractual = datos['contractual']
            entrega_existente.contrato = contractual.get('contrato', '')
            entrega_existente.acuerdo_niveles_servicio = contractual.get('acuerdoNivelesServicio', '')
            entrega_existente.polizas = contractual.get('polizas', '')
            entrega_existente.penalidades = contractual.get('penalidades', '')
            entrega_existente.alcance_servicio = contractual.get('alcanceServicio', '')
            entrega_existente.unidades_facturacion = contractual.get('unidadesFacturacion', '')
            entrega_existente.acuerdo_pago = contractual.get('acuerdoPago', '')
            entrega_existente.incremento = contractual.get('incremento', '')
        
        # Campos tecnológicos
        if 'tecnologia' in datos:
            tecnologia = datos['tecnologia']
            entrega_existente.mapa_aplicativos = tecnologia.get('mapaAplicativos', '')
            entrega_existente.internet = tecnologia.get('internet', '')
            entrega_existente.telefonia = tecnologia.get('telefonia', '')
            entrega_existente.whatsapp = tecnologia.get('whatsapp', '')
            entrega_existente.integraciones = tecnologia.get('integraciones', '')
            entrega_existente.vpn = tecnologia.get('vpn', '')
            entrega_existente.diseno_ivr = tecnologia.get('disenoIVR', '')
            entrega_existente.transferencia_llamadas = tecnologia.get('transferenciaLlamadas', '')
            entrega_existente.correos_electronicos = tecnologia.get('correosElectronicos', '')
            entrega_existente.linea_018000 = tecnologia.get('linea018000', '')
            entrega_existente.linea_entrada = tecnologia.get('lineaEntrada', '')
            entrega_existente.sms = tecnologia.get('sms', '')
            entrega_existente.requisitos_grabacion = tecnologia.get('requisitosGrabacion', '')
            entrega_existente.entrega_resguardo = tecnologia.get('entregaResguardo', '')
            entrega_existente.encuesta_satisfaccion = tecnologia.get('encuestaSatisfaccion', '')
        
        # Campos de procesos
        if 'procesos' in datos:
            procesos = datos['procesos']
            entrega_existente.listado_reportes = procesos.get('listadoReportes', '')
            entrega_existente.proceso_monitoreo_calidad = procesos.get('procesoMonitoreoCalidad', '')
        
        # Guardar cambios
        db.commit()
        db.refresh(entrega_existente)
        
        return entrega_existente
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la entrega: {str(e)}"
        )


@router.delete("/{entrega_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_entrega(entrega_id: int, db: Session = Depends(get_db)):
    """
    Eliminar una entrega
    """
    entrega = db.query(ProjectEntregaImplementaciones).filter(
        ProjectEntregaImplementaciones.id == entrega_id
    ).first()
    
    if not entrega:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrega con ID {entrega_id} no encontrada"
        )
    
    db.delete(entrega)
    db.commit()
    return None