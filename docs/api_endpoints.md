# Documentacion API

La documentacion OpenAPI se genera automaticamente por FastAPI en:

- `http://localhost:8000/docs`
- `http://localhost:8000/openapi.json`

## Parametros comunes de listados

- `q`: busqueda textual.
- `page`: pagina, minimo 1.
- `page_size`: tamano de pagina, 1 a 100.
- `sort_by`: campo de ordenamiento.
- `sort_order`: `asc` o `desc`.

## Ejemplos

```bash
curl "http://localhost:8000/api/publications?q=diabetes&page=1&page_size=10&sort_by=year&sort_order=desc"
curl "http://localhost:8000/api/researchers?specialty=Infectologia"
curl "http://localhost:8000/api/projects?status=En%20ejecucion"
curl "http://localhost:8000/api/units?region=Lima"
curl "http://localhost:8000/api/clinical-trials?status=Activo"
curl "http://localhost:8000/api/search?q=telemedicina"
```
