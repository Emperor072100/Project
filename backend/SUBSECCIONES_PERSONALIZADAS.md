# Implementación de Subsecciones Personalizadas

## ¿Qué se implementó?

Se agregó la funcionalidad para que las subsecciones personalizadas que creas con el botón "+ Nueva subsesión" se guarden correctamente en la base de datos.

## Cambios realizados

### 1. Nuevo modelo de base de datos
- **Archivo**: `backend/models/project_implementacion_subseccion_personalizada.py`
- **Tabla**: `project_implementacion_subseccion_personalizada`
- **Propósito**: Almacenar las subsecciones personalizadas con sus 4 campos (Seguimiento, Estado, Responsable, Notas)

### 2. Funciones helper agregadas a `backend/routers/implementaciones.py`
- `CAMPOS_PREDEFINIDOS`: Diccionario que define cuáles campos son predefinidos vs personalizados
- `guardar_subsecciones_personalizadas()`: Guarda subsecciones personalizadas en la BD
- `obtener_subsecciones_personalizadas()`: Recupera subsecciones personalizadas desde la BD

### 3. Endpoints modificados
- **POST `/implementaciones/`**: Ahora guarda subsecciones personalizadas al crear
- **GET `/implementaciones/{id}`**: Ahora recupera subsecciones personalizadas al consultar
- **PUT `/implementaciones/{id}`**: Ahora actualiza subsecciones personalizadas

### 4. Script de migración SQL
- **Archivo**: `backend/migrations/create_subseccion_personalizada_table.sql`

## Pasos para activar la funcionalidad

### Paso 1: Ejecutar la migración SQL

Conéctate a tu base de datos PostgreSQL y ejecuta:

```powershell
# Opción 1: Desde psql
psql -U tu_usuario -d nombre_base_datos -f backend/migrations/create_subseccion_personalizada_table.sql

# Opción 2: Usando Python
cd backend
python -c "from core.database import engine; from pathlib import Path; engine.execute(Path('migrations/create_subseccion_personalizada_table.sql').read_text())"
```

O ejecuta manualmente el SQL:

```sql
CREATE TABLE IF NOT EXISTS project_implementacion_subseccion_personalizada (
    id SERIAL PRIMARY KEY,
    cliente_implementacion_id INTEGER NOT NULL,
    seccion VARCHAR(50) NOT NULL,
    nombre_subsesion VARCHAR(255) NOT NULL,
    seguimiento TEXT,
    estado VARCHAR(100),
    responsable VARCHAR(255),
    notas TEXT,
    FOREIGN KEY (cliente_implementacion_id) REFERENCES project_implementaciones_clienteimple(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subseccion_impl_id ON project_implementacion_subseccion_personalizada(cliente_implementacion_id);
CREATE INDEX IF NOT EXISTS idx_subseccion_seccion ON project_implementacion_subseccion_personalizada(seccion);
```

### Paso 2: Reiniciar el servidor backend

```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Paso 3: Probar la funcionalidad

1. Abre el frontend de Implementaciones
2. Crea o edita una implementación
3. En cualquier sección (Contractual, Talento Humano, Procesos, Tecnología):
   - Haz clic en el botón "+ Nueva subsesión"
   - Escribe el nombre de la subsesión (ej: "cuota")
   - Haz clic en "Agregar"
   - Llena los campos: Seguimiento, Estado, Responsable, Notas
4. Guarda la implementación
5. Recarga la página o cierra y vuelve a abrir la implementación
6. ✅ Deberías ver tu subsesión personalizada con todos los datos guardados

## Cómo funciona

### Al crear/editar una implementación:

1. **Frontend** detecta cuándo agregas una nueva subsesción:
   ```javascript
   agregarSubsesion('contractual') // Agrega al estado local
   ```

2. **Frontend** envía TODOS los campos al backend (predefinidos + personalizados):
   ```json
   {
     "contractual": {
       "modeloContrato": {...},
       "alcance": {...},
       "cuota": {  // ← Campo personalizado
         "seguimiento": "...",
         "estado": "...",
         "responsable": "...",
         "notas": "..."
       }
     }
   }
   ```

3. **Backend** identifica cuáles son personalizados:
   - Campos NO en `CAMPOS_PREDEFINIDOS['contractual']` = personalizados
   - Guarda predefinidos en tablas específicas
   - Guarda personalizados en `project_implementacion_subseccion_personalizada`

4. **Al recuperar**, el backend:
   - Lee campos predefinidos de las tablas específicas
   - Lee campos personalizados de `project_implementacion_subseccion_personalizada`
   - Combina todo en un solo objeto JSON

## Estructura de la tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | ID único |
| `cliente_implementacion_id` | INTEGER | FK a la implementación |
| `seccion` | VARCHAR(50) | contractual / talento_humano / procesos / tecnologia |
| `nombre_subsesion` | VARCHAR(255) | Nombre de la subsesión (ej: "cuota") |
| `seguimiento` | TEXT | Campo "Seguimiento" |
| `estado` | VARCHAR(100) | Campo "Estado" |
| `responsable` | VARCHAR(255) | Campo "Responsable" |
| `notas` | TEXT | Campo "Notas" |

## Verificación

Para verificar que todo funciona correctamente:

```sql
-- Ver todas las subsecciones personalizadas
SELECT * FROM project_implementacion_subseccion_personalizada;

-- Ver subsecciones de una implementación específica
SELECT * FROM project_implementacion_subseccion_personalizada 
WHERE cliente_implementacion_id = 1;

-- Ver subsecciones por sección
SELECT seccion, nombre_subsesion, estado 
FROM project_implementacion_subseccion_personalizada 
WHERE cliente_implementacion_id = 1;
```

## Solución de problemas

### Error: "table project_implementacion_subseccion_personalizada does not exist"
→ Ejecuta el script SQL de migración (Paso 1)

### Las subsecciones no se guardan
→ Verifica que el servidor backend esté reiniciado después de los cambios

### Las subsecciones se duplican
→ Funciona correctamente: al actualizar, se eliminan las viejas y se crean las nuevas

### No veo mis subsecciones después de guardar
→ Verifica en la consola del navegador si hay errores de red
→ Verifica los logs del backend para ver si se están guardando

## Próximos pasos (opcional)

Si quieres agregar más funcionalidades:

1. **Validación de nombres únicos**: Evitar subsecciones con el mismo nombre
2. **Auditoría**: Agregar campos `created_at` y `updated_at`
3. **Eliminación selectiva**: Botón para eliminar subsecciones personalizadas
4. **Orden**: Campo `orden` para controlar el orden de visualización
5. **Exportación PDF**: Incluir subsecciones personalizadas en el PDF de entrega

---

**¿Necesitas ayuda?** Revisa los logs del backend para mensajes como:
- "✅ Subsecciones personalizadas actualizadas"
- "Guardando subsesión personalizada: {nombre}"
