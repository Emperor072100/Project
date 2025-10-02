from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..core.database import Base
import enum
from datetime import datetime

class TipoCampañaEnum(str, enum.Enum):
    SAC = "SAC"
    TMC = "TMC"
    TVT = "TVT"
    CBZ = "CBZ"

class Campaña(Base):
    __tablename__ = "project_campanias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(Enum(TipoCampañaEnum), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    lider = Column(String, nullable=False)
    cje = Column(String, nullable=False)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    estado = Column(String, nullable=True)
    presupuesto = Column(Float, nullable=True)
    descripcion = Column(String, nullable=True)
    observaciones = Column(String, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    cliente = relationship("Cliente", back_populates="campañas")
    # ...otros campos y relaciones...
