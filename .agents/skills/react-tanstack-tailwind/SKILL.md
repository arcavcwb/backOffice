---
name: react-tanstack-tailwind
description: "Patrones de frontend del proyecto: componentes React con Tailwind (sin librería de componentes), TanStack Query para datos del servidor, y estructura de UI reutilizable. Úsala al construir cualquier pantalla, componente o llamada a datos en el frontend. Triggers: 'componente', 'pantalla', 'UI', 'frontend', 'TanStack', 'React Query', 'Tailwind', 'query', 'mutación', 'formulario'."
---

# Skill: React + TanStack Query + Tailwind

## Cuándo se activa
Al construir cualquier parte del frontend: componentes, pantallas, formularios,
o llamadas a datos.

## Datos del servidor: TanStack Query (SIEMPRE)
- Toda lectura de datos va por `useQuery`; toda escritura por `useMutation`.
- Nunca `useEffect` + `fetch` a mano para datos del servidor.
- **Cada query maneja explícitamente en la UI:** estado de carga, estado de
  error, y estado vacío. No hay pantallas que se queden en blanco.
- Claves de query consistentes y jerárquicas (ej: `['solicitudes', tenantId]`).
- Invalida las queries afectadas tras una mutación para refrescar la vista.
- Mutaciones optimistas donde la UX lo justifique (con rollback en error).

## Estado local
- `useState`/`useReducer` para UI local (modales, inputs). Nada de librerías de
  estado global salvo que el owner lo apruebe.

## Tailwind sin librería de componentes
Como no usamos shadcn/Mantine, mantenemos **componentes base propios** para no
reinventar en cada pantalla. Convenciones:
- Crea y reutiliza primitivos: `Button`, `Input`, `Select`, `Table`, `Card`,
  `Modal`, `Spinner`, `EmptyState`, `ErrorState`.
- Estilo con clases Tailwind. Extrae variantes repetidas con una utilidad de
  composición de clases (ej: `clsx`/`cva`) en vez de duplicar strings largos.
- Tokens de diseño (color primario del tenant, espaciados) centralizados en la
  config de Tailwind y/o variables CSS, para soportar el branding por tenant
  (HU-019).
- Accesibilidad básica: labels en inputs, foco visible, roles ARIA donde toque.

## Tipado
- Props tipadas. Consume `database.types.ts` para las formas de datos. Sin `any`.

## Textos
- Ningún string visible hardcodeado: todo pasa por i18n (skill `i18n-patterns`).

## Navegación por rol (HU-020)
- La navegación se construye a partir del rol del usuario: cada entrada declara
  qué rol la puede ver. Un punto único y documentado donde cada proyecto añade
  sus secciones (RNF-09, HU-021).
