from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True)
    nombre = Column(String)
    descripcion = Column(String)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))

