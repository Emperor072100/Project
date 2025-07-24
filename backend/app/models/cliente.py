from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime

class Cliente(Base):
    __tablename__ = "campañas_clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    empresa = Column(String, nullable=True)
    correo = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    direccion = Column(Text, nullable=True)
    contacto_principal = Column(String, nullable=True)
    observaciones = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    campañas = relationship("Campaña", back_populates="cliente")
