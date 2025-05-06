from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import date
from core.config import DATABASE_URL


class RolUsuario(str, Enum):
    admin = "admin"
    usuario = "usuario"

class UsuarioBase(BaseModel):
    nombre: str
    correo: EmailStr
    rol: RolUsuario

class UsuarioCreate(UsuarioBase):
    contraseña: str

class UsuarioOut(UsuarioBase):
    id: int

    class Config:
        from_attributes = True
