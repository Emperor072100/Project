from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import enum


class TipoCampaña(str, enum.Enum):
    SAC = "SAC"
    TMC = "TMC"
    TVT = "TVT"
    CBZ = "CBZ"


class Campaña(Base):
    __tablename__ = "campañas_campañas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(Enum(TipoCampaña), nullable=False, default=TipoCampaña.SAC)
    cliente_corporativo_id = Column(
        Integer,
        ForeignKey("campañas_clientes_corporativos.id"),
        nullable=False
    )
    contacto_id = Column(
        Integer,
        ForeignKey("campañas_contacto.id"),
        nullable=False
    )
    lider_de_campaña = Column(String, nullable=False)
    ejecutivo = Column(String, nullable=False)
    fecha_de_produccion = Column(Date, nullable=False)  # Solo fecha, sin hora
    
    # Relaciones
    cliente_corporativo = relationship(
        "ClienteCorporativo",
        back_populates="campañas"
    )
    contacto = relationship("Cliente", back_populates="campañas")
    historial = relationship("HistorialCampaña", back_populates="campaña")
    productos = relationship("ProductoCampaña", back_populates="campaña")
    facturacion = relationship("FacturacionCampaña", back_populates="campaña")