# Bitacora del modulo: Investigadores

## Estado actual

El modulo de investigadores existe como directorio inicial con rutas de listado y detalle. Esta preparado para mostrar perfiles institucionales, produccion cientifica, filiacion, especialidades y metricas academicas.

### Intervencion 2026-06-16 - Directorio CRIS de investigadores

Se inicia la implementacion completa del Directorio de Investigadores como nucleo del ecosistema cientifico institucional, inspirado en ORCID, RENACYT, VIVO, Pure, Symplectic Elements y PeruCRIS. La intervencion no modifica Home, backend ni otros directorios.

Resultado de la intervencion:

- `/investigadores` queda como directorio CRIS principal de investigadores.
- `/investigadores/[id]` queda como perfil individual institucional.
- Se incorporan datos mock estructurados para seis investigadores.
- Se agregan interfaces preparadas para ORCID, RENACYT, OpenAlex, Scopus y Crossref.
- Se agregan enlaces cruzados a Produccion Cientifica, Proyectos y Unidades.

## Funcionalidades implementadas

- Ruta de listado de investigadores.
- Ruta de detalle de investigador.
- Modelo backend `Researcher`.
- Datos semilla de investigadores.
- Endpoints de listado y detalle.
- Directorio principal con KPIs, buscador, filtros y tarjetas.
- Perfil individual con identidad, expertise, indicadores, produccion cientifica, proyectos, red de colaboracion, unidades e investigadores relacionados.
- Visualizacion mock tipo grafo para colaboracion cientifica.
- Datos mock CRIS estructurados en frontend para el MVP.

## Errores corregidos

- Se supera la experiencia inicial limitada del directorio.
- Se evita depender del backend para renderizar el MVP del directorio CRIS.
- Se reinicio Next.js para que reconociera correctamente la ruta dinamica `/investigadores/[id]`.

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

## Pendientes

- Conectar ORCID API.
- Conectar RENACYT y CTI Vitae.
- Enriquecer autoria y metricas con OpenAlex, Scopus y Crossref.
- Reemplazar grafo mock por datos reales de colaboracion.
- Implementar paginacion y ordenamiento avanzado cuando aumente el volumen.
- Agregar pruebas automatizadas de filtros, tarjetas y perfil.

## Capturas asociadas

- `docs/screenshots/directorio-investigadores-v1.png`
- `docs/screenshots/investigador-perfil-v1.png`

## Observaciones tecnicas

El modulo debe servir como buscador de expertos institucionales y punto de integracion con identificadores academicos externos.

Validaciones ejecutadas:

- `npm run typecheck`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001 npm run build`
- `npm run dev`
- `/investigadores` responde 200.
- `/investigadores/1` responde 200.
- Filtros y busqueda por query string verificados.
