# README tecnico

## Descripcion del proyecto

El Observatorio Nacional de Investigacion de EsSalud es una plataforma institucional para gestionar, visualizar y analizar informacion de investigacion e innovacion en salud. El proyecto busca evolucionar hacia un sistema CRIS con directorios especializados, indicadores institucionales, transparencia de datos y futuras integraciones bibliometricas.

## Stack tecnologico

- **Frontend:** Next.js, React, TypeScript y Tailwind CSS.
- **Backend:** FastAPI, SQLAlchemy, Alembic y Pydantic.
- **Base de datos:** PostgreSQL.
- **Contenedores:** Docker Compose.
- **Busqueda futura:** OpenSearch.
- **Integraciones futuras:** ORCID, OpenAlex, Crossref, PubMed, Scopus, DSpace, RENACYT y CTI Vitae.

## Estructura general del repositorio

```text
/
├── frontend/
├── backend/
├── database/
├── etl/
├── docs/
├── docker-compose.yml
├── README.md
└── .env.example
```

## Comandos principales para desarrollo local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose

```bash
docker compose up --build
```

### Validaciones recomendadas

```bash
cd frontend
npm run typecheck
npm run build
```

```bash
cd backend
python -m compileall app
```

## Flujo recomendado de Git

1. Verificar funcionamiento.
2. Hacer commit del estado estable.
3. Crear rama por funcionalidad.
4. Ejecutar prompt en Codex.
5. Validar compilacion.
6. Generar capturas.
7. Actualizar `docs/CHANGELOG.md`.
8. Hacer commit del resultado.

## Convencion sugerida de nombres de ramas

```text
feature/modulo-descripcion-corta
fix/modulo-descripcion-corta
docs/modulo-descripcion-corta
refactor/modulo-descripcion-corta
```

Ejemplos:

```text
feature/directorio-produccion-cientifica
fix/home-hydration
docs/bitacora-tecnica
refactor/home-hero-buscador
```

## Convencion sugerida de mensajes de commit

```text
tipo(modulo): descripcion breve del cambio
```

Ejemplos:

```text
feat(produccion-cientifica): implementa directorio y ficha de publicaciones
fix(home): corrige hydration y HTML invalido
docs(bitacora): agrega changelog tecnico y decisiones
refactor(home): simplifica hero y elimina busqueda duplicada
```

## Regla obligatoria para futuros prompts de desarrollo

Todo prompt futuro para desarrollo del observatorio debe incluir:

1. Actualiza `docs/CHANGELOG.md`.
2. Agrega una entrada con:
   - fecha
   - rama de trabajo
   - modulo intervenido
   - funcionalidades implementadas
   - errores corregidos
   - archivos creados/modificados
   - pendientes
3. Genera capturas de pantalla en `docs/screenshots/`.
4. Actualiza la bitacora especifica del modulo en `docs/bitacora/`.
5. Resume los cambios al finalizar.
