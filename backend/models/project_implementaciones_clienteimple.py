from sqlalchemy import Column, Integer, String
from core.database import Base

class ProjectImplementacionesClienteImple(Base):
    __tablename__ = "project_implementaciones_clienteimple"
    id = Column(Integer, primary_key=True, index=True)
    cliente_implementacion = Column(String, nullable=False)
    proceso_implementacion = Column(String, nullable=False)
