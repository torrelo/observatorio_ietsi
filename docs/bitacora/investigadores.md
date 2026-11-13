# Bitacora del modulo: Investigadores

## Estado actual

### Intervencion 2026-11-13 - Base visual compartida

Se adapta el listado al contenedor y encabezado comunes; las tarjetas se distribuyen segun espacio disponible y dejan de recortar nombre y filiacion mediante alturas fijas. Metricas redistribuibles al ampliar texto. No se alteran perfiles, Expertise, autores, ranking ni calculos. Capturas: `base-visual-{antes,despues}-investigadores-{360,1440}.png`. Evidencia y alcance: `docs/BASE_VISUAL_ETAPA_1.md`.

El modulo de investigadores funciona como directorio institucional con datos reales del pipeline bibliometrico y una capa curada de presentacion. El listado y el perfil individual usan `researcher_id` como clave, indicadores desde la base de investigadores, publicaciones vinculadas desde `researcher_publication_links.csv` y filiacion/foto/avatar desde los archivos curados.

### Intervencion 2026-09-16 - Correccion de Expertise y separacion por pipe

Se corrige la seccion Expertise del perfil individual para que no sea afectada por la capa curada de presentacion:

- Expertise usa exclusivamente campos bibliometricos procesados en `researchers_observatory.csv`.
- Las listas se separan solo por pipe `|`.
- Se preservan etiquetas oficiales con comas internas y conjunciones, por ejemplo `Salud Neonatal, del niño y Adolescente`.
- Se deja de generar `keywords` desde areas, subtemas o filiaciones cuando no existe campo explicito.
- Se repara el lector de `researchers_observatory.csv` cuando el archivo viene separado por coma y contiene listas no entrecomilladas con comas internas.

Validacion puntual:

- Perfil validado: `/investigadores/orcid%3A0000-0001-8758-0463`.
- Etiqueta completa preservada: `Salud Neonatal, del niño y Adolescente`.
- Fragmento incorrecto ausente como etiqueta independiente: `del niño y Adolescente`.
- Captura: `docs/screenshots/investigador-expertise-pipe-fix-v3.png`.

### Intervencion 2026-09-16 - Perfiles curados, filiacion normalizada y avatar institucional

Se integra la capa curada generada por el pipeline institucional para corregir la presentacion publica de perfiles de investigadores:

- `frontend/public/data/researcher_profiles_curated.csv`
- `frontend/public/data/researcher_affiliations_normalized.csv`
- `frontend/public/data/researcher_photo_manifest.csv`

Alcance:

- Usar `display_name` como nombre publico.
- Usar `primary_affiliation_normalized` como filiacion principal del encabezado.
- Mostrar `primary_institution`, `primary_unit`, `primary_network` y `country` como metadatos secundarios.
- Usar `photo_url` solo cuando exista y avatar por `avatar_initials` como fallback.
- Mostrar etiqueta discreta para perfiles `requires_manual_review`.
- Evitar que `affiliations` crudo aparezca como filiacion principal publica.
- Actualizar filtros institucionales por institucion, unidad, red, pais y estado de revision.
- Hacer tolerante la lectura CSV a separadores `;`, `,` y tabulador.

Resultado:

- `/investigadores` muestra 309 investigadores reales.
- `/investigadores/[id]` muestra encabezado curado sin recuadros vacios de fotografia.
- La ficha individual conserva indicadores bibliometricos y publicaciones vinculadas.
- `npm run validate:researchers` reporta 309 perfiles curados, 178 filiaciones normalizadas, 131 perfiles pendientes de revision y 309 avatares por iniciales.
- Se regeneraron capturas finales:
  - `docs/screenshots/directorio-investigadores-perfiles-curados-v2.png`
  - `docs/screenshots/investigador-perfil-curado-v2.png`

### Intervencion 2026-09-06 - Datos reales de investigadores institucionales

Se inicia el reemplazo de datos mock de investigadores por fuentes reales generadas desde la base institucional enriquecida:

- `frontend/public/data/researchers_observatory.csv`
- `frontend/public/data/researcher_publication_links.csv`
- `frontend/public/data/researcher_indicators_observatory.xlsx`
- `frontend/public/data/researcher_indicators_observatory.json`

Alcance:

- Reemplazar tarjetas, KPIs, ranking/listado, filtros y perfiles de investigadores.
- Usar `researcher_publication_links.csv` para produccion cientifica asociada a cada investigador.
- Mostrar indicadores bibliometricos reales del observatorio, sin interpretarlos como metricas globales.
- Construir una red simple de colaboracion institucional evitando autoria masiva.
- Mantener rutas y estilo visual existentes.

