# Capturas de pantalla

Revisión final QA 2026-11-14: `qa-{baseline,final}-{home,produccion-cientifica,investigadores,proyectos,unidades}-{360,1280}.png`, viewport CSS 360x1000/1280x1000, DPR 1. Series adicionales `qa-dialogo-*`, `qa-filtro-*`, `qa-panel-*`, `qa-menu-*` con altura 480 cuando figura `360x480`; `qa-carga-*`, `qa-vacio-*`, `qa-error-*` y `qa-home-fuente-parcial-*` documentan estados reales con fallos solo de prueba. Las finales se regeneraron intencionalmente después de la corrección final; no se muestran capturas manipuladas sin texto del sondeo de contraste. Informe `../REVISION_FINAL_QA.md` y manifiesto `../qa-screenshots.json`.

Serie 2026-11-14, patrón compartido: `directorios-{investigadores,proyectos,unidades}-{antes,despues}-{360,1440}.png`, viewports CSS 360x1000/1440x1000 y DPR 1, mismas fuentes. `directorios-{investigadores,proyectos,unidades}-resultados-360.png` muestra las tarjetas móviles. Quince capturas nuevas revisadas; no sustituyen series históricas. Informe y limitaciones: `../DIRECTORIOS_UX.md`. Las tomas posteriores de esta serie se regeneraron intencionalmente durante la validación final.

Serie del 2026-11-14: `coherencia-{produccion-cientifica,investigadores}-{antes,despues}-{360,1440}.png`, con vistas de 360x1000 y 1440x1000 CSS. `coherencia-publicaciones-validacion-ayuda-360.png` muestra la ayuda abierta. Las tomas despues se regeneran intencionalmente para reflejar el ajuste final, sin sustituir series históricas anteriores. Medidas y validación en `../COHERENCIA_PRODUCCION_CIENTIFICA.md`.

Incidente runtime del 2026-11-13: `next-runtime-after-clean.png`, `next-runtime-after-hmr.png` y `next-runtime-after-build.png` documentan las comprobaciones posteriores. No se presenta captura previa del error exacto porque no pudo capturarse; la evidencia parcial anterior y los eventos están en `docs/next-runtime-*.json`. Informe: `../INCIDENTE_WEBPACK_RUNTIME.md`.

Serie del 2026-11-13, rediseño de Producción Científica: `produccion-cientifica-ux-{antes,despues}-{360,1440}.png`, viewport 360x1000/1440x1000 CSS, DPR 1, texto normal y mismos datos. Informe y límites en `../PRODUCCION_CIENTIFICA_UX.md`. Las capturas despues se regeneraron durante la revisión para conservar la versión final; no reemplazan las series históricas anteriores.

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
