from sqlalchemy import Column, Integer, String, ForeignKey
from core.database import Base

class ProjectImplementacionContractual(Base):
    __tablename__ = "project_implementacion_contractual"
    id = Column(Integer, primary_key=True, index=True)
    cliente_implementacion_id = Column(Integer, ForeignKey("project_implementaciones_clienteimple.id"), nullable=False)
    modelo_contrato_seguimiento = Column(String)
    modelo_contrato_estado = Column(String)
    modelo_contrato_responsable = Column(String)
    modelo_contrato_notas = Column(String)
    modelo_confidencialidad_seguimiento = Column(String)
    modelo_confidencialidad_estado = Column(String)
    modelo_confidencialidad_responsable = Column(String)
    modelo_confidencialidad_notas = Column(String)
    alcance_seguimiento = Column(String)
    alcance_estado = Column(String)
    alcance_responsable = Column(String)
    alcance_notas = Column(String)
    fecha_inicio_seguimiento = Column(String)
    fecha_inicio_estado = Column(String)
    fecha_inicio_responsable = Column(String)
    fecha_inicio_notas = Column(String)
