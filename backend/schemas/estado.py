# schemas/estado.py
from pydantic import BaseModel
from typing import Optional


class EstadoBase(BaseModel):
    nombre: str
    categoria: str | None = None


class EstadoCreate(EstadoBase):
    pass


class EstadoOut(EstadoBase):
    id: int

    class Config:
        from_attributes = True  # Para que Pydantic lea de los modelos ORM
