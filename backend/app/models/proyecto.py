from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
from app.models.tipo_equipo import proyecto_tipos, proyecto_equipos
from app.models.estado import Estado
from app.models.prioridad import Prioridad

class Proyecto(Base):

    __tablename__ = "project_proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    # estado = Column(String, nullable=True)  # Por ejemplo: "En Progreso", "Completado", etc.
    # prioridad = Column(String, nullable=True)  # Por ejemplo: "Alta", "Media", "Baja"
    objetivo = Column(Text, nullable=True)
    enlace = Column(String)
    observaciones = Column(Text)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    progreso = Column(Float)
    responsable_id = Column(Integer, ForeignKey("project_usuarios.id"), nullable=False)

    estado_id = Column(Integer, ForeignKey("project_estados.id"), nullable=False)
    prioridad_id = Column(Integer, ForeignKey("project_prioridades.id"), nullable=False)

    estado = relationship("Estado", back_populates="proyectos")
    prioridad = relationship("Prioridad", back_populates="proyectos")
    responsable = relationship("Usuario", back_populates="proyectos")

    tipos = relationship("Tipo", secondary=proyecto_tipos, back_populates="proyectos")
    equipos = relationship("Equipo", secondary=proyecto_equipos, back_populates="proyectos")
