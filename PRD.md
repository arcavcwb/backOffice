# PRD: Plantilla Backoffice Multi-Tenant

## META
- **Versión:** 1.0
- **Fecha:** 2026-06-30
- **Estado:** Aprobado
- **Owner:** [tú]
- **Tipo:** Boilerplate / plantilla reutilizable (no producto final)

---

## 1. VISIÓN Y PROBLEMA

- **Problema:** Cada proyecto nuevo de la empresa requiere reconstruir desde cero la misma base: autenticación, usuarios, roles, aprobaciones, logs y una base de datos multi-tenant. Hoy esto toma **varias semanas** de trabajo repetido por proyecto, y ocurre en **muchos** proyectos al año. Es esfuerzo perdido en algo ya resuelto.
- **Visión:** Una plantilla multi-tenant reutilizable que reduce el arranque de la base de **varias semanas a ~1 semana**, dejando al desarrollador libre para concentrarse únicamente en la lógica de negocio específica de cada proyecto.
- **Por qué ahora:** El volumen de proyectos justifica invertir una vez en una base sólida en lugar de re-pagar el costo en cada arranque.

---

## 2. USUARIOS Y ROLES

Modelo de roles en **dos niveles**: plataforma (gestiona todos los clientes) y tenant (dentro de cada cliente). Los roles de tenant nunca acceden a datos de otro tenant.

| ID    | Rol               | Nivel      | Necesidad principal                                              |
|-------|-------------------|------------|------------------------------------------------------------------|
| U-01  | Super-Admin       | Plataforma | Crear, configurar y suspender tenants; supervisar la plataforma. |
| U-02  | Admin (de tenant) | Tenant     | Gestionar su propio tenant: invitar usuarios, asignar roles, branding. |
| U-03  | Aprobador         | Tenant     | Aprobar o rechazar solicitudes dentro de su tenant.              |
| U-04  | Usuario           | Tenant     | Usar las funcionalidades y crear solicitudes.                    |

**Flujos de alta:**
- **Tenant nuevo:** solo el Super-Admin (U-01) lo crea. Registro público cerrado. Al crear el tenant se designa e invita a su primer Admin.
- **Usuarios de tenant:** el Admin (U-02) los invita por email. El invitado acepta, crea contraseña y entra ya dentro de su tenant con su rol.

---

## 3. OBJETIVOS Y MÉTRICAS DE ÉXITO

| ID    | Objetivo                                          | Métrica                                  | Meta          |
|-------|---------------------------------------------------|------------------------------------------|---------------|
| O-01  | Reducir el tiempo de arranque de la base          | Tiempo para tener la base funcionando    | ≤ 1 semana    |
| O-02  | Eliminar el re-trabajo de auth/roles/logs         | Esfuerzo en reconstruir el núcleo        | ~0 (heredado) |
| O-03  | Permitir extensión por un dev en solitario        | Tiempo para añadir una sección nueva     | Horas, no días|
| O-04  | Garantizar aislamiento de datos entre clientes    | Fugas de datos cross-tenant              | 0             |

---

## 4. ALCANCE

### Dentro del alcance (MVP — el núcleo reutilizable)
- Autenticación: login, logout, recuperar contraseña, sesiones JWT.
- Invitaciones por email: generar token, enviar, aceptar + crear contraseña, expiración.
- Gestión de tenants (Super-Admin): crear, configurar, suspender, listar.
- Gestión de usuarios y roles (Admin de tenant): invitar, asignar rol, desactivar.
- RBAC en 2 niveles (plataforma + tenant) con aislamiento por RLS y `tenant_id`.
- Sistema de aprobaciones de 1 paso, extensible (campo `type` + estados).
- Logs / auditoría avanzada: registro automático + visor con filtros.
- Branding básico por tenant: logo, color primario, nombre.
- Layout del panel con navegación por rol y punto de extensión documentado.
- Esquema de base de datos multi-tenant base.

### Fuera del alcance (FASE 2+ / específico de cada proyecto)
- Aprobaciones multi-paso o multi-tipo complejas (motor de workflow).
- Editor visual de temas / branding avanzado.
- Signup público abierto.
- OAuth (Google, etc.) y 2FA.
- La lógica de negocio concreta de cada proyecto.
- Reportes/analíticas específicas e integraciones externas puntuales.

---

## 5. ÉPICAS

### EP-01: Autenticación y sesiones
- **Objetivo:** Que un usuario pueda entrar de forma segura.
- **Vinculada a:** O-01
- **Prioridad:** Alta