Resultado de la intervencion:

- `/investigadores` carga investigadores reales desde `researchers_observatory.csv`.
- `/investigadores/[id]` acepta `researcher_id` real codificado en URL, incluyendo identificadores `orcid:...` y `name:...`.
- La produccion cientifica del perfil usa `researcher_publication_links.csv`.
- Los KPIs principales, rankings y analitica breve usan `researcher_indicators_observatory.json` o calculos de fallback.
- Se conserva la arquitectura visual del modulo sin redisenar Home ni otros directorios.
- Se incorpora nota metodologica visible sobre identificacion de investigadores institucionales, h-index observatorio y autoria masiva.

### Intervencion 2026-06-16 - Directorio CRIS de investigadores

Se inicia la implementacion completa del Directorio de Investigadores como nucleo del ecosistema cientifico institucional, inspirado en ORCID, RENACYT, VIVO, Pure, Symplectic Elements y PeruCRIS. La intervencion no modifica Home, backend ni otros directorios.

Resultado de la intervencion:

- `/investigadores` queda como directorio CRIS principal de investigadores.
- `/investigadores/[id]` queda como perfil individual institucional.
- Se incorporan datos mock estructurados para seis investigadores.
- Se agregan interfaces preparadas para ORCID, RENACYT, OpenAlex, Scopus y Crossref.
- Se agregan enlaces cruzados a Produccion Cientifica, Proyectos y Unidades.

### Intervencion 2026-06-17 - Homogeneización completa de tarjetas del Directorio de Investigadores

Reglas de diseño implementadas:

- Orden obligatorio de contenido respetado: Avatar → Nombre completo → Especialidad → Centro de trabajo → ORCID/RENACYT → Líneas de investigación → Indicadores → Botón "Ver perfil".
- Nombre completo reservado para máximo 2 líneas con truncamiento en ellipsis.
- Especialidad reservada para 1 línea con truncamiento en ellipsis.
- Centro de trabajo reservado para 2 líneas con truncamiento y espacio fijo.
- ORCID y RENACYT siempre inician en el mismo punto vertical entre tarjetas.
- Líneas de investigación reservadas para 2 líneas completas; si hay excedente se muestra badge `+N`.
- Indicadores mantenidos en grid 3x2 sin cambio de estilo.
- Botón "Ver perfil" alineado al final de la tarjeta con layout flexbox.
- Espacios fijos para institución y líneas de investigación para evitar desalineación.

Manejo de overflow:

- Textos largos de nombre, especialidad e institución se truncaron con ellipsis visual.
- Líneas de investigación excedentes muestran solo las primeras dos líneas de datos con badge `+N`.
- No se permite aumentar la altura de la tarjeta por contenido adicional.

Alineación de tarjetas:

- Se garantizó la misma altura total entre tarjetas.
- Se garantizó el mismo inicio visual de ORCID y RENACYT.
- Se garantizó el mismo inicio visual de las líneas de investigación.
- Se garantizó el mismo inicio visual de los indicadores.
- El botón "Ver perfil" queda horizontalmente alineado en todas las tarjetas.

## Funcionalidades implementadas

- Ruta de listado de investigadores.
- Ruta de detalle de investigador.
- Modelo backend `Researcher`.
- Datos reales de investigadores institucionales.
- Perfiles curados de investigadores.
- Filiacion principal normalizada.
- Avatar por iniciales cuando no existe fotografia validada.
- Endpoints de listado y detalle.
- Directorio principal con KPIs, buscador, filtros y tarjetas.
- Perfil individual con identidad, expertise, indicadores, produccion cientifica, proyectos, red de colaboracion, unidades e investigadores relacionados.
- Visualizacion tipo grafo alimentada por coautores reales registrados en la base.
- Vinculos reales investigador-publicacion.
- Filtros por ORCID, area tematica, anio, cuartil, afiliacion y ordenamiento bibliometrico.
- Filtros por institucion, unidad, red, pais, estado de revision y tipo de estudio.
- Ranking breve y paneles agregados por cuartil y area tematica.
- Script `npm run validate:researchers`.

## Errores corregidos

