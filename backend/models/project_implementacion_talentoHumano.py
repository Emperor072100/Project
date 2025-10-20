from sqlalchemy import Column, Integer, String, ForeignKey
from core.database import Base


class ProjectImplementacionTalentoHumano(Base):
    __tablename__ = "project_implementacion_talentoHumano"
    id = Column(Integer, primary_key=True, index=True)
    cliente_implementacion_id = Column(
        Integer, ForeignKey("project_implementaciones_clienteimple.id"), nullable=False
    )
    perfil_personal_seguimiento = Column(String)
    perfil_personal_estado = Column(String)
    perfil_personal_responsable = Column(String)
    perfil_personal_notas = Column(String)
    cantidad_asesores_seguimiento = Column(String)
    cantidad_asesores_estado = Column(String)
    cantidad_asesores_responsable = Column(String)
    cantidad_asesores_notas = Column(String)
    horarios_seguimiento = Column(String)
    horarios_estado = Column(String)
    horarios_responsable = Column(String)
    horarios_notas = Column(String)
    formador_seguimiento = Column(String)
    formador_estado = Column(String)
    formador_responsable = Column(String)
    formador_notas = Column(String)
    capacitaciones_andes_seguimiento = Column(String)
    capacitaciones_andes_estado = Column(String)
    capacitaciones_andes_responsable = Column(String)
    capacitaciones_andes_notas = Column(String)
    capacitaciones_cliente_seguimiento = Column(String)
    capacitaciones_cliente_estado = Column(String)
    capacitaciones_cliente_responsable = Column(String)
    capacitaciones_cliente_notas = Column(String)
