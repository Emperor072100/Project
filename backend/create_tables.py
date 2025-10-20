#!/usr/bin/env python3
"""
Script para crear todas las tablas en la base de datos
"""
from core.database import engine, Base
from app.models import usuario, proyecto, tarea, estado, prioridad, tipo_equipo
from app.models import (
    Cliente,
    ClienteCorporativo,
    Campaña,
    HistorialCampaña,
    ProductoCampaña,
    FacturacionCampaña,
)  # Agregar los nuevos modelos


def create_tables():
    """Crea todas las tablas definidas en los modelos"""
    print("Creando tablas en la base de datos...")

    # Esto crear todas las tablas definidas en los modelos
    Base.metadata.create_all(bind=engine)

    print(" Tablas creadas exitosamente!")
    print("\nTablas que deberan estar creadas:")
    print("- project_usuarios")
    print("- project_proyectos")
    print("- project_tareas")
    print("- project_estados")
    print("- project_prioridades")
    print("- project_tipos")
    print("- project_equipos")
    print("- proyecto_tipos (tabla de asociacin)")
    print("- proyecto_equipos (tabla de asociacin)")
    print("- campanas_clientes")  # Nueva tabla de clientes
    print("- campanas_clientes_corporativos")  # Nueva tabla de clientes corporativos
    print("- campanas_contacto")  # Nueva tabla de contactos
    print("- campanas_campanas")  # Nueva tabla de campanas
    print("- historial_campanas")  # Nueva tabla de historial
    print("- productos_campanas")  # Nueva tabla de productos por campaña
    print("- facturacion_campanas")  # Nueva tabla de facturación por campaña


if __name__ == "__main__":
    create_tables()
