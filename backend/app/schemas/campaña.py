from pydantic import BaseModel
from typing import Optional

class CampañaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tipo: str

class CampañaCreate(CampañaBase):
    cliente_id: int
    cje: Optional[str] = None
    lider: Optional[str] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    estado: Optional[str] = None
    presupuesto: Optional[str] = None
    observaciones: Optional[str] = None

class CampañaUpdate(CampañaBase):
    cliente_id: Optional[int] = None
    cje: Optional[str] = None
    lider: Optional[str] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    estado: Optional[str] = None
    presupuesto: Optional[str] = None
    observaciones: Optional[str] = None

class CampañaOut(CampañaBase):
    id: int
    cliente_nombre: Optional[str] = None
    cje: Optional[str] = None
    lider: Optional[str] = None
    class Config:
        from_attributes = True

class TipoCampañaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class TipoCampañaCreate(TipoCampañaBase):
    pass

class TipoCampañaUpdate(TipoCampañaBase):
    pass

class TipoCampañaOut(TipoCampañaBase):
    id: int
    class Config:
        from_attributes = True
