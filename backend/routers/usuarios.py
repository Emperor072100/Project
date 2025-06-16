from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.models.usuario import Usuario
from app.dependencies import get_db, solo_admin, get_current_user
from core.security import hash_password

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioOut)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db), current_user = Depends(solo_admin)):
    existente = db.query(Usuario).filter(
        (Usuario.nombre == usuario.nombre) | (Usuario.correo == usuario.correo)
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Nombre o correo ya en uso")
    
    hashed_password = hash_password(usuario.contraseña)
    nuevo_usuario = Usuario(
    nombre=usuario.nombre, 
    apellido=usuario.apellido,     # ← AÑADIR
    correo=usuario.correo,
    hashed_password=hashed_password,
    rol=usuario.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.get("", response_model=List[UsuarioOut])
def listar_usuarios(nombre: Optional[str] = Query(None), db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    query = db.query(Usuario)
    if nombre:
        query = query.filter(Usuario.nombre.ilike(f"%{nombre}%"))
    return query.all()

@router.get("/{usuario_id}", response_model=UsuarioOut)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.put("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(usuario_id: int, usuario_update: UsuarioUpdate, db: Session = Depends(get_db), current_user = Depends(solo_admin)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario_update.nombre: usuario.nombre = usuario_update.nombre
    if usuario_update.correo: usuario.correo = usuario_update.correo
    if usuario_update.rol: usuario.rol = usuario_update.rol
    if usuario_update.apellido: usuario.apellido = usuario_update.apellido
    if usuario_update.contraseña: usuario.hashed_password = hash_password(usuario_update.contraseña)

    db.commit()
    db.refresh(usuario)
    return usuario

@router.delete("/{usuario_id}", status_code=204)
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db), current_user = Depends(solo_admin)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
