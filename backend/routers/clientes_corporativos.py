from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from schemas.cliente_corporativo import (
    ClienteCorporativo,
    ClienteCorporativoCreate,
    ClienteCorporativoUpdate,
)
import crud.cliente_corporativo as crud_cliente_corp

router = APIRouter(prefix="/clientes-corporativos", tags=["clientes-corporativos"])


@router.get("/", response_model=List[ClienteCorporativo])
def listar_clientes_corporativos(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Obtener lista de clientes corporativos"""
    clientes = crud_cliente_corp.get_clientes_corporativos(db, skip=skip, limit=limit)
    return clientes


@router.get("/{cliente_id}", response_model=ClienteCorporativo)
def obtener_cliente_corporativo(cliente_id: int, db: Session = Depends(get_db)):
    """Obtener un cliente corporativo por ID"""
    cliente = crud_cliente_corp.get_cliente_corporativo(db, cliente_id=cliente_id)
    if cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente corporativo no encontrado",
        )
    return cliente


@router.post("/", response_model=ClienteCorporativo)
def crear_cliente_corporativo(
    cliente: ClienteCorporativoCreate, db: Session = Depends(get_db)
):
    """Crear un nuevo cliente corporativo"""
    return crud_cliente_corp.create_cliente_corporativo(db=db, cliente=cliente)


@router.put("/{cliente_id}", response_model=ClienteCorporativo)
def actualizar_cliente_corporativo(
    cliente_id: int,
    cliente_update: ClienteCorporativoUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar un cliente corporativo"""
    cliente = crud_cliente_corp.update_cliente_corporativo(
        db=db, cliente_id=cliente_id, cliente_update=cliente_update
    )
    if cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente corporativo no encontrado",
        )
    return cliente


@router.delete("/{cliente_id}")
def eliminar_cliente_corporativo(cliente_id: int, db: Session = Depends(get_db)):
    """Eliminar un cliente corporativo"""
    success = crud_cliente_corp.delete_cliente_corporativo(db=db, cliente_id=cliente_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente corporativo no encontrado",
        )
    return {"message": "Cliente corporativo eliminado exitosamente"}


@router.get("/sector/{sector}", response_model=List[ClienteCorporativo])
def obtener_clientes_por_sector(sector: str, db: Session = Depends(get_db)):
    """Obtener clientes corporativos por sector"""
    clientes = crud_cliente_corp.get_clientes_corporativos_by_sector(db, sector=sector)
    return clientes


@router.get("/search/{search_term}", response_model=List[ClienteCorporativo])
def buscar_clientes_corporativos(
    search_term: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Buscar clientes corporativos por nombre o sector"""
    clientes = crud_cliente_corp.search_clientes_corporativos(
        db, search_term=search_term, skip=skip, limit=limit
    )
    return clientes
