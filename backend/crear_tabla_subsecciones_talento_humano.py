"""
Script para crear la tabla de subsecciones personalizadas de Talento Humano
Ejecutar: python crear_tabla_subsecciones_talento_humano.py
"""

from core.database import engine
from sqlalchemy import text
from pathlib import Path


def crear_tabla_subsecciones_talento_humano():
    """Ejecuta el script SQL para crear la tabla de subsecciones de Talento Humano"""
    try:
        sql_file = (
            Path(__file__).parent
            / "migrations"
            / "create_subseccion_talento_humano_table.sql"
        )

        if not sql_file.exists():
            print(f"❌ Error: No se encontró el archivo {sql_file}")
            return False

        print(f"📄 Leyendo script SQL desde: {sql_file}")
        sql_script = sql_file.read_text(encoding="utf-8")

        print("🔄 Ejecutando migración...")
        with engine.connect() as connection:
            connection.execute(text(sql_script))
            connection.commit()

        print(
            "✅ Tabla 'project_subseccion_implementacion_talento_humano' creada exitosamente!"
        )
        print("\nAhora puedes:")
        print("1. Reiniciar el servidor backend")
        print(
            "2. Crear subsecciones personalizadas en Talento Humano desde el frontend"
        )
        print("3. Las subsecciones se guardarán automáticamente en la base de datos")

        return True

    except Exception as e:
        print(f"❌ Error al crear la tabla: {str(e)}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("CREACIÓN DE TABLA PARA SUBSECCIONES DE TALENTO HUMANO")
    print("=" * 60)
    print()

    exito = crear_tabla_subsecciones_talento_humano()

    if not exito:
        print("\n⚠️  La migración falló. Revisa los errores arriba.")
        print("Puedes ejecutar el SQL manualmente desde psql o pgAdmin.")

    print("\n" + "=" * 60)
