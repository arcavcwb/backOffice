# ADR 0001: Estrategia de Documentación (Orientada a IA)

## Contexto
El BackOffice Multi-Tenant está planeado para contar en el futuro con un asistente inteligente basado en un sistema RAG (Retrieval-Augmented Generation). Para que este asistente sea efectivo, necesita una base de conocimiento altamente estructurada, semántica y confiable, que cubra tanto aspectos de negocio como de arquitectura técnica.

## Decisión
Se ha decidido dividir la documentación en tres capas, utilizando formatos que faciliten la indexación por parte de LLMs:

1. **Gestión y Producto (Negocio):** Utilizaremos **Plane Pages** para centralizar el PRD, manuales de usuario, FAQs (paquetes de conocimiento) y glosario del dominio. Plane actuará como la fuente de verdad del producto.
2. **Arquitectura y Diseño (Técnico):** Utilizaremos una carpeta `/docs` en la raíz del repositorio, escrita en Markdown puro (`.md`). Aquí vivirán estos ADRs (Architecture Decision Records) y diagramas del sistema. Markdown es el formato nativo preferido para herramientas de RAG.
3. **Código (Implementación):** Se utilizará el estándar **TSDoc** de manera estricta para documentar componentes React y Edge Functions, priorizando el "por qué" y el contexto de las reglas multi-tenant.

## Consecuencias
- **Positivas:** El proyecto genera su propia base de conocimiento nativa y "digerible" por IAs desde el primer día. Las decisiones quedan registradas inmutablemente junto al código o en la herramienta de gestión.
- **Negativas:** Exige mayor disciplina por parte de los desarrolladores (y agentes) para mantener actualizados los ADRs y Plane Pages ante cada cambio en el flujo de negocio.
