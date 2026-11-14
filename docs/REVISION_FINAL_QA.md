# Revisión Final de Calidad

Fecha: 2026-11-14. Rama `feat/directorios-ux`. Revisión funcional, responsive y de accesibilidad de cinco rutas, conservando cambios anteriores. Sin commit/push/PR/despliegue, nuevas dependencias ni modificaciones de backend/API o archivos de datos.

## Entorno y Alcance

- Next.js 15.1.3; React/React DOM 19.0.0; TypeScript 5.9.3; Tailwind 3.4.19; npm y lockfile existentes.
- Sin AGENTS.md dentro del repositorio. Estado sucio inicial inspeccionado y trabajo previo conservado.
- Frontend: `cd frontend && npm run dev`; desarrollo `.next-dev`, producción `.next`. Se detuvo el grupo del servidor del proyecto antes de compilar.
- Backend activo: `http://127.0.0.1:8000/health` devuelve `status:ok`, `service:observatorio-api`. Ejecución documentada: `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`; PostgreSQL mediante Compose. No se realizan operaciones de escritura ni pruebas exhaustivas de API; las cinco vistas usan loaders locales.
- Chrome headless/CDP 9225, caché desactivada, DPR 1. Sin Playwright ni lector de pantalla. Se usa axe-core ya instalado transitivamente (sin instalar paquetes), inspección DOM/AX, entradas reales de teclado y pruebas Node con fuentes reales.

## Línea Base y Correcciones

Todos estos fallos estaban presentes al iniciar esta revisión. No se atribuyen al último rediseño ni a una etapa específica sin evidencia histórica adicional.

| Hallazgo | Evidencia y causa confirmada | Corrección mínima | Resultado |
|---|---|---|---|
| Portada pierde la consulta | Formulario sin action, input sin name; Enter con «renal» recarga `/` sin q | HomeSearch GET con q, ámbito explícito en cuatro rutas existentes, etiqueta visible y validación de vacío/espacios | Aprobado; teclado en campo y botón, cuatro destinos |
| Salto oculto bajo sticky | Tras Enter, H1 y=64 con encabezado hasta y=161 | Offset de desplazamiento medido con ResizeObserver según posición/altura real; márgenes de resultados compatibles | Aprobado; H1 y=225, salto/foco visible en las cinco rutas |
| Login inerte | Botón sin manejador ni destino | Diálogo nativo informativo de acceso simulado, sin pedir credenciales | Aprobado; Enter/Espacio/Escape/Cerrar, AX modal, fondo inerte, retorno del foco y scroll |
| Destinos ficticios | Dos módulos y ocho enlaces de pie con href="#" | Se conservan etiquetas/contenido como Próximamente o referencias pendientes, sin fingir acciones | Aprobado; sin enlaces #; destinos reales preservados |
| Documento no identifica sección | Cinco rutas heredan el mismo document.title | Metadata específica de los cuatro listados y plantilla institucional | Aprobado; cinco títulos distintos, idioma es |
| Fallo de una fuente derriba portada | Resumen secuencial e import eager de investigadores; lectura fallida impide usar otros accesos | Fuentes independientes, ausentes como No disponible y aviso/reintento; errores inesperados se propagan | Aprobado; recuperación con cada una de las cuatro fuentes ausentes |
| Agregado opcional derriba investigadores | EIO inducido solo al JSON de indicadores impide cargar módulo | Reutilización de fallbacks CSV/vínculos ya definidos, con aviso visible | Aprobado; diez registros reales visibles con agregado ausente |
| Lectura durante import evita la pantalla de error | Proceso nuevo, CSV de investigadores ausente; export const ejecuta I/O al cargar módulo | Se retira únicamente la constante exportada sin consumidores; getters y fórmulas conservados, I/O diferido a consulta | Aprobado; error y reintento con contexto desde proceso nuevo |
| Área de resultados no tiene nombre fiable | axe deja aria-label sobre div genérico como indeterminado | role=region en el contenedor ya enfocable | Aprobado; semántica y nombre comprobados en seis vistas |
| Overlay no aplicado | bg-brand-dark/78 no tiene regla generada; backgroundColor transparente | Sintaxis válida de opacidad arbitraria 0.78 | Aprobado; muestra de contraste mínimo 6,85:1 |
| Movimiento sin adaptación específica | Transiciones/transformaciones de tarjetas sin regla reducida | prefers-reduced-motion en base compartida | Aprobado; emulación de preferencia y duraciones computadas |

