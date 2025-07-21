from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from schemas.campaña import CampañaCreate, CampañaUpdate, CampañaOut
from app.models.campaña import Campaña, TipoCampaña
from app.models.cliente import Cliente
from app.dependencies import get_db
from core.security import get_current_user, UserInDB

router = APIRouter(prefix="/campañas", tags=["Campañas"])


@router.post("/", response_model=CampañaOut)
def crear_campaña(
    campaña: CampañaCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Crear una nueva campaña"""
    # Verificar que el cliente existe
    cliente = db.query(Cliente).filter(Cliente.id == campaña.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    nueva_campaña = Campaña(**campaña.dict())
    db.add(nueva_campaña)
    db.commit()
    db.refresh(nueva_campaña)
    
    # Cargar el cliente para obtener el nombre
    campaña_con_cliente = db.query(Campaña).options(
        joinedload(Campaña.cliente)
    ).filter(Campaña.id == nueva_campaña.id).first()
    
    response = CampañaOut.from_orm(campaña_con_cliente)
    response.cliente_nombre = campaña_con_cliente.cliente.nombre
    return response


@router.get("/", response_model=List[CampañaOut])
def listar_campañas(
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Listar todas las campañas con información del cliente"""
    campañas = db.query(Campaña).options(joinedload(Campaña.cliente)).all()
    
    result = []
    for campaña in campañas:
        campaña_out = CampañaOut.from_orm(campaña)
        campaña_out.cliente_nombre = campaña.cliente.nombre
        result.append(campaña_out)
    
    return result


@router.get("/estadisticas")
def obtener_estadisticas(
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Obtener estadísticas para los contadores superiores"""
    total_clientes = db.query(Cliente).count()
    total_campañas = db.query(Campaña).count()
    
    # Contar por tipo de servicio
    sac_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.SAC).count()
    tmg_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.TMG).count()
    cbi_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.CBI).count()
    otro_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.OTRO).count()
    
    return {
        "total_clientes": total_clientes,
        "total_campañas": total_campañas,
        "por_servicio": {
            "SAC": sac_count,
            "TMG": tmg_count,
            "CBI": cbi_count,
            "OTRO": otro_count
        }
    }


@router.get("/{campaña_id}", response_model=CampañaOut)
def obtener_campaña(
    campaña_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Obtener una campaña específica"""
    campaña = db.query(Campaña).options(
        joinedload(Campaña.cliente)
    ).filter(Campaña.id == campaña_id).first()
    
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    response = CampañaOut.from_orm(campaña)
    response.cliente_nombre = campaña.cliente.nombre
    return response


@router.put("/{campaña_id}", response_model=CampañaOut)
def actualizar_campaña(
    campaña_id: int,
    campaña: CampañaUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Actualizar una campaña"""
    campaña_db = db.query(Campaña).filter(Campaña.id == campaña_id).first()
    if not campaña_db:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    # Si se está actualizando el cliente, verificar que existe
    if campaña.cliente_id and campaña.cliente_id != campaña_db.cliente_id:
        cliente = db.query(Cliente).filter(Cliente.id == campaña.cliente_id).first()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    for campo, valor in campaña.dict(exclude_unset=True).items():
        setattr(campaña_db, campo, valor)
    
    db.commit()
    db.refresh(campaña_db)
    
    # Cargar el cliente para la respuesta
    campaña_con_cliente = db.query(Campaña).options(
        joinedload(Campaña.cliente)
    ).filter(Campaña.id == campaña_id).first()
    
    response = CampañaOut.from_orm(campaña_con_cliente)
    response.cliente_nombre = campaña_con_cliente.cliente.nombre
    return response


@router.delete("/{campaña_id}")
def eliminar_campaña(
    campaña_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Eliminar una campaña"""
    campaña = db.query(Campaña).filter(Campaña.id == campaña_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    db.delete(campaña)
    db.commit()
    return {"message": "Campaña eliminada exitosamente"}
