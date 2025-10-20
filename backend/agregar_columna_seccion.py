from sqlalchemy import create_engine, text
from core.config import DATABASE_URL
import os

def agregar_columna_seccion():
    """Ejecuta la migración para agregar la columna 'seccion' a las tablas de subsecciones"""
    try:
        # Crear engine de base de datos
        engine = create_engine(DATABASE_URL)
        
        # Leer el archivo SQL
        sql_file_path = os.path.join(os.path.dirname(__file__), 'migrations', 'add_seccion_column_to_subsecciones.sql')
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Ejecutar el script SQL
        with engine.connect() as connection:
            connection.execute(text(sql_script))
            connection.commit()
        
        print("✅ Columna 'seccion' agregada exitosamente a las tablas:")
        print("   - project_subseccion_implementacion_talento_humano")
        print("   - project_subseccion_implementacion_procesos")
        print("   - project_subseccion_implementacion_tecnologia")
        print("\nAhora todas las tablas tienen la columna 'seccion' para identificar a qué sección pertenecen.")
        
    except Exception as e:
        print(f"❌ Error al agregar la columna: {e}")
        raise

if __name__ == "__main__":
    agregar_columna_seccion()
