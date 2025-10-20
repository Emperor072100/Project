from pydantic import BaseModel
from typing import Optional
from datetime import date


class TareaBase(BaseModel):
    descripcion: str


class TareaCreate(TareaBase):
    proyecto_id: int


class TareaUpdate(BaseModel):
    descripcion: Optional[str]


class TareaOut(TareaBase):
    id: int
    proyecto_id: int

    class Config:
        from_attributes = True
