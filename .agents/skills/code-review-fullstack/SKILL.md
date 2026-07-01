---
name: code-review-fullstack
description: "Checklist de revisión de PR para el stack del proyecto (Supabase + React + TanStack + Tailwind), con foco en seguridad multi-tenant y rendimiento. Úsala al revisar un pull request. Triggers: 'revisa el PR', 'code review', 'revisa el código', 'aprobar el pull request'."
---

# Skill: Code Review full-stack

## Cuándo se activa
Al revisar un PR antes de aprobarlo.

## 1. Seguridad multi-tenant (bloqueante)
- [ ] La `service_role` key NO aparece en ningún código que llegue al cliente.
- [ ] Las tablas nuevas/tocadas tienen RLS activado y políticas por rol.
- [ ] Existe test de aislamiento cross-tenant para esta historia (si toca datos
      de tenant). Sin él, NO se aprueba.
- [ ] Inputs de Edge Functions validados; nada se confía del cliente.
- [ ] Si hay JOINs, se consideró el comportamiento de RLS en tablas unidas.

## 2. Rendimiento
- [ ] Sin N+1 queries (ni en Postgres ni en cascadas de fetch en React).
- [ ] Toda columna usada por políticas RLS o filtros frecuentes está indexada.
- [ ] Listas y visores pesados paginan (RNF-07).
- [ ] React: sin renders evitables; memoización donde de verdad importa (no por
      reflejo).

## 3. Calidad de código (bloqueante lo marcado)
- [ ] Sin `console.log` ni prints de depuración. (bloqueante)
- [ ] Sin variables/imports sin usar. (bloqueante)
- [ ] Sin `any`; se usan los tipos de `database.types.ts`. (bloqueante)
- [ ] Sin `SELECT *`. (bloqueante)
- [ ] Sin strings visibles hardcodeados: todo por i18n. (bloqueante)
- [ ] Nombres claros, funciones de tamaño razonable, sin duplicación evidente.
- [ ] Estados de UI (carga/error/vacío) presentes en cada vista con datos.

## 4. Consistencia con el plan y el PRD
- [ ] Hace lo que el plan técnico aprobado especifica, sin alcance extra.
- [ ] Cumple los criterios de aceptación de la historia.

## 5. Git
- [ ] Branch y commits siguen las convenciones.
- [ ] El PR enlaza el work item de Plane.

## Veredicto
- **APROBADO** solo si pasa todo lo bloqueante y el checklist en general →
  notificar al owner para merge.
- **CAMBIOS SOLICITADOS** si algo bloqueante falla → comentarios línea por línea
  + estado `En desarrollo`.

El Reviewer NO mergea: el merge final lo autoriza el owner.
