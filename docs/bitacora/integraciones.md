# Bitacora del modulo: Integraciones

## Estado actual

La arquitectura esta preparada para futuras integraciones con fuentes bibliometricas, repositorios e identificadores academicos. Aun no hay conexion real con APIs externas.

## Funcionalidades implementadas

- Modelos backend con campos para identificadores externos.
- Campo `external_identifiers` preparado para publicaciones.
- Campos para ORCID, Scopus Author ID y RENACYT en investigadores.
- Preparacion conceptual para OpenSearch.
- Datos semilla que simulan fuentes como Scopus, PubMed, OpenAlex, Crossref y DSpace institucional.

## Errores corregidos

- No se registran correcciones especificas recientes para integraciones externas.

## Pendientes

- Disenar conectores para ORCID.
- Disenar conectores para OpenAlex.
- Disenar conectores para Crossref.
- Disenar conectores para PubMed.
- Disenar conectores para Scopus.
- Disenar conectores para DSpace institucional.
- Disenar conectores para RENACYT y CTI Vitae.
- Implementar colas o jobs ETL para sincronizacion.
- Definir estrategia de normalizacion, deduplicacion y trazabilidad de registros.

## Capturas asociadas

- No aplica por ahora.

## Observaciones tecnicas

Las integraciones deben implementarse de forma desacoplada, preferiblemente en servicios o pipelines ETL, evitando acoplar llamadas externas directamente a los renders del frontend.
