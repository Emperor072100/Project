from pydantic import BaseModel
from typing import Optional
from datetime import date

class TareaBase(BaseModel):
    descripcion: str
    completado: Optional[bool] = False

class TareaCreate(TareaBase):
    proyecto_id: int  # ✅ agregado

class TareaUpdate(BaseModel):
    descripcion: Optional[str]
    completado: Optional[bool]

class TareaOut(TareaBase):
    id: int
    proyecto_id: int

    class Config:
        from_attributes = True
