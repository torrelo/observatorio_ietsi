# Bitacora del modulo: Unidades

## Estado actual

### Revisión QA 2026-11-14

Metadata, región de resultados nombrada y margen de foco compatible con sticky. Fuente, indicadores y relaciones CIEI intactos. Búsqueda/filtros/orden/páginas/URL/retorno contrastados; teclado a 360×480 y error/reintento con consulta/Sí de CIEI conservados aprobados. No se rediseña el catálogo CIEI ni se reinterpretan estados de registro/acreditación. Evidencia y limitaciones: `docs/REVISION_FINAL_QA.md`.

### Intervención 2026-11-14 - Patrón compartido de directorios

Rama `feat/directorios-ux`. Se mantienen 30 unidades y el catálogo existente de 18 CIEI como entidades distintas. Búsqueda principal, filtros y etiquetas removibles, orden y paginación en servidor con URL compartible. Cuatro KPIs de unidades filtradas, estadísticas secundarias y nombres completos en tarjetas de una o dos columnas. La acreditación se atribuye al comité vinculado, nunca a la unidad. No se publican responsables ni observaciones técnicas en las tarjetas principales; se conservan fuentes y fichas.

Correcciones demostrables: «Sí» se reconoce en filtros booleanos de unidad/CIEI; los conteos de unidades se imprimen sin `n*12` ni límites artificiales, escalando solo las barras. Fuente: tipos 16/10/4; redes Rebagliati 9, Almenara 9, Cusco 4 y restantes según base. Los filtros no cambian esas cifras para forzar coincidencias.

Pendientes: el contador histórico `readyUnits` busca «lista» y devuelve 0, mientras la fuente contiene 29 «Listo mínimo»; `registeredCiei` cuenta presencia de estado, no registro positivo; `unitsWithPendingCriticalFields` incluye acciones recomendadas. Se explicitan las definiciones sin reformularlas. La página CIEI mantiene su diseño y limitaciones anteriores. Evidencia, capturas y validación: `docs/DIRECTORIOS_UX.md`.

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