### EP-02: Tenants
- **Objetivo:** Que el Super-Admin gestione clientes (alta, configuración, suspensión).
- **Vinculada a:** O-01, O-04
- **Prioridad:** Alta

### EP-03: Usuarios, roles e invitaciones
- **Objetivo:** Que cada tenant gestione su equipo con RBAC aislado.
- **Vinculada a:** O-01, O-04
- **Prioridad:** Alta

### EP-04: Aprobaciones
- **Objetivo:** Flujo genérico de solicitud → aprobación, extensible por proyecto.
- **Vinculada a:** O-03
- **Prioridad:** Media

### EP-05: Auditoría y logs
- **Objetivo:** Trazabilidad de acciones con visor y filtros.
- **Vinculada a:** O-04
- **Prioridad:** Media

### EP-06: Branding y layout del panel
- **Objetivo:** Panel personalizable por tenant y estructura extensible.
- **Vinculada a:** O-03
- **Prioridad:** Media

---

## 6. HISTORIAS DE USUARIO

### HU-001 (Épica: EP-01)
- **Historia:** Como cualquier usuario quiero iniciar sesión con mi email y contraseña para acceder al sistema de forma segura.
- **Prioridad:** Alta
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO un usuario registrado y activo CUANDO introduce email y contraseña válidos ENTONCES accede y se crea una sesión con JWT.
  - [ ] DADO credenciales inválidas CUANDO intenta entrar ENTONCES ve un mensaje de error y NO accede.
  - [ ] DADO un usuario de un tenant suspendido CUANDO intenta entrar ENTONCES se le niega el acceso con mensaje claro.
  - [ ] DADO un login exitoso ENTONCES el JWT contiene su `tenant_id` y su rol como claims.
- **Notas técnicas:** Vía Supabase Auth. Los claims (`tenant_id`, rol) se inyectan en el JWT mediante Auth hooks.

### HU-002 (Épica: EP-01)
- **Historia:** Como usuario autenticado quiero cerrar sesión para proteger mi cuenta.
- **Prioridad:** Alta
- **Estimación:** 1
- **Criterios de aceptación:**
  - [ ] DADO un usuario con sesión activa CUANDO pulsa "Cerrar sesión" ENTONCES la sesión se invalida y es redirigido al login.

### HU-003 (Épica: EP-01)
- **Historia:** Como usuario quiero recuperar mi contraseña por email para recuperar el acceso si la olvido.
- **Prioridad:** Alta
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO un email registrado CUANDO solicita recuperación ENTONCES recibe un email con enlace de restablecimiento.
  - [ ] DADO un enlace válido CUANDO define una nueva contraseña ENTONCES puede entrar con ella.
  - [ ] DADO un enlace expirado o ya usado CUANDO intenta usarlo ENTONCES ve un error y debe solicitar uno nuevo.

### HU-004 (Épica: EP-02)
- **Historia:** Como Super-Admin quiero crear un tenant nuevo y designar su primer Admin para dar de alta a un cliente.
- **Prioridad:** Alta
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO que soy Super-Admin CUANDO creo un tenant con nombre y email del admin inicial ENTONCES se crea el tenant y se envía invitación al admin.
  - [ ] DADO un tenant recién creado ENTONCES queda aislado: sus datos no son visibles para otros tenants (RLS).
  - [ ] DADO que NO soy Super-Admin CUANDO intento acceder a la creación de tenants ENTONCES se me deniega.
- **Notas técnicas:** La creación de tenant + invitación del admin es operación administrativa (Edge Function con service_role, nunca desde el cliente).

### HU-005 (Épica: EP-02)
- **Historia:** Como Super-Admin quiero editar la configuración de un tenant para mantener sus datos al día.
- **Prioridad:** Alta
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO un tenant existente CUANDO edito su nombre o configuración ENTONCES los cambios se guardan y quedan registrados en auditoría.

### HU-006 (Épica: EP-02)
- **Historia:** Como Super-Admin quiero suspender o reactivar un tenant para controlar el acceso de un cliente.
- **Prioridad:** Alta
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO un tenant activo CUANDO lo suspendo ENTONCES sus usuarios no pueden iniciar sesión.
  - [ ] DADO un tenant suspendido CUANDO lo reactivo ENTONCES sus usuarios vuelven a poder entrar.
  - [ ] DADO una suspensión/reactivación ENTONCES queda registrada en auditoría.