El fallback de portada admite únicamente errores de archivo/parseo de datos. La prueba con TypeError de módulo comprueba que no se ocultan fallos de Webpack/renderizado; no se desactiva SSR. El fallback de investigadores conserva las fórmulas existentes y el ciclo de caché del loader: restaurar un agregado requiere reiniciar su proceso para reconstruir el snapshot.

## Matriz por Ruta

| Ruta | Adaptación | Teclado | Estados | Flujos | Evidencia |
|---|---|---|---|---|---|
| `/` | Aprobado, cinco anchos y texto 200% | Aprobado, salto/menú/modal y búsqueda en cuatro ámbitos | Vacío y fuentes parciales/reintento aprobados | Enter/botón, consulta recibida y navegación principal aprobados | qa-final-a11y, qa-final-keyboard, qa-final-faults |
| `/produccion-cientifica` | Aprobado | Aprobado, también 360×480 | Carga/vacío/error/reintento/agregado ausente aprobados | Once vistas filtradas comparadas con datos, orden/páginas/URL/retorno y última consulta aprobados | qa-final-publications, qa-final-states, qa-final-faults |
| `/investigadores` | Aprobado | Aprobado, también 360×480 | Carga/vacío/error/reintento/agregado ausente aprobados | Búsqueda/filtros/chips/orden/páginas/URL/retorno aprobados | qa-final-directories, qa-final-keyboard, qa-final-faults |
| `/proyectos` | Aprobado | Aprobado, también 360×480 | Carga/vacío/error/reintento aprobados | Búsqueda/filtros/chips/orden/páginas/URL/retorno aprobados | qa-final-directories, qa-final-keyboard, qa-final-faults |
| `/unidades` | Aprobado | Aprobado, también 360×480 | Carga/vacío/error/reintento aprobados | Búsqueda/filtros/chips/orden/páginas/URL/retorno aprobados | qa-final-directories, qa-final-keyboard, qa-final-faults |

Los nombres de evidencia corresponden a JSON dentro de docs/. Los indicadores de publicaciones/investigadores son globales; proyectos/unidades conservan indicadores de todas las coincidencias antes de paginar. No se mezclan con los registros de la página actual.

## Pruebas Ejecutadas

