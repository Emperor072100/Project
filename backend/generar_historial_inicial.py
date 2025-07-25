#!/usr/bin/env python3
"""
Script para generar historial inicial para campañas existentes
"""
from core.database import SessionLocal
from app.models.campana import Campaña
from app.models.historial_campana import HistorialCampaña
from datetime import datetime

def generar_historial_inicial():
    """Generar entradas de historial inicial para campañas existentes"""
    db = SessionLocal()
    try:
        # Obtener todas las campañas que no tienen historial
        campañas_sin_historial = db.query(Campaña).filter(
            ~Campaña.id.in_(
                db.query(HistorialCampaña.campaña_id).distinct()
            )
        ).all()
        
        print(f"Encontradas {len(campañas_sin_historial)} campañas sin historial")
        
        for campaña in campañas_sin_historial:
            # Crear entrada de historial inicial
            historial_inicial = HistorialCampaña(
                campaña_id=campaña.id,
                usuario_id=None,
                accion="creada",
                cambios={
                    "nombre": campaña.nombre,
                    "descripcion": campaña.descripcion,
                    "tipo": str(campaña.tipo),
                    "estado": "Creación inicial"
                },
                observaciones="Entrada de historial generada automáticamente para campaña existente",
                fecha=campaña.fecha_de_produccion or datetime.utcnow()
            )
            
            db.add(historial_inicial)
            print(f"Historial creado para campaña: {campaña.nombre}")
        
        db.commit()
        print(f"✅ Historial inicial generado para {len(campañas_sin_historial)} campañas")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generar_historial_inicial()
