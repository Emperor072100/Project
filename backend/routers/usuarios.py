from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.models.usuario import Usuario
from app.dependencies import get_db, solo_admin, get_current_user
from core.security import hash_password

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioOut)
def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    try:
        print(f"🔍 Datos recibidos: {usuario}")
        
        # Verificar si el usuario ya existe
        existente = db.query(Usuario).filter(
            (Usuario.nombre == usuario.nombre) | (Usuario.correo == usuario.correo)
        ).first()
        
        if existente:
            print("❌ Usuario ya existe")
            raise HTTPException(status_code=400, detail="Nombre o correo ya en uso")

        print("🔑 Hasheando contraseña...")
        hashed_password = hash_password(usuario.contraseña)
        print("✅ Contraseña hasheada exitosamente")
        
        print("📝 Creando usuario...")
        nuevo_usuario = Usuario(
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            correo=usuario.correo,
            hashed_password=hashed_password,
            rol=usuario.rol
        )
        
        print("💾 Guardando en base de datos...")
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        
        print("✅ Usuario creado exitosamente")
        return nuevo_usuario
        
    except HTTPException as http_exc:
        print(f"❌ HTTPException: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print(f"🔥 ERROR inesperado: {str(e)}")
        print(f"🔥 Tipo de error: {type(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/", response_model=List[UsuarioOut])
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