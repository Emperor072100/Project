#!/usr/bin/env python3
"""Script simple para registrar usuario administrador."""
import os
import sys
from pathlib import Path

# Set encoding to avoid decode errors
os.environ['PGCLIENTENCODING'] = 'UTF8'

# Add backend to path
repo_backend = Path(__file__).resolve().parent.parent
if str(repo_backend) not in sys.path:
    sys.path.insert(0, str(repo_backend))

from core.database import SessionLocal
from core.security import hash_password, crear_token_acceso
from app.models.usuario import Usuario, RolUsuario

# Datos del usuario administrador
USER_DATA = {
    "nombre": "ALVARO",
    "correo": "admin@admin.com",
    "rol": "admin",
    "apellido": "VALENCIA",
    "contraseña": "admin"
}

def main():
    print("Registrando usuario administrador...")
    print(f"Nombre: {USER_DATA['nombre']} {USER_DATA['apellido']}")
    print(f"Correo: {USER_DATA['correo']}")
    print()
    
    db = SessionLocal()
    try:
        # Verificar si ya existe
        existing = db.query(Usuario).filter(
            (Usuario.correo == USER_DATA['correo']) | 
            (Usuario.nombre == USER_DATA['nombre'])
        ).first()
        
        if existing:
            print(f"✓ Usuario ya existe (ID: {existing.id})")
            print(f"  Nombre: {existing.nombre} {existing.apellido}")
            print(f"  Correo: {existing.correo}")
            print(f"  Rol: {existing.rol}")
            
            # Generar token
            token = crear_token_acceso(existing)
            print(f"\n✓ Token de acceso:\n{token}\n")
            return
        
        # Crear nuevo usuario
        hashed = hash_password(USER_DATA['contraseña'])
        rol_enum = RolUsuario(USER_DATA['rol'])
        
        usuario = Usuario(
            nombre=USER_DATA['nombre'],
            correo=USER_DATA['correo'],
            hashed_password=hashed,
            apellido=USER_DATA['apellido'],
            rol=rol_enum
        )
        
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
        print(f"✓ Usuario creado exitosamente!")
        print(f"  ID: {usuario.id}")
        print(f"  Nombre: {usuario.nombre} {usuario.apellido}")
        print(f"  Correo: {usuario.correo}")
        print(f"  Rol: {usuario.rol}")
        
        # Generar token
        token = crear_token_acceso(usuario)
        print(f"\n✓ Token de acceso (Bearer):\n{token}\n")
        
        print("\nCredenciales de inicio de sesión:")
        print(f"  Correo: {USER_DATA['correo']}")
        print(f"  Contraseña: {USER_DATA['contraseña']}")
        
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error: {type(e).__name__}")
        print(f"  {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
