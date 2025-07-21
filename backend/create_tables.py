#!/usr/bin/env python3
"""
Script para crear todas las tablas en la base de datos
"""
from core.database import engine, Base
from app.models import usuario, proyecto, tarea, estado, prioridad, tipo_equipo
from app.models import Cliente, Campaña  # Agregar los nuevos modelos

def create_tables():
    """Crea todas las tablas definidas en los modelos"""
    print("Creando tablas en la base de datos...")
    
    # Esto creará todas las tablas definidas en los modelos
    Base.metadata.create_all(bind=engine)
    
    print("✅ Tablas creadas exitosamente!")
    print("\nTablas que deberían estar creadas:")
    print("- project_usuarios")
    print("- project_proyectos") 
    print("- project_tareas")
    print("- project_estados")
    print("- project_prioridades")
    print("- project_tipos")
    print("- project_equipos")
    print("- proyecto_tipos (tabla de asociación)")
    print("- proyecto_equipos (tabla de asociación)")
    print("- campañas_clientes")  # Nueva tabla de clientes
    print("- campañas_campañas")  # Nueva tabla de campañas

if __name__ == "__main__":
    create_tables()
