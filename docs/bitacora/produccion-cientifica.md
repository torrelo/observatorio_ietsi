# Bitacora del modulo: Produccion cientifica

## Estado actual

El Directorio de Produccion Cientifica cuenta con ruta principal, KPIs, buscador, filtros, categorias rapidas, listado de publicaciones, panel de analisis breve y ficha individual de publicacion.

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

## Errores corregidos

- Ordenamiento de rutas backend para evitar que `summary` y `analytics` sean interpretadas como identificadores dinamicos.
- Validacion de rutas principales del directorio.

## Pendientes

- Generar captura `docs/screenshots/produccion-cientifica-estado-actual.png`.
- Implementar descarga PDF real.
- Implementar exportacion Excel si se requiere.
- Conectar integraciones reales con Scopus, PubMed, OpenAlex, Crossref, ORCID y DSpace.
- Agregar pruebas automatizadas de filtros, paginacion y detalle.

## Capturas asociadas

- `docs/screenshots/directorio-produccion-cientifica.png`
- `docs/screenshots/publicacion-detalle.png`

## Observaciones tecnicas

El directorio concentra la busqueda especializada de publicaciones y debe mantenerse independiente del Home. Los datos actuales son semilla/mock, preparados para evolucionar hacia PostgreSQL e integraciones externas.
