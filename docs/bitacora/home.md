# Bitacora del modulo: Home

## Estado actual

### Revisión QA 2026-11-14

Se corrige el formulario sin destino ni nombre de campo: transmite q por GET al ámbito elegido entre los cuatro directorios, con etiqueta y validación de vacío/espacios. No se promete búsqueda global simultánea. Se conservan datos reales y estructura de portada. Cada fuente puede fallar de forma independiente sin convertirse en cero ni inutilizar los otros accesos; aviso y reintento por teclado verificados con cuatro fallos de lectura aislados. Errores ajenos a datos se propagan, no se oculta Webpack.

Destinos `#` no configurados se presentan como Próximamente/referencias pendientes sin fingir enlaces. Se corrige la sintaxis del overlay 0.78 (antes no generaba CSS), el salto bajo sticky y el acceso simulado informativo. Contraste mínimo 6,85:1 en muestras de texto del Hero, sin afirmar conformidad integral. Fotografías de fondo decorativas con alt vacío. Fuentes y métricas no cambiadas. Evidencia, capturas y pendientes editoriales: `docs/REVISION_FINAL_QA.md`.

### Intervencion 2026-11-13 - Base visual compartida

Inicio comparte contenedor de 1440 px, fuente base de 16 px y encabezado con navegacion activa/movil. Se conservan imagen, datos, orden, rutas y busqueda existente. Informe transversal: `docs/BASE_VISUAL_ETAPA_1.md`; medidas y capturas comparables antes/despues en docs. No se incorporan dashboards ni se redisenan secciones.

### Intervencion 2026-11-13 - Fuentes compartidas con directorios

- Las tarjetas y KPIs consumen `frontend/lib/home.ts`, que reutiliza `getPublicationsSummary`, `getResearcherSummary`, `getProjectStats` y `getResearchUnitStats`.
- No se usa el resumen legacy de FastAPI ni cantidades constantes en accesos.
- Produccion cientifica muestra el total de publicaciones, no lo etiqueta como indexadas. Proyectos diferencia total registrado en el acceso y activos en el KPI.
- Los otros dos KPIs muestran citas y publicaciones de acceso abierto reales; ensayos y financiamiento quedan pendientes de fuente validada.
- Se conservan Hero, navegacion, estructura, estilos y noticias. Inicio se renderiza dinamicamente; los caches internos de los loaders mantienen su ciclo de reinicio habitual al actualizar datos.
- Validado: lint, build, equivalencia de las cuatro cantidades con listados sin filtros y GET `/` 200 en desarrollo. Totales actuales: 2,701 publicaciones, 308 investigadores, 31 proyectos y 30 unidades; 31,556 citas y 1,709 publicaciones de acceso abierto. Captura pendiente de generacion manual.

El Home institucional funciona como puerta de entrada al observatorio. Presenta branding EsSalud, IETSI y Observatorio, Hero con imagen institucional de fondo, overlay azul, titulo principal, subtitulo y buscador global como accion central.

### Intervencion 2026-09-04 - Fallback ante backend no disponible

Se identifica que la ruta `/` puede responder `500 Internal Server Error` cuando el frontend intenta consumir `GET /api/home/summary` desde FastAPI y el backend no esta activo en `localhost:8000`.

Alcance previsto:

- Mantener intacto el Home visual.
- Corregir la capa API del frontend para devolver un resumen institucional local cuando el backend no responda.
- Usar los indicadores reales de publicaciones ya incorporados cuando esten disponibles.
- Evitar que el Server Component del Home lance excepciones por `ECONNREFUSED`.

Resultado de la intervencion:

- `frontend/lib/api.ts` ahora captura fallos de `GET /api/home/summary`.
- Si FastAPI no esta activo, `api.home()` devuelve un resumen local compatible con el Home.
- El KPI de publicaciones indexadas se obtiene desde la capa real de publicaciones CSV/XLSX.
- Las metricas sin fuente activa se muestran como `No disponible` para no inventar datos.
- La ruta `/` fue validada en desarrollo y dejo de responder 500 en una instancia limpia.

### Intervencion 2026-09-04 - Componentes de error del App Router

Se reporta el mensaje `missing required error components, refreshing...` al visitar rutas existentes del observatorio. Se agregan componentes institucionales requeridos para estabilizar la experiencia de error del App Router:

- `frontend/app/error.tsx`
- `frontend/app/global-error.tsx`
- `frontend/app/not-found.tsx`

La intervencion no modifica el diseno del Home ni la arquitectura funcional de los modulos. Solo agrega boundaries para estados de error y rutas no encontradas. Se valida que `/produccion-cientifica` e `/investigadores` responden 200 en una instancia limpia de desarrollo.

### Intervencion 2026-09-04 - Arranque production standalone

Se reproduce `500 Internal Server Error` en todas las rutas al ejecutar el frontend con `npm run start`. La causa identificada es la combinacion de `output: "standalone"` en `next.config.ts` con el comando `next start`, que Next advierte como no compatible.

Resultado de la intervencion:

- `npm run start` ahora ejecuta `node .next/standalone/server.js`.
- `npm run build` ejecuta una preparacion posterior para copiar `.next/static` y `public` dentro del artefacto standalone.
- La correccion no modifica rutas, componentes ni diseno visual.

## Funcionalidades implementadas

- Header institucional con logos, menu principal e inicio de sesion simulado.
- Hero simplificado con buscador principal.
- Directorios principales como accesos de navegacion.
- Modulos complementarios.
- Indicadores clave compactos.
- Noticias y convocatorias.
- Footer reducido.

## Errores corregidos

- Reduccion de redundancia entre buscador de Header y buscador del Hero.
- Ajuste visual del Hero para mejorar contraste y legibilidad.
- Correcciones de hydration relacionadas con HTML invalido y formateo dependiente del entorno.
- Fallback para evitar `Internal Server Error` cuando el backend no esta activo.
- Componentes de error y ruta no encontrada para evitar estados incompletos del App Router.
- Correccion del script de arranque production local con Next standalone.

## Pendientes

- Generar captura `docs/screenshots/home-estado-actual.png`.
- Conectar ensayos clinicos y financiamiento cuando exista una fuente validada; publicaciones, investigadores, proyectos y unidades ya comparten fuentes con los directorios.
- Mantener la pagina como resumen ejecutivo, evitando incorporar dashboards complejos.

## Capturas asociadas

- `docs/screenshots/home-buscador-unico.png`
- `docs/screenshots/home-hero-background.png`
- `docs/screenshots/home-fallback-backend-v1.png`
- `docs/screenshots/produccion-cientifica-error-components-fix.png`
- `docs/screenshots/investigadores-error-components-fix.png`

## Observaciones tecnicas

El Home no debe convertirse en dashboard completo. La busqueda global vive en el Hero y la analitica avanzada debe ubicarse en modulos especializados.
