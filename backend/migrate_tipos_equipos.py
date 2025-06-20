from sqlalchemy.orm import Session
from core.database import SessionLocal, engine
from app.models.tipo_equipo import Tipo, Equipo, Base
from app.models.proyecto import Proyecto

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)

def migrate_tipos_equipos():
    db = SessionLocal()
    try:
        # Obtener todos los proyectos
        proyectos = db.query(Proyecto).all()
        
        # Recopilar todos los tipos y equipos únicos
        tipos_unicos = set()
        equipos_unicos = set()
        
        for proyecto in proyectos:
            # Aquí asumimos que los tipos y equipos están almacenados como strings separados por comas
            # o como arrays en algún campo. Ajusta según cómo estén almacenados actualmente.
            if hasattr(proyecto, 'tipo') and proyecto.tipo:
                if isinstance(proyecto.tipo, list):
                    for t in proyecto.tipo:
                        tipos_unicos.add(t)
                else:
                    tipos_unicos.add(proyecto.tipo)
            
            if hasattr(proyecto, 'equipo') and proyecto.equipo:
                if isinstance(proyecto.equipo, list):
                    for e in proyecto.equipo:
                        equipos_unicos.add(e)
                else:
                    equipos_unicos.add(proyecto.equipo)
        
        # Crear tipos únicos
        tipos_dict = {}
        for nombre_tipo in tipos_unicos:
            tipo = Tipo(nombre=nombre_tipo)
            db.add(tipo)
            db.flush()
            tipos_dict[nombre_tipo] = tipo
        
        # Crear equipos únicos
        equipos_dict = {}
        for nombre_equipo in equipos_unicos:
            equipo = Equipo(nombre=nombre_equipo)
            db.add(equipo)
            db.flush()
            equipos_dict[nombre_equipo] = equipo
        
        # Asociar tipos y equipos a proyectos
        for proyecto in proyectos:
            if hasattr(proyecto, 'tipo') and proyecto.tipo:
                if isinstance(proyecto.tipo, list):
                    for t in proyecto.tipo:
                        proyecto.tipos.append(tipos_dict[t])
                else:
                    proyecto.tipos.append(tipos_dict[proyecto.tipo])
            
            if hasattr(proyecto, 'equipo') and proyecto.equipo:
                if isinstance(proyecto.equipo, list):
                    for e in proyecto.equipo:
                        proyecto.equipos.append(equipos_dict[e])
                else:
                    proyecto.equipos.append(equipos_dict[proyecto.equipo])
        
        db.commit()
        print("Migración completada con éxito")
    
    except Exception as e:
        db.rollback()
        print(f"Error durante la migración: {e}")
    
    finally:
        db.close()

if __name__ == "__main__":
    migrate_tipos_equipos()