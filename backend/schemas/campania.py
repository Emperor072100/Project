# Migración de campaña.py a campania.py sin 'ñ'
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CampañaBase(BaseModel):
    nombre: str
    tipo: str
    cliente_id: int
    lider: str
    cje: str
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    estado: Optional[str] = None
    presupuesto: Optional[float] = None
    descripcion: Optional[str] = None
    observaciones: Optional[str] = None


class CampañaCreate(CampañaBase):
    pass


class CampañaUpdate(CampañaBase):
    pass


class Campaña(CampañaBase):
    id: int
    cliente_nombre: Optional[str] = None
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
