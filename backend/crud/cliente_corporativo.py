from sqlalchemy.orm import Session
from app.models.cliente_corporativo import ClienteCorporativo
from schemas.cliente_corporativo import (
    ClienteCorporativoCreate,
    ClienteCorporativoUpdate
)
from typing import List, Optional


def get_cliente_corporativo(
    db: Session,
    cliente_id: int
) -> Optional[ClienteCorporativo]:
    """Obtener un cliente corporativo por ID"""
    return db.query(ClienteCorporativo).filter(
        ClienteCorporativo.id == cliente_id
    ).first()


def get_clientes_corporativos(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[ClienteCorporativo]:
    """Obtener lista de clientes corporativos"""
    return db.query(ClienteCorporativo).offset(skip).limit(limit).all()


def get_clientes_corporativos_by_sector(
    db: Session,
    sector: str
) -> List[ClienteCorporativo]:
    """Obtener clientes corporativos por sector"""
    return db.query(ClienteCorporativo).filter(
        ClienteCorporativo.sector == sector
    ).all()


def create_cliente_corporativo(
    db: Session,
    cliente: ClienteCorporativoCreate
) -> ClienteCorporativo:
    """Crear un nuevo cliente corporativo"""
    db_cliente = ClienteCorporativo(**cliente.dict())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


def update_cliente_corporativo(
    db: Session,
    cliente_id: int,
    cliente_update: ClienteCorporativoUpdate
) -> Optional[ClienteCorporativo]:
    """Actualizar un cliente corporativo"""
    db_cliente = get_cliente_corporativo(db, cliente_id)
    if db_cliente:
        update_data = cliente_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_cliente, field, value)
        db.commit()
        db.refresh(db_cliente)
    return db_cliente


def delete_cliente_corporativo(
    db: Session,
    cliente_id: int
) -> bool:
    """Eliminar un cliente corporativo"""
    db_cliente = get_cliente_corporativo(db, cliente_id)
    if db_cliente:
        db.delete(db_cliente)
        db.commit()
        return True
    return False


def search_clientes_corporativos(
    db: Session,
    search_term: str,
    skip: int = 0,
    limit: int = 100
) -> List[ClienteCorporativo]:
    """Buscar clientes corporativos por nombre o sector"""
    return db.query(ClienteCorporativo).filter(
        (ClienteCorporativo.nombre.ilike(f"%{search_term}%")) |
        (ClienteCorporativo.sector.ilike(f"%{search_term}%"))
    ).offset(skip).limit(limit).all()
