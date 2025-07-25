from pydantic import BaseModel
from typing import Optional


class ClienteBase(BaseModel):
    nombre: str
    telefono: str
    correo: str
    cliente_corporativo_id: int


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    cliente_corporativo_id: Optional[int] = None


class ClienteOut(ClienteBase):
    id: int
    
    class Config:
        from_attributes = True
