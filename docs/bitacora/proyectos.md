# Bitacora del modulo: Proyectos

## Estado actual

El modulo de proyectos existe como directorio inicial con rutas de listado y detalle. Esta orientado a gestionar proyectos de investigacion, estados, lineas tematicas, financiamiento y resultados.

## Funcionalidades implementadas

- Ruta de listado de proyectos.
- Ruta de detalle de proyecto.
- Modelo backend `Project`.
- Datos semilla de proyectos.
- Endpoints de listado y detalle.
- Pipeline visual inicial para estados del proyecto.

## Errores corregidos

- Correccion de formateo deterministico para evitar diferencias entre render del servidor y cliente.
- Identificacion del error `projects.map is not a function` cuando la respuesta del backend no tiene el formato esperado.

## Pendientes

- Implementar fallback con datos mock cuando el backend no responda o devuelva formato inesperado.
- Validar filtros por estado, tipo, linea tematica, unidad, financiamiento y anio.
- Agregar capturas del modulo.
- Fortalecer pruebas de contrato entre frontend y backend.

## Capturas asociadas

- Pendiente: `docs/screenshots/proyectos-v1.png`.

## Observaciones tecnicas

El modulo debe mantener trazabilidad de ciclo de vida del proyecto: formulacion, aprobacion etica, ejecucion, analisis y publicacion.
