from sqlalchemy import (
    Column, Integer, String, JSON, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class ProjectEntregaImplementaciones(Base):
    __tablename__ = "project_entregaImplementaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    implementacion_id = Column(
        Integer,
        ForeignKey('project_implementaciones_clienteimple.id'),
        nullable=False
    )
    fecha_entrega = Column(DateTime, nullable=False, default=func.now())
    
    # Datos estructurados de la entrega (JSON completo del formulario)
    # Contiene: contractual, tecnologia, procesos
    datos_entrega = Column(JSON, nullable=True)
    
    # Metadatos
    responsable_entrega = Column(String(255), nullable=True)
    estado_entrega = Column(
        String(50), nullable=False, default='Completada'
    )
    notas_adicionales = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(
        DateTime,
        nullable=False,
        default=func.now(),
        onupdate=func.now()
    )
    
    # Relación con la implementación
    implementacion = relationship(
        "ProjectImplementacionesClienteImple",
        back_populates="entregas"
    )
