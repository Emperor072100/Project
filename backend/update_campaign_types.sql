-- Script para actualizar los tipos de campaña en la base de datos
-- Ejecutar este script en PostgreSQL para actualizar el enum

-- 1. Agregar los nuevos valores al enum existente
ALTER TYPE tipocampaña ADD VALUE IF NOT EXISTS 'TMC';
ALTER TYPE tipocampaña ADD VALUE IF NOT EXISTS 'TVT';
ALTER TYPE tipocampaña ADD VALUE IF NOT EXISTS 'CBZ';

-- 2. Actualizar los datos existentes
UPDATE campañas_campañas SET tipo = 'TMC' WHERE tipo = 'TMG';
UPDATE campañas_campañas SET tipo = 'CBZ' WHERE tipo = 'CBI';
UPDATE campañas_campañas SET tipo = 'TVT' WHERE tipo = 'OTRO';

-- 3. Eliminar los valores viejos (esto es más complejo en PostgreSQL)
-- Por ahora, dejaremos que coexistan ambos valores
-- Los nuevos registros usarán TMC, TVT, CBZ

-- Verificar los datos
SELECT tipo, COUNT(*) FROM campañas_campañas GROUP BY tipo;
