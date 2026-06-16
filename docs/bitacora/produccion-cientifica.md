# Bitacora del modulo: Produccion cientifica

## Estado actual

El Directorio de Produccion Cientifica cuenta con ruta principal, KPIs, buscador, filtros, categorias rapidas, listado de publicaciones, panel de analisis breve y ficha individual de publicacion.

### Intervencion 2026-06-16 - Consolidacion de rutas

Se inicia la consolidacion del modulo para declarar `/produccion-cientifica` como ruta institucional oficial y mantener `/publicaciones` como modulo legacy con redireccion de compatibilidad. La intervencion no contempla redisenio visual ni eliminacion de componentes.

Resultado de la intervencion:

- `/produccion-cientifica` queda como modulo oficial.
- `/produccion-cientifica/[id]` queda como ficha oficial.
- `/publicaciones` redirige a `/produccion-cientifica`.
- `/publicaciones/[id]` redirige a `/produccion-cientifica/[id]`.
- Header global y Home apuntan ahora al modulo oficial.

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

## Errores corregidos

- Ordenamiento de rutas backend para evitar que `summary` y `analytics` sean interpretadas como identificadores dinamicos.
- Validacion de rutas principales del directorio.
- Divergencia entre el modulo legacy `/publicaciones` y el modulo institucional `/produccion-cientifica`.
- Enlaces institucionales desde Header y Home que apuntaban al modulo legacy.

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
- Agregar pruebas automatizadas de filtros, paginacion y detalle.

## Capturas asociadas

- `docs/screenshots/directorio-produccion-cientifica.png`
- `docs/screenshots/publicacion-detalle.png`
- `docs/screenshots/directorio-produccion-cientifica-v2.png`
- `docs/screenshots/publicacion-detalle-v2.png`

## Observaciones tecnicas

El directorio concentra la busqueda especializada de publicaciones y debe mantenerse independiente del Home. Los datos actuales son semilla/mock, preparados para evolucionar hacia PostgreSQL e integraciones externas.

Validaciones ejecutadas:

- `npm run typecheck`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001 npm run build`
- Verificacion local con `npm run dev` en `http://localhost:3001`.
- Verificacion de redirecciones legacy con respuestas 307.
