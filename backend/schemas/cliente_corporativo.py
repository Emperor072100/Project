from pydantic import BaseModel
from typing import Optional


class ClienteCorporativoBase(BaseModel):
    nombre: str
    logo: Optional[str] = None
    sector: str


class ClienteCorporativoCreate(ClienteCorporativoBase):
    pass


class ClienteCorporativoUpdate(BaseModel):
    nombre: Optional[str] = None
    logo: Optional[str] = None
    sector: Optional[str] = None


class ClienteCorporativo(ClienteCorporativoBase):
    id: int

    class Config:
        from_attributes = True
