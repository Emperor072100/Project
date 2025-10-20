from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from schemas.campaña import CampañaCreate, CampañaUpdate, CampañaOut
from app.models.campana import Campaña, TipoCampaña
from app.models.cliente import Cliente
from app.models.cliente_corporativo import ClienteCorporativo
from app.models.historial_campana import HistorialCampaña
from app.models.producto_campana import ProductoCampaña
from app.models.facturacion_campana import FacturacionCampaña
from app.schemas.historial_campana import HistorialOut, HistorialCreate
from app.schemas.productos_facturacion import (
    ProductoCampañaCreate,
    ProductoCampaña as ProductoOut,
    ProductoCampañaBase,
    FacturacionCampañaCreate,
    FacturacionCampaña as FacturacionOut,
    FacturacionCampañaBase,
)
from app.dependencies import get_db
from core.security import get_current_user, UserInDB

router = APIRouter(prefix="/campanas", tags=["Campañas"])


@router.post("/", response_model=CampañaOut)
def crear_campaña(
    campaña: CampañaCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Crear una nueva campaña"""
    # Verificar que el cliente corporativo existe
    cliente_corp = (
        db.query(ClienteCorporativo)
        .filter(ClienteCorporativo.id == campaña.cliente_corporativo_id)
        .first()
    )
    if not cliente_corp:
        raise HTTPException(status_code=404, detail="Cliente corporativo no encontrado")

    # Verificar que el contacto existe
    contacto = db.query(Cliente).filter(Cliente.id == campaña.contacto_id).first()
    if not contacto:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")

    nueva_campaña = Campaña(**campaña.dict())
    db.add(nueva_campaña)
    db.commit()
    db.refresh(nueva_campaña)

    # Registrar creación en historial
    registrar_cambio_campaña(
        db=db,
        campaña_id=nueva_campaña.id,
        accion="creada",
        cambios=campaña.dict(),
        usuario_id=usuario.id if hasattr(usuario, "id") else None,
        observaciones=f"Campaña creada por {usuario.nombre if hasattr(usuario, 'nombre') else 'usuario'}",
    )

    return nueva_campaña


@router.get("/", response_model=List[CampañaOut])
def listar_campañas(
    db: Session = Depends(get_db), usuario: UserInDB = Depends(get_current_user)
):
    """Listar todas las campañas con información completa"""
    campañas = (
        db.query(Campaña)
        .options(joinedload(Campaña.cliente_corporativo), joinedload(Campaña.contacto))
        .all()
    )

    return campañas


@router.get("/estadisticas")
def obtener_estadisticas(
    db: Session = Depends(get_db), usuario: UserInDB = Depends(get_current_user)
):
    """Obtener estadísticas para los contadores superiores"""
    total_clientes_corporativos = db.query(ClienteCorporativo).count()
    total_contactos = db.query(Cliente).count()
    total_campañas = db.query(Campaña).count()

    # Contar por tipo de servicio con los nuevos tipos
    sac_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.SAC).count()
    tmc_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.TMC).count()
    tvt_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.TVT).count()
    cbz_count = db.query(Campaña).filter(Campaña.tipo == TipoCampaña.CBZ).count()

    return {
        "total_clientes_corporativos": total_clientes_corporativos,
        "total_contactos": total_contactos,
        "total_campañas": total_campañas,
        "por_servicio": {
            "SAC": sac_count,
            "TMC": tmc_count,
            "TVT": tvt_count,
            "CBZ": cbz_count,
        },
    }


@router.get("/{campana_id}", response_model=CampañaOut)
def obtener_campaña(
    campana_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Obtener una campaña específica"""
    campaña = (
        db.query(Campaña)
        .options(joinedload(Campaña.cliente_corporativo), joinedload(Campaña.contacto))
        .filter(Campaña.id == campana_id)
        .first()
    )

    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    return campaña


@router.put("/{campana_id}", response_model=CampañaOut)
def actualizar_campaña(
    campana_id: int,
    campaña_update: CampañaUpdate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Actualizar una campaña existente"""
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    # Verificar cliente corporativo si se está actualizando
    if campaña_update.cliente_corporativo_id is not None:
        cliente_corp = (
            db.query(ClienteCorporativo)
            .filter(ClienteCorporativo.id == campaña_update.cliente_corporativo_id)
            .first()
        )
        if not cliente_corp:
            raise HTTPException(
                status_code=404, detail="Cliente corporativo no encontrado"
            )

    # Verificar contacto si se está actualizando
    if campaña_update.contacto_id is not None:
        contacto = (
            db.query(Cliente).filter(Cliente.id == campaña_update.contacto_id).first()
        )
        if not contacto:
            raise HTTPException(status_code=404, detail="Contacto no encontrado")

    # Actualizar campos
    update_data = campaña_update.dict(exclude_unset=True)
    cambios_realizados = {}

    for field, value in update_data.items():
        valor_anterior = getattr(campaña, field)
        if valor_anterior != value:
            cambios_realizados[field] = {
                "anterior": str(valor_anterior) if valor_anterior is not None else None,
                "nuevo": str(value) if value is not None else None,
            }
        setattr(campaña, field, value)

    db.commit()
    db.refresh(campaña)

    # Registrar cambios en historial si hubo modificaciones
    if cambios_realizados:
        registrar_cambio_campaña(
            db=db,
            campaña_id=campana_id,
            accion="actualizada",
            cambios=cambios_realizados,
            usuario_id=usuario.id if hasattr(usuario, "id") else None,
            observaciones=f"Campaña actualizada por {usuario.nombre if hasattr(usuario, 'nombre') else 'usuario'}",
        )

    return campaña


@router.delete("/{campana_id}")
def eliminar_campaña(
    campana_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Eliminar una campaña"""
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    db.delete(campaña)
    db.commit()

    return {"message": "Campaña eliminada exitosamente"}


# Endpoints para historial de campañas
@router.get("/{campana_id}/historial", response_model=List[HistorialOut])
def obtener_historial_campaña(
    campana_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Obtener el historial de cambios de una campaña"""
    # Verificar que la campaña existe
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    # Obtener historial ordenado por fecha descendente
    historial = (
        db.query(HistorialCampaña)
        .filter(HistorialCampaña.campaña_id == campana_id)
        .order_by(HistorialCampaña.fecha.desc())
        .all()
    )

    return historial


@router.post("/{campana_id}/historial", response_model=HistorialOut)
def crear_entrada_historial(
    campana_id: int,
    historial_data: HistorialCreate,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Crear una nueva entrada en el historial de una campaña"""
    # Verificar que la campaña existe
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    # Crear nueva entrada de historial
    nueva_entrada = HistorialCampaña(
        campaña_id=campana_id,
        usuario_id=usuario.id if hasattr(usuario, "id") else None,
        accion=historial_data.accion,
        cambios=historial_data.cambios,
        observaciones=historial_data.observaciones,
    )

    db.add(nueva_entrada)
    db.commit()
    db.refresh(nueva_entrada)

    return nueva_entrada


def registrar_cambio_campaña(
    db: Session,
    campaña_id: int,
    accion: str,
    cambios: dict = None,
    usuario_id: int = None,
    observaciones: str = None,
):
    """Función auxiliar para registrar cambios en el historial"""
    # Generar mensaje personalizado según la acción
    mensaje_legible = generar_mensaje_historial(accion, cambios, usuario_id, db)

    import datetime
    import enum
    import json

    def serializar_para_json(obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        if isinstance(obj, enum.Enum):
            return obj.value
        raise TypeError(f"Type {type(obj)} not serializable")

    cambios_json = None
    if cambios is not None:
        # Serializa el dict a string y luego lo vuelve a dict para que SQLAlchemy lo acepte como JSON serializable
        cambios_json = json.loads(json.dumps(cambios, default=serializar_para_json))

    entrada_historial = HistorialCampaña(
        campaña_id=campaña_id,
        usuario_id=usuario_id,
        accion=accion,
        cambios=cambios_json,
        observaciones=mensaje_legible or observaciones,
    )
    db.add(entrada_historial)
    db.commit()


def generar_mensaje_historial(
    accion: str, cambios: dict, usuario_id: int = None, db: Session = None
) -> str:
    """Generar mensaje legible para el historial"""
    from app.models.usuario import Usuario

    # Obtener el nombre del usuario de la base de datos
    usuario_nombre = "Usuario"  # Valor por defecto
    if usuario_id and db:
        try:
            usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
            if usuario:
                # Evitar nombres duplicados
                if usuario.nombre == usuario.apellido:
                    usuario_nombre = usuario.nombre
                else:
                    usuario_nombre = f"{usuario.nombre} {usuario.apellido}".strip()
        except Exception:
            # Si hay error en la consulta, usar el valor por defecto
            pass

    if accion == "producto_agregado":
        producto_servicio = cambios.get("producto_servicio", "producto")
        cantidad = cambios.get("cantidad", 1)
        tipo = cambios.get("tipo", "Producto")
        proveedor = cambios.get("proveedor", "")

        mensaje_base = f"{usuario_nombre} agregó {tipo.lower()}: {producto_servicio}"
        if cantidad > 1:
            mensaje_base += f" (cantidad: {cantidad})"
        if proveedor:
            mensaje_base += f" - Proveedor: {proveedor}"

        return mensaje_base

    elif accion == "producto_actualizado":
        anterior = cambios.get("anterior", {})
        nuevo = cambios.get("nuevo", {})

        # Obtener el contexto del producto para ser más específico
        producto_contexto = nuevo.get("producto_servicio") or anterior.get(
            "producto_servicio", "producto"
        )

        # Mostrar todos los cambios de manera clara
        cambios_texto = []

        if anterior.get("producto_servicio") != nuevo.get("producto_servicio"):
            cambios_texto.append(
                f"nombre de '{anterior.get('producto_servicio', '')}' a '{nuevo.get('producto_servicio', '')}'"
            )

        if anterior.get("cantidad") != nuevo.get("cantidad"):
            cambios_texto.append(
                f"cantidad de {producto_contexto} de {anterior.get('cantidad', 0)} a {nuevo.get('cantidad', 0)} unidades"
            )

        if anterior.get("proveedor") != nuevo.get("proveedor"):
            cambios_texto.append(
                f"proveedor de {producto_contexto} de '{anterior.get('proveedor', '')}' a '{nuevo.get('proveedor', '')}'"
            )

        if anterior.get("tipo") != nuevo.get("tipo"):
            cambios_texto.append(
                f"tipo de {producto_contexto} de '{anterior.get('tipo', '')}' a '{nuevo.get('tipo', '')}'"
            )

        if anterior.get("propiedad") != nuevo.get("propiedad"):
            cambios_texto.append(
                f"propiedad de {producto_contexto} de '{anterior.get('propiedad', '')}' a '{nuevo.get('propiedad', '')}'"
            )

        if cambios_texto:
            return f"{usuario_nombre} modificó {', '.join(cambios_texto)}"
        else:
            return f"{usuario_nombre} modificó {producto_contexto}"

    elif accion == "producto_eliminado":
        producto_servicio = cambios.get("producto_servicio", "producto")
        cantidad = cambios.get("cantidad", 1)
        tipo = cambios.get("tipo", "producto")

        mensaje = f"{usuario_nombre} eliminó {tipo.lower()}: {producto_servicio}"
        if cantidad > 1:
            mensaje += f" (cantidad: {cantidad})"

        return mensaje

    elif accion == "facturacion_eliminada":
        unidad = cambios.get("unidad", "unidad")
        valor = cambios.get("valor", 0)

        mensaje = f"{usuario_nombre} eliminó facturación: {unidad}"
        if valor > 0:
            mensaje += f" (valor: ${valor:,.0f})"

        return mensaje

    elif accion == "facturacion_agregada":
        unidad = cambios.get("unidad", "unidad")
        cantidad = cambios.get("cantidad", 1)
        valor = cambios.get("valor", 0)
        periodicidad = cambios.get("periodicidad", "")

        mensaje = f"{usuario_nombre} agregó facturación: {unidad}"
        if cantidad > 1:
            mensaje += f" (cantidad: {cantidad})"
        if valor > 0:
            mensaje += f" - Valor: ${valor:,.0f}"
        if periodicidad:
            mensaje += f" - Periodicidad: {periodicidad}"

        return mensaje

    elif accion == "facturacion_actualizada":
        anterior = cambios.get("anterior", {})
        nuevo = cambios.get("nuevo", {})

        # Obtener el contexto del producto/servicio para ser más específicos
        unidad_contexto = nuevo.get("unidad") or anterior.get("unidad", "unidad")

        # Mostrar todos los cambios de manera clara
        cambios_texto = []

        if anterior.get("unidad") != nuevo.get("unidad"):
            cambios_texto.append(
                f"unidad de facturación de '{anterior.get('unidad', '')}' a '{nuevo.get('unidad', '')}'"
            )

        if anterior.get("cantidad") != nuevo.get("cantidad"):
            cambios_texto.append(
                f"cantidad de {unidad_contexto} de {anterior.get('cantidad', 0)} a {nuevo.get('cantidad', 0)} unidades"
            )

        if anterior.get("valor") != nuevo.get("valor"):
            cambios_texto.append(
                f"valor de {unidad_contexto} de ${anterior.get('valor', 0):,.0f} a ${nuevo.get('valor', 0):,.0f}"
            )

        if anterior.get("periodicidad") != nuevo.get("periodicidad"):
            cambios_texto.append(
                f"periodicidad de {unidad_contexto} de '{anterior.get('periodicidad', '')}' a '{nuevo.get('periodicidad', '')}'"
            )

        if cambios_texto:
            return f"{usuario_nombre} modificó {', '.join(cambios_texto)}"
        else:
            return f"{usuario_nombre} modificó facturación de {unidad_contexto}"

    elif accion == "actualizada":
        # Manejar actualizaciones de campaña con mensajes específicos
        if not cambios:
            return f"{usuario_nombre} actualizó la campaña"

        cambios_texto = []
        for campo, valores in cambios.items():
            if (
                isinstance(valores, dict)
                and "anterior" in valores
                and "nuevo" in valores
            ):
                anterior = valores["anterior"]
                nuevo = valores["nuevo"]

                # Traducir nombres de campos al español y manejar casos especiales
                if campo == "nombre":
                    cambios_texto.append(f"nombre de '{anterior}' a '{nuevo}'")
                elif campo == "tipo":
                    cambios_texto.append(f"tipo de campaña de '{anterior}' a '{nuevo}'")
                elif campo == "ejecutivo":
                    cambios_texto.append(f"ejecutivo de '{anterior}' a '{nuevo}'")
                elif campo == "lider_de_campaña":
                    cambios_texto.append(
                        f"líder de campaña de '{anterior}' a '{nuevo}'"
                    )
                elif campo == "estado":
                    cambios_texto.append(f"estado de '{anterior}' a '{nuevo}'")
                elif campo == "fecha_de_produccion":
                    anterior_fecha = anterior if anterior else "sin fecha"
                    nuevo_fecha = nuevo if nuevo else "sin fecha"
                    cambios_texto.append(
                        f"fecha de producción de '{anterior_fecha}' a '{nuevo_fecha}'"
                    )
                elif campo == "cliente_corporativo_id":
                    # Aquí podrías obtener el nombre del cliente en lugar del ID
                    cambios_texto.append(
                        f"cliente corporativo (ID: {anterior} → {nuevo})"
                    )
                elif campo == "contacto_id":
                    # Aquí podrías obtener el nombre del contacto en lugar del ID
                    cambios_texto.append(f"contacto (ID: {anterior} → {nuevo})")
                elif campo == "presupuesto":
                    anterior_presup = (
                        f"${anterior:,.0f}" if anterior else "sin presupuesto"
                    )
                    nuevo_presup = f"${nuevo:,.0f}" if nuevo else "sin presupuesto"
                    cambios_texto.append(
                        f"presupuesto de {anterior_presup} a {nuevo_presup}"
                    )
                elif campo == "observaciones":
                    anterior_obs = (
                        anterior[:50] + "..."
                        if anterior and len(anterior) > 50
                        else anterior or "sin observaciones"
                    )
                    nuevo_obs = (
                        nuevo[:50] + "..."
                        if nuevo and len(nuevo) > 50
                        else nuevo or "sin observaciones"
                    )
                    cambios_texto.append(
                        f"observaciones de '{anterior_obs}' a '{nuevo_obs}'"
                    )
                else:
                    # Para campos no específicos, usar nombre genérico
                    campo_esp = campo.replace("_", " ")
                    cambios_texto.append(f"{campo_esp} de '{anterior}' a '{nuevo}'")

        if cambios_texto:
            if len(cambios_texto) == 1:
                return f"{usuario_nombre} actualizó {cambios_texto[0]} de la campaña"
            else:
                return f"{usuario_nombre} actualizó: {', '.join(cambios_texto)}"
        else:
            return f"{usuario_nombre} actualizó la campaña"

    else:
        return f"{usuario_nombre} realizó acción {accion}"


# ==================== ENDPOINTS DE PRODUCTOS ====================


@router.get("/{campana_id}/productos", response_model=List[ProductoOut])
def obtener_productos_campaña(
    campana_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Obtener todos los productos de una campaña"""
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    productos = (
        db.query(ProductoCampaña).filter(ProductoCampaña.campaña_id == campana_id).all()
    )
    return productos


@router.post("/{campana_id}/productos", response_model=ProductoOut)
def crear_producto_campaña(
    campana_id: int,
    producto: ProductoCampañaBase,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Crear un nuevo producto para una campaña"""
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    db_producto = ProductoCampaña(
        campaña_id=campana_id,
        tipo=producto.tipo,
        producto_servicio=producto.producto_servicio,
        proveedor=producto.proveedor,
        propiedad=producto.propiedad,
        cantidad=producto.cantidad,
    )

    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)

    # Registrar en historial
    registrar_cambio_campaña(
        db=db,
        campaña_id=campana_id,
        usuario_id=usuario.id,
        accion="producto_agregado",
        cambios={
            "tipo": producto.tipo,
            "producto_servicio": producto.producto_servicio,
            "proveedor": producto.proveedor,
            "propiedad": producto.propiedad,
            "cantidad": producto.cantidad,
        },
    )

    return db_producto


@router.put("/{campana_id}/productos/{producto_id}", response_model=ProductoOut)
def actualizar_producto_campaña(
    campana_id: int,
    producto_id: int,
    producto: ProductoCampañaBase,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Actualizar un producto de una campaña"""
    db_producto = (
        db.query(ProductoCampaña)
        .filter(
            ProductoCampaña.id == producto_id, ProductoCampaña.campaña_id == campana_id
        )
        .first()
    )

    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Guardar valores anteriores para historial
    valores_anteriores = {
        "tipo": db_producto.tipo,
        "producto_servicio": db_producto.producto_servicio,
        "proveedor": db_producto.proveedor,
        "propiedad": db_producto.propiedad,
        "cantidad": db_producto.cantidad,
    }

    # Actualizar campos
    db_producto.tipo = producto.tipo
    db_producto.producto_servicio = producto.producto_servicio
    db_producto.proveedor = producto.proveedor
    db_producto.propiedad = producto.propiedad
    db_producto.cantidad = producto.cantidad

    db.commit()
    db.refresh(db_producto)

    # Registrar en historial
    registrar_cambio_campaña(
        db=db,
        campaña_id=campana_id,
        usuario_id=usuario.id,
        accion="producto_actualizado",
        cambios={
            "anterior": valores_anteriores,
            "nuevo": {
                "tipo": producto.tipo,
                "producto_servicio": producto.producto_servicio,
                "proveedor": producto.proveedor,
                "propiedad": producto.propiedad,
                "cantidad": producto.cantidad,
            },
        },
    )

    return db_producto


@router.delete("/{campana_id}/productos/{producto_id}")
def eliminar_producto_campaña(
    campana_id: int,
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Eliminar un producto de una campaña"""
    db_producto = (
        db.query(ProductoCampaña)
        .filter(
            ProductoCampaña.id == producto_id, ProductoCampaña.campaña_id == campana_id
        )
        .first()
    )

    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Guardar información para historial
    producto_info = {
        "tipo": db_producto.tipo,
        "producto_servicio": db_producto.producto_servicio,
        "proveedor": db_producto.proveedor,
        "propiedad": db_producto.propiedad,
        "cantidad": db_producto.cantidad,
    }

    db.delete(db_producto)
    db.commit()

    # Registrar en historial
    registrar_cambio_campaña(
        db=db,
        campaña_id=campana_id,
        usuario_id=usuario.id,
        accion="producto_eliminado",
        cambios=producto_info,
    )

    return {"message": "Producto eliminado correctamente"}


# ==================== ENDPOINTS DE FACTURACIÓN ====================


@router.get("/{campana_id}/facturacion", response_model=List[FacturacionOut])
def obtener_facturacion_campaña(
    campana_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Obtener todas las unidades de facturación de una campaña"""
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    facturacion = (
        db.query(FacturacionCampaña)
        .filter(FacturacionCampaña.campaña_id == campana_id)
        .all()
    )
    return facturacion


@router.post("/{campana_id}/facturacion", response_model=FacturacionOut)
def crear_facturacion_campaña(
    campana_id: int,
    facturacion: FacturacionCampañaBase,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Crear una nueva unidad de facturación para una campaña"""
    campaña = db.query(Campaña).filter(Campaña.id == campana_id).first()
    if not campaña:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    db_facturacion = FacturacionCampaña(
        campaña_id=campana_id,
        unidad=facturacion.unidad,
        cantidad=facturacion.cantidad,
        valor=facturacion.valor,
        periodicidad=facturacion.periodicidad,
    )

    db.add(db_facturacion)
    db.commit()
    db.refresh(db_facturacion)

    # Registrar en historial
    registrar_cambio_campaña(
        db=db,
        campaña_id=campana_id,
        usuario_id=usuario.id,
        accion="facturacion_agregada",
        cambios={
            "unidad": facturacion.unidad,
            "cantidad": facturacion.cantidad,
            "valor": facturacion.valor,
            "periodicidad": facturacion.periodicidad,
        },
    )

    return db_facturacion


@router.put("/{campana_id}/facturacion/{facturacion_id}", response_model=FacturacionOut)
def actualizar_facturacion_campaña(
    campana_id: int,
    facturacion_id: int,
    facturacion: FacturacionCampañaBase,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Actualizar una unidad de facturación de una campaña"""
    db_facturacion = (
        db.query(FacturacionCampaña)
        .filter(
            FacturacionCampaña.id == facturacion_id,
            FacturacionCampaña.campaña_id == campana_id,
        )
        .first()
    )

    if not db_facturacion:
        raise HTTPException(
            status_code=404, detail="Unidad de facturación no encontrada"
        )

    # Guardar valores anteriores para historial
    valores_anteriores = {
        "unidad": db_facturacion.unidad,
        "cantidad": db_facturacion.cantidad,
        "valor": db_facturacion.valor,
        "periodicidad": db_facturacion.periodicidad,
    }

    # Actualizar campos
    db_facturacion.unidad = facturacion.unidad
    db_facturacion.cantidad = facturacion.cantidad
    db_facturacion.valor = facturacion.valor
    db_facturacion.periodicidad = facturacion.periodicidad

    db.commit()
    db.refresh(db_facturacion)

    # Registrar en historial
    registrar_cambio_campaña(
        db=db,
        campaña_id=campana_id,
        usuario_id=usuario.id,
        accion="facturacion_actualizada",
        cambios={
            "anterior": valores_anteriores,
            "nuevo": {
                "unidad": facturacion.unidad,
                "cantidad": facturacion.cantidad,
                "valor": facturacion.valor,
                "periodicidad": facturacion.periodicidad,
            },
        },
    )

    return db_facturacion


@router.delete("/{campana_id}/facturacion/{facturacion_id}")
def eliminar_facturacion_campaña(
    campana_id: int,
    facturacion_id: int,
    db: Session = Depends(get_db),
    usuario: UserInDB = Depends(get_current_user),
):
    """Eliminar una unidad de facturación de una campaña"""
    db_facturacion = (
        db.query(FacturacionCampaña)
        .filter(
            FacturacionCampaña.id == facturacion_id,
            FacturacionCampaña.campaña_id == campana_id,
        )
        .first()
    )

    if not db_facturacion:
        raise HTTPException(
            status_code=404, detail="Unidad de facturación no encontrada"
        )

    # Guardar información para historial
    facturacion_info = {
        "unidad": db_facturacion.unidad,
        "cantidad": db_facturacion.cantidad,
        "valor": db_facturacion.valor,
        "periodicidad": db_facturacion.periodicidad,
    }

    db.delete(db_facturacion)
    db.commit()

    # Registrar en historial
    registrar_cambio_campaña(
        db=db,
        campaña_id=campana_id,
        usuario_id=usuario.id,
        accion="facturacion_eliminada",
        cambios=facturacion_info,
    )

    return {"message": "Unidad de facturación eliminada correctamente"}
