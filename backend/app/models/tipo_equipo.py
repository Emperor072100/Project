from sqlalchemy import Table, Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from core.database import Base  # Asegúrate de que esta importación sea consistente

# =============================================
# Tablas de asociación (many-to-many)
# =============================================

proyecto_equipos = Table(
    "proyecto_equipos",
    Base.metadata,
    Column(
        "proyecto_id", Integer, ForeignKey("project_proyectos.id"), primary_key=True
    ),
    Column("equipo_id", Integer, ForeignKey("project_equipos.id"), primary_key=True),
    extend_existing=True,
)

proyecto_tipos = Table(
    "proyecto_tipos",
    Base.metadata,
    Column(
        "proyecto_id", Integer, ForeignKey("project_proyectos.id"), primary_key=True
    ),
    Column("tipo_id", Integer, ForeignKey("project_tipos.id"), primary_key=True),
    extend_existing=True,
)


# =============================================
# Modelos de base de datos
# =============================================


class Equipo(Base):
    __tablename__ = "project_equipos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)

    proyectos = relationship(
        "Proyecto", secondary=proyecto_equipos, back_populates="equipos"
    )


class Tipo(Base):
    __tablename__ = "project_tipos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)

    proyectos = relationship(
        "Proyecto", secondary=proyecto_tipos, back_populates="tipos"
    )
