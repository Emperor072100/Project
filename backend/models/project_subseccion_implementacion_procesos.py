from sqlalchemy import Column, Integer, String, Text, ForeignKey
from core.database import Base


class ProjectSubseccionImplementacionProcesos(Base):
    __tablename__ = "project_subseccion_implementacion_procesos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_implementacion_id = Column(
        Integer,
        ForeignKey("project_implementaciones_clienteimple.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    seccion = Column(String(50), default="procesos", nullable=False)
    nombre_subsesion = Column(String(255), nullable=False)
    seguimiento = Column(Text)
    estado = Column(String(100))
    responsable = Column(String(255))
    notas = Column(Text)
