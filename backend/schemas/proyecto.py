# proyecto.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class ProyectoBase(BaseModel):
    nombre: str
    tipo: Optional[List[str]] = []
    equipo: Optional[List[str]] = []
    estado: Optional[str]
    prioridad: Optional[str]
    objetivo: Optional[str]
    enlace: Optional[str]
    observaciones: Optional[str]
    fecha_inicio: Optional[date]
    fecha_fin: Optional[date]
    progreso: Optional[float]

class ProyectoCreate(ProyectoBase):
    responsable_id: Optional[int] = None

class ProyectoUpdate(BaseModel):
    nombre: Optional[str]
    tipo: Optional[List[str]] = []
    equipo: Optional[List[str]] = []
    responsable_nombre: Optional[str] = None
    estado: Optional[str]
    prioridad: Optional[str]
    objetivo: Optional[str]
    enlace: Optional[str]
    observaciones: Optional[str]
    fecha_inicio: Optional[date]
    fecha_fin: Optional[date]
    progreso: Optional[float]

class ProyectoOut(ProyectoBase):
    id: int
    responsable_id: int
    responsable_nombre: str = None

    class Config:
        from_attributes = True
