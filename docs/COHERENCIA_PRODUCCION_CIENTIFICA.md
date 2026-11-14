# Coherencia visual y funcional de Producción Científica

Fecha: 2026-11-14. Rama existente: `feat/produccion-cientifica-ux`.

## Inspección y alcance

Se conservan los cambios preexistentes del rediseño y de la recuperación de Webpack. No se encontraron AGENTS.md aplicables en el repositorio ni antecesores inspeccionados. Se usan npm, Next 15.1.3, React/React DOM 19.0.0 y Tailwind 3.4.19 instalados, sin actualizar dependencias.

Ambas rutas ya usaban SectionHeader y site-container. Producción Científica omitía eyebrow y usaba py-6; Investigadores mostraba la etiqueta institucional con py-8. Las fuentes, colores y alineación de H1 ya coincidían (30 px móvil / 36 px escritorio, x=16/32 px). La diferencia de KPIs era de representación, no de datos: líneas verticales frente a tarjetas.

Se midieron 60 px entre el final del grupo de búsqueda y la barra de resultados: mb-6 (24), altura mínima del estado vacío (24) y margen de ese estado (12). Esto confirmaba un espacio reservado por contenido vacío, no un problema del backend.

## Cambios

- Producción Científica reutiliza SectionHeader con `eyebrow="Directorio institucional"` y el mismo py-8 de Investigadores. Título, descripción y fecha real del loader se conservan. No se modifica Header global ni logotipos.
- KpiCard incorpora una variante directory que comparte superficie blanca, borde slate-200, radio de 8 px, sombra discreta, padding de 16 px, etiqueta de 13 px y valor de 24 px. Se utiliza en ambas rutas sin copiar valores. La variante original con tendencia no cambia.
- Las tarjetas tienen una altura mínima de 7rem, no altura fija ni máximo: crecen con etiquetas, cifras o fuente ampliada. La cifra se alinea al final mediante flex, sin recortes.
- La cuadrícula de publicaciones adapta 4/2/1 columnas al espacio disponible mediante container queries y medidas rem. No se modifica el grid general ni se reincorpora columna estadística derecha.
- “Resumen del catálogo” sustituye la frase larga. Botón Info con nombre accesible, aria-expanded/aria-controls y useId estable; apertura con Enter/toque y cierre por botón o Escape, con retorno de foco. Explicación literal solicitada en un párrafo visible solo al abrir. Es un disclosure en flujo, no un modal ni un tooltip dependiente de hover/title.
- El estado vacío permanece como live region sr-only sin ocupar espacio en el flujo; pending/dirty mantienen su aviso visible. La separación búsqueda–barra pasa a 16 px, sin eliminar los mensajes de actualización o cambios sin aplicar.

## Fuentes y alcances

No cambian lectores, normalización, reglas de negocio ni contratos. Los cuatro indicadores siguen usando getPublicationsSummary sobre el catálogo completo: 2701 publicaciones, 1709 de acceso abierto, 917 Q1–Q2 y 31556 citas, con los archivos actuales. Los 2700 incluidos permanecen como indicador secundario de cobertura; no se fuerza igualdad.

El listado utiliza getPublications(query). El total es del conjunto filtrado antes del slice; rango y registros corresponden a la página actual. El orden se aplica al conjunto completo. Las operaciones conservan el mecanismo existente de App Router/URL, sin añadir fetches cliente ni reconstruir KPIs desde los resultados visibles.

## Validación funcional

Se amplía `frontend/scripts/check-publication-directory.mjs` para comparar el DOM con el loader real en Node, exclusivamente como referencia de pruebas. No se envía el catálogo completo al cliente.

Casos comprobados:

| Consulta | Total filtrado | Página / páginas | Registros visibles | Rango |
| --- | ---: | --- | ---: | --- |
| Sin filtros | 2701 | 1 / 271 | 10 | 1–10 |
| q=renal | 73 | 1 / 8 | 10 | 1–10 |
| renal + año 2023 + acceso abierto | 3 | 1 / 1 | 3 | 1–3 |
| renal + acceso abierto | 53 | 1 / 6 | 10 | 1–10 |
| renal + acceso abierto, página 2 | 53 | 2 / 6 | 10 | 11–20 |
| renal, orden por citas, página 2 | 73 | 2 / 8 | 10 | 11–20 |
| Cambio desde página 2 a año 2023 | 3 | 1 / 1 | 3 | 1–3 |
| Última consulta: diabetes, orden por citas | 85 | 1 / 9 | 10 | 1–10 |
| Consulta sin coincidencias | 0 | 1 / 1 | 0 | 0–0 |

