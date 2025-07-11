from pydantic import BaseModel, EmailStr

class Usuario(BaseModel):
    email: EmailStr

# Prueba simple
try:
    usuario = Usuario(email="correo@dominio.com")
    print("✅ Validación exitosa:", usuario)
except Exception as e:
    print("❌ Error:", e)
