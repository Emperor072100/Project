from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from app.models.tipo_equipo import proyecto_tipo, proyecto_equipo


class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
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
    
    # Relaciones muchos a muchos
    tipos = relationship("Tipo", secondary=proyecto_tipo, back_populates="proyectos")
    equipos = relationship("Equipo", secondary=proyecto_equipo, back_populates="proyectos")