- **Dependencias:** HU-001 (el bloqueo de login se valida en la autenticación).

### HU-007 (Épica: EP-02)
- **Historia:** Como Super-Admin quiero ver la lista de todos los tenants para gestionarlos.
- **Prioridad:** Alta
- **Estimación:** 2
- **Criterios de aceptación:**
  - [ ] DADO que soy Super-Admin CUANDO abro la gestión de tenants ENTONCES veo todos los tenants con su estado (activo/suspendido).

### HU-008 (Épica: EP-03)
- **Historia:** Como Admin de tenant quiero invitar a un usuario por email y asignarle un rol para incorporar a mi equipo.
- **Prioridad:** Alta
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO que soy Admin CUANDO invito un email y elijo un rol (Admin/Aprobador/Usuario) ENTONCES se genera un token y se envía email de invitación.
  - [ ] DADO un email ya perteneciente a mi tenant CUANDO intento invitarlo ENTONCES se me avisa que ya existe.
  - [ ] DADO una invitación enviada ENTONCES aparece como "pendiente" hasta que se acepte.
- **Notas técnicas:** Usar `inviteUserByEmail` de Supabase Auth. La invitación debe asociar `tenant_id` y rol al token.

### HU-009 (Épica: EP-03)
- **Historia:** Como persona invitada quiero aceptar la invitación y crear mi contraseña para acceder al tenant correcto.
- **Prioridad:** Alta
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO un token de invitación válido CUANDO creo mi contraseña ENTONCES quedo registrado en el tenant correcto con el rol asignado.
  - [ ] DADO un token expirado CUANDO intento aceptarlo ENTONCES veo un error y debo pedir nueva invitación.
  - [ ] DADO una invitación ya aceptada CUANDO intento reutilizar el enlace ENTONCES se me redirige al login.
- **Dependencias:** HU-008.

### HU-010 (Épica: EP-03)
- **Historia:** Como Admin de tenant quiero ver, cambiar el rol o desactivar usuarios de mi tenant para administrar mi equipo.
- **Prioridad:** Alta
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO que soy Admin CUANDO abro la gestión de usuarios ENTONCES veo solo los usuarios de MI tenant.
  - [ ] DADO un usuario de mi tenant CUANDO cambio su rol ENTONCES el cambio aplica y queda en auditoría.
  - [ ] DADO un usuario activo CUANDO lo desactivo ENTONCES no puede iniciar sesión.

### HU-011 (Épica: EP-03)
- **Historia:** Como sistema quiero garantizar que cada rol solo accede a lo permitido y nunca a otro tenant para proteger los datos.
- **Prioridad:** Alta
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO un usuario de tenant A CUANDO intenta acceder a datos de tenant B (por API o URL) ENTONCES se le deniega (RLS).
  - [ ] DADO un Usuario (rol básico) CUANDO intenta una acción de Admin ENTONCES se le deniega.
  - [ ] DADO cualquier acceso ENTONCES las políticas se aplican a nivel de base de datos, no solo en frontend.
- **Notas técnicas:** Transversal. Cubrir con tests de aislamiento cross-tenant. Relacionada con RNF-01, RNF-03.

### HU-012 (Épica: EP-04)
- **Historia:** Como Usuario de tenant quiero crear una solicitud de un tipo determinado para que sea revisada y aprobada.
- **Prioridad:** Media
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO que soy Usuario CUANDO creo una solicitud con un `type` y los datos requeridos ENTONCES queda registrada en estado "pendiente" dentro de mi tenant.
  - [ ] DADO una solicitud creada ENTONCES se registra quién la creó y cuándo (auditoría).
  - [ ] DADO el diseño extensible ENTONCES el campo `type` permite que cada proyecto defina sus propios tipos sin cambiar el esquema base.

### HU-013 (Épica: EP-04)
- **Historia:** Como Aprobador de tenant quiero aprobar o rechazar una solicitud pendiente para resolver la petición.
- **Prioridad:** Media
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO que soy Aprobador CUANDO veo una solicitud pendiente de mi tenant ENTONCES puedo aprobarla o rechazarla.
  - [ ] DADO una aprobación/rechazo CUANDO se ejecuta ENTONCES la solicitud cambia de estado y se registra quién decidió, cuándo y un comentario opcional.
  - [ ] DADO que NO soy Aprobador (ni Admin) CUANDO intento decidir sobre una solicitud ENTONCES se me deniega.
  - [ ] DADO una solicitud ya resuelta CUANDO intento volver a decidir ENTONCES se me impide (no se re-procesa).
