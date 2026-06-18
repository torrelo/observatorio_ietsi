# ✅ Solución: Relaciones entre Investigadores y Producción Científica

## Problema Identificado

El usuario reportaba que **no había relaciones visibles entre investigadores y producción científica** en el observatorio. El análisis reveló que:

1. ✓ Las relaciones **sí existían en los datos** (seed_data.py)
2. ✓ Los **schemas Pydantic estaban correctos**
3. ✗ Los **endpoints de búsqueda/filtrado no incluían las relaciones**
4. ✗ No había **endpoints específicos para consultar relaciones**
5. ✗ La **búsqueda global no cruzaba relaciones**

---

## 🔧 Correcciones Implementadas

### 1. **Mejora del Sistema de Filtrado**

**Archivo:** `backend/app/services/seed_data.py`

#### Problema:
La función `_matches_filter()` no validaba correctamente si el campo "authors" existía antes de filtrar.

#### Solución:
```python
def _matches_filter(item: dict[str, Any], key: str, value: Any) -> bool:
    needle = str(value).lower()
    if key == "author":
        # Ahora valida que el campo "authors" existe antes de filtrar
        if "authors" in item:
            return any(needle in author["name"].lower() for author in item.get("authors", []))
        return False
    # ... resto del código
```

---

### 2. **Búsqueda Global con Relaciones**

**Archivo:** `backend/app/services/seed_data.py`

#### Antes:
```python
# Solo buscaba en campos directos
for item in PUBLICATIONS:
    if needle in _search_blob(item, ["title", "abstract", "keywords"]):
        # ...
```

#### Después:
```python
# Ahora busca incluyendo relaciones
for item in PUBLICATIONS:
    search_fields = ["title", "abstract", "keywords", "authors"]
    if needle in _search_blob(item, search_fields):
        # ...

for item in RESEARCHERS:
    search_fields = ["full_name", "specialty", "publications", "projects"]
    if needle in _search_blob(item, search_fields):
        # ...
```

---

### 3. **Nuevos Endpoints de Relaciones**

**Archivo:** `backend/app/api/routes.py`

Se agregaron **8 nuevos endpoints** para acceder a las relaciones:

#### **Investigadores → Publicaciones**
```
GET /api/v1/researchers/{id}/publications
```
Retorna todas las publicaciones donde el investigador es autor.

#### **Investigadores → Proyectos**
```
GET /api/v1/researchers/{id}/projects
```
Retorna todos los proyectos en los que participa.

#### **Publicaciones → Autores**
```
GET /api/v1/publications/{id}/authors
```
Retorna investigadores completos que escribieron la publicación.

#### **Proyectos → Investigadores**
```
GET /api/v1/projects/{id}/researchers
```
Retorna investigador principal y coinvestigadores.

#### **Proyectos → Publicaciones**
```
GET /api/v1/projects/{id}/publications
```
Retorna publicaciones generadas por el proyecto.

#### **Unidades → Investigadores**
```
GET /api/v1/units/{id}/researchers
```
Retorna investigadores de la unidad.

#### **Unidades → Publicaciones**
```
GET /api/v1/units/{id}/publications
```
Retorna publicaciones de la unidad.

---

### 4. **Corrección de Relaciones Bidireccionales**

**Archivo:** `backend/app/services/seed_data.py`

#### Problema:
Las relaciones investigador ↔ unidad no se establecían bidireccionales.

#### Solución:
```python
# Establecer relaciones bidireccionales entre investigadores y unidades
for researcher in RESEARCHERS:
    researcher_ref = _simple_ref(researcher, "full_name")
    for unit_ref in researcher.get("research_units", []):
        unit = get_item(UNITS, unit_ref["id"])
        if unit is not None:
            if not any(r["id"] == researcher["id"] for r in unit.get("researchers", [])):
                unit["researchers"].append(researcher_ref)
```

---

## 📊 Validación de Resultados

Se ejecutó `backend/scripts/test_relations.py` con los siguientes resultados:

