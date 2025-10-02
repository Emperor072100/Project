from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from core.database import Base


class FacturacionCampaña(Base):
    __tablename__ = "project_facturacion_campanas"

    id = Column(Integer, primary_key=True, index=True)
    campaña_id = Column(Integer, ForeignKey("project_campanas_campanas.id"), nullable=False)
    unidad = Column(String, nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    valor = Column(Float, nullable=False)
    periodicidad = Column(String, nullable=False)  # Nuevo campo: periodicidad de facturación

    # Relación con campaña
    campaña = relationship("Campaña", back_populates="facturacion")
