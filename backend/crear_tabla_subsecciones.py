"""
Script para crear la tabla de subsecciones personalizadas
Ejecutar: python crear_tabla_subsecciones.py
"""

from core.database import engine
from sqlalchemy import text
from pathlib import Path


def crear_tabla_subsecciones():
    """Ejecuta el script SQL para crear la tabla de subsecciones personalizadas"""
    try:
        sql_file = (
            Path(__file__).parent
            / "migrations"
            / "create_subseccion_personalizada_table.sql"
        )

        if not sql_file.exists():
            print(f"❌ Error: No se encontró el archivo {sql_file}")
            return False

        print(f"📄 Leyendo script SQL desde: {sql_file}")
        sql_script = sql_file.read_text(encoding="utf-8")

        print("🔄 Ejecutando migración...")
        with engine.connect() as connection:
            # Ejecutar cada statement del script
            connection.execute(text(sql_script))
            connection.commit()

        print(
            "✅ Tabla 'project_implementacion_subseccion_personalizada' creada exitosamente!"
        )
        print("\nAhora puedes:")
        print("1. Reiniciar el servidor backend")
        print("2. Crear subsecciones personalizadas desde el frontend")
        print("3. Las subsecciones se guardarán automáticamente en la base de datos")

        return True

    except Exception as e:
        print(f"❌ Error al crear la tabla: {str(e)}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("CREACIÓN DE TABLA PARA SUBSECCIONES PERSONALIZADAS")
    print("=" * 60)
    print()

    exito = crear_tabla_subsecciones()

    if not exito:
        print("\n⚠️  La migración falló. Revisa los errores arriba.")
        print("Puedes ejecutar el SQL manualmente desde psql o pgAdmin.")

    print("\n" + "=" * 60)
