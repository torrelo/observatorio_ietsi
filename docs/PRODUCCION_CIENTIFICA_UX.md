# Rediseño del directorio de producción científica

Fecha: 2026-11-13. Rama: `feat/produccion-cientifica-ux`.

## Diagnóstico antes de editar

Git limpio al comenzar; rama local creada desde `observatorio-directorio-proyectos`, sin commit. Sin AGENTS.md aplicable encontrado en el repositorio; se mantienen las instrucciones de la etapa compartida. Next 15.1.3, React 19, Tailwind 3.4.19, TypeScript 5.9.3, npm/package-lock. Sin cambios de dependencias.

- Fuente: CSV `frontend/public/data/publications_observatory.csv`; agregados del JSON generado desde `publication_indicators_observatory.xlsx`. Loader de servidor `frontend/lib/publications.ts`, no una consulta al backend. No se presupone disponibilidad de FastAPI.
- Catálogo/listado sin filtros: 2701 registros. Resumen de incluidos: 2700. El resumen prioriza el workbook y el listado no excluye por observatory_included; se preservan ambos criterios, sin modificar exclusiones ni cálculos.
- Búsqueda q: coincidencia textual case-insensitive en título, resumen, DOI, PMID, revista/ISSN, tipo documental, estudio, clasificación temática, fuente, autores y autores institucionales. No equivale a búsqueda externa de texto completo ni ofrece relevancia puntuada.
- Filtros realmente implementados: year, publication_type, author, journal, quartile, study_type, thematic_area, thematic_category, thematic_subtheme, source, funding, open_access. Salvo acceso booleano, la comparación actual es por subcadena; no se cambia.
- Los campos unit/network aparecían en el formulario pero el loader los ignoraba. No se mantendrá una falsa promesa de filtrado; se documentará su falta de soporte. Filtro de revista limitaba opciones a las primeras 200; el conjunto real contiene más revistas.
- Orden global antes del slice: año asc/desc, citas asc/desc, cuartil y título. Predeterminado -year. page/limit, alias page_size/sort_by; límite máximo 100, tamaño predeterminado 10. El loader ya recorta páginas fuera de rango, pero la URL no lo reflejaba.
- Todos los KPIs/estadísticas son globales, aunque haya filtros aplicados. CSV exportado incluía solo la página visible sin indicarlo claramente. No hay estadísticas filtradas disponibles en el contrato actual.
- Campos: título, autores, revista/ISSN, año, DOI/PMID, cuartil, acceso, citas, estudio, clasificación, keywords derivadas y metadatos de procedencia. Ausencias frecuentes: abstract, DOI, PMID, cuartil, impacto, altmetric y financiamiento. La normalización antigua convierte citas ausentes a 0 y acceso desconocido a false: se añadirá lectura de disponibilidad original exclusiva de presentación, sin cambiar modelos, métricas o API.
- Títulos apuntaban al DOI, no a la ficha; autores se cortaban sin expansión; filtros de texto no recuperaban valores de URL. Estadística permanente reducía el área de resultados. El retorno desde detalle siempre borraba la búsqueda. Había boundary genérico, sin loading ni estado vacío específico.

## Implementación

- Encabezado compacto con H1, descripción y actualización verificable desde el loader. Fecha 04/09/2026; no se usa la fecha del navegador ni la fecha actual.
- Cuatro indicadores globales: publicaciones, acceso abierto, Q1–Q2 y citas. Sin porcentajes de denominador ambiguo. Los demás indicadores y cobertura se conservan en un desplegable posterior.
- Buscador único amplio con etiqueta y ayuda, Enter/botón Buscar. Envío explícito, sin consultas inmediatas ni debounce innecesario. Transiciones de App Router, estado aria-busy y aviso de actualización; no hay fetch manual paralelo que sobrescriba resultados nuevos.
- Dos columnas desde 1024 CSS: filtros de 17rem (272 px a escala normal) y resultados flexibles. Sin columna analítica permanente ni cambios en el contenedor, Header o estilos compartidos.
- Filtros principales y Más filtros; se mantienen los tipos documentales sin fusionarlos. Todas las revistas reales son seleccionables, no solo las primeras 200. Unidad/red no se ofrecen como controles falsamente funcionales: se explica la limitación real del lector.
- Estado aplicado en URL, borrador identificado y restablecido al cambiar la consulta. Etiquetas removibles sincronizan formulario y resultados. Limpiar filtros conserva q/orden; borrar consulta conserva filtros; restablecer elimina todo. Cambiar consulta/filtro/orden reinicia página, paginar conserva el resto.
- Orden sobre el conjunto completo usando el loader existente; no se ofrece relevancia. Parámetros validados, aliases conservados, página fuera de rango redirigida a la última válida. URL de retorno de ficha limitada al mismo directorio, sin redirecciones externas.
- El filtro open_access=false se denomina «No marcado como abierto», no «Restringido»: el contrato antiguo incluye allí tanto false informado como acceso desconocido normalizado a false. Se explica esa cobertura y no se cambia el predicado. Cada resultado distingue su estado original.
- Títulos completos enlazados al detalle, revista/año, autores expandibles, pocas etiquetas y citas verificables. DOI/PMID solo enlazan si tienen formato válido. Ver publicación apunta al DOI sin prometer texto completo. Información adicional en disclosure, sin pequeñas cajas para cada metadato. Cero citas y citas ausentes tienen textos distintos; acceso desconocido no aparece como restringido.
- CSV identifica que exporta la página visible. Las citas ausentes quedan vacías también en este CSV, sin cambiar servicios de exportación de otras vistas ni cálculos.
- Estadísticas del catálogo, distribuciones anuales (1984–2026), cobertura y metodología después del listado y plegadas inicialmente. Valores en listas descriptivas como alternativa textual; barras decorativas aria-hidden, sin librería nueva. Indicadores y gráficos no se reconstruyen desde los diez resultados visibles.
- Estados de carga, ausencia de coincidencias y error diferenciados. Reintento conserva la URL. Disclosure móvil no modal: sin focus trap artificial; Enter/Tab permiten llegar a los filtros y sus valores persisten al cerrar/abrir.

