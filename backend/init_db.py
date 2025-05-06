import sys
from pathlib import Path

# Forzar a incluir el path backend/app en sys.path
BASE_DIR = Path(__file__).resolve().parent
APP_DIR = BASE_DIR / "app"
sys.path.insert(0, str(APP_DIR))

# Ahora importa sin usar "app."
from core.database import SessionLocal, engine, Base
from models import usuario, proyecto
from core.security import hash_password

Base.metadata.create_all(bind=engine)

def crear_usuario_admin():
    db = SessionLocal()
    try:
        admin_existente = db.query(usuario.Usuario).filter(usuario.Usuario.nombre == "admin").first()
        if not admin_existente:
            nuevo_admin = usuario.Usuario(
                nombre="admin",
                correo="admin@proyectos.com",
                hashed_password=hash_password("admin123"),
                rol=usuario.RolUsuario.admin
            )
            db.add(nuevo_admin)
            db.commit()
            print("✅ Usuario admin creado con éxito: admin / admin123")
        else:
            print("ℹ️ Ya existe un usuario admin.")
    finally:
        db.close()

if __name__ == "__main__":
    crear_usuario_admin()
