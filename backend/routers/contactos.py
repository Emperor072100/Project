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
    """Listar todos los contactos con información del cliente corporativo"""
    contactos = db.query(Cliente).options(joinedload(Cliente.cliente_corporativo)).all()
    return contactos


@router.get("/{contacto_id}", response_model=ClienteOut)
def obtener_contacto(
    contacto_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Obtener un contacto específico"""
    contacto = (
        db.query(Cliente)
        .options(joinedload(Cliente.cliente_corporativo))
        .filter(Cliente.id == contacto_id)
        .first()
    )
    if not contacto:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    return contacto


@router.put("/{contacto_id}", response_model=ClienteOut)
def actualizar_contacto(
    contacto_id: int,
    contacto_update: ClienteUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Actualizar un contacto existente"""
    contacto = db.query(Cliente).filter(Cliente.id == contacto_id).first()
    if not contacto:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")

    # Verificar cliente corporativo si se está actualizando
    if contacto_update.cliente_corporativo_id is not None:
        cliente_corp = (
            db.query(ClienteCorporativo)
            .filter(ClienteCorporativo.id == contacto_update.cliente_corporativo_id)
            .first()
        )
        if not cliente_corp:
            raise HTTPException(
                status_code=404, detail="Cliente corporativo no encontrado"
            )

    # Actualizar campos
    update_data = contacto_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contacto, field, value)

    db.commit()
    db.refresh(contacto)
    return contacto


@router.delete("/{contacto_id}")
def eliminar_contacto(
    contacto_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Eliminar un contacto"""
    contacto = db.query(Cliente).filter(Cliente.id == contacto_id).first()
    if not contacto:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")

    db.delete(contacto)
    db.commit()
    return {"message": "Contacto eliminado exitosamente"}


@router.get(
    "/por-cliente-corporativo/{cliente_corp_id}", response_model=List[ClienteOut]
)
def obtener_contactos_por_cliente_corporativo(
    cliente_corp_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Obtener todos los contactos de un cliente corporativo específico"""
    contactos = (
        db.query(Cliente)
        .filter(Cliente.cliente_corporativo_id == cliente_corp_id)
        .all()
    )
    return contactos
