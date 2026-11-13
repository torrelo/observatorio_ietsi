# Bitacora del modulo: Produccion cientifica

## Estado actual

### Intervencion 2026-11-13 - Base visual compartida

Contenedor de hasta 1440 px, titulo h1 de 30/36 px, columnas adaptables, campos con nombre accesible y minimo de 44 px. Paginacion redistribuible con texto ampliado; se preservan query params, resultados, exportacion y panel analitico. No se modifican loaders ni indicadores. Capturas: `base-visual-{antes,despues}-produccion-cientifica-{360,1440}.png`. Diagnostico y validaciones transversales en `docs/BASE_VISUAL_ETAPA_1.md`. Proxima etapa propuesta: redisenar este directorio, no implementada aqui.

El Directorio de Produccion Cientifica cuenta con ruta principal, KPIs, buscador, filtros, categorias rapidas, listado de publicaciones, panel de analisis breve y ficha individual de publicacion.

### Intervencion 2026-09-04 - Carga de datos reales del pipeline bibliometrico

Se inicia la sustitucion de datos semilla/mock por fuentes reales generadas por el pipeline de enriquecimiento bibliometrico:

- `publications_observatory.csv` para registros individuales de publicaciones.
- `publication_indicators_observatory.xlsx` para indicadores agregados por resumen, cobertura, anio, cuartil, tipo de estudio, revista y acceso abierto.

Alcance previsto:

- Crear una capa server-side de lectura y normalizacion de datos reales.
- Reemplazar KPIs, listado, filtros, analitica breve y ficha individual por valores provenientes de los archivos reales.
- Manejar valores faltantes sin exponer `null`, `undefined`, `NaN` o cadenas vacias en la interfaz.
- Incorporar cobertura del enriquecimiento y nota metodologica visible.
- Mantener rutas, arquitectura visual y componentes existentes.

Resultado de la intervencion:

- `frontend/lib/publications.ts` carga y normaliza `publications_observatory.csv`.
- `publication_indicators_observatory.xlsx` se conserva como fuente original y se usa un JSON derivado para consumo server-side del MVP.
- KPIs, filtros, listado, paginacion, paneles analiticos y ficha individual usan datos reales.
- La interfaz maneja valores faltantes con textos institucionales: `No disponible`, `Sin cuartil`, `Sin DOI`, `Sin PMID` y `Sin area tematica`.
- Se agrega seccion de calidad de datos con cobertura de enriquecimiento.
- Se agrega nota metodologica visible.
- El backend expone publicaciones reales en `/api/publications`, `/api/publications/summary`, `/api/publications/analytics`, `/api/publications/indicators`, `/api/publications/coverage` y `/api/publications/filters` cuando detecta los archivos locales.
- Se mantiene fallback backend a datos semilla si las fuentes reales no existen.

Validaciones de datos:

- Total publicaciones cargadas: 2701.
- Total publicaciones incluidas: 2700.
- Cobertura DOI: 78.37% desde indicadores agregados y 78.41% calculada directamente desde CSV.
- Cobertura de cuartil: 69.52%.
- Cobertura de citas: 77.63% desde indicadores agregados y 77.67% calculada directamente desde CSV.
- Revistas unicas: 780.
- Rango de anios validos: 1984-2026.

### Intervencion 2026-06-16 - Consolidacion de rutas

Se inicia la consolidacion del modulo para declarar `/produccion-cientifica` como ruta institucional oficial y mantener `/publicaciones` como modulo legacy con redireccion de compatibilidad. La intervencion no contempla redisenio visual ni eliminacion de componentes.

Resultado de la intervencion:

- `/produccion-cientifica` queda como modulo oficial.
- `/produccion-cientifica/[id]` queda como ficha oficial.
- `/publicaciones` redirige a `/produccion-cientifica`.
- `/publicaciones/[id]` redirige a `/produccion-cientifica/[id]`.
- Header global y Home apuntan ahora al modulo oficial.

### Intervencion 2026-06-16 - Optimizacion UX de ficha individual

Se optimiza la ficha `/produccion-cientifica/[id]` para reducir redundancias y mejorar la jerarquia de informacion siguiendo patrones de portales CRIS y bibliometricos institucionales. No se modifica backend, directorio ni diseno general del observatorio.

Cambios documentados:

- Simplificacion de badges a cuartil y estado de acceso.
- Eliminacion de duplicidades DOI, PMID, fuentes y cuartil en zonas superiores.
- Agrupacion de exportaciones bajo `Exportar`.
- Agrupacion de enlaces externos bajo `Ver publicacion`.
- Incorporacion de metadato resumen bajo autores.
- Integracion de financiamiento dentro de detalles bibliograficos.
- Separacion de palabras clave como chips.
- Mantenimiento de autores y filiaciones con estructura preparada para ORCID y RENACYT.

## Funcionalidades implementadas