- Línea base: diez vistas a 360/1280 y diez análisis axe sin infracciones detectadas. Eso no detectó las funcionalidades inertes; reproducción de búsqueda/salto guardada en `qa-baseline-functional.json`.
- Final responsive: 50 combinaciones de cinco rutas × 320/360/768/1280/1440 CSS × tamaño raíz 100%/200%, sin overflow general ni defectos DOM comprobados. Diez análisis axe WCAG 2/2.1/2.2 A/AA sin infracciones detectadas; comprobaciones incompletas conservadas en JSON, no consideradas aprobadas manualmente.
- No se confunden píxeles de captura con CSS. El 200% probado es ampliación de texto mediante fuente raíz, no zoom nativo de navegador ni pinch-zoom. 320 CSS se emula por viewport; no certifica todas las configuraciones de dispositivo.
- Diez recorridos de teclado (cinco rutas × 360×480/1280×900), Tab/Shift+Tab, foco visible y no ocluido, salto, menú/ayudas, estado activo, diálogo nativo por AX, contenido de fondo inerte y restauración de foco/scroll. Filtros móviles aplicados con selección por teclado. No hay valores positivos de tabindex ni controles anidados detectados; controles ocultos fuera de la secuencia revisada.
- Portada: cuatro envíos por teclado, alternando Enter en campo o botón, consulta recibida en destino; vacío y espacios bloqueados. Cuatro consultas largas con caracteres españoles a 320 CSS conservadas sin overflow. Cinco destinos del Header activados con Enter.
- Publicaciones: once vistas contra el loader, ayuda por teclado y toque en cinco anchos, filtros combinados, chips, limpieza, orden global, paginación, recarga/atrás/adelante, retorno y últimas consultas bajo latencia. Globales invariables. Cero errores de consola.
- Otros directorios: 30 combinaciones responsive, 45 vistas contra loaders y tres flujos completos equivalentes, incluidas páginas fuera de rango y última consulta bajo latencia. Cero errores de consola.
- Carga/vacío: cuatro pruebas bajo latencia 1600 ms con aria-busy, anuncio de actualización, submit realmente deshabilitado, ausencia de coincidencias diferenciada y consulta conservada. El estado inicial loading.tsx se inspecciona en código; su aparición exacta en cada respuesta inicial no se afirma a partir de estas transiciones.
- Datos: cinco pruebas nuevas de fuentes parciales, agregado ausente, propagación de errores inesperados, import sin I/O y recuperación; siete pruebas de consulta de publicaciones y siete de directorios correctas. Primera ejecución con subproceso bloqueada por sandbox (EPERM), repetida con permiso local; no se atribuye ese bloqueo al portal.
- Lint, TypeScript y compilación correctos; dos builds secuenciales, el último tras corregir la lectura eager demostrada por el proceso frío. No hay build/dev simultáneos.
- Diez escenarios con procesos standalone nuevos y fixture de EIO solo en pruebas: cuatro fuentes parciales en portada, cuatro errores de directorio con consulta y filtro conservados tras reintentar por Enter, dos agregados ausentes con listados reales de diez filas. El primer ensayo detectó el fallo de import frío; se corrigió y se repitió el grupo completo. Después solo se ampliaron los cuatro escenarios de error para comprobar también filtros. Ver qa-final-faults.json. No se modifican archivos de datos.
- Diecisiete accesos directos/recargas/navegaciones internas sobre producción final: sin excepciones, chunks o solicitudes fallidas. Ver next-runtime-qa-final.json. Los logs EIO de los procesos aislados son esperados, no errores del servicio normal.
- Tras reponer desarrollo, otras diecisiete comprobaciones equivalentes correctas sin errores de chunks, hidratación o red detectados (`next-runtime-qa-development.json`). No reapareció la excepción reading 'call' en los recorridos evaluados; esto no atribuye su causa histórica a los cambios actuales.
- Contraste del Hero: texto ocultado solo temporalmente en el DOM de prueba para capturar el fondo sin glifos; comparación de color computado con todos los píxeles del área de cada texto, DPR 1. Diez muestras a 360/1280, mínimo 6,85:1. El DOM se recarga inmediatamente; capturas finales muestran el texto real. No se editan imágenes ni fuentes.
- Revisión manual de casos indeterminados de axe: role/label de resultados corregidos; referencia aria-controls de login existente en DOM y diálogo modal comprobado en AX/teclado. Axe no puede resolver ese vínculo con el diálogo cerrado; se conserva la relación válida. Contraste sobre imagen se contrasta con píxeles como se describe arriba. No se convierten estos resultados en certificación integral.

Las últimas correcciones de rol, overlay y lectura inicial se revisaron con pruebas dirigidas de semántica/contraste y procesos fríos, sin repetir innecesariamente las 50 combinaciones de geometría que no modifican. Las capturas finales se tomaron del último build. En error se verifican las tres imágenes del Header cargadas/visibles; se usa captura desde compositor para evitar un artefacto de Chrome headless que dejaba parte del encabezado sin pintar en el PNG, sin modificar CSS del portal para la captura.

Durante la regresión se corrigió un selector del runner que pulsaba el primer submit del documento (ahora el diálogo cerrado) en lugar del formulario de consulta. No era pérdida de filtros de la aplicación. El alcance del oracle también se corrigió: no se asume que todas las filas de vínculos tengan un perfil actual. No se alteran fuentes ni cifras para aprobar pruebas. La serie final se guarda con prefijos QA separados.

El reporte `directorios-validacion.json` fue regenerado intencionalmente con la regresión completa posterior (30 combinaciones/45 vistas/tres flujos), indicando esta revisión en sus metadatos; no queda publicado el intento parcial del runner. Las nuevas evidencias QA y su línea base se conservan separadas. Los datos fuente y los cambios previos de implementación no se revierten.

## Evidencias Visuales

`docs/screenshots/qa-{baseline,final}-{home,produccion-cientifica,investigadores,proyectos,unidades}-{360,1280}.png`: mismas rutas/viewport, alto 1000 CSS, DPR 1, datos reales. Diez capturas antes y diez después.

`qa-dialogo-*-360x480.png`, `qa-menu-home-360x480.png`, `qa-panel-*-360x480.png` y `qa-filtro-*-360x480.png`: modal, menú, panel abierto y filtros aplicados en altura reducida. `qa-carga-*-360.png`, `qa-vacio-*-360.png`, `qa-error-*-360.png` y `qa-home-fuente-parcial-1280.png`: actualización, vacío, error y fallo parcial reales mediante fixture aislada. Las capturas finales se regeneraron tras el último build; comparación y manifiesto en qa-screenshots.json. Solo contienen información pública y consultas de prueba, no credenciales. Los sondeos de píxeles no se presentan como capturas de la interfaz sin texto.

