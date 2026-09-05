-- ==============================================================================
-- SmartQueue - Esquema de Base de Datos PostgreSQL
-- Tabla de almacenamiento de turnos generados desde el webhook de n8n
-- ==============================================================================

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    turno_id VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    servicio VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(20) NOT NULL,
    tipo_atencion VARCHAR(50) NOT NULL,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices recomendados para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_turnos_codigo ON turnos(turno_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_servicio ON turnos(servicio);
