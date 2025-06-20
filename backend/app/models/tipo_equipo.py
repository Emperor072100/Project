from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

# Tabla de relación muchos a muchos para Proyecto-Tipo
proyecto_tipo = Table(
    "proyecto_tipo",
    Base.metadata,
    Column("proyecto_id", Integer, ForeignKey("proyectos.id"), primary_key=True),
    Column("tipo_id", Integer, ForeignKey("tipos.id"), primary_key=True),
)

# Tabla de relación muchos a muchos para Proyecto-Equipo
proyecto_equipo = Table(
    "proyecto_equipo",
    Base.metadata,
    Column("proyecto_id", Integer, ForeignKey("proyectos.id"), primary_key=True),
    Column("equipo_id", Integer, ForeignKey("equipos.id"), primary_key=True),
)

# Modelo para Tipo
class Tipo(Base):
    __tablename__ = "tipos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    
    # Relación con proyectos
    proyectos = relationship("Proyecto", secondary=proyecto_tipo, back_populates="tipos")

# Modelo para Equipo
class Equipo(Base):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    
    # Relación con proyectos
    proyectos = relationship("Proyecto", secondary=proyecto_equipo, back_populates="equipos")