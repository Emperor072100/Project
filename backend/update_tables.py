"""
Script para actualizar todas las tablas:
- campañas_clientes_corporativos (nombre, logo, sector)
- campañas_contacto (nombre, telefono, correo, cliente_corporativo_id)
- campañas_campañas (nombre, tipo, cliente_corporativo_id, contacto_id,
                     lider_de_campaña, ejecutivo, fecha_de_produccion)
"""
from core.database import engine
from app.models.cliente import Cliente
from app.models.cliente_corporativo import ClienteCorporativo
from app.models.campana import Campaña
from sqlalchemy import text


def update_all_tables(recreate_campañas=False):
    """Actualizar todas las tablas con la nueva estructura"""
    try:
        # Crear tablas en el orden correcto (respetando foreign keys)
        ClienteCorporativo.__table__.create(engine, checkfirst=True)
        print("✅ Tabla 'campañas_clientes_corporativos' creada/verificada")
        
        Cliente.__table__.create(engine, checkfirst=True)
        print("✅ Tabla 'campañas_contacto' creada/verificada")
        
        # Manejar la tabla de campañas
        if recreate_campañas:
            print("\n🔄 Recreando tabla campañas_campañas...")
            with engine.connect() as connection:
                # Eliminar la tabla primero
                connection.execute(
                    text("DROP TABLE IF EXISTS campañas_campañas")
                )
                # Eliminar el tipo ENUM si existe
                connection.execute(
                    text("DROP TYPE IF EXISTS \"tipocampaña\"")
                )
                connection.commit()
                print("🗑️ Tabla anterior y tipo ENUM eliminados")
            
            Campaña.__table__.create(engine)
            print("✅ Tabla 'campañas_campañas' recreada con nueva estructura")
        else:
            Campaña.__table__.create(engine, checkfirst=True)
            print("✅ Tabla 'campañas_campañas' creada/verificada")
        
        print("\n📋 Estructura final de las tablas:")
        
        print("\n1. campañas_clientes_corporativos:")
        print("   - id: Integer (Primary Key)")
        print("   - nombre: String (Not Null)")
        print("   - logo: String (Nullable) - URL del logo")
        print("   - sector: String (Not Null)")
        
        print("\n2. campañas_contacto:")
        print("   - id: Integer (Primary Key)")
        print("   - nombre: String (Not Null)")
        print("   - telefono: String (Not Null)")
        print("   - correo: String (Not Null)")
        print("   - cliente_corporativo_id: Integer (Foreign Key)")
        
        print("\n3. campañas_campañas:")
        print("   - id: Integer (Primary Key)")
        print("   - nombre: String (Not Null)")
        print("   - tipo: Enum (SAC, TMC, TVT, CBZ)")
        print("   - cliente_corporativo_id: Integer (Foreign Key)")
        print("   - contacto_id: Integer (Foreign Key)")
        print("   - lider_de_campaña: String (Not Null)")
        print("   - ejecutivo: String (Not Null)")
        print("   - fecha_de_produccion: Date (Not Null) - Solo fecha")
        print("   - estado: Enum (activo, inactivo) - Default: activo")
        
        print("\n✅ Todas las tablas han sido actualizadas exitosamente!")
        
        if recreate_campañas:
            print("\n⚠️ ADVERTENCIA: Se perdieron los datos anteriores " +
                  "de campañas_campañas")
        
    except Exception as e:
        print(f"❌ Error actualizando las tablas: {e}")


if __name__ == "__main__":
    print("Opciones:")
    print("1. Actualizar tablas (mantener datos existentes)")
    print("2. Recrear tabla campañas_campañas (PERDER DATOS)")
    
    opcion = input("Selecciona una opción (1 o 2): ")
    
    if opcion == "2":
        confirm = input("⚠️ Esto eliminará TODOS los datos de " +
                        "campañas_campañas. ¿Continuar? (SI/no): ")
        if confirm.upper() == 'SI':
            update_all_tables(recreate_campañas=True)
        else:
            print("❌ Operación cancelada")
    else:
        update_all_tables(recreate_campañas=False)