En once verificaciones del listado se contrastan títulos de todos los registros visibles, total, rango, paginación y etiquetas aplicadas. Los cuatro valores globales permanecen idénticos. Se comprueba limpieza que conserva la consulta, retirada individual, valores restaurados en formulario, conservación del filtro de acceso al paginar y reinicio de página al cambiar filtro.

Dos envíos consecutivos con latencia en el primero mantienen URL y resultado de diabetes, y se vuelve a verificar tras una espera: no se observa sobrescritura por el resultado renal anterior. Es evidencia de ese escenario, no una prueba exhaustiva de todas las intercalaciones de red.

La ayuda se comprueba con teclado (Enter/Escape/retorno de foco) y eventos táctiles CDP reales en 320, 360, 768, 1280 y 1440 px CSS. El panel móvil conserva valores al cerrar/abrir y se cierra tras aplicar. Se verifican también recarga, atrás/adelante, detalle/retorno, registros ausentes frente a cero, vacío y página fuera de rango.

Lint, tipos y siete pruebas de lógica correctos. Build correcto, con dev detenido previamente; se conservan .next-dev para desarrollo y .next para producción. La batería de navegador se ejecuta en dev y se repite contra standalone final. Regresión breve de Inicio, Investigadores, Proyectos y Unidades incluida; sin cambios de reglas en esos módulos.

## Evidencia

- `docs/coherencia-publicaciones-antes.json` y `docs/coherencia-publicaciones-despues.json`: medidas de encabezado y espaciado.
- `docs/coherencia-publicaciones-validacion.json`: matriz responsive, ayuda, once comprobaciones de datos y flujos de navegación.
- `docs/screenshots/coherencia-{produccion-cientifica,investigadores}-{antes,despues}-{360,1440}.png`: vistas comparables, DPR 1 y viewport 360x1000/1440x1000 CSS.
- `docs/screenshots/coherencia-publicaciones-validacion-{360,1440}.png` y `coherencia-publicaciones-validacion-ayuda-360.png`: comprobación final y ayuda desplegada.

La revisión es parcial de accesibilidad: no se declara conformidad WCAG integral ni prueba de lectores de pantalla. Texto 200% se valida sin usar escalado CSS para agrandar artificialmente la aplicación. No se prueba cada combinación posible de filtros.

Distribución final a tamaño normal: una columna de KPIs a 320 px, dos a 360/768 px y cuatro a 1280/1440 px. Las tarjetas miden 112–114 px a escala normal y crecen hasta 224–226 px al ampliar texto al 200%, sin desbordamiento horizontal. Desarrollo queda repuesto en http://localhost:3000/produccion-cientifica (PID npm 50741, log `/tmp/observatorio-next-dev-coherencia.log`).

## Archivos de esta intervención

- `frontend/app/produccion-cientifica/page.tsx`: etiqueta y padding del encabezado.
- `frontend/components/KpiCard.tsx`: variante directory compartida, sin alterar default.
- `frontend/app/investigadores/page.tsx`: reemplazo del renderer duplicado por KpiCard; los seis valores, filtros y listado se conservan.
- `frontend/components/publications/PublicationStatistics.tsx`: cuatro tarjetas y resumen/ayuda.
- `frontend/components/publications/CatalogueSummaryHelp.tsx`: disclosure accesible.
- `frontend/components/publications/PublicationDirectory.module.css`: grid local adaptable.
- `frontend/components/publications/PublicationWorkspace.tsx`: eliminación de la reserva vacía y separación de 16 px.
- `frontend/scripts/check-publication-directory.mjs`: verificaciones ampliadas y nombres de evidencia configurables para no sustituir capturas históricas.
- Changelog, bitácora, informe y evidencia. tsconfig.tsbuildinfo se regenera por las verificaciones existentes.

## Reproducción

Con el frontend activo en 3000 y Chrome aislado en el puerto de depuración 9225:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test:publication-query
TEST_BASE_URL=http://127.0.0.1:3000 TEST_REPORT_NAME=coherencia-publicaciones-validacion.json TEST_SCREENSHOT_PREFIX=coherencia-publicaciones-validacion npm run test:publication-browser
```

Para build, detener primero el dev del proyecto y ejecutar npm run build; no ejecutar ambos simultáneamente. No se crean commits ni se realiza push o despliegue. Se mantienen pendientes las limitaciones anteriores de filtros unidad/red, métricas nulas del modelo y separación autorizada de gestión; no se modifican en este ajuste visual.
