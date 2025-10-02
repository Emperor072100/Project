from sqlalchemy import Column, Integer, String, JSON
from core.database import Base

class ProjectImplementacionesClienteImple(Base):
    __tablename__ = "project_implementaciones_clienteimple"
    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String, nullable=False)
    proceso = Column(String, nullable=False)
    estado = Column(String, nullable=True)
