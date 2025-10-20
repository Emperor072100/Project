# proyecto.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from schemas.estado import EstadoOut
from schemas.prioridad import PrioridadOut
from schemas.usuario import UsuarioOut


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
    equipos: Optional[List[int]] = []  # Para IDs de equipos


class ProyectoUpdate(BaseModel):
    nombre: Optional[str] = None
    tipos: Optional[List[str]] = None  # Cambiado para usar nombres directamente
    equipos: Optional[List[str]] = None  # Cambiado para usar nombres directamente
    responsable_nombre: Optional[str] = None
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    objetivo: Optional[str] = None
    enlace: Optional[str] = None
    observaciones: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    progreso: Optional[float] = None


class ProyectoPatch(BaseModel):
    """Schema específico para operaciones PATCH - todos los campos son opcionales"""

    nombre: Optional[str] = None
    tipos: Optional[List[str]] = None
    equipos: Optional[List[str]] = None
    responsable_nombre: Optional[str] = None
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    objetivo: Optional[str] = None
    enlace: Optional[str] = None
    observaciones: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    progreso: Optional[float] = None


class TipoOut(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class EquipoOut(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class ProyectoOut(BaseModel):
    id: int
    nombre: str
    objetivo: Optional[str]
    enlace: Optional[str]
    observaciones: Optional[str]
    fecha_inicio: Optional[date]
    fecha_fin: Optional[date]
    progreso: Optional[float]
    responsable_id: int
    responsable_nombre: Optional[str] = None

    estado: EstadoOut
    prioridad: PrioridadOut
    tipos: List[TipoOut]
    equipos: List[EquipoOut]

    class Config:
        from_attributes = True
