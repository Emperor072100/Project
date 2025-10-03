#!/usr/bin/env python3
"""Script para verificar el estado de la base de datos"""

from core.database import get_db
from models.project_implementaciones_clienteimple import ProjectImplementacionesClienteImple
from models.project_implementacion_contractual import ProjectImplementacionContractual
from models.project_implementacion_talentoHumano import ProjectImplementacionTalentoHumano
from models.project_implementacion_procesos import ProjectImplementacionProcesos
from models.project_implementacion_tecnologia import ProjectImplementacionTecnologia
from sqlalchemy.orm import Session

def main():
    db = next(get_db())
    
    print("=== VERIFICACIÓN DE BASE DE DATOS ===")
    
    # Verificar implementaciones principales
    implementaciones = db.query(ProjectImplementacionesClienteImple).all()
    print(f"\nImplementaciones principales: {len(implementaciones)}")
    for imp in implementaciones:
        print(f"  ID: {imp.id}, Cliente: {imp.cliente}, Estado: {imp.estado}")
        print(f"    Contractual JSON: {imp.contractual is not None}")
        print(f"    Talento Humano JSON: {imp.talento_humano is not None}")
        print(f"    Procesos JSON: {imp.procesos is not None}")
        print(f"    Tecnología JSON: {imp.tecnologia is not None}")
    
    # Verificar datos específicos del ID 1 (que usaremos para prueba)
    print("\n=== DETALLES IMPLEMENTACIÓN ID 1 ===")
    imp1 = db.query(ProjectImplementacionesClienteImple).filter_by(id=1).first()
    if imp1:
        print(f"Cliente: {imp1.cliente}")
        print(f"Estado: {imp1.estado}")
        print(f"Contractual JSON: {imp1.contractual}")
        print(f"Talento Humano JSON: {imp1.talento_humano}")
        
        # Verificar tabla contractual
        contractual1 = db.query(ProjectImplementacionContractual).filter_by(cliente_implementacion_id=1).first()
        if contractual1:
            print(f"Contractual tabla - Modelo contrato seguimiento: '{contractual1.modelo_contrato_seguimiento}'")
            print(f"Contractual tabla - Modelo contrato estado: '{contractual1.modelo_contrato_estado}'")
        
        # Verificar tabla talento humano
        talento1 = db.query(ProjectImplementacionTalentoHumano).filter_by(cliente_implementacion_id=1).first()
        if talento1:
            print(f"Talento tabla - Perfil personal seguimiento: '{talento1.perfil_personal_seguimiento}'")
            print(f"Talento tabla - Perfil personal estado: '{talento1.perfil_personal_estado}'")
    
    db.close()

if __name__ == "__main__":
    main()
