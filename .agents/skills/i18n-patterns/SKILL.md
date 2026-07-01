---
name: i18n-patterns
description: "Cómo se manejan los textos traducibles en el proyecto (RNF-06). Úsala siempre que se muestre texto al usuario o se añada una cadena visible. Triggers: 'texto', 'traducción', 'i18n', 'idioma', 'string', 'label', 'mensaje', 'internacionalización'."
---

# Skill: Internacionalización (i18n)

## Cuándo se activa
Siempre que se muestre texto al usuario o se añada una cadena visible. Viene de
RNF-06: idioma configurable, ningún texto hardcodeado.

## Regla base
**Ningún string visible se escribe directo en el JSX o en mensajes.** Todo texto
que ve el usuario proviene de archivos de traducción, referenciado por una clave.

## Patrón
- Usa una librería estándar (react-i18next o equivalente) inicializada una vez.
- Los textos viven en archivos de recursos por idioma (ej: `es.json`, `en.json`),
  organizados por namespace/feature para que escalen.
- En los componentes se usa la función de traducción con una clave, nunca el
  literal: el texto se resuelve por `t('feature.clave')`.
- Claves descriptivas y jerárquicas: `auth.login.title`, `approvals.empty`, etc.
- Interpolación para valores dinámicos (nombres, conteos) vía la librería, no
  concatenando strings.
- Pluralización mediante el mecanismo de la librería, no con `if` manuales.

## Alcance de idioma
- El idioma puede fijarse por usuario o por tenant (según el proyecto). El valor
  seleccionado se persiste y se aplica al cargar.

## Checklist al añadir una pantalla o componente
- [ ] Ningún texto literal en el JSX visible.
- [ ] Todas las claves nuevas existen en TODOS los archivos de idioma soportados.
- [ ] Valores dinámicos por interpolación, no concatenación.
- [ ] Textos de error y estados vacíos también traducidos.
