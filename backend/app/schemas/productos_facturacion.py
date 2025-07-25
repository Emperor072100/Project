from pydantic import BaseModel
from typing import Optional


class ProductoCampañaBase(BaseModel):
    tipo: str
    producto_servicio: str  # Nuevo campo
    proveedor: str
    propiedad: str
    cantidad: int


class ProductoCampañaCreate(ProductoCampañaBase):
    campaña_id: int


class ProductoCampaña(ProductoCampañaBase):
    id: int
    campaña_id: int

    class Config:
        from_attributes = True


class FacturacionCampañaBase(BaseModel):
    unidad: str
    cantidad: int
    valor: float
    periodicidad: str  # Nuevo campo


class FacturacionCampañaCreate(FacturacionCampañaBase):
    campaña_id: int


class FacturacionCampaña(FacturacionCampañaBase):
    id: int
    campaña_id: int

    class Config:
        from_attributes = True
