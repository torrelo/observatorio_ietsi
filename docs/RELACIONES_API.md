# 🔗 Documentación de Relaciones - API Observatorio

## Descripción General

La API del Observatorio permite acceder a relaciones bidireccionales entre entidades. Este documento describe todos los endpoints para consultar estas relaciones.

---

## 📚 Relaciones Principales

### Investigadores ↔ Publicaciones

```
Investigador → Publicaciones (como autor)
Publicación → Autores (investigadores)
```

### Proyectos ↔ Investigadores

```
Proyecto → Investigador principal
Proyecto → Coinvestigadores
```

### Unidades → Investigadores/Publicaciones

```
Unidad → Investigadores
Unidad → Publicaciones
```

---

## 🔌 Endpoints de Relaciones

### 1. **Publicaciones de un Investigador**

**GET** `/api/v1/researchers/{researcher_id}/publications`

Obtiene todas las publicaciones en las que un investigador es autor.

**Parámetros:**
- `researcher_id` (path): ID del investigador
- `page` (query): Número de página (default: 1)
- `page_size` (query): Registros por página (default: 20, max: 100)
- `sort_by` (query): Campo para ordenar (año, citation_count)
- `sort_order` (query): asc o desc

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/researchers/1/publications?page=1&page_size=10&sort_by=year&sort_order=desc"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Factores de riesgo cardiovascular...",
      "year": 2024,
      "authors": [
        {"id": 1, "name": "Dra. Mariana Torres"}
      ],
      "citation_count": 12
    }
  ],
  "total": 6,
  "page": 1,
  "page_size": 10,
  "pages": 1
}
```

---

### 2. **Proyectos de un Investigador**

**GET** `/api/v1/researchers/{researcher_id}/projects`

Obtiene todos los proyectos en los que un investigador participa (como principal o coinvestigador).

**Parámetros:**
- `researcher_id` (path): ID del investigador
- `page` (query): Número de página (default: 1)
- `page_size` (query): Registros por página (default: 20)
- `sort_by` (query): start_date, status
- `sort_order` (query): asc o desc

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/researchers/1/projects?sort_by=start_date&sort_order=desc"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": 1,
      "project_code": "ESS-IETSI-2024-001",
      "title": "Efectividad de intervención educativa en diabetes",
      "status": "En ejecución",
      "principal_investigator": {"id": 1, "name": "Dra. Mariana Torres"},
      "coinvestigators": [...]
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20,
  "pages": 1
}
```

---

### 3. **Autores de una Publicación**

**GET** `/api/v1/publications/{publication_id}/authors`

Obtiene todos los investigadores autores de una publicación, con sus detalles completos.

**Parámetros:**
- `publication_id` (path): ID de la publicación
- `page` (query): Número de página (default: 1)
- `page_size` (query): Registros por página (default: 20)
- `sort_by` (query): full_name, h_index
- `sort_order` (query): asc o desc

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/publications/1/authors?sort_by=h_index&sort_order=desc"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": 1,
      "full_name": "Dra. Mariana Torres Salcedo",
      "specialty": "Cardiología",
      "h_index": 18,
      "citation_count": 245,
      "publications": [...]
    },
    {
      "id": 8,
      "full_name": "Lic. Elena Bustamante Leon",
      "specialty": "Epidemiología",
      "h_index": 12,
      "citation_count": 156
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20,
  "pages": 1
}
```

---

### 4. **Investigadores de un Proyecto**

**GET** `/api/v1/projects/{project_id}/researchers`

Obtiene todos los investigadores asociados a un proyecto (principal y coinvestigadores).

**Parámetros:**
- `project_id` (path): ID del proyecto
- `page` (query): Número de página
- `page_size` (query): Registros por página
- `sort_by` (query): full_name, h_index
- `sort_order` (query): asc o desc

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/projects/1/researchers"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": 1,
      "full_name": "Dra. Mariana Torres",
      "specialty": "Cardiología",
      "h_index": 18,
      "publications": [...]
    }
  ],
  "total": 4,
  "page": 1,
  "page_size": 20,
  "pages": 1
}
```

---

### 5. **Publicaciones de un Proyecto**

**GET** `/api/v1/projects/{project_id}/publications`

Obtiene todas las publicaciones generadas por un proyecto.

