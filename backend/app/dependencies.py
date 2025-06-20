from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from core.database import SessionLocal
from core.security import decodificar_token
from app.models.usuario import Usuario
from schemas.usuario import RolUsuario

# Esquema para obtener el token desde el encabezado Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Obtener al usuario actual desde el token JWT
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decodificar_token(token)
        user_id = int(payload.get("sub"))  # <- aquí el fix importante
        if not user_id:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise credentials_exception
    return user

# Verificar si el usuario es administrador
def solo_admin(user: Usuario = Depends(get_current_user)):
    if user.rol != RolUsuario.admin:
        raise HTTPException(status_code=403, detail="Solo administradores")
    return user