- Ruta `/produccion-cientifica`.
- Ruta `/produccion-cientifica/[id]`.
- KPIs de publicaciones, citas, publicaciones Q1/Q2, acceso abierto, investigadores autores y revistas.
- Buscador por titulo, autor, DOI, PMID, revista o palabra clave.
- Filtros por anio, tipo, autor, unidad, red, area, revista, cuartil, tipo de estudio, acceso abierto, fuente y financiamiento.
- Tarjetas de resultados con badges bibliometricos.
- Ficha individual con resumen, detalles, autores, metricas, financiamiento, enlaces externos y publicaciones relacionadas.
- Preparacion de exportaciones CSV, RIS, BibTeX y ficha PDF.
- Endpoints backend para listado, detalle, resumen y analitica.
- Datos semilla realistas en espanol.
- Redirecciones de compatibilidad desde rutas legacy `/publicaciones`.
- Navegacion institucional consolidada hacia `/produccion-cientifica`.
- Ficha individual optimizada con menor ruido visual y mejor jerarquia bibliografica.
- Carga de datos reales desde `frontend/public/data/publications_observatory.csv`.
- Indicadores agregados desde `frontend/public/data/publication_indicators_observatory.json`, derivado trazable del XLSX original.
- Filtros y ordenamientos derivados de campos reales de publicaciones.
- Calidad de datos/cobertura del enriquecimiento.
- Nota metodologica visible sobre cuartiles, citas, acceso abierto y clasificacion tematica.

## Errores corregidos

- Ordenamiento de rutas backend para evitar que `summary` y `analytics` sean interpretadas como identificadores dinamicos.
- Validacion de rutas principales del directorio.
- Divergencia entre el modulo legacy `/publicaciones` y el modulo institucional `/produccion-cientifica`.
- Enlaces institucionales desde Header y Home que apuntaban al modulo legacy.
- Redundancias visuales en la ficha individual: exceso de badges, acciones atomizadas, financiamiento aislado y palabras clave dentro de tabla.
- Dependencia de datos ficticios visibles en el modulo oficial de Produccion Cientifica.
- Exposicion potencial de valores faltantes como cadenas vacias o valores tecnicos.
- Limite del parser CSV backend para campos bibliograficos extensos.

## Auditoria de rutas

- `/publicaciones`: modulo legacy anterior. Usaba `api.publications`, `PublicationCard`, `SearchBar`, `FilterSidebar` y `SectionHeader`. Ahora redirige a `/produccion-cientifica`.
- `/publicaciones/[id]`: ficha legacy anterior. Usaba `api.publication`, `Badge`, `DataTable` y `SectionHeader`. Ahora redirige a `/produccion-cientifica/[id]`.
- `/produccion-cientifica`: modulo oficial. Usa `getPublications`, `getPublicationsSummary`, `getPublicationsAnalytics`, `Badge`, `SectionHeader` y utilidades de exportacion.
- `/produccion-cientifica/[id]`: ficha oficial. Usa `getPublication`, `getPublications`, `Badge`, `DataTable`, `PublicationActions` y enlaces externos.

## Revision de componentes

- `Button`: huerfano actualmente; no se elimina en esta fase.
- `PublicationCard`: legacy; estaba ligado al modulo antiguo `/publicaciones`; marcado como pendiente de retiro tras validacion funcional.
- `SearchBar`: reutilizable; sigue usado por otros directorios, no es exclusivo de Produccion Cientifica.
- `FilterSidebar`: reutilizable; sigue usado por otros directorios, no es exclusivo de Produccion Cientifica.

## Pendientes

- Retirar rutas legacy cuando se complete validacion funcional y trazabilidad de enlaces externos.
- Generar captura `docs/screenshots/produccion-cientifica-estado-actual.png`.
- Implementar descarga PDF real.
- Implementar exportacion Excel si se requiere.
- Conectar integraciones reales con OpenAlex, PubMed, ORCID, Crossref, Scopus y DSpace.
- Exponer ORCID y RENACYT por autor desde backend para completar la ficha CRIS.
- Agregar pruebas automatizadas de filtros, paginacion y detalle.
- Persistir la fuente real en PostgreSQL cuando se active la fase de carga formal.
- Automatizar la conversion XLSX a JSON dentro del pipeline ETL o reemplazarla por un lector oficial.
- Normalizar investigadores/autores institucionales con identificadores estables cuando el pipeline los entregue.

## Capturas asociadas

- `docs/screenshots/directorio-produccion-cientifica.png`
- `docs/screenshots/publicacion-detalle.png`
- `docs/screenshots/directorio-produccion-cientifica-v2.png`
- `docs/screenshots/publicacion-detalle-v2.png`
- `docs/screenshots/publicacion-detalle-ux-v3.png`
- `docs/screenshots/produccion-cientifica-datos-reales-v1.png`
- `docs/screenshots/publicacion-detalle-datos-reales-v1.png`

## Observaciones tecnicas

El directorio concentra la busqueda especializada de publicaciones y debe mantenerse independiente del Home. Los datos actuales del modulo oficial provienen de archivos reales del pipeline de enriquecimiento bibliometrico. La capa queda preparada para evolucionar hacia PostgreSQL e integraciones externas.

Validaciones ejecutadas:

- `npm run typecheck`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001 npm run build`
- Verificacion local con `npm run dev` en `http://localhost:3001`.
- Verificacion de redirecciones legacy con respuestas 307.
