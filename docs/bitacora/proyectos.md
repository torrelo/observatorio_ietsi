# Bitacora del modulo: Proyectos

## Estado actual

### Revisión QA 2026-11-14

Metadata y región de resultados nombrada; margen de foco adaptado al encabezado. Sin cambios de datos, modelo o ficha. Regresión de filtros/orden/páginas/URL/retorno con fuente real, teclado a altura móvil reducida y error/reintento conservando consulta/estado aprobados. Compilación correcta. Detalles, capturas y límites: `docs/REVISION_FINAL_QA.md`.

### Intervención 2026-11-14 - Patrón compartido de directorios

Rama `feat/directorios-ux`. Se mantienen los datos de OpenProject (31 proyectos, 185 participaciones, no personas únicas). Búsqueda principal, filtros aplicados, orden global en servidor y paginación con estado en URL. Cuatro indicadores sobre todas las coincidencias, antes de paginar. Tarjetas horizontales con título completo, investigador, fechas y descripción; se retiran del listado el avance inferido por estado y las etiquetas técnicas. Se conserva el pipeline de la ficha sin rediseñarla. Estadísticas, presupuesto planificado por moneda y revisión pasan a un bloque secundario; el presupuesto no se presenta como financiamiento captado.

Componentes, capturas y validaciones: `docs/DIRECTORIOS_UX.md`. Pendientes: autorización real para datos de gestión/equipo/presupuesto y etapas explícitas del proyecto. La ficha solo incorpora retorno seguro con estado.

### Intervencion 2026-11-13 - Base visual compartida

El listado actual usa la base real de OpenProject mediante el loader existente. Esta intervencion solo adapta ancho, titulo, filtros, KPIs y controles a la base visual comun, y permite mostrar completo el titulo de tarjeta. No cambia datos, pipeline ni fichas. Capturas: `base-visual-{antes,despues}-proyectos-{360,1440}.png`. Diagnostico y validacion: `docs/BASE_VISUAL_ETAPA_1.md`. Las entradas historicas siguientes describen fases anteriores, no la fuente actual del listado.

El modulo de proyectos quedo implementado como directorio institucional y ficha individual para seguimiento de proyectos de investigacion, innovacion y desarrollo cientifico en salud. La ruta oficial es `/proyectos` y la ficha individual se renderiza en `/proyectos/[id]`.

### Intervencion 2026-06-18 - Directorio institucional de proyectos

Se implemento el Directorio de Proyectos como plataforma institucional de seguimiento de proyectos de investigacion e innovacion en salud. El alcance incluye directorio, ficha individual, pipeline de investigacion, filtros, analitica breve, alertas mock y datos estructurados compatibles con integraciones CRIS futuras.

## Alcance funcional

- Ruta oficial `/proyectos`.
- Ruta de ficha individual `/proyectos/[id]`.
- KPIs institucionales.
- Buscador y filtros laterales.
- Tarjetas comparables con pipeline compacto.
- Ficha con resumen ejecutivo, informacion general, equipo, unidad, comite de etica, financiamiento, entregables, publicaciones derivadas y documentos.
- Panel analitico breve.
- Alertas automatizadas mock.

## Criterios de diseno

- Mantener consistencia visual con Produccion Cientifica e Investigadores.
- Usar tarjetas limpias, bordes suaves, azul institucional y fondos claros.
- Evitar exceso de badges.
- Priorizar comparabilidad entre proyectos y trazabilidad de estado.
- Mantener responsive: filtros laterales en escritorio y plegables en pantallas menores.

## Funcionalidades implementadas

- Ruta `/proyectos` con encabezado institucional, KPIs, buscador principal, filtros laterales y pestanas por tipo de proyecto.
- Tarjetas de proyecto con codigo institucional, estado, titulo, investigador principal, unidad, linea tematica, financiamiento, fechas, pipeline compacto, alertas mock y enlace de detalle.
- Panel analitico breve con proyectos por estado, tipo, linea tematica, red asistencial, financiamiento anual, tasa de publicacion y tiempo promedio de ejecucion.
- Ruta `/proyectos/[id]` con breadcrumb, enlace de retorno, encabezado del proyecto, resumen ejecutivo, informacion general, equipo investigador, unidad responsable, pipeline, comite de etica, financiamiento, productos esperados, resultados, publicaciones derivadas, documentos y enlaces.
- Datos mock estructurados para 30 proyectos de EsSalud.
- Enlaces hacia investigadores, Produccion Cientifica y Unidades.
- Estructura preparada para integraciones futuras con OpenProject, ORCID, RENACYT, Produccion Cientifica, Repositorio institucional, Comite de etica y sistemas internos EsSalud.

## Errores corregidos

- Correccion de formateo deterministico para evitar diferencias entre render del servidor y cliente.
- Identificacion del error `projects.map is not a function` cuando la respuesta del backend no tiene el formato esperado.
- Se evita depender de una respuesta backend variable durante el MVP del modulo mediante datos mock estructurados y funciones de filtrado deterministicas.

## Pendientes

- Conectar con endpoints backend reales cuando se cierre el contrato de datos de proyectos.
- Implementar integraciones reales con OpenProject, ORCID, RENACYT, Produccion Cientifica, Repositorio institucional, Comite de etica y sistemas internos EsSalud.
- Agregar pruebas automatizadas para busqueda, filtros, tarjetas, pipeline y ficha individual.
- Incorporar paginacion real si el volumen de proyectos crece.
- Fortalecer pruebas de contrato entre frontend y backend.

## Capturas asociadas

- `docs/screenshots/directorio-proyectos-v1.png`
- `docs/screenshots/proyecto-detalle-v1.png`

## Observaciones tecnicas

El modulo debe mantener trazabilidad de ciclo de vida del proyecto: formulacion, aprobacion etica, ejecucion, analisis y publicacion.
La implementacion actual no modifica backend ni otros modulos del observatorio. El dataset mock del frontend permite validar la experiencia de usuario y la arquitectura visual antes de conectar integraciones reales.
