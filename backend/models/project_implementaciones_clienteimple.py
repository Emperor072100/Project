from sqlalchemy import Column, Integer, String, JSON
from core.database import Base

class ProjectImplementacionesClienteImple(Base):
    __tablename__ = "project_implementaciones_clienteimple"
    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String, nullable=False)
    proceso = Column(String, nullable=False)
    estado = Column(String, nullable=True)
    # Columnas JSON que se pueden eliminar ya que no se usan
    contractual = Column(JSON, nullable=True)
    talento_humano = Column(JSON, nullable=True)
    procesos = Column(JSON, nullable=True)
    tecnologia = Column(JSON, nullable=True)
