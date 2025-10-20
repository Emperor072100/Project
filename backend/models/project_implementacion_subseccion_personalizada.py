from sqlalchemy import Column, Integer, String, ForeignKey
from core.database import Base


class ProjectImplementacionSubseccionPersonalizada(Base):
    """
    Tabla para almacenar subsecciones personalizadas dinámicas que el usuario
    agrega mediante el botón 'Nueva subsesión' en el frontend.
    """

    __tablename__ = "project_implementacion_subseccion_personalizada"

    id = Column(Integer, primary_key=True, index=True)
    cliente_implementacion_id = Column(
        Integer, ForeignKey("project_implementaciones_clienteimple.id"), nullable=False
    )

    # Sección a la que pertenece (contractual, talento_humano, procesos, tecnologia)
    seccion = Column(String, nullable=False)

    # Nombre de la subsesión personalizada (key)
    nombre_subsesion = Column(String, nullable=False)

    # Campos del formulario
    seguimiento = Column(String)
    estado = Column(String)
    responsable = Column(String)
    notas = Column(String)
