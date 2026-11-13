# Bitacora del modulo: Unidades

## Estado actual

### Intervencion 2026-11-13 - Base visual compartida

El listado actual consume la base local curada de unidades/CIEI mediante el loader existente. Se adapta al contenedor comun y a tarjetas por espacio disponible; nombres completos y metadatos sin columnas internas demasiado estrechas. No se cambian relaciones, filtros ni indicadores. Capturas: `base-visual-{antes,despues}-unidades-{360,1440}.png`. Informe `docs/BASE_VISUAL_ETAPA_1.md` registra como pendientes los conteos transformados en graficos y la normalizacion del filtro Si/Sí; no se corrigen reglas de negocio en esta etapa. Las entradas historicas siguientes pertenecen a fases previas.

El modulo de unidades de investigacion existe como directorio inicial con rutas de listado y detalle. Esta preparado para representar unidades, redes asistenciales, regiones, infraestructura y productividad.

## Funcionalidades implementadas

- Ruta de listado de unidades.
- Ruta de detalle de unidad.
- Modelo backend `ResearchUnit`.
- Datos semilla de unidades.
- Endpoints de listado y detalle.
- Mapa institucional simulado disponible como componente reutilizable.

## Errores corregidos

- No se registran correcciones especificas recientes para este modulo.

## Pendientes

- Revisar experiencia UX/UI completa del directorio.
- Validar filtros por tipo de unidad, red asistencial, region, linea de investigacion y estado.
- Agregar capturas del modulo.
- Integrar mapa institucional con datos reales cuando esten disponibles.

## Capturas asociadas

- Pendiente: `docs/screenshots/unidades-v1.png`.

## Observaciones tecnicas

El modulo debe permitir comprender la capacidad institucional de investigacion por red, region y unidad asistencial.
