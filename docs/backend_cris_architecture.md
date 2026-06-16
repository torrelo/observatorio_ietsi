# Arquitectura de datos y backend CRIS

## Alcance

El backend modela el nucleo funcional del Observatorio Nacional de Investigacion de EsSalud para:

- Produccion cientifica
- Investigadores
- Proyectos
- Unidades de investigacion
- Ensayos clinicos
- Financiamiento, revistas, instituciones, palabras clave, redes y datasets

## Entidades principales

- `Publication`: produccion cientifica con DOI, PMID, cuartil, impacto, citas y altmetric.
- `Researcher`: perfiles CRIS con ORCID, RENACYT, Scopus Author ID, afiliacion y metricas.
- `Project`: portafolio institucional con IP, coinvestigadores, presupuesto, estado etico y ODS.
- `ResearchUnit`: capacidades por red asistencial, region, infraestructura y geolocalizacion.
- `ClinicalTrial`: ensayos clinicos por registro, fase, sponsor, unidades e investigadores.
- `FundingSource`: fuentes de financiamiento institucional, publico competitivo o cooperacion.
- `Journal`: revistas con ISSN, area, cuartil e impacto.
- `Institution`: hospitales y entidades vinculadas.
- `Keyword`: vocabulario controlado para busqueda y clasificacion.
- `ResearchNetwork`: redes cientificas e institucionales.
- `Dataset`: activos de datos vinculables a proyectos.

## Diagrama ER

```mermaid
erDiagram
    INSTITUTION ||--o{ RESEARCH_UNIT : hosts
    JOURNAL ||--o{ PUBLICATION : publishes
    FUNDING_SOURCE ||--o{ PUBLICATION : funds
    FUNDING_SOURCE ||--o{ PROJECT : funds
    RESEARCHER ||--o{ PROJECT : leads
    RESEARCH_UNIT ||--o{ PROJECT : executes
    PROJECT ||--o{ DATASET : produces

    PUBLICATION }o--o{ RESEARCHER : authors
    PUBLICATION }o--o{ KEYWORD : tagged
    PUBLICATION }o--o{ PROJECT : derives_from
    PUBLICATION }o--o{ RESEARCH_UNIT : affiliated_to
    RESEARCHER }o--o{ KEYWORD : expertise
    RESEARCHER }o--o{ RESEARCH_UNIT : belongs_to
    PROJECT }o--o{ RESEARCHER : coinvestigators
    CLINICAL_TRIAL }o--o{ RESEARCHER : involves
    CLINICAL_TRIAL }o--o{ RESEARCH_UNIT : conducted_at
    RESEARCH_NETWORK }o--o{ RESEARCH_UNIT : includes

    PUBLICATION {
      int id PK
      string title
      text abstract
      int year
      string publication_type
      int journal_id FK
      string doi
      string pmid
      string quartile
      float impact_factor
      string study_type
      string thematic_area
      int funding_source FK
      bool open_access
      int citation_count
      float altmetric_score
      datetime created_at
      datetime updated_at
    }

    RESEARCHER {
      int id PK
      string full_name
      string orcid
      string renacyt_code
      string scopus_author_id
      string specialty
      string academic_degree
      string affiliation
      text biography
      string photo_url
      int h_index
      int citation_count
      bool international_collaboration
    }

    PROJECT {
      int id PK
      string project_code
      string title
      text summary
      string project_type
      string status
      string thematic_line
      string funding_type
      numeric budget
      date start_date
      date end_date
      string ethics_status
      array expected_outputs
      array sdg
      text results_summary
    }

    RESEARCH_UNIT {
      int id PK
      string name
      string unit_type
      string network
      string region
      string province
      string district
      text description
      array infrastructure
      float latitude
      float longitude
    }

    CLINICAL_TRIAL {
      int id PK
      string registry_code
      string title
      string phase
      string status
      string sponsor
      date start_date
      date end_date
    }
```

## OpenSearch futuro

El endpoint `/api/search` mantiene un contrato independiente del motor:

- `entity`
- `id`
- `title`
- `subtitle`
- `url`

La proxima iteracion puede reemplazar la busqueda en memoria por un servicio `SearchProvider` con implementaciones `PostgresSearchProvider` y `OpenSearchProvider`.
