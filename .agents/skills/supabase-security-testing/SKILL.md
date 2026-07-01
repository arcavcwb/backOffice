---
name: supabase-security-testing
description: "Patrones de testing del proyecto: Vitest para unitarias, Playwright para E2E, y el test OBLIGATORIO de aislamiento cross-tenant. Úsala al escribir o revisar pruebas. Triggers: 'test', 'prueba', 'Vitest', 'Playwright', 'E2E', 'cobertura', 'aislamiento', 'test de seguridad'."
---

# Skill: Testing y seguridad

## Cuándo se activa
Al escribir o revisar pruebas de cualquier historia.

## Regla base
Cada criterio de aceptación (formato DADO-CUANDO-ENTONCES) se traduce en al
menos un test. Un criterio sin test = criterio NO cumplido.

## Tipos de test y cuándo usar cada uno

### Unitarios — Vitest
- Lógica de negocio, funciones puras, helpers, validaciones.
- Rápidos y aislados. Mockea dependencias externas.

### Aislamiento cross-tenant — OBLIGATORIO si la historia toca datos de tenant
Este es el test estrella del proyecto (HU-011, RNF-01, RNF-03):
- Crea (o siembra) datos en dos tenants distintos: A y B.
- Autentícate como usuario del Tenant A.
- Intenta leer datos del Tenant B → **debe devolver vacío / denegar**.
- Intenta escribir/modificar datos del Tenant B → **debe fallar**.
- Repite para acceso por rol: un `Usuario` intentando una acción de `Admin`
  → **denegado**.
- Si la funcionalidad hace JOINs, prueba que RLS en las tablas unidas se
  comporta como se espera (skill `multi-tenant-rls`).

### E2E — Playwright
- Flujos críticos de UI de punta a punta según la historia: login, aceptar
  invitación + crear contraseña, crear solicitud, aprobar/rechazar.
- Verifica los estados de UI (carga, error, vacío) además del camino feliz.

## Ejecución
- Corre la suite COMPLETA (nuevos + existentes) para cazar regresiones.
- Reporta: criterios ✓/✗, tests pasa/falla, cobertura, y una línea explícita:
  "aislamiento cross-tenant verificado ✓/✗".

## Si algo falla
Devuelve la historia a `En desarrollo` con el detalle del fallo. No marques nada
como probado sin evidencia automatizada.
