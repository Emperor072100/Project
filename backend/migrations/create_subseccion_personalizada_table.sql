-- Migración para agregar tabla de subsecciones personalizadas
-- Fecha: 2025-10-16
-- Propósito: Almacenar subsecciones dinámicas creadas por el usuario en el formulario de implementaciones

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

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subseccion_impl_id ON project_implementacion_subseccion_personalizada(cliente_implementacion_id);
CREATE INDEX IF NOT EXISTS idx_subseccion_seccion ON project_implementacion_subseccion_personalizada(seccion);

COMMENT ON TABLE project_implementacion_subseccion_personalizada IS 'Almacena las subsecciones personalizadas creadas dinámicamente por el usuario';
COMMENT ON COLUMN project_implementacion_subseccion_personalizada.seccion IS 'Sección a la que pertenece: contractual, talento_humano, procesos, tecnologia';
COMMENT ON COLUMN project_implementacion_subseccion_personalizada.nombre_subsesion IS 'Clave/nombre de la subsección personalizada';