## Pendientes Priorizados

- **Crítico:** ninguno confirmado y pendiente en los flujos frontend ya evaluados. No equivale a certificar todos los dispositivos, datos o servicios externos.
- **Alto, dato previo:** un mismo ORCID/researcher_id aparece como Yersin Silva Silva en la base bibliométrica y Cristian Díaz-Vélez en perfiles curados; iniciales YS/CD diferentes. No se reasignan métricas desde frontend. Validar identidad canónica en el pipeline.
- **Alto, cobertura previa confirmada:** 3505 vínculos del CSV completo frente a 3476 vinculados a los 308 IDs actuales. Hay 29 vínculos cuyos IDs no están en researchers_observatory.csv (dos IDs distintos); resumen de publicaciones únicas 2369 frente a 2365 en perfiles actuales. Contraste con csv.DictReader, sin reinterpretar indicadores. Reconciliar IDs/versiones de las fuentes.
- **Alto, política previa:** no existe separación autorizada público/gestión; public/data y fichas exponen información ya publicada por el MVP. Los desplegables no son controles de acceso. La aprobación de privacidad/datos públicos requiere responsables y backend, fuera de esta revisión.
- **Medio, contenido previo:** noticias/convocatorias estáticas no contrastadas con fuentes editoriales; no se presentan como actualidad validada por esta auditoría. Repositorio/datos abiertos/enlaces de pie sin URL configurada quedan identificados, no se inventan destinos.
- **Medio, definiciones previas:** preparación «lista» frente a «Listo mínimo», registro CIEI como presencia de estado y acciones recomendadas contadas como pendientes; catálogo CIEI con H2/gráficos transformados fuera de las cinco rutas. Mantener separados comités y unidades; correcciones semánticas de indicadores requieren acuerdo de datos.
- **Medio, rendimiento previo:** varios servicios de publicaciones releen/parsan el mismo CSV dentro de una petición. No son solicitudes HTTP duplicadas demostradas ni se introduce caché que cambie la actualización de datos en este encargo.
- **No verificado:** lector de pantalla real, zoom nativo del navegador, dispositivos físicos, todos los estados hover/disabled de todos los detalles y disponibilidad remota de cada DOI/ORCID. Se verifican destinos/forma HTTPS y navegación local; no se ejecutan operaciones externas ni autenticación real. Sin declaración integral WCAG 2.2 AA.

## Archivos y Reproducción

- Correcciones: `components/HomeSearch.tsx`, `RefreshSources.tsx`, `Header.tsx`, `Footer.tsx`; `app/page.tsx`, `layout.tsx`, `globals.css`; metadata en cuatro listados y aviso de agregado en investigadores; márgenes de foco en CSS de directorios/publicaciones; `lib/home.ts`, `sourceErrors.ts`, fallback opcional en `researchers.ts`.
- Pruebas: `scripts/check-final-{a11y,keyboard,states,faults,manual}.mjs`, `test-final-data.mjs`, fixture `qa-source-faults.cjs`, helper CDP de teclado/captura y opciones de nombres/selector del runner de directorios. Comandos añadidos a package.json; sin tocar lockfile.
- Documentación: este informe, CHANGELOG, bitácoras afectadas y registro de capturas.

```bash
cd frontend
npm run lint
npm run typecheck
npm run test:publication-query
npm run test:directory-query
npm run test:qa-data
# Con desarrollo activo en 3000 y Chrome CDP en 9225:
npm run test:qa-a11y
npm run test:qa-keyboard
node scripts/check-final-states.mjs
```

Detener primero desarrollo antes de `npm run build`. Después del build, `node scripts/check-final-faults.mjs` levanta y detiene servicios standalone propios en 3005; no correrlo sobre un puerto ocupado ni precargar su fixture en el servicio normal. Reiniciar `npm run dev` al finalizar. Evidencia completa en los JSON QA; no se deben considerar aprobados los pasos pendientes.

## Estado de Cierre

Implementación del alcance terminada. Validaciones ejecutadas del alcance completadas con las exclusiones explícitas anteriores; no equivalen a una certificación integral de accesibilidad, a validar todas las fuentes ni a aprobar su publicación institucional. Pendientes de datos/política se mantienen priorizados y sin modificación desde frontend. Servidores temporales de QA detenidos; desarrollo repuesto en localhost:3000 y log `/tmp/observatorio-qa-dev.log`. No se hace commit, push ni despliegue.