- **Dependencias:** HU-012.

### HU-014 (Épica: EP-04)
- **Historia:** Como Usuario de tenant quiero ver el estado de las solicitudes que he creado para hacer seguimiento.
- **Prioridad:** Media
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO que soy Usuario CUANDO abro mis solicitudes ENTONCES veo solo las mías con su estado actual (pendiente/aprobada/rechazada).
  - [ ] DADO una solicitud rechazada ENTONCES puedo ver el comentario del aprobador si existe.

### HU-015 (Épica: EP-04)
- **Historia:** Como Aprobador de tenant quiero una bandeja con las solicitudes pendientes para gestionarlas eficientemente.
- **Prioridad:** Media
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO que soy Aprobador CUANDO abro la bandeja ENTONCES veo todas las solicitudes pendientes de MI tenant, ordenadas por fecha.
  - [ ] DADO la bandeja CUANDO filtro por `type` o estado ENTONCES la lista se filtra correctamente.

### HU-016 (Épica: EP-05)
- **Historia:** Como sistema quiero registrar automáticamente las acciones relevantes para garantizar trazabilidad.
- **Prioridad:** Media
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO cualquier acción relevante (login, cambio de rol, CRUD de tenant/usuario, decisión de aprobación) CUANDO ocurre ENTONCES se crea un registro con: quién, qué acción, sobre qué entidad, cuándo y `tenant_id`.
  - [ ] DADO un registro de auditoría ENTONCES es inmutable (no editable ni borrable desde la aplicación).
  - [ ] DADO el aislamiento ENTONCES cada registro queda asociado a su tenant.
- **Notas técnicas:** Relacionada con RNF-05 (inmutabilidad).

### HU-017 (Épica: EP-05)
- **Historia:** Como Admin de tenant quiero un visor de los logs de mi tenant con filtros para investigar qué ha pasado.
- **Prioridad:** Media
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO que soy Admin CUANDO abro el visor de auditoría ENTONCES veo solo los registros de MI tenant.
  - [ ] DADO el visor CUANDO filtro por usuario, tipo de acción o rango de fechas ENTONCES la lista se filtra correctamente.
  - [ ] DADO muchos registros ENTONCES la lista está paginada y se mantiene fluida.
- **Dependencias:** HU-016.

### HU-018 (Épica: EP-05)
- **Historia:** Como Super-Admin quiero ver auditoría a nivel plataforma para supervisar acciones sobre tenants.
- **Prioridad:** Media
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO que soy Super-Admin CUANDO abro la auditoría global ENTONCES veo los registros de acciones de plataforma (creación/suspensión de tenants, etc.).
  - [ ] DADO el visor global CUANDO filtro por tenant, acción o fecha ENTONCES la lista se filtra correctamente.
- **Dependencias:** HU-016.

### HU-019 (Épica: EP-06)
- **Historia:** Como Admin de tenant quiero configurar el logo, color primario y nombre de mi tenant para que el panel refleje mi marca.
- **Prioridad:** Media
- **Estimación:** 3
- **Criterios de aceptación:**
  - [ ] DADO que soy Admin CUANDO subo un logo, elijo un color primario y defino el nombre ENTONCES se guardan en la configuración del tenant.
  - [ ] DADO un tenant con branding configurado CUANDO sus usuarios entran ENTONCES el panel muestra ese logo, color y nombre.
  - [ ] DADO un tenant sin branding configurado ENTONCES se usa un branding por defecto.

### HU-020 (Épica: EP-06)
- **Historia:** Como usuario autenticado quiero un panel con navegación adaptada a mi rol para acceder solo a lo que me corresponde.
- **Prioridad:** Media
- **Estimación:** 5
- **Criterios de aceptación:**
  - [ ] DADO un usuario autenticado CUANDO entra al panel ENTONCES ve un layout con navegación y su información de sesión.
  - [ ] DADO mi rol CUANDO se renderiza la navegación ENTONCES solo veo las secciones permitidas (ej: un Usuario no ve "Gestión de tenants").
  - [ ] DADO el diseño extensible ENTONCES hay un punto claro donde cada proyecto añade sus secciones de menú y páginas.

