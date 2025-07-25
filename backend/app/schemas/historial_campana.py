from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class HistorialBase(BaseModel):
    campaña_id: int
    usuario_id: Optional[int] = None
    accion: str
    cambios: Optional[Dict[str, Any]] = None
    observaciones: Optional[str] = None

class HistorialCreate(HistorialBase):
    pass

class HistorialOut(HistorialBase):
    id: int
    fecha: datetime

    class Config:
        from_attributes = True
