from core.database import get_db
from app.models.usuario import Usuario

def fix_user():
    db = next(get_db())
    user = db.query(Usuario).filter(Usuario.id == 1).first()
    if user:
        user.nombre = 'Administrador'
        user.apellido = 'Sistema'
        db.commit()
        print('Usuario actualizado correctamente:')
        print(f'Nombre: {user.nombre}')
        print(f'Apellido: {user.apellido}')
        print(f'Nombre completo: {user.nombre} {user.apellido}')
    else:
        print('Usuario no encontrado')

if __name__ == "__main__":
    fix_user()
