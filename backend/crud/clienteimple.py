from backend.models.project_implementaciones_clienteimple import ProjectImplementacionesClienteImple
from backend.core.database import SessionLocal

def create_clienteimple(cliente, proceso):
    db = SessionLocal()
    nueva = ProjectImplementacionesClienteImple(
        cliente_implementacion=cliente,
        proceso_implementacion=proceso
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    db.close()
    return nueva
