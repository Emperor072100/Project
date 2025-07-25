"""
Script para crear la tabla campañas_clientes_corporativos
"""
from core.database import engine
from app.models.cliente_corporativo import ClienteCorporativo


def create_cliente_corporativo_table():
    """Crear la tabla de clientes corporativos"""
    try:
        # Crear solo la tabla de cliente corporativo
        ClienteCorporativo.__table__.create(engine, checkfirst=True)
        print("✅ Tabla 'campañas_clientes_corporativos' creada exitosamente")
        
        # Mostrar información de la tabla
        print("\n📋 Estructura de la tabla:")
        print("- id: Integer (Primary Key)")
        print("- nombre: String (Not Null)")
        print("- logo: String (Nullable) - URL del logo")
        print("- sector: String (Not Null)")
        
    except Exception as e:
        print(f"❌ Error creando la tabla: {e}")


if __name__ == "__main__":
    create_cliente_corporativo_table()
