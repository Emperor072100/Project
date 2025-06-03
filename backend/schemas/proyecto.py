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
    pass

class ProyectoUpdate(BaseModel):
    nombre: Optional[str]
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

class ProyectoOut(ProyectoBase):
    id: int
    responsable_id: int

    class Config:
        from_attributes = True
