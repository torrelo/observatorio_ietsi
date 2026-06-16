# Backend tecnico

API CRIS del Observatorio Nacional de Investigacion de EsSalud.

## Stack

- FastAPI
- SQLAlchemy 2
- Alembic
- Pydantic 2
- PostgreSQL

## Instalacion local

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Ejecutar API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Migraciones

Con PostgreSQL disponible y `DATABASE_URL` configurado:

```bash
alembic upgrade head
```

Crear una nueva revision:

```bash
alembic revision --autogenerate -m "descripcion"
```

## Endpoints principales

Todos los listados soportan `q`, `page`, `page_size`, `sort_by`, `sort_order` y filtros especificos.

- `GET /health`
- `GET /api/publications`
- `GET /api/publications/{id}`
- `GET /api/researchers`
- `GET /api/researchers/{id}`
- `GET /api/projects`
- `GET /api/projects/{id}`
- `GET /api/units`
- `GET /api/units/{id}`
- `GET /api/clinical-trials`
- `GET /api/clinical-trials/{id}`
- `GET /api/search?q=diabetes`

## Datos semilla

El MVP expone datos deterministas en memoria:

- 100 publicaciones
- 50 investigadores
- 30 proyectos
- 15 unidades de investigacion
- 10 ensayos clinicos

Esto permite probar el contrato API sin requerir carga inicial de PostgreSQL. La estructura SQLAlchemy y Alembic queda lista para persistencia real.

## Busqueda

`GET /api/search` usa busqueda textual compatible con la forma futura de OpenSearch. El contrato devuelve `entity`, `id`, `title`, `subtitle` y `url`.