### HU-021 (Épica: EP-06)
- **Historia:** Como desarrollador que usa la plantilla quiero un punto de extensión claro y documentado para añadir la funcionalidad específica de cada proyecto rápidamente.
- **Prioridad:** Media
- **Estimación:** 2
- **Criterios de aceptación:**
  - [ ] DADO que clono la plantilla CUANDO leo la documentación ENTONCES sé exactamente dónde y cómo añadir una sección (ruta + página + entrada de menú + permisos).
  - [ ] DADO un ejemplo incluido ENTONCES hay al menos una sección de muestra que sirve de plantilla para las nuevas.
- **Notas técnicas:** Relacionada con O-03 y RNF-09.

---

## 7. REQUISITOS NO FUNCIONALES

| ID     | Tipo            | Requisito                                                                                              |
|--------|-----------------|-------------------------------------------------------------------------------------------------------|
| RNF-01 | Seguridad       | Aislamiento multi-tenant por RLS a nivel de BD en TODAS las tablas con `tenant_id`. Nunca confiar solo en filtrado de aplicación. |
| RNF-02 | Seguridad       | La `service_role` key NUNCA se expone en el cliente. Solo server-side (Edge Functions) para operaciones administrativas explícitas. |
| RNF-03 | Seguridad       | Las consultas con JOIN deben verificarse contra RLS en todas las tablas involucradas. Tests de aislamiento cross-tenant obligatorios. |
| RNF-04 | Rendimiento     | Toda columna usada en políticas RLS (`tenant_id`, `user_id`) debe estar indexada.                     |
| RNF-05 | Seguridad       | Registros de auditoría inmutables (sin update/delete desde la aplicación).                            |
| RNF-06 | i18n            | Todo texto visible viene de archivos de traducción, no hardcodeado. Idioma padrão (código e UI): pt-BR. |
| RNF-07 | Rendimiento     | Listas y visores (auditoría, usuarios, solicitudes) deben paginar y mantenerse fluidos con gran volumen. |
| RNF-08 | Mantenibilidad  | Migraciones de esquema versionadas en Git. Política RLS incluida en cada migración que crea tabla con datos de tenant. |
| RNF-09 | Extensibilidad  | Punto de extensión documentado (ruta + página + menú + permisos) para añadir secciones por proyecto.   |
| RNF-10 | Usabilidad      | Diseñada para ser extendida por un dev en solitario: convenciones claras, sin sobre-ingeniería, doc de arranque. |

---

## 8. RESTRICCIONES TÉCNICAS

- **Backend / datos:** Supabase (PostgreSQL + Auth + RLS). Lógica administrativa y de negocio en Supabase Edge Functions (TypeScript).
- **Frontend:** React + Vite + TypeScript. Estado de servidor con TanStack Query. Enrutamiento con TanStack Router (type-safe). Estilos con Tailwind CSS puro (SIN librería de componentes, patrones propios).
- **Testes:** Vitest para pruebas unitarias y Playwright para E2E (enfoque estricto en aislamiento cross-tenant).
- **Auth:** Supabase Auth, email/contraseña en el MVP. Claims (`tenant_id`, rol) inyectados en el JWT vía Auth hooks. OAuth y 2FA fuera del MVP.
- **Despliegue:** Supabase Cloud (gestionado) por defecto. Arquitectura no debe impedir self-hosting futuro (Supabase es Postgres estándar).
- **i18n:** Infraestructura de traducción desde el inicio.

---

## APÉNDICE — Resumen de desglose

| Épica | Historias        | Story Points |
|-------|------------------|--------------|
| EP-01 | HU-001 a HU-003  | 7            |
| EP-02 | HU-004 a HU-007  | 13           |
| EP-03 | HU-008 a HU-011  | 16           |
| EP-04 | HU-012 a HU-015  | 16           |
| EP-05 | HU-016 a HU-018  | 13           |
| EP-06 | HU-019 a HU-021  | 10           |
| **TOTAL** | **21 historias** | **75 puntos** |

**Sugerencia de sprints (para cargar en Plane):**
- **Sprint 1 (núcleo mínimo usable):** Setup DB Inicial (Tablas tenants/users y Supabase Auth Hooks) + EP-01 completa + HU-008/009/010/011 (invitaciones y RBAC) + HU-020 (layout). Permite entrar, invitar y navegar de forma aislada.
- **Sprint 2:** EP-02 (tenants) + HU-016/017 (auditoría base + visor).
- **Sprint 3:** EP-04 (aprobaciones) + HU-018 + HU-019 + HU-021.