```
✅ PRUEBA 1: Publicaciones de un Investigador
   Investigador "Dra. Mariana Torres" tiene 6 publicaciones ✓

✅ PRUEBA 2: Autores de una Publicación
   Publicación tiene 3 autores con detalles completos ✓

✅ PRUEBA 3: Investigadores de un Proyecto
   Proyecto tiene investigador principal + coinvestigadores ✓

✅ PRUEBA 4: Publicaciones de un Proyecto
   Proyecto tiene 4 publicaciones asociadas ✓

✅ PRUEBA 5: Investigadores de una Unidad
   Unidad tiene 4 investigadores ✓

✅ PRUEBA 6: Publicaciones de una Unidad
   Unidad tiene 7 publicaciones ✓

✅ PRUEBA 7: Validación de Esquemas Pydantic
   Todos los esquemas validan correctamente ✓

📊 RESUMEN:
   - Relaciones Publicación-Autor: 300
   - Relaciones Investigador-Publicación: 300
   - Relaciones Proyecto-Investigador: 60
   - Relaciones Unidad-Investigador: 50
```

---

## 🚀 Cómo Usar las Relaciones

### Ejemplo 1: Ver todas las publicaciones de un investigador

```bash
curl "http://localhost:8000/api/v1/researchers/1/publications?sort_by=year&sort_order=desc"
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
  "page_size": 20,
  "pages": 1
}
```

### Ejemplo 2: Ver todos los autores de una publicación

```bash
curl "http://localhost:8000/api/v1/publications/1/authors?sort_by=h_index&sort_order=desc"
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
      "citation_count": 245
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20,
  "pages": 1
}
```

### Ejemplo 3: Buscar publicaciones incluyendo autores

```bash
curl "http://localhost:8000/api/v1/search?q=Torres&limit=10"
```

Ahora busca no solo por nombre de publicación, sino también por nombre de autores.

---

## 📚 Documentación

Se creó documentación completa en:
```
docs/RELACIONES_API.md
```

Contiene:
- ✓ Descripción de todas las relaciones
- ✓ Documentación de 7 nuevos endpoints
- ✓ Ejemplos de uso
- ✓ Casos de uso comunes
- ✓ Guía de troubleshooting

---

## 🧪 Pruebas

Se creó un script de prueba en:
```
backend/scripts/test_relations.py
```

Ejecutar con:
```bash
cd backend && python3 scripts/test_relations.py
```

---

## 📋 Cambios de Archivos

| Archivo | Cambios |
|---------|---------|
| `backend/app/services/seed_data.py` | ✓ Mejorado filtrado de autores<br/>✓ Búsqueda global con relaciones<br/>✓ Relaciones bidireccionales unidad-investigador |
| `backend/app/api/routes.py` | ✓ 8 nuevos endpoints de relaciones |
| `docs/RELACIONES_API.md` | ✓ Documentación completa (nuevo) |
| `backend/scripts/test_relations.py` | ✓ Script de pruebas (nuevo) |

---

## 🎯 Resultado Final

**Ahora los usuarios pueden:**

1. ✅ Ver todas las publicaciones de un investigador
2. ✅ Ver todos los autores de una publicación con detalles
3. ✅ Ver investigadores de un proyecto
4. ✅ Ver publicaciones de un proyecto
5. ✅ Ver investigadores de una unidad
6. ✅ Ver publicaciones de una unidad
7. ✅ Filtrar publicaciones por autor
8. ✅ Buscar globalmente incluyendo relaciones

**Las relaciones están completamente funcionales y documentadas.**

---

## 🔍 Verificación Rápida

Para verificar que todo funciona, ejecuta:

```bash
# 1. Iniciar el servidor backend
docker-compose up backend

# 2. En otra terminal, hacer una consulta
curl "http://localhost:8000/api/v1/researchers/1/publications"

# 3. O ejecutar el script de pruebas
python3 backend/scripts/test_relations.py
```

---

## 📞 Próximos Pasos (Opcional)

Para mejorar aún más el sistema, considera:

1. **Frontend:** Actualizar componentes para mostrar autores en tarjetas de publicaciones
2. **Frontend:** Mostrar publicaciones en perfil de investigadores
3. **API:** Agregar filtros avanzados (por rango de h-index, especialidad, etc.)
4. **BD:** Migrar seed_data.py a PostgreSQL para persistencia
5. **Cache:** Implementar caché para búsquedas complejas

