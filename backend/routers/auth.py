
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from core.database import get_db
from core.security import verificar_password, crear_token_acceso
from app.models.usuario import Usuario
import logging
from core.security import get_current_user, UserInDB
router = APIRouter(prefix="/auth", tags=["Autenticación"])
from schemas.usuario import UsuarioOut 

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Intento de login para: {form_data.username}")
    usuario = db.query(Usuario).filter(Usuario.correo == form_data.username).first()
    
    if not usuario:
        logger.warning(f"Usuario no encontrado: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"Usuario encontrado: {usuario.correo}, Rol: {usuario.rol}")
    logger.info(f"Hashed Pwd DB: {usuario.hashed_password}")

    if not verificar_password(form_data.password, usuario.hashed_password):
        logger.warning(f"Contraseña incorrecta para: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"Login exitoso para: {usuario.correo}")
    access_token = crear_token_acceso(usuario)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "rol": usuario.rol
        }
    }
@router.get("/me", response_model=UsuarioOut)
def leer_usuario_actual(usuario: UserInDB = Depends(get_current_user)):
    print("📥 Usuario recibido:", usuario)
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "rol": usuario.rol
    }

