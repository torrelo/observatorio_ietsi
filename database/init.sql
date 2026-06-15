CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS integration_registry (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name varchar(80) NOT NULL,
  base_url text,
  enabled boolean NOT NULL DEFAULT false,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO integration_registry (source_name, base_url, enabled)
VALUES
  ('OpenSearch', 'http://opensearch:9200', false),
  ('ORCID', 'https://pub.orcid.org/v3.0', false),
  ('Crossref', 'https://api.crossref.org', false),
  ('OpenAlex', 'https://api.openalex.org', false),
  ('PubMed', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils', false),
  ('Scopus', 'https://api.elsevier.com', false),
  ('DSpace', NULL, false)
ON CONFLICT DO NOTHING;
