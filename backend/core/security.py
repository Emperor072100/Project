# from datetime import datetime, timedelta
# from jose import JWTError, jwt
# from passlib.context import CryptContext
# from fastapi import Depends, HTTPException
# from fastapi.security import OAuth2PasswordBearer
# from pydantic import BaseModel

# from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def verificar_password(plain_password, hashed_password):
#     return pwd_context.verify(plain_password, hashed_password)

# def hash_password(password):
#     return pwd_context.hash(password)

# class UserInDB(BaseModel):
#     id: int
#     nombre: str
#     correo: str
#     rol: str

# def crear_token_acceso(usuario, expires_delta: timedelta = None):
#     to_encode = {
#         "sub": str(usuario.id),
#         "nombre": usuario.nombre,
#         "correo": usuario.correo,
#         "rol": str(usuario.rol)
#     }
#     expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# def decodificar_token(token: str):
#     return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = payload.get("sub")
#         nombre = payload.get("nombre")
#         correo = payload.get("correo")
#         rol = payload.get("rol")

#         if not user_id or not nombre or not correo or not rol:
#             raise HTTPException(status_code=401, detail="Token inválido o incompleto")

#         return UserInDB(id=int(user_id), nombre=nombre, correo=correo, rol=rol)
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Token inválido")
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from core.database import get_db
from app.models.usuario import Usuario

# -------------------------
# Seguridad de contraseñas
# -------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password):
    return pwd_context.hash(password)


# -------------------------
# Modelo base del usuario para el token (ligero)
# -------------------------


class UserInDB(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    rol: str


# -------------------------
# Crear token de acceso
# -------------------------


def crear_token_acceso(usuario, expires_delta: timedelta = None):
    to_encode = {
        "sub": str(usuario.id),
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": str(usuario.rol),
        # puedes agregar más si quieres: "apellido": usuario.apellido, ...
    }
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# -------------------------
# Decodificar token
# -------------------------


def decodificar_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


# -------------------------
# OAuth2 esquema
# -------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# -------------------------
# Obtener usuario actual
# Puedes alternar: solo con token, o con base de datos.
# -------------------------


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Usuario:
    """
    Extrae el ID del token y busca al usuario completo en la base de datos.
    Si prefieres trabajar solo con los campos del token, puedes devolver UserInDB.
    """
    cred_excepcion = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decodificar_token(token)
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, AttributeError):
        raise cred_excepcion

    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if usuario is None:
        raise cred_excepcion

    return usuario


# Si prefieres usar solo el token (sin consultar la BD), puedes crear una función aparte:
def get_current_user_from_token(token: str = Depends(oauth2_scheme)) -> UserInDB:
    try:
        payload = decodificar_token(token)
        user_id = payload.get("sub")
        nombre = payload.get("nombre")
        correo = payload.get("correo")
        rol = payload.get("rol")

        if not user_id or not nombre or not correo or not rol:
            raise HTTPException(status_code=401, detail="Token inválido o incompleto")

        return UserInDB(id=int(user_id), nombre=nombre, correo=correo, rol=rol)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
