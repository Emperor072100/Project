from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.campana import TipoCampaña, EstadoCampaña


class CampañaBase(BaseModel):
    nombre: str
    tipo: TipoCampaña
    cliente_corporativo_id: int
    contacto_id: int
    lider_de_campaña: str
    ejecutivo: str
    fecha_de_produccion: date  # Solo fecha, sin hora
    estado: EstadoCampaña = EstadoCampaña.ACTIVO


class CampañaCreate(CampañaBase):
    pass


class CampañaUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[TipoCampaña] = None
    cliente_corporativo_id: Optional[int] = None
    contacto_id: Optional[int] = None
    lider_de_campaña: Optional[str] = None
    ejecutivo: Optional[str] = None
    fecha_de_produccion: Optional[date] = None
    estado: Optional[EstadoCampaña] = None


class CampañaOut(CampañaBase):
    id: int
    
    class Config:
        from_attributes = True
