from pydantic import BaseModel
from typing import List, Optional

# Association schemas
class ProyectoTipoBase(BaseModel):
    proyecto_id: int
    tipo_id: int

class ProyectoTipoCreate(ProyectoTipoBase):
    pass

class ProyectoTipo(ProyectoTipoBase):
    class Config:
        orm_mode = True

class ProyectoEquipoBase(BaseModel):
    proyecto_id: int
    equipo_id: int

class ProyectoEquipoCreate(ProyectoEquipoBase):
    pass

class ProyectoEquipo(ProyectoEquipoBase):
    class Config:
        orm_mode = True

# Related entity schemas
class TipoBase(BaseModel):
    nombre: str

class TipoCreate(TipoBase):
    pass

class Tipo(TipoBase):
    id: int
    class Config:
        orm_mode = True

class EquipoBase(BaseModel):
    nombre: str

class EquipoCreate(EquipoBase):
    pass

class Equipo(EquipoBase):
    id: int
    class Config:
        orm_mode = True