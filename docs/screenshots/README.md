# Capturas de pantalla

Todas las capturas del proyecto deben guardarse en `docs/screenshots/`.

## Nombres recomendados

Usar nombres descriptivos y versionables:

- `home-v1.png`
- `home-redisenado.png`
- `produccion-cientifica-v1.png`
- `publicacion-detalle-v1.png`
- `investigadores-v1.png`
- `proyectos-v1.png`
- `unidades-v1.png`

## Reglas de registro

Serie del 2026-11-13: `base-visual-{antes,despues}-{home,produccion-cientifica,investigadores,proyectos,unidades}-{360,1440}.png`. Capturas comparables del viewport inicial de 360x1000 y 1440x1000 CSS, DPR 1 y tamano normal de texto. Se regeneraron intencionalmente las capturas `despues` durante la validacion para conservar solo el resultado final de la misma intervencion. No se reemplazan series historicas de otras fechas. Medidas y limitaciones en `../BASE_VISUAL_ETAPA_1.md`.

- Incluir fecha y descripcion de cada captura en `docs/CHANGELOG.md`.
- No reemplazar capturas anteriores salvo que sea intencional.
- Si una captura reemplaza otra, registrar el motivo en el changelog.
- Mantener nombres claros por modulo, pantalla y version.
