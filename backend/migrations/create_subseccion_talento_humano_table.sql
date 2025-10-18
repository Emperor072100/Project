-- Migración para agregar tabla de subsecciones personalizadas de Talento Humano
-- Fecha: 2025-10-16
-- Propósito: Almacenar subsecciones dinámicas creadas por el usuario en la sección de Talento Humano

CREATE TABLE IF NOT EXISTS project_subseccion_implementacion_talento_humano (
    id SERIAL PRIMARY KEY,
    cliente_implementacion_id INTEGER NOT NULL,
    nombre_subsesion VARCHAR(255) NOT NULL,
    seguimiento TEXT,
    estado VARCHAR(100),
    responsable VARCHAR(255),
    notas TEXT,
    FOREIGN KEY (cliente_implementacion_id) REFERENCES project_implementaciones_clienteimple(id) ON DELETE CASCADE
);

-- Índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subseccion_th_impl_id ON project_subseccion_implementacion_talento_humano(cliente_implementacion_id);

COMMENT ON TABLE project_subseccion_implementacion_talento_humano IS 'Almacena las subsecciones personalizadas de Talento Humano creadas dinámicamente por el usuario';
COMMENT ON COLUMN project_subseccion_implementacion_talento_humano.nombre_subsesion IS 'Clave/nombre de la subsección personalizada';
