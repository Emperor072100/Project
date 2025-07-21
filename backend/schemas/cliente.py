from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ClienteBase(BaseModel):
    nombre: str
    empresa: Optional[str] = None
    correo: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    contacto_principal: Optional[str] = None
    observaciones: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(ClienteBase):
    nombre: Optional[str] = None


class ClienteOut(ClienteBase):
    id: int
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
