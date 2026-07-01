# Escuadrón especializado — `.agents/`

Agentes y skills especializados para el stack del PRD:
**Supabase (Postgres + Auth + RLS) · React + Vite + TS · TanStack Query · Tailwind · Vitest + Playwright · i18n**

Modo semi-autónomo: el owner aprueba cada gate.

## Estructura

```
tu-proyecto/
├── AGENTS.md                              ← reglas maestras + stack fijo
├── PRD.md                                 ← la fuente de verdad
└── .agents/
    ├── agents/                            ← 4 AGENTES especializados
    │   ├── analista.md                    ← arquitecto full-stack (datos+API+UI)
    │   ├── implementador.md               ← full-stack senior del stack
    │   ├── tester.md                      ← QA + seguridad (aislamiento)
    │   └── reviewer.md                    ← tech lead / auditor
    └── skills/                            ← 6 SKILLS técnicas
        ├── multi-tenant-rls/              ← COMPARTIDA — el patrón crítico
        ├── supabase-data-layer/           ← esquema, migraciones, RLS, Edge Fns
        ├── react-tanstack-tailwind/       ← componentes, queries, Tailwind
        ├── supabase-security-testing/     ← Vitest + Playwright + aislamiento
        ├── i18n-patterns/                 ← textos traducibles
        └── code-review-fullstack/         ← checklist de PR
```

## Perfiles de los 4 agentes

| Agente | Perfil | Skills que más usa |
|--------|--------|--------------------|
| **Analista** | Arquitecto full-stack. Plan completo: datos + RLS + API + UI. No codifica. | multi-tenant-rls, supabase-data-layer |
| **Implementador** | Full-stack senior del stack. Ejecuta el plan. No testea. | react-tanstack-tailwind, supabase-data-layer, i18n-patterns |
| **Tester** | QA + seguridad. Rompe el aislamiento. | supabase-security-testing, multi-tenant-rls |
| **Reviewer** | Tech lead / auditor. Último filtro. No mergea. | code-review-fullstack, multi-tenant-rls |

## Por qué `multi-tenant-rls` es compartida
El aislamiento entre tenants es el requisito más crítico del PRD (RNF-01,
RNF-03, HU-011). Los cuatro agentes lo tocan: el Analista lo diseña, el
Implementador no lo rompe, el Tester lo ataca, el Reviewer lo verifica. Vive en
una sola skill para que todos apliquen exactamente el mismo patrón.

## Reglas fijas del stack (viven en los agentes + skills)
- Nunca `SELECT *` · tipado estricto (`database.types.ts`), nada de `any`
- `service_role` key jamás en el cliente
- Todo texto por i18n, nada hardcodeado
- Toda tabla de tenant: `tenant_id` indexado + RLS + política por rol
- Ninguna historia que toque datos de tenant pasa sin test de aislamiento
- Sin `console.log`, sin variables sin usar (bloquean el merge)

## Cómo arrancar
1. Copia `AGENTS.md`, `.agents/` y tu `PRD.md` a la raíz del proyecto.
2. Conecta el MCP de Plane a Antigravity e integra Git con Plane.
3. Crea los estados del workflow en Plane.
4. Pide al agente principal "desglosa el PRD" → aprueba → arranca el loop.
