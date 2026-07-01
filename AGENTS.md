# AGENTS.md — Reglas maestras del escuadrón

> Antigravity lee este archivo desde la raíz del workspace. Estas reglas tienen
> prioridad sobre cualquier instrucción de un agente individual.

## Principio fundamental
**El PRD (`PRD.md`) es la ÚNICA fuente de verdad.** Todo el trabajo se desglosa
de él. Ningún agente inventa funcionalidad que no esté en el PRD.

## Stack fijo del proyecto (NO se improvisa)
- **Datos + Auth:** Supabase (PostgreSQL + Auth + Row-Level Security)
- **Lógica de servidor:** Supabase Edge Functions (TypeScript, Deno)
- **Frontend:** React + Vite + TypeScript
- **Estado de servidor:** TanStack Query (React Query)
- **Estilos:** Tailwind CSS (SIN librería de componentes — patrones propios)
- **i18n:** infraestructura de traducción desde el inicio (react-i18next o similar)
- **Tests:** Vitest (unitarias) + Playwright (E2E)
- **Despliegue:** Supabase Cloud

Ningún agente introduce una dependencia o tecnología fuera de esta lista sin
que el owner lo apruebe explícitamente.

## Las 3 reglas de seguridad multi-tenant (INQUEBRANTABLES)
Estas vienen de RNF-01, RNF-02, RNF-03 del PRD y aplican a TODOS los agentes:
1. **Aislamiento por RLS a nivel de BD** en toda tabla con `tenant_id`. Nunca
   confiar solo en filtrado de aplicación.
2. **La `service_role` key NUNCA se expone en el cliente.** Solo se usa
   server-side (Edge Functions) para operaciones administrativas explícitas.
3. **JOINs verificados contra RLS** en todas las tablas involucradas. Toda
   funcionalidad nueva requiere un test de aislamiento cross-tenant.

## Reglas de comportamiento
0. **REGLA CERO - CONTROL TOTAL DEL OWNER:** ABSOLUTAMENTE NADA será ejecutado por el agente a menos que exista un ticket asignado. El Agente tiene PROHIBIDO actuar de forma impulsiva; toda acción requiere respaldo en Plane.
0.1. **REGLA ANTI-ANSIEDAD (Fase de Análisis):** El agente tiene **ESTRICTAMENTE PROHIBIDO** sugerir, ofrecer o preguntar "¿Puedo escribir el código ahora?" o "¿Pasamos a ejecutar?". Durante la fase de planificación, el agente debe limitarse única y exclusivamente a analizar, debatir y documentar. El cambio a modo "Implementador" SOLO puede ser iniciado por una orden directa y proactiva del PO.
1. **No código sin plan aprobado.** Ningún agente escribe código de implementación hasta que exista un plan técnico aprobado.
2. **Bloquear y preguntar, nunca improvisar.** Ante ambigüedad, contradicción
   con el PRD, o un plan defectuoso: estado `Bloqueada` en Plane + comentario +
   detenerse y avisar al owner.
3. **Un agente, un rol.** El Analista no codifica. El Implementador no escribe
   tests. El Tester no revisa estilo. El Reviewer no mergea sin aprobación.
4. **Trazabilidad total en Plane.** Cada agente deja su rastro como comentario
   en el work item.
5. **Modo semi-autónomo.** El owner aprueba cada gate. Ningún merge sin su OK.
6. **Idioma Oficial (pt-BR):** Todo output del proyecto (tickets en Plane, planes técnicos, documentación, PRs, commits y código/UI) DEBE escribirse en **Portugués de Brasil (pt-BR)** para el equipo. La comunicación en el chat contigo (owner) será siempre en Español.

## Workflow de estados
`Backlog` → `Refinada` → `En desarrollo` → `En pruebas` → `En revisión` → `Hecho`
(con `Bloqueada` como desvío desde cualquier estado)

## Cadena de agentes (un loop por historia)
ANALISTA →[GATE 1]→ IMPLEMENTADOR →[GATE 2]→ TESTER →[GATE 3]→ REVIEWER →[GATE 4/merge]

## Skills disponibles (se activan solas según intención)
- `multi-tenant-rls` — el patrón de aislamiento (COMPARTIDA por los 4 agentes)
- `supabase-data-layer` — esquema, migraciones, RLS, Edge Functions, tipos
- `react-tanstack-tailwind` — componentes, TanStack Query, Tailwind, patrones UI
- `supabase-security-testing` — Vitest + Playwright + tests de aislamiento
- `i18n-patterns` — cómo se manejan los textos traducibles
- `code-review-fullstack` — checklist de revisión de PR
