from sqlalchemy import create_engine, text
from core.config import DATABASE_URL
import os


def crear_tabla_subsecciones_procesos():
    """Ejecuta la migración para crear la tabla de subsecciones de Procesos"""
    try:
        # Crear engine de base de datos
        engine = create_engine(DATABASE_URL)

        # Leer el archivo SQL
        sql_file_path = os.path.join(
            os.path.dirname(__file__),
            "migrations",
            "create_subseccion_procesos_table.sql",
        )
        with open(sql_file_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        # Ejecutar el script SQL
        with engine.connect() as connection:
            connection.execute(text(sql_script))
            connection.commit()

        print(
            "✅ Tabla 'project_subseccion_implementacion_procesos' creada exitosamente!"
        )
        print("\nAhora puedes:")
        print("1. Reiniciar el servidor backend")
        print("2. Crear subsecciones personalizadas en Procesos desde el frontend")
        print("3. Las subsecciones se guardarán automáticamente en la base de datos")

    except Exception as e:
        print(f"❌ Error al crear la tabla: {e}")
        raise


if __name__ == "__main__":
    crear_tabla_subsecciones_procesos()