- Se supera la experiencia inicial limitada del directorio.
- Se evita depender del backend para renderizar el MVP del directorio CRIS.
- Se reinicio Next.js para que reconociera correctamente la ruta dinamica `/investigadores/[id]`.
- Se reemplazaron investigadores ficticios por investigadores reales derivados de la base institucional.
- Se normalizaron valores faltantes para no mostrar `null`, `undefined`, `NaN` ni cadenas vacias.
- Se habilitaron IDs reales de investigador en rutas dinamicas.
- Se corrigio la visualizacion de perfiles sin fotografia mediante avatar por iniciales.
- Se elimino el uso de filiaciones crudas concatenadas como encabezado publico.
- Se corrigio la lectura de CSV con separador coma en `researchers_observatory.csv`.

## Componentes reutilizados

- `Badge`
- `SectionHeader`
- `DataTable`

## Componentes creados

- `ResearcherProfileCard`
- `CollaborationGraph`

### Intervencion 2026-06-16 - Homogeneizacion de tarjetas CRIS

Se implementa la homogeneización visual de las tarjetas del Directorio de Investigadores para garantizar consistencia en altura, orden visual y distribución de contenido.

**Orden visual implementado:**
1. Foto + nombre y apellidos
2. Especialidad
3. Centro de trabajo (altura fija 2 líneas)
4. ORCID y RENACYT (badges)
5. Líneas de investigación (2 primeras líneas + badge "+N" si hay más)
6. Indicadores científicos (6 métricas en grid 3x2)
7. Botón "Ver perfil" (alineado al final)

**Reglas visuales aplicadas:**
- Contenedor tarjeta: `flex h-full flex-col` (permite crecimiento vertical)
- Centro de trabajo: `h-10 overflow-hidden line-clamp-2` (altura fija)
- Líneas investigación: `min-h-10 flex flex-wrap` con badge "+N" dinámico
- Indicadores: Grid consistente 3x2
- Botón: Empujado al final con spacer `flex-1`

**Cambios en componentes:**
- `ResearcherProfileCard.tsx`: Refactorizada con flexbox, lógica de overflow badge
- `investigadores/page.tsx`: Envolvimiento de tarjetas en `<div className="h-full">`

## Archivos principales

- `frontend/app/investigadores/page.tsx`
- `frontend/app/investigadores/[id]/page.tsx`
- `frontend/lib/researchers.ts`
- `frontend/components/ResearcherProfileCard.tsx`
- `frontend/components/CollaborationGraph.tsx`
- `frontend/scripts/validate-researcher-data.mjs`
- `frontend/public/data/researcher_indicators_observatory.json`
- `frontend/public/data/researcher_profiles_curated.csv`
- `frontend/public/data/researcher_affiliations_normalized.csv`
- `frontend/public/data/researcher_photo_manifest.csv`
- `backend/app/services/real_researchers.py`

## Pendientes

- Conectar ORCID API.
- Conectar RENACYT y CTI Vitae.
- Enriquecer autoria y metricas con OpenAlex, Scopus y Crossref.
- Persistir investigadores y vinculos en PostgreSQL.
- Normalizar duplicados por variantes de nombre/ORCID en el pipeline maestro.
- Reemplazar grafo visual por visualizacion interactiva basada en red real de coautoria si se aprueba una dependencia especializada.
- Agregar pruebas automatizadas de filtros, tarjetas y perfil.

## Capturas asociadas

- `docs/screenshots/directorio-investigadores-v1.png`
- `docs/screenshots/investigador-perfil-v1.png`
- `docs/screenshots/directorio-investigadores-datos-reales-v1.png`
- `docs/screenshots/investigador-perfil-datos-reales-v1.png`
- `docs/screenshots/directorio-investigadores-perfiles-curados-v2.png`
- `docs/screenshots/investigador-perfil-curado-v2.png`

## Observaciones tecnicas

El modulo debe servir como buscador de expertos institucionales y punto de integracion con identificadores academicos externos.

Validaciones ejecutadas:

- `npm run typecheck`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001 npm run build`
- `npm run build`
- `npm run lint`
- `python3 -m compileall app`
- `npm run dev`
- `/investigadores` responde 200.
- `/investigadores/1` responde 200.
- `/investigadores/orcid%3A0000-0003-4593-2509` responde 200.
- `npm run validate:researchers`: 564 investigadores, 3512 vinculos, 2369 publicaciones unicas, rango 1984-2026.
- `npm run validate:researchers`: 309 investigadores, 309 perfiles curados, 309 filiaciones normalizadas, 3505 vinculos, 2369 publicaciones unicas, rango 1984-2026.
- Filtros y busqueda por query string verificados.
