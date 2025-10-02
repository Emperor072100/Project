from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import enum


class TipoProducto(str, enum.Enum):
    PRODUCTO = "Producto"
    SERVICIO = "Servicio"


class PropiedadProducto(str, enum.Enum):
    PROPIA = "Propia"
    ALQUILADA = "Alquilada"


class ProductoCampaña(Base):
    __tablename__ = "project_productos_campanas"

    id = Column(Integer, primary_key=True, index=True)
    campaña_id = Column(Integer, ForeignKey("project_campanas_campanas.id"), nullable=False)
    tipo = Column(Enum(TipoProducto), nullable=False, default=TipoProducto.PRODUCTO)
    producto_servicio = Column(String, nullable=False)  # Nuevo campo: nombre específico del producto/servicio
    proveedor = Column(String, nullable=False)
    propiedad = Column(Enum(PropiedadProducto), nullable=False, default=PropiedadProducto.PROPIA)
    cantidad = Column(Integer, nullable=False, default=1)

    # Relación con campaña
    campaña = relationship("Campaña", back_populates="productos")
