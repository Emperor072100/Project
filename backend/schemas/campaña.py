from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.campana import TipoCampaña


class CampañaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tipo: TipoCampaña
    cje: Optional[str] = None
    lider: Optional[str] = None
    cliente_id: int
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    estado: Optional[str] = "Activa"
    presupuesto: Optional[str] = None
    observaciones: Optional[str] = None


class CampañaCreate(CampañaBase):
    pass


class CampañaUpdate(CampañaBase):
    nombre: Optional[str] = None
    cliente_id: Optional[int] = None
    tipo: Optional[TipoCampaña] = None


class CampañaOut(CampañaBase):
    id: int
    fecha_creacion: datetime
    cliente_nombre: Optional[str] = None  # Para mostrar el nombre del cliente en la tabla
    
    class Config:
        from_attributes = True
