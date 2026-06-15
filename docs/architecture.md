# Arquitectura del MVP

El MVP separa frontend, backend, base de datos y capa ETL para permitir evolucion incremental.

- `frontend`: Next.js, React, TypeScript y Tailwind CSS.
- `backend`: FastAPI, Pydantic y SQLAlchemy.
- `database`: scripts iniciales para PostgreSQL.
- `etl`: espacio para conectores ORCID, Crossref, OpenAlex, PubMed, Scopus, DSpace y OpenSearch.

La API expone endpoints REST de lectura y usa datos semilla realistas en espanol. Los modelos SQLAlchemy ya reflejan las entidades principales para migrar a persistencia PostgreSQL.
