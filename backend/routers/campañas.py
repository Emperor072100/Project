from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from typing import List
from schemas.campaña import CampañaCreate, CampañaUpdate, CampañaOut
from app.models.campana import Campaña, TipoCampaña
from app.models.cliente import Cliente
from app.models.cliente_corporativo import ClienteCorporativo
from app.dependencies import get_db
from core.security import get_current_user, UserInDB

# MODELOS Y ESQUEMAS NECESARIOS
from app.models.campana import Campaña, TipoCampaña
from app.models.cliente import Cliente
from app.schemas.campaña import CampañaOut, CampañaCreate, CampañaUpdate

router = APIRouter(prefix="/campañas", tags=["Campañas"])


@router.post("/", response_model=CampañaOut)
def crear_campania(
    campaña: CampañaCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Crear una nueva campaña"""
    # Verificar que el cliente corporativo existe
    cliente_corp = db.query(ClienteCorporativo).filter(
        ClienteCorporativo.id == campaña.cliente_corporativo_id
    ).first()
    if not cliente_corp:
        raise HTTPException(
            status_code=404,
            detail="Cliente corporativo no encontrado"
        )
    
    # Verificar que el contacto existe
    contacto = db.query(Cliente).filter(
        Cliente.id == campaña.contacto_id
    ).first()
    if not contacto:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    
    nueva_campaña = Campaña(**campaña.dict())
    db.add(nueva_campaña)
    db.commit()
    db.refresh(nueva_campaña)
    
    return nueva_campaña


@router.get("/", response_model=List[CampañaOut])
def listar_campañas(
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Listar todas las campañas con información completa"""
    campañas = db.query(Campaña).options(
        joinedload(Campaña.cliente_corporativo),
        joinedload(Campaña.contacto)
    ).all()
    
    return campañas


@router.get("/estadisticas")
def obtener_estadisticas(
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Obtener estadísticas para los contadores superiores"""
    total_clientes_corporativos = db.query(ClienteCorporativo).count()
    total_contactos = db.query(Cliente).count()
    total_campañas = db.query(Campaña).count()
    
    # Contar por tipo de servicio con los nuevos tipos
    sac_count = db.query(Campaña).filter(
        Campaña.tipo == TipoCampaña.SAC
    ).count()
    tmc_count = db.query(Campaña).filter(
        Campaña.tipo == TipoCampaña.TMC
    ).count()
    tvt_count = db.query(Campaña).filter(
        Campaña.tipo == TipoCampaña.TVT
    ).count()
    cbz_count = db.query(Campaña).filter(
        Campaña.tipo == TipoCampaña.CBZ
    ).count()
    
    return {
        "total_clientes_corporativos": total_clientes_corporativos,
        "total_contactos": total_contactos,
        "total_campañas": total_campañas,
        "por_servicio": {
            "SAC": sac_count,
            "TMC": tmc_count,
            "TVT": tvt_count,
            "CBZ": cbz_count
            "TMC": tmc_count,
            "TVT": tvt_count,
            "CBZ": cbz_count
        }
    }


@router.get("/{campaña_id}", response_model=CampañaOut)
def obtener_campaña(
    campaña_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Obtener una campania específica"""
    campaña = db.query(Campaña).options(
        joinedload(Campaña.cliente_corporativo),
        joinedload(Campaña.contacto)
    ).filter(Campaña.id == campaña_id).first()
    
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    return campaña


@router.put("/{campaña_id}", response_model=CampañaOut)
def actualizar_campaña(
    campaña_id: int,
    campaña_update: CampañaUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Actualizar una campaña existente"""
    campaña = db.query(Campaña).filter(Campaña.id == campaña_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    # Verificar cliente corporativo si se está actualizando
    if campaña_update.cliente_corporativo_id is not None:
        cliente_corp = db.query(ClienteCorporativo).filter(
            ClienteCorporativo.id == campaña_update.cliente_corporativo_id
        ).first()
        if not cliente_corp:
            raise HTTPException(
                status_code=404,
                detail="Cliente corporativo no encontrado"
            )
    
    # Verificar contacto si se está actualizando
    if campaña_update.contacto_id is not None:
        contacto = db.query(Cliente).filter(
            Cliente.id == campaña_update.contacto_id
        ).first()
        if not contacto:
            raise HTTPException(
                status_code=404,
                detail="Contacto no encontrado"
            )
    
    # Actualizar campos
    update_data = campaña_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaña, field, value)
    
    db.commit()
    db.refresh(campaña)
    
    return campaña


@router.delete("/{campaña_id}")
def eliminar_campaña(
    campaña_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user)
):
    """Eliminar una campania"""
    campaña = db.query(Campaña).filter(Campaña.id == campaña_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    
    db.delete(campaña)
    db.commit()
    
    return {"message": "Campaña eliminada exitosamente"}