## Evidencia de coberturas distintas

El CSV contiene un registro con `observatory_included=False`: `604177c836c7`, `exclusion_reason=book_chapter`, DOI `10.1007/978-1-60327-285-8_22`, citas `0`. El listado existente no excluye ese registro. Se mantiene esa política.

`npm run validate:publications` informa 2701 filas, 2700 incluidos, 2117 registros CSV con DOI y 2097 con citas. El workbook conserva 2116 con DOI y cobertura de citas de 2096 sobre 2700; la diferencia de una fila coincide con el registro excluido que dispone de ambos campos. No se mezclan esos recuentos ni se recalculan para forzar igualdad. El UI declara alcance global y denominadores del archivo de cobertura (presentes + faltantes). Los indicadores de acceso abierto y citas mantienen sus fuentes/cálculos originales.

## Archivos

Modificados:
- `frontend/app/produccion-cientifica/page.tsx`: composición del directorio y paginación.
- `frontend/app/produccion-cientifica/[id]/page.tsx`: únicamente recepción/validación de returnTo y enlace Volver, sin rediseñar la ficha.
- `frontend/lib/publications.ts`: accessor de disponibilidad desde campos CSV originales para la presentación de la página. Sin cambiar ScientificPublication, normalizador, filtros, agregados o API.
- `frontend/package.json`: scripts de pruebas, sin dependencias nuevas.
- `docs/CHANGELOG.md`, `docs/bitacora/produccion-cientifica.md` y este informe. `tsconfig.tsbuildinfo` se regenera con TypeScript.

Creados:
- `frontend/lib/publicationQuery.ts`: normalización de URL, parches, limpieza y retorno seguro.
- `frontend/components/publications/PublicationWorkspace.tsx`: búsqueda, borrador, filtros móviles y orden.
- `frontend/components/publications/PublicationResult.tsx`: resultado bibliográfico.
- `frontend/components/publications/PublicationStatistics.tsx`: indicadores y estadísticas secundarias.
- `frontend/components/publications/PublicationDirectory.module.css`: estilos locales y reutilización de variables de base.
- `frontend/app/produccion-cientifica/loading.tsx` y `error.tsx`.
- `frontend/scripts/test-publication-query.mjs`, `check-publication-directory.mjs`, `check-publication-error.mjs` y `fixtures/publication-read-error.cjs` (solo pruebas).
- `docs/validacion-produccion-cientifica-ux.json`, `docs/validacion-produccion-cientifica-error.json` y cuatro capturas antes/después.

## Validación ejecutada

