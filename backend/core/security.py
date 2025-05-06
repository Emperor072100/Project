from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Para hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

# Clase auxiliar para retornar al usuario autenticado
class UserInDB(BaseModel):
    id: int
    nombre: str
    correo: str
    rol: str

# Crear token JWT con payload detallado
def crear_token_acceso(usuario, expires_delta: timedelta = None):
    to_encode = {
        "sub": str(usuario.id),
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": usuario.rol
    }
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Decodificar token manualmente
def decodificar_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# Autenticación desde token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        nombre = payload.get("nombre")
        correo = payload.get("correo")
        rol = payload.get("rol")

        if not user_id or not nombre or not correo or not rol:
            raise HTTPException(status_code=401, detail="Token inválido o incompleto")

        return UserInDB(
            id=int(user_id),
            nombre=nombre,
            correo=correo,
            rol=rol
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
