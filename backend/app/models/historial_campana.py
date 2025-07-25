from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime

class HistorialCampaña(Base):
    __tablename__ = 'historial_campañas'

    id = Column(Integer, primary_key=True, index=True)
    campaña_id = Column(Integer, ForeignKey("campañas_campañas.id"), nullable=False)
    usuario_id = Column(Integer, nullable=True)  # Quien hizo el cambio
    accion = Column(String, nullable=False)  # "creada", "actualizada", "eliminada"
    cambios = Column(JSON, nullable=True)  # JSON con los campos que cambiaron
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    observaciones = Column(Text, nullable=True)

    # Relación con campaña
    campaña = relationship("Campaña", back_populates="historial")
