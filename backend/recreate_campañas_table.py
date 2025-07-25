"""
Script para recrear la tabla campañas_campañas con la nueva estructura
"""
from core.database import engine
from app.models.campana import Campaña
from sqlalchemy import text


def recreate_campañas_table():
    """Eliminar y recrear la tabla campañas_campañas"""
    try:
        # Conectar a la base de datos
        with engine.connect() as connection:
            # Eliminar la tabla si existe
            connection.execute(text("DROP TABLE IF EXISTS campañas_campañas"))
            connection.commit()
            print("🗑️ Tabla 'campañas_campañas' eliminada")
        
        # Recrear la tabla con la nueva estructura
        Campaña.__table__.create(engine)
        print("✅ Tabla 'campañas_campañas' recreada con nueva estructura")
        
        print("\n📋 Nueva estructura de campañas_campañas:")
        print("   - id: Integer (Primary Key)")
        print("   - nombre: String (Not Null)")
        print("   - tipo: Enum (SAC, TMC, TVT, CBZ)")
        print("   - cliente_corporativo_id: Integer (Foreign Key)")
        print("   - contacto_id: Integer (Foreign Key)")
        print("   - lider_de_campaña: String (Not Null)")
        print("   - ejecutivo: String (Not Null)")
        print("   - fecha_de_produccion: Date (Not Null) - Solo fecha")
        
        print("\n⚠️ ADVERTENCIA: Se han perdido todos los datos anteriores")
        print("   de la tabla campañas_campañas")
        
    except Exception as e:
        print(f"❌ Error recreando la tabla: {e}")


if __name__ == "__main__":
    print("⚠️ Este script eliminará TODOS los datos de campañas_campañas")
    confirm = input("¿Estás seguro? (escribe 'SI' para continuar): ")
    
    if confirm.upper() == 'SI':
        recreate_campañas_table()
    else:
        print("❌ Operación cancelada")