- `npm run lint`, `npm run typecheck`, `npm run build`: correctos. Servidor dev comprobado en 3004; luego se detuvo antes de build para no compartir artefactos .next entre procesos de escritura.
- `npm run test:publication-query`: 7 pruebas correctas. Validación, aliases, cambios de URL, retiro individual, limpieza, paginación, retorno seguro; además datos reales, orden anterior a paginación y disponibilidad de citas (null distinto de 0).
- `npm run test:publication-browser`: correcto en desarrollo y repetido contra build standalone. 320/360/768/1280/1440 CSS, texto 200% en todos, sin desbordamiento de página. Un H1, etiquetas, apertura por Enter y Tab a filtros con foco visible; controles móviles mantienen borrador al cerrar/abrir.
- Búsqueda con Enter, transición aria-busy con latencia de red simulada, filtros combinados, aplicación/cierre móvil, retiro de etiqueta, limpieza, orden, página 2, recarga, atrás/adelante, detalle/retorno, valores ausentes y ceros reales, estado vacío y página fuera de rango: correctos. Cero errores de consola registrados en flujos normales.
- Fallo EIO simulado exclusivamente en servidor de prueba 3005 mediante preload, sin modificar CSV/XLSX ni lógica de producción. Error distinto de vacío, sin trazas en interfaz; retiro del fallo y reintento con Enter recuperan q=renal/year=2023. JSON específico guarda resultado. Los errores de servidor esperados de esta prueba no se contabilizan como fallos de los flujos normales.
- Regresión breve `/`, `/investigadores`, `/proyectos`, `/unidades`: carga, H1 y ausencia de desbordamiento correctos; no se modifican sus archivos ni componentes compartidos.
- Backend `/health` verificado: status ok. No es requisito para el directorio, que usa archivos locales existentes.
- Capturas de referencia y finales de 360x1000 y 1440x1000 CSS, DPR 1, revisadas visualmente. Archivos `screenshots/produccion-cientifica-ux-{antes,despues}-{360,1440}.png`. Capturas finales desde pestañas nuevas para evitar artefactos de repintado del entorno headless observados en la etapa anterior.

Estas comprobaciones no equivalen a conformidad WCAG integral. No se probaron lectores de pantalla ni otros motores; tampoco todas las combinaciones del catálogo. La ampliación fue de texto al 200%, no zoom nativo de la ventana. Foco/contraste reutilizan la base anterior; se mantienen colores institucionales, texto oscuro y estados expresados también por palabras.

## Ejecución y pruebas

Desde `frontend`:

```bash
npm run lint
npm run typecheck
npm run test:publication-query
npm run build
npm run dev -- --hostname 127.0.0.1 --port 3004
```

Abrir http://localhost:3004/produccion-cientifica. No ejecutar dev y build simultáneamente. Para probar el artefacto de producción, detener dev y usar `PORT=3004 HOSTNAME=127.0.0.1 npm run start`.

Prueba de navegador sin instalar dependencias (requiere Chrome y Node con WebSocket nativo):

```bash
/opt/google/chrome/chrome --headless --remote-debugging-port=9225 --user-data-dir=/tmp/observatorio-test-chrome about:blank
npm run test:publication-browser
```

En entornos donde Chrome necesita `--no-sandbox`, esa opción se limita al proceso aislado de pruebas. El runner acepta `TEST_BASE_URL` y `CHROME_DEBUG_URL`. No se cambia configuración del navegador del usuario.

Error/reintento: después de build, en un puerto aparte y únicamente para pruebas:

```bash
PORT=3005 HOSTNAME=127.0.0.1 PUBLICATION_TEST_FAILURE_FLAG=/tmp/observatorio-publication-fault.flag node --require ./scripts/fixtures/publication-read-error.cjs .next/standalone/server.js
PUBLICATION_TEST_FAILURE_FLAG=/tmp/observatorio-publication-fault.flag node scripts/check-publication-error.mjs
```

El runner crea/elimina solo ese marcador temporal y siempre lo retira al finalizar. Nunca añadir el preload a los comandos de arranque del portal.

## Pendientes priorizados y reutilización

1. Alta: implementar unit/network con relaciones institucionales reales en el servicio antes de ofrecer esos filtros. Esta etapa no inventa relaciones ni cambia backend.
2. Alta: evaluar en una tarea independiente si el modelo/API debe conservar null para citas/acceso/Altmetric. La nueva vista pública usa procedencia original, pero orden, agregados, mediana y otras vistas mantienen la normalización antigua por restricción expresa.
3. Media: snapshots/caché por solicitud para evitar el reprocesamiento repetido de CSV/indicadores; no se cambia la invalidación existente en este rediseño.
4. Media: filtros por subcadena pueden dar resultados más amplios que igualdad exacta; se conserva su semántica. No se modifica para aparentar recuentos distintos.
5. Media: no existe separación autorizada entre gestión y público; los CSV están en public/data y la ficha conserva metadatos técnicos. Retirar detalles internos del listado no es autorización ni crea una vista administrativa protegida. Se requiere diseño de acceso aparte.
6. Baja: favicon ausente preexistente; el validador histórico usa recuentos CSV completos con denominador de incluidos, lo que puede diferir de la cobertura del workbook. Se documenta, sin cambiar reglas de conteo.

Reutilizable posteriormente: patrón de consulta aplicada frente a borrador, etiquetas removibles, normalización de URL, retorno validado, disclosure móvil no modal, estados de transición y estadísticas plegables con alternativa textual. No se abstraen prematuramente como componentes globales ni se trasladan todavía a otros directorios. Sin commit, push, PR o despliegue.
