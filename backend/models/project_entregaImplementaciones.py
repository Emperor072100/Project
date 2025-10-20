from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class ProjectEntregaImplementaciones(Base):
    __tablename__ = "project_entregaImplementaciones"

    id = Column(Integer, primary_key=True, index=True)
    implementacion_id = Column(
        Integer, ForeignKey("project_implementaciones_clienteimple.id"), nullable=False
    )
    fecha_entrega = Column(DateTime, nullable=False, default=func.now())

    # Campos contractuales
    contrato = Column(Text, nullable=True)
    acuerdo_niveles_servicio = Column(Text, nullable=True)
    polizas = Column(Text, nullable=True)
    penalidades = Column(Text, nullable=True)
    alcance_servicio = Column(Text, nullable=True)
    unidades_facturacion = Column(Text, nullable=True)
    acuerdo_pago = Column(Text, nullable=True)
    incremento = Column(Text, nullable=True)

    # Campos tecnológicos
    mapa_aplicativos = Column(Text, nullable=True)
    internet = Column(Text, nullable=True)
    telefonia = Column(Text, nullable=True)
    whatsapp = Column(Text, nullable=True)
    integraciones = Column(Text, nullable=True)
    vpn = Column(Text, nullable=True)
    diseno_ivr = Column(Text, nullable=True)
    transferencia_llamadas = Column(Text, nullable=True)
    correos_electronicos = Column(Text, nullable=True)
    linea_018000 = Column(Text, nullable=True)
    linea_entrada = Column(Text, nullable=True)
    sms = Column(Text, nullable=True)
    requisitos_grabacion = Column(Text, nullable=True)
    entrega_resguardo = Column(Text, nullable=True)
    encuesta_satisfaccion = Column(Text, nullable=True)

    # Campos de procesos
    listado_reportes = Column(Text, nullable=True)
    proceso_monitoreo_calidad = Column(Text, nullable=True)

    # Metadatos
    estado_entrega = Column(String(50), nullable=False, default="Completada")

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(
        DateTime, nullable=False, default=func.now(), onupdate=func.now()
    )

    # Relación con la implementación
    implementacion = relationship(
        "ProjectImplementacionesClienteImple", back_populates="entregas"
    )
