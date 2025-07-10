import sys
from pathlib import Path

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent.parent))

# Now import without using "app."
from core.database import SessionLocal, engine, Base
from app.models import usuario, proyecto, tipo_equipo
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
