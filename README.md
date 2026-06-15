# Observatorio Nacional de Investigacion de EsSalud

MVP institucional para inteligencia cientifica, gestion de investigacion y transparencia. Incluye frontend en Next.js, API en FastAPI, modelos SQLAlchemy preparados para PostgreSQL, datos semilla realistas y Docker Compose.

## Estructura

- `frontend`: Next.js + React + TypeScript + Tailwind CSS.
- `backend`: FastAPI + SQLAlchemy + Pydantic.
- `database`: SQL inicial para PostgreSQL e integraciones futuras.
- `etl`: base documental para conectores ORCID, Crossref, OpenAlex, PubMed, Scopus, DSpace y OpenSearch.
- `docs`: notas de arquitectura.
- `images`: logos fuente de EsSalud e IETSI.

## Ejecucion local sin Docker

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

URLs:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

## Ejecucion con Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## Endpoints MVP

- `GET /health`
- `GET /api/home/summary`
- `GET /api/publications`
- `GET /api/publications/{id}`
- `GET /api/projects`
- `GET /api/projects/{id}`
- `GET /api/researchers`
- `GET /api/researchers/{id}`
- `GET /api/units`
- `GET /api/units/{id}`
- `GET /api/search/global?q=diabetes`

## Notas

El MVP usa datos semilla en memoria para acelerar la primera iteracion. Los modelos SQLAlchemy y el servicio PostgreSQL quedan listos para persistencia real, migraciones e ingesta desde fuentes bibliograficas.
