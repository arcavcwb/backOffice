---
name: supabase-data-layer
description: "Patrones para la capa de datos con Supabase: diseño de esquema, migraciones versionadas, políticas RLS, Edge Functions y tipos generados. Úsala al diseñar o implementar tablas, migraciones o lógica de servidor. Triggers: 'esquema', 'migración', 'tabla', 'Edge Function', 'database.types', 'diseño de base de datos', 'Supabase'."
---

# Skill: Capa de datos con Supabase

## Cuándo se activa
Al diseñar o implementar esquema, migraciones, políticas RLS, Edge Functions o
tipos generados.

## Migraciones
- **Versionadas en Git** (RNF-08). Nunca cambios de esquema a mano en el panel
  sin reflejarlos en una migración.
- Cada migración que crea una tabla con datos de tenant **incluye en el mismo
  archivo** el `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` y sus políticas
  (ver skill `multi-tenant-rls`). No se separan.
- Nombra las migraciones de forma descriptiva y ordenada por timestamp.

## Diseño de tablas
- Toda tabla de tenant lleva: `id` (PK), `tenant_id` (FK, **indexado**),
  timestamps (`created_at`, `updated_at`).
- Índices en toda columna usada por políticas RLS o por filtros frecuentes
  (RNF-04, RNF-07).
- Claves foráneas explícitas con `on delete` pensado (evitar huérfanos).

## Tipos
- Genera y versiona `database.types.ts` desde el esquema de Supabase.
- El frontend y las Edge Functions consumen ESOS tipos. Prohibido `any`.
- Regenera los tipos tras cada migración que cambie el esquema.

## Consultas
- **Nunca `SELECT *`**: columnas explícitas siempre (rendimiento y claridad).
- Usa el cliente tipado de Supabase.

## Edge Functions (cuándo y cómo)
- Úsalas para lógica que NO cabe en RLS: workflows de aprobación, operaciones
  administrativas (crear tenant, invitar), integraciones.
- Son el ÚNICO lugar donde puede vivir la `service_role` key (RNF-02), y solo
  para lo que de verdad requiere saltar RLS.
- Valida inputs en la Edge Function; no confíes en el cliente.

## Auditoría (HU-016, RNF-05)
- La tabla de auditoría es de solo-inserción: sin update/delete desde la app.
- Cada registro: quién, acción, entidad, cuándo, `tenant_id`.
