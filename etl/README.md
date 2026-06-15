# ETL e integraciones futuras

Este directorio queda preparado para conectores de ingesta y normalizacion.

Fuentes previstas:

- ORCID: perfiles, afiliaciones e identificadores.
- Crossref: DOI, revistas, citas y metadatos editoriales.
- OpenAlex: produccion cientifica abierta, instituciones y conceptos.
- PubMed: PMID, MeSH y publicaciones biomedicas.
- Scopus: metricas bibliometricas bajo credenciales institucionales.
- DSpace: repositorio institucional.
- OpenSearch: busqueda avanzada e indexacion.

El MVP usa datos semilla en memoria desde FastAPI. La siguiente iteracion puede mover los seeds a PostgreSQL y crear jobs programados.
