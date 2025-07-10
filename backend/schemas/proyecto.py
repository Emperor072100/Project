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

    
class ProyectoCreate(BaseModel):
    nombre: str
    responsable_id: int
    estado_id: int
    prioridad_id: int
    objetivo: Optional[str] = None
    enlace: Optional[str] = None
    observaciones: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    progreso: Optional[float] = 0.0
    tipos: Optional[List[int]] = []  # Para IDs de tipos
    equipos: Optional[List[int]] = [] # Para IDs de equipos

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
    tipos: List[str] = []
    equipos: List[str] = []

    class Config:
        from_attributes = True
