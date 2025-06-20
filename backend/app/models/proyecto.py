from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from core.database import Base


class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    # Eliminar esta línea
    # responsable = relationship("Usuario", backref="proyectos")
    
    # Mantener solo esta
    responsable = relationship("Usuario", back_populates="proyectos")
    estado = Column(String)
    prioridad = Column(String)
    objetivo = Column(Text)
    enlace = Column(String)
    observaciones = Column(Text)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    progreso = Column(Float)
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))

    responsable = relationship("Usuario", back_populates="proyectos")
    tareas = relationship("Tarea", back_populates="proyecto", cascade="all, delete-orphan")