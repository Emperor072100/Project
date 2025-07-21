from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import enum

class TipoCampaña(str, enum.Enum):
    SAC = "SAC"
    TMG = "TMG"
    CBI = "CBI"
    OTRO = "OTRO"

class Campaña(Base):
    __tablename__ = "campañas_campañas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    tipo = Column(Enum(TipoCampaña), nullable=False, default=TipoCampaña.OTRO)
    cje = Column(String, nullable=True)  # Campo CJE del diseño
    lider = Column(String, nullable=True)  # Líder de la campaña
    cliente_id = Column(Integer, ForeignKey("campañas_clientes.id"), nullable=False)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    estado = Column(String, default="Activa")  # Activa, Pausada, Finalizada
    presupuesto = Column(String, nullable=True)
    observaciones = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Relación con cliente
    cliente = relationship("Cliente", back_populates="campañas")
