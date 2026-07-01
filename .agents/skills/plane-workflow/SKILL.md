---
name: plane-workflow
description: Interactúa con Plane (leer tickets, cambiar estados, comentar). Obligatorio para mantener la trazabilidad de todos los cambios de este proyecto.
---

# Plane Workflow Skill

Tu objetivo en este proyecto está guiado por la metodología descrita en `AGENTS.md`. Tienes a tu disposición un script CLI para interactuar de manera nativa con la API de Plane para el proyecto `BackOffice-Multitenant`.

**Ruta del Script:**
`python3 /home/diego/armando/agy/first-plane-proyect/.agents/skills/plane-workflow/scripts/plane_cli.py`

## Reglas Obligatorias:
1. **Un agente, un ticket:** Cuando decidas (o el owner te pida) trabajar en una Historia de Usuario, **DEBES** asignarte la historia moviéndola a "In Progress" usando este script.
2. **Comentarios de Trazabilidad:** Al empezar, al pausar y al terminar de implementar un ticket, **DEBES** dejar un comentario en el ticket de Plane describiendo brevemente tu progreso, decisiones técnicas o el PR correspondiente.
3. **Bloqueos:** Si el plan técnico es ambiguo o te encuentras un problema, debes mover el estado a "Todo" o comentar que estás bloqueado, y detener la ejecución para avisar al owner.
4. **Finalización:** Una vez terminado y probado el código según los criterios de aceptación, debes comentar y mover la tarea a "Done".

## Comandos CLI Disponibles

**Listar Issues (por defecto todas, o filtradas por estado):**
```bash
python3 .agents/skills/plane-workflow/scripts/plane_cli.py list
python3 .agents/skills/plane-workflow/scripts/plane_cli.py list --state "backlog"
```

**Ver detalles de un Issue (Criterios de Aceptación, Descripción):**
(Puedes usar el ID `CAPSU-1` o simplemente `1`)
```bash
python3 .agents/skills/plane-workflow/scripts/plane_cli.py get 1
```

**Cambiar Estado de un Issue:**
(Estados típicos de Plane: Backlog, Todo, In Progress, Done, Cancelled)
```bash
python3 .agents/skills/plane-workflow/scripts/plane_cli.py update-state 1 "In Progress"
```

**Agregar un Comentario de Trazabilidad:**
```bash
python3 .agents/skills/plane-workflow/scripts/plane_cli.py comment 1 "Empezando la implementación de autenticación según el PRD."
```
