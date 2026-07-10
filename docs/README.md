# Documentación Técnica del Proyecto

Esta carpeta contiene la documentación estructurada sobre la arquitectura, flujos y decisiones técnicas del proyecto BackOffice Multi-Tenant. 

Esta documentación está pensada tanto para ser leída por los desarrolladores como para servir de contexto y base de conocimiento para futuros Asistentes Inteligentes (Sistemas RAG).

## Estructura

- `/docs/architecture`: Diagramas y explicaciones de la arquitectura general del sistema (Supabase, React, etc.).
- `/docs/adrs`: Architecture Decision Records. Registro histórico de las decisiones técnicas tomadas, su contexto y sus consecuencias.
- `/docs/auth`: Flujos de autenticación, RBAC y políticas RLS.
- `/docs/tenants`: Reglas de negocio y aislamiento de datos entre clientes.
- `/docs/components`: Estándares de desarrollo de componentes UI (React + Tailwind).

## Reglas de Documentación

1. **Formato Markdown Puro:** Mantener todo en Markdown (`.md`) para facilitar su lectura por LLMs.
2. **Contexto Completo:** Explicar el *por qué* de las cosas, no solo el *qué*.
3. **Referencias a Plane:** Siempre que sea posible, enlazar las decisiones arquitectónicas al ticket original en Plane (ej. `CAPSU-XX`) para mantener la trazabilidad.

## Glosario y FAQs de Negocio
Para dudas sobre producto, manuales de usuario o glosario de términos de negocio, por favor consultar las **Pages en Plane**, donde se centraliza la documentación orientada a producto.
