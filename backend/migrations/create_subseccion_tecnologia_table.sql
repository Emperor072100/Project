-- Crear tabla para subsecciones personalizadas de Tecnología
CREATE TABLE IF NOT EXISTS project_subseccion_implementacion_tecnologia (
    id SERIAL PRIMARY KEY,
    cliente_implementacion_id INTEGER NOT NULL,
    nombre_subsesion VARCHAR(255) NOT NULL,
    seguimiento TEXT,
    estado VARCHAR(100),
    responsable VARCHAR(255),
    notas TEXT,
    FOREIGN KEY (cliente_implementacion_id) REFERENCES project_implementaciones_clienteimple(id) ON DELETE CASCADE
);

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_subseccion_tecnologia_cliente_id 
ON project_subseccion_implementacion_tecnologia(cliente_implementacion_id);

-- Agregar comentarios para documentación
COMMENT ON TABLE project_subseccion_implementacion_tecnologia IS 'Almacena las subsecciones personalizadas de la sección Tecnología';
COMMENT ON COLUMN project_subseccion_implementacion_tecnologia.nombre_subsesion IS 'Nombre de la subsección personalizada ingresada por el usuario';
