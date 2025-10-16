BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 2988863cf59f

CREATE TABLE project_campanas_clientes_corporativos (
    id SERIAL NOT NULL, 
    nombre VARCHAR NOT NULL, 
    logo VARCHAR, 
    sector VARCHAR NOT NULL, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_project_campanas_clientes_corporativos_id ON project_campanas_clientes_corporativos (id);

CREATE INDEX ix_project_campanas_clientes_corporativos_nombre ON project_campanas_clientes_corporativos (nombre);

CREATE TABLE project_equipos (
    id SERIAL NOT NULL, 
    nombre VARCHAR NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (nombre)
);

CREATE INDEX ix_project_equipos_id ON project_equipos (id);

CREATE TABLE project_estados (
    id SERIAL NOT NULL, 
    nombre VARCHAR(255) NOT NULL, 
    categoria VARCHAR(255), 
    PRIMARY KEY (id)
);

CREATE INDEX ix_project_estados_id ON project_estados (id);

CREATE TABLE project_implementaciones_clienteimple (
    id SERIAL NOT NULL, 
    cliente_implementacion VARCHAR NOT NULL, 
    proceso_implementacion VARCHAR NOT NULL, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_project_implementaciones_clienteimple_id ON project_implementaciones_clienteimple (id);

CREATE TABLE project_prioridades (
    id SERIAL NOT NULL, 
    nivel VARCHAR(255) NOT NULL, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_project_prioridades_id ON project_prioridades (id);

CREATE TABLE project_tipos (
    id SERIAL NOT NULL, 
    nombre VARCHAR NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (nombre)
);

CREATE INDEX ix_project_tipos_id ON project_tipos (id);

CREATE TYPE rolusuario AS ENUM ('admin', 'usuario');

CREATE TABLE project_usuarios (
    id SERIAL NOT NULL, 
    nombre VARCHAR NOT NULL, 
    correo VARCHAR NOT NULL, 
    hashed_password VARCHAR NOT NULL, 
    rol rolusuario, 
    apellido VARCHAR NOT NULL, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_project_usuarios_correo ON project_usuarios (correo);

CREATE INDEX ix_project_usuarios_id ON project_usuarios (id);

CREATE UNIQUE INDEX ix_project_usuarios_nombre ON project_usuarios (nombre);

CREATE TABLE project_campanas_contacto (
    id SERIAL NOT NULL, 
    nombre VARCHAR NOT NULL, 
    telefono VARCHAR NOT NULL, 
    correo VARCHAR NOT NULL, 
    cliente_corporativo_id INTEGER NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(cliente_corporativo_id) REFERENCES project_campanas_clientes_corporativos (id)
);

CREATE INDEX ix_project_campanas_contacto_id ON project_campanas_contacto (id);

CREATE TABLE project_implementacion_contractual (
    id SERIAL NOT NULL, 
    cliente_implementacion_id INTEGER NOT NULL, 
    modelo_contrato_seguimiento VARCHAR, 
    modelo_contrato_estado VARCHAR, 
    modelo_contrato_responsable VARCHAR, 
    modelo_contrato_notas VARCHAR, 
    modelo_confidencialidad_seguimiento VARCHAR, 
    modelo_confidencialidad_estado VARCHAR, 
    modelo_confidencialidad_responsable VARCHAR, 
    modelo_confidencialidad_notas VARCHAR, 
    alcance_seguimiento VARCHAR, 
    alcance_estado VARCHAR, 
    alcance_responsable VARCHAR, 
    alcance_notas VARCHAR, 
    fecha_inicio_seguimiento VARCHAR, 
    fecha_inicio_estado VARCHAR, 
    fecha_inicio_responsable VARCHAR, 
    fecha_inicio_notas VARCHAR, 
    PRIMARY KEY (id), 
    FOREIGN KEY(cliente_implementacion_id) REFERENCES project_implementaciones_clienteimple (id)
);

CREATE INDEX ix_project_implementacion_contractual_id ON project_implementacion_contractual (id);

CREATE TABLE project_implementacion_procesos (
    id SERIAL NOT NULL, 
    cliente_implementacion_id INTEGER NOT NULL, 
    responsable_cliente_seguimiento VARCHAR, 
    responsable_cliente_estado VARCHAR, 
    responsable_cliente_responsable VARCHAR, 
    responsable_cliente_notas VARCHAR, 
    responsable_andes_seguimiento VARCHAR, 
    responsable_andes_estado VARCHAR, 
    responsable_andes_responsable VARCHAR, 
    responsable_andes_notas VARCHAR, 
    responsables_operacion_seguimiento VARCHAR, 
    responsables_operacion_estado VARCHAR, 
    responsables_operacion_responsable VARCHAR, 
    responsables_operacion_notas VARCHAR, 
    listado_reportes_seguimiento VARCHAR, 
    listado_reportes_estado VARCHAR, 
    listado_reportes_responsable VARCHAR, 
    listado_reportes_notas VARCHAR, 
    protocolo_comunicaciones_seguimiento VARCHAR, 
    protocolo_comunicaciones_estado VARCHAR, 
    protocolo_comunicaciones_responsable VARCHAR, 
    protocolo_comunicaciones_notas VARCHAR, 
    informacion_diaria_seguimiento VARCHAR, 
    informacion_diaria_estado VARCHAR, 
    informacion_diaria_responsable VARCHAR, 
    informacion_diaria_notas VARCHAR, 
    seguimiento_periodico_seguimiento VARCHAR, 
    seguimiento_periodico_estado VARCHAR, 
    seguimiento_periodico_responsable VARCHAR, 
    seguimiento_periodico_notas VARCHAR, 
    guiones_protocolos_seguimiento VARCHAR, 
    guiones_protocolos_estado VARCHAR, 
    guiones_protocolos_responsable VARCHAR, 
    guiones_protocolos_notas VARCHAR, 
    proceso_monitoreo_seguimiento VARCHAR, 
    proceso_monitoreo_estado VARCHAR, 
    proceso_monitoreo_responsable VARCHAR, 
    proceso_monitoreo_notas VARCHAR, 
    cronograma_tecnologia_seguimiento VARCHAR, 
    cronograma_tecnologia_estado VARCHAR, 
    cronograma_tecnologia_responsable VARCHAR, 
    cronograma_tecnologia_notas VARCHAR, 
    cronograma_capacitaciones_seguimiento VARCHAR, 
    cronograma_capacitaciones_estado VARCHAR, 
    cronograma_capacitaciones_responsable VARCHAR, 
    cronograma_capacitaciones_notas VARCHAR, 
    realizacion_pruebas_seguimiento VARCHAR, 
    realizacion_pruebas_estado VARCHAR, 
    realizacion_pruebas_responsable VARCHAR, 
    realizacion_pruebas_notas VARCHAR, 
    PRIMARY KEY (id), 
    FOREIGN KEY(cliente_implementacion_id) REFERENCES project_implementaciones_clienteimple (id)
);

CREATE INDEX ix_project_implementacion_procesos_id ON project_implementacion_procesos (id);

CREATE TABLE "project_implementacion_talentoHumano" (
    id SERIAL NOT NULL, 
    cliente_implementacion_id INTEGER NOT NULL, 
    perfil_personal_seguimiento VARCHAR, 
    perfil_personal_estado VARCHAR, 
    perfil_personal_responsable VARCHAR, 
    perfil_personal_notas VARCHAR, 
    cantidad_asesores_seguimiento VARCHAR, 
    cantidad_asesores_estado VARCHAR, 
    cantidad_asesores_responsable VARCHAR, 
    cantidad_asesores_notas VARCHAR, 
    horarios_seguimiento VARCHAR, 
    horarios_estado VARCHAR, 
    horarios_responsable VARCHAR, 
    horarios_notas VARCHAR, 
    formador_seguimiento VARCHAR, 
    formador_estado VARCHAR, 
    formador_responsable VARCHAR, 
    formador_notas VARCHAR, 
    capacitaciones_andes_seguimiento VARCHAR, 
    capacitaciones_andes_estado VARCHAR, 
    capacitaciones_andes_responsable VARCHAR, 
    capacitaciones_andes_notas VARCHAR, 
    capacitaciones_cliente_seguimiento VARCHAR, 
    capacitaciones_cliente_estado VARCHAR, 
    capacitaciones_cliente_responsable VARCHAR, 
    capacitaciones_cliente_notas VARCHAR, 
    PRIMARY KEY (id), 
    FOREIGN KEY(cliente_implementacion_id) REFERENCES project_implementaciones_clienteimple (id)
);

CREATE INDEX "ix_project_implementacion_talentoHumano_id" ON "project_implementacion_talentoHumano" (id);

CREATE TABLE project_implementacion_tecnologia (
    id SERIAL NOT NULL, 
    cliente_implementacion_id INTEGER NOT NULL, 
    creacion_modulo_seguimiento VARCHAR, 
    creacion_modulo_estado VARCHAR, 
    creacion_modulo_responsable VARCHAR, 
    creacion_modulo_notas VARCHAR, 
    tipificacion_interacciones_seguimiento VARCHAR, 
    tipificacion_interacciones_estado VARCHAR, 
    tipificacion_interacciones_responsable VARCHAR, 
    tipificacion_interacciones_notas VARCHAR, 
    aplicativos_proceso_seguimiento VARCHAR, 
    aplicativos_proceso_estado VARCHAR, 
    aplicativos_proceso_responsable VARCHAR, 
    aplicativos_proceso_notas VARCHAR, 
    whatsapp_seguimiento VARCHAR, 
    whatsapp_estado VARCHAR, 
    whatsapp_responsable VARCHAR, 
    whatsapp_notas VARCHAR, 
    correos_electronicos_seguimiento VARCHAR, 
    correos_electronicos_estado VARCHAR, 
    correos_electronicos_responsable VARCHAR, 
    correos_electronicos_notas VARCHAR, 
    requisitos_grabacion_seguimiento VARCHAR, 
    requisitos_grabacion_estado VARCHAR, 
    requisitos_grabacion_responsable VARCHAR, 
    requisitos_grabacion_notas VARCHAR, 
    PRIMARY KEY (id), 
    FOREIGN KEY(cliente_implementacion_id) REFERENCES project_implementaciones_clienteimple (id)
);

CREATE INDEX ix_project_implementacion_tecnologia_id ON project_implementacion_tecnologia (id);

CREATE TABLE project_proyectos (
    id SERIAL NOT NULL, 
    nombre VARCHAR NOT NULL, 
    objetivo TEXT, 
    enlace VARCHAR, 
    observaciones TEXT, 
    fecha_inicio DATE, 
    fecha_fin DATE, 
    progreso FLOAT, 
    responsable_id INTEGER NOT NULL, 
    estado_id INTEGER NOT NULL, 
    prioridad_id INTEGER NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(estado_id) REFERENCES project_estados (id), 
    FOREIGN KEY(prioridad_id) REFERENCES project_prioridades (id), 
    FOREIGN KEY(responsable_id) REFERENCES project_usuarios (id)
);

CREATE INDEX ix_project_proyectos_id ON project_proyectos (id);

CREATE TYPE "tipocampa±a" AS ENUM ('SAC', 'TMC', 'TVT', 'CBZ');

CREATE TYPE "estadocampa±a" AS ENUM ('ACTIVO', 'INACTIVO');

CREATE TABLE project_campanas_campanas (
    id SERIAL NOT NULL, 
    nombre VARCHAR NOT NULL, 
    tipo "tipocampa±a" NOT NULL, 
    cliente_corporativo_id INTEGER NOT NULL, 
    contacto_id INTEGER NOT NULL, 
    contacto_id_secundario INTEGER, 
    "lider_de_campa±a" VARCHAR NOT NULL, 
    ejecutivo VARCHAR NOT NULL, 
    fecha_de_produccion DATE NOT NULL, 
    estado "estadocampa±a" NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(cliente_corporativo_id) REFERENCES project_campanas_clientes_corporativos (id), 
    FOREIGN KEY(contacto_id) REFERENCES project_campanas_contacto (id), 
    FOREIGN KEY(contacto_id_secundario) REFERENCES project_campanas_contacto (id)
);

CREATE INDEX ix_project_campanas_campanas_id ON project_campanas_campanas (id);

CREATE TABLE project_tareas (
    id SERIAL NOT NULL, 
    nombre VARCHAR, 
    descripcion VARCHAR, 
    proyecto_id INTEGER, 
    PRIMARY KEY (id), 
    FOREIGN KEY(proyecto_id) REFERENCES project_proyectos (id)
);

CREATE TABLE proyecto_equipos (
    proyecto_id INTEGER NOT NULL, 
    equipo_id INTEGER NOT NULL, 
    PRIMARY KEY (proyecto_id, equipo_id), 
    FOREIGN KEY(equipo_id) REFERENCES project_equipos (id), 
    FOREIGN KEY(proyecto_id) REFERENCES project_proyectos (id)
);

CREATE TABLE proyecto_tipos (
    proyecto_id INTEGER NOT NULL, 
    tipo_id INTEGER NOT NULL, 
    PRIMARY KEY (proyecto_id, tipo_id), 
    FOREIGN KEY(proyecto_id) REFERENCES project_proyectos (id), 
    FOREIGN KEY(tipo_id) REFERENCES project_tipos (id)
);

CREATE TABLE project_facturacion_campanas (
    id SERIAL NOT NULL, 
    "campa±a_id" INTEGER NOT NULL, 
    unidad VARCHAR NOT NULL, 
    cantidad INTEGER NOT NULL, 
    valor FLOAT NOT NULL, 
    periodicidad VARCHAR NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY("campa±a_id") REFERENCES project_campanas_campanas (id)
);

CREATE INDEX ix_project_facturacion_campanas_id ON project_facturacion_campanas (id);

CREATE TABLE project_historial_campanas (
    id SERIAL NOT NULL, 
    "campa±a_id" INTEGER NOT NULL, 
    usuario_id INTEGER, 
    accion VARCHAR NOT NULL, 
    cambios JSON, 
    fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    observaciones TEXT, 
    PRIMARY KEY (id), 
    FOREIGN KEY("campa±a_id") REFERENCES project_campanas_campanas (id)
);

CREATE INDEX ix_project_historial_campanas_id ON project_historial_campanas (id);

CREATE TYPE tipoproducto AS ENUM ('PRODUCTO', 'SERVICIO');

CREATE TYPE propiedadproducto AS ENUM ('PROPIA', 'ALQUILADA');

CREATE TABLE project_productos_campanas (
    id SERIAL NOT NULL, 
    "campa±a_id" INTEGER NOT NULL, 
    tipo tipoproducto NOT NULL, 
    producto_servicio VARCHAR NOT NULL, 
    proveedor VARCHAR NOT NULL, 
    propiedad propiedadproducto NOT NULL, 
    cantidad INTEGER NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY("campa±a_id") REFERENCES project_campanas_campanas (id)
);

CREATE INDEX ix_project_productos_campanas_id ON project_productos_campanas (id);

INSERT INTO alembic_version (version_num) VALUES ('2988863cf59f') RETURNING alembic_version.version_num;

-- Running upgrade 2988863cf59f -> 463d5cb8cf7e

UPDATE alembic_version SET version_num='463d5cb8cf7e' WHERE alembic_version.version_num = '2988863cf59f';

-- Running upgrade 463d5cb8cf7e -> 886bd78d7b4a

UPDATE alembic_version SET version_num='886bd78d7b4a' WHERE alembic_version.version_num = '463d5cb8cf7e';

-- Running upgrade 886bd78d7b4a -> 5fb943806368

UPDATE alembic_version SET version_num='5fb943806368' WHERE alembic_version.version_num = '886bd78d7b4a';

-- Running upgrade 5fb943806368 -> 6b83debdc419

UPDATE alembic_version SET version_num='6b83debdc419' WHERE alembic_version.version_num = '5fb943806368';

-- Running upgrade 6b83debdc419 -> 732690e104bb

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN cliente VARCHAR NOT NULL;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN proceso VARCHAR NOT NULL;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN contractual JSON;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN talento_humano JSON;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN procesos JSON;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN tecnologia JSON;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN estado VARCHAR;

ALTER TABLE project_implementaciones_clienteimple DROP COLUMN proceso_implementacion;

ALTER TABLE project_implementaciones_clienteimple DROP COLUMN cliente_implementacion;

UPDATE alembic_version SET version_num='732690e104bb' WHERE alembic_version.version_num = '6b83debdc419';

-- Running upgrade 732690e104bb -> d9a904263f05

ALTER TABLE project_implementaciones_clienteimple DROP COLUMN procesos;

ALTER TABLE project_implementaciones_clienteimple DROP COLUMN contractual;

ALTER TABLE project_implementaciones_clienteimple DROP COLUMN talento_humano;

ALTER TABLE project_implementaciones_clienteimple DROP COLUMN tecnologia;

ALTER TABLE project_implementaciones_clienteimple DROP COLUMN estado;

UPDATE alembic_version SET version_num='d9a904263f05' WHERE alembic_version.version_num = '732690e104bb';

-- Running upgrade d9a904263f05 -> 6f698bccbe57

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN estado VARCHAR;

UPDATE alembic_version SET version_num='6f698bccbe57' WHERE alembic_version.version_num = 'd9a904263f05';

-- Running upgrade 6f698bccbe57 -> 4f350724156b

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN contractual JSON;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN talento_humano JSON;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN procesos JSON;

ALTER TABLE project_implementaciones_clienteimple ADD COLUMN tecnologia JSON;

UPDATE alembic_version SET version_num='4f350724156b' WHERE alembic_version.version_num = '6f698bccbe57';

-- Running upgrade 4f350724156b -> 9c942b8ef46f

CREATE TABLE entregas (
    id SERIAL NOT NULL, 
    implementacion_id INTEGER NOT NULL, 
    cliente VARCHAR(255) NOT NULL, 
    servicio VARCHAR(255) NOT NULL, 
    fecha_entrega TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    estado VARCHAR(50) NOT NULL, 
    responsable VARCHAR(255), 
    datos_contractual JSON, 
    datos_tecnologia JSON, 
    datos_procesos JSON, 
    notas TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(implementacion_id) REFERENCES project_implementaciones_clienteimple (id)
);

CREATE INDEX ix_entregas_id ON entregas (id);

UPDATE alembic_version SET version_num='9c942b8ef46f' WHERE alembic_version.version_num = '4f350724156b';

-- Running upgrade 9c942b8ef46f -> 52808178d974

CREATE TABLE "project_entregaImplementaciones" (
    id SERIAL NOT NULL, 
    implementacion_id INTEGER NOT NULL, 
    fecha_entrega TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    datos_entrega JSON, 
    responsable_entrega VARCHAR(255), 
    estado_entrega VARCHAR(50) NOT NULL, 
    notas_adicionales TEXT, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(implementacion_id) REFERENCES project_implementaciones_clienteimple (id)
);

CREATE INDEX "ix_project_entregaImplementaciones_id" ON "project_entregaImplementaciones" (id);

DROP INDEX ix_entregas_id;

DROP TABLE entregas;

UPDATE alembic_version SET version_num='52808178d974' WHERE alembic_version.version_num = '9c942b8ef46f';

-- Running upgrade 52808178d974 -> c863b98dda65

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN contrato TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN acuerdo_niveles_servicio TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN polizas TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN penalidades TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN alcance_servicio TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN unidades_facturacion TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN acuerdo_pago TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN incremento TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN mapa_aplicativos TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN internet TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN telefonia TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN whatsapp TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN integraciones TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN vpn TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN diseno_ivr TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN transferencia_llamadas TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN correos_electronicos TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN linea_018000 TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN linea_entrada TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN sms TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN requisitos_grabacion TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN entrega_resguardo TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN encuesta_satisfaccion TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN listado_reportes TEXT;

ALTER TABLE "project_entregaImplementaciones" ADD COLUMN proceso_monitoreo_calidad TEXT;

ALTER TABLE "project_entregaImplementaciones" DROP COLUMN datos_entrega;

UPDATE alembic_version SET version_num='c863b98dda65' WHERE alembic_version.version_num = '52808178d974';

-- Running upgrade c863b98dda65 -> 12c71a71d1d8

ALTER TABLE "project_entregaImplementaciones" DROP COLUMN responsable_entrega;

ALTER TABLE "project_entregaImplementaciones" DROP COLUMN notas_adicionales;

UPDATE alembic_version SET version_num='12c71a71d1d8' WHERE alembic_version.version_num = 'c863b98dda65';

COMMIT;

