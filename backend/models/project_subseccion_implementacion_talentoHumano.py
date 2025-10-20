from sqlalchemy import Column, Integer, String, ForeignKey
from core.database import Base


class ProjectSubseccionImplementacionTalentoHumano(Base):
    """
    Tabla para almacenar subsecciones personalizadas dinámicas de Talento Humano
    que el usuario agrega mediante el botón 'Nueva subsesión' en el frontend.
    """

    __tablename__ = "project_subseccion_implementacion_talento_humano"

    id = Column(Integer, primary_key=True, index=True)
    cliente_implementacion_id = Column(
        Integer, ForeignKey("project_implementaciones_clienteimple.id"), nullable=False
    )

    # Sección a la que pertenece
    seccion = Column(String(50), default="talento_humano", nullable=False)

    # Nombre de la subsesción personalizada (key)
    nombre_subsesion = Column(String, nullable=False)

    # Campos del formulario
    seguimiento = Column(String)
    estado = Column(String)
    responsable = Column(String)
    notas = Column(String)
