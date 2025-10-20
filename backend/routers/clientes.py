from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from schemas.cliente import ClienteCreate, ClienteUpdate, ClienteOut
from app.models.cliente import Cliente
from app.models.cliente_corporativo import ClienteCorporativo
from app.dependencies import get_db
from core.security import get_current_user, UserInDB

router = APIRouter(prefix="/contactos", tags=["Contactos"])


@router.post("/", response_model=ClienteOut)
def crear_contacto(
    contacto: ClienteCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Crear un nuevo contacto"""
    # Verificar que el cliente corporativo existe
    cliente_corp = (
        db.query(ClienteCorporativo)
        .filter(ClienteCorporativo.id == contacto.cliente_corporativo_id)
        .first()
    )
    if not cliente_corp:
        raise HTTPException(status_code=404, detail="Cliente corporativo no encontrado")

    nuevo_contacto = Cliente(**contacto.dict())
    db.add(nuevo_contacto)
    db.commit()
    db.refresh(nuevo_contacto)
    return nuevo_contacto


@router.get("/", response_model=List[ClienteOut])
def listar_contactos(
    db: Session = Depends(get_db), usuario: UserInDB = Depends(get_current_user)
):
    """Listar todos los clientes"""
    return db.query(Cliente).all()


@router.get("/{cliente_id}", response_model=ClienteOut)
def obtener_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Obtener un cliente específico"""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.put("/{cliente_id}", response_model=ClienteOut)
def actualizar_cliente(
    cliente_id: int,
    cliente: ClienteUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Actualizar un cliente"""
    cliente_db = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    for campo, valor in cliente.dict(exclude_unset=True).items():
        setattr(cliente_db, campo, valor)

    db.commit()
    db.refresh(cliente_db)
    return cliente_db


@router.delete("/{cliente_id}")
def eliminar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Eliminar un cliente"""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    db.delete(cliente)
    db.commit()
    return {"message": "Cliente eliminado exitosamente"}
