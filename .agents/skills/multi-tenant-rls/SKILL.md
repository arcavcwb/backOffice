---
name: multi-tenant-rls
description: "El patrón de aislamiento multi-tenant del proyecto. Úsala SIEMPRE que se diseñe, implemente, pruebe o revise algo que toque datos de un tenant. Triggers: 'tenant', 'aislamiento', 'RLS', 'política de seguridad', 'multi-tenant', 'tenant_id', 'seguridad de datos'."
---

# Skill: Patrón Multi-Tenant con RLS (COMPARTIDA)

> Esta es la skill más crítica del proyecto. La usan los 4 agentes: el Analista
> la diseña, el Implementador no la rompe, el Tester la ataca, el Reviewer la
> verifica. Viene de RNF-01, RNF-02, RNF-03 y HU-011.

## El modelo
Multi-tenancy por **columna discriminadora** `tenant_id` en cada tabla de datos
de cliente, con aislamiento impuesto por Row-Level Security de PostgreSQL.

## Las 3 reglas inquebrantables
1. **RLS en la base de datos, no en la app.** El filtrado de aplicación es
   conveniencia; la seguridad la impone la BD. Toda tabla con datos de tenant
   tiene RLS activado.
2. **La `service_role` key salta TODAS las políticas RLS.** Por eso:
   - NUNCA en el cliente/bundle del frontend.
   - Solo en Edge Functions, para operaciones administrativas explícitas
     (ej: Super-Admin crea tenant).
3. **RLS se evalúa por tabla, también en JOINs.** Si consultas A con join a B, y
   B tiene RLS, una fila inaccesible en B hace que esa fila no vuelva. Diseña y
   prueba considerando esto.

## Patrón de política (referencia conceptual)
- Toda tabla de tenant: columna `tenant_id` (indexada — RNF-04).
- El `tenant_id` y el rol del usuario viajan como **claims en el JWT**,
  inyectados por un Auth hook de Supabase en el login.
- Las políticas comparan la columna `tenant_id` de la fila contra el claim
  `tenant_id` del JWT. La lógica: "esta fila es visible/modificable solo si su
  tenant_id coincide con el del usuario autenticado".
- Roles: las políticas distinguen qué puede hacer cada rol (Admin/Aprobador/
  Usuario) DENTRO de su tenant. El Super-Admin opera a nivel plataforma
  (vía Edge Function con service_role, no vía RLS de tenant).

## División de responsabilidades
- **RLS maneja:** aislamiento de datos entre tenants + acceso por rol a filas.
- **La aplicación maneja:** feature gating, rate limiting, y los workflows de
  aprobación (la lógica de negocio, no el aislamiento).

## Checklist para CUALQUIER funcionalidad que toque datos de tenant
- [ ] La tabla tiene `tenant_id` indexado.
- [ ] RLS activado en la tabla.
- [ ] Políticas por operación (select/insert/update/delete) y por rol.
- [ ] Ninguna ruta de cliente usa `service_role`.
- [ ] Existe un test que, autenticado como Tenant A, falla al acceder a Tenant B.
- [ ] Si hay JOINs, se verificó el comportamiento de RLS en las tablas unidas.
