-- Agregar columna 'seccion' a las tablas de subsecciones personalizadas

-- 1. Talento Humano
ALTER TABLE project_subseccion_implementacion_talento_humano 
ADD COLUMN IF NOT EXISTS seccion VARCHAR(50) DEFAULT 'talento_humano';

UPDATE project_subseccion_implementacion_talento_humano 
SET seccion = 'talento_humano' 
WHERE seccion IS NULL;

-- 2. Procesos
ALTER TABLE project_subseccion_implementacion_procesos 
ADD COLUMN IF NOT EXISTS seccion VARCHAR(50) DEFAULT 'procesos';

UPDATE project_subseccion_implementacion_procesos 
SET seccion = 'procesos' 
WHERE seccion IS NULL;

-- 3. Tecnología
ALTER TABLE project_subseccion_implementacion_tecnologia 
ADD COLUMN IF NOT EXISTS seccion VARCHAR(50) DEFAULT 'tecnologia';

UPDATE project_subseccion_implementacion_tecnologia 
SET seccion = 'tecnologia' 
WHERE seccion IS NULL;

-- Agregar comentarios
COMMENT ON COLUMN project_subseccion_implementacion_talento_humano.seccion IS 'Sección a la que pertenece la subsección (talento_humano)';
COMMENT ON COLUMN project_subseccion_implementacion_procesos.seccion IS 'Sección a la que pertenece la subsección (procesos)';
COMMENT ON COLUMN project_subseccion_implementacion_tecnologia.seccion IS 'Sección a la que pertenece la subsección (tecnologia)';