**Parámetros:**
- `project_id` (path): ID del proyecto
- `page` (query): Número de página
- `page_size` (query): Registros por página
- `sort_by` (query): year, citation_count
- `sort_order` (query): asc o desc

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/projects/1/publications?sort_by=year&sort_order=desc"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Factores de riesgo cardiovascular...",
      "year": 2024,
      "authors": [...],
      "citation_count": 12
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 20,
  "pages": 1
}
```

---

### 6. **Investigadores de una Unidad**

**GET** `/api/v1/units/{unit_id}/researchers`

Obtiene todos los investigadores que trabajan en una unidad de investigación.

**Parámetros:**
- `unit_id` (path): ID de la unidad
- `page` (query): Número de página
- `page_size` (query): Registros por página
- `sort_by` (query): full_name, h_index
- `sort_order` (query): asc o desc

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/units/1/researchers?sort_by=h_index&sort_order=desc"
```

---

### 7. **Publicaciones de una Unidad**

**GET** `/api/v1/units/{unit_id}/publications`

Obtiene todas las publicaciones asociadas a una unidad de investigación.

**Parámetros:**
- `unit_id` (path): ID de la unidad
- `page` (query): Número de página
- `page_size` (query): Registros por página
- `sort_by` (query): year, citation_count
- `sort_order` (query): asc o desc

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/units/1/publications"
```

---

## 🔍 Búsqueda Global con Relaciones

El endpoint de búsqueda global ahora incluye las relaciones al buscar:

**GET** `/api/v1/search?q=termino`

**Busca en:**
- Publicaciones: título, abstract, autores, palabras clave
- Investigadores: nombre, especialidad, publicaciones, proyectos
- Proyectos: título, investigadores
- Unidades: nombre, región

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/search?q=Cardiología&limit=20"
```

---

## 📋 Filtros de Relaciones

### Filtrar Publicaciones por Autor

**GET** `/api/v1/publications?author=Mariana%20Torres`

Retorna solo publicaciones donde el nombre del autor contiene "Mariana Torres".

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/publications?author=Torres&page=1&page_size=10"
```

---

## 🚀 Casos de Uso Comunes

### 1. Perfil Completo de un Investigador

```bash
# Obtener detalles del investigador
GET /api/v1/researchers/1

# Obtener sus publicaciones
GET /api/v1/researchers/1/publications

# Obtener sus proyectos
GET /api/v1/researchers/1/projects
```

### 2. Detalle de una Publicación con Todos los Autores

```bash
# Obtener detalles de publicación
GET /api/v1/publications/1

# Obtener información completa de autores
GET /api/v1/publications/1/authors?sort_by=h_index&sort_order=desc
```

### 3. Ver Equipo de un Proyecto

```bash
# Obtener detalles del proyecto
GET /api/v1/projects/1

# Obtener investigadores del proyecto
GET /api/v1/projects/1/researchers

# Obtener publicaciones del proyecto
GET /api/v1/projects/1/publications
```

### 4. Analizar Producción de una Unidad

```bash
# Obtener detalles de la unidad
GET /api/v1/units/1

# Obtener investigadores
GET /api/v1/units/1/researchers

# Obtener publicaciones
GET /api/v1/units/1/publications?sort_by=year&sort_order=desc
```

---

## 🎯 Estructura de Respuesta

Todos los endpoints de relaciones retornan un objeto `Page`:

```json
{
  "items": [
    { /* Entidad */ }
  ],
  "total": 100,        // Total de registros
  "page": 1,           // Página actual
  "page_size": 20,     // Registros por página
  "pages": 5           // Total de páginas
}
```

---

## ⚠️ Notas Importantes

1. **Paginación:** Todos los endpoints retornan resultados paginados. Use `page` y `page_size` para navegar.

2. **Ordenamiento:** El campo `sort_by` varía según el endpoint. Consulte la documentación específica.

3. **Buscar vs Filtrar:**
   - `search?q=...` busca en texto completo
   - `?author=...` filtra exactamente por ese criterio

4. **Performance:** Los endpoints de relaciones están optimizados pero con muchos registros pueden tardar. Use `page_size` apropiado.

5. **IDs requeridos:** Siempre proporcione los IDs correctos. El sistema retorna 404 si no existe la entidad.

---

## 📞 Troubleshooting

**P:** ¿Por qué no veo las publicaciones de un investigador?
**R:** Verifique que el `researcher_id` sea correcto y que el investigador realmente sea autor de publicaciones.

**P:** ¿Cómo obtengo el ID de un investigador?
**R:** Use `GET /api/v1/researchers?q=nombre` para buscar por nombre.

**P:** ¿Puedo combinar múltiples filtros?
**R:** Sí, puede combinar `q=...` con otros filtros como `&author=...&sort_by=year`
