from core.database import get_db
from app.models.usuario import Usuario


def check_users():
    db = next(get_db())
    usuarios = db.query(Usuario).all()
    print("=== USUARIOS EN LA BASE DE DATOS ===")
    for user in usuarios:
        print(f"ID: {user.id}")
        print(f"Correo: {user.correo}")
        print(f'Nombre: "{user.nombre}"')
        print(f'Apellido: "{user.apellido}"')
        print(f'Nombre completo: "{user.nombre} {user.apellido}"')
        print("---")


if __name__ == "__main__":
    check_users()
