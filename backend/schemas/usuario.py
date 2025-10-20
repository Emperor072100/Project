from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class RolUsuario(str, Enum):
    admin = "admin"
    usuario = "usuario"


class UsuarioBase(BaseModel):
    nombre: str
    correo: EmailStr
    rol: RolUsuario
    apellido: str


class UsuarioCreate(UsuarioBase):
    contraseña: str


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None
    rol: Optional[RolUsuario] = None
    contraseña: Optional[str] = None
    apellido: str


class UsuarioOut(UsuarioBase):
    id: int

    model_config = {"from_attributes": True}